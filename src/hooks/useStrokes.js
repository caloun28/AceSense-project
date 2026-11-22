import { useState, useRef, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';

const SESSION_GAP_MS = 15 * 60 * 1000;
const RALLY_GAP_MS = 10 * 1000;

const isSameDay = (dateA, dateB) =>
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate();

export function useStrokes(dateFilter = 'today', sideFilter = 'all') {
    const [history, setHistory] = useState([]);
    const lastPacketRef = useRef({ hwId: null, timeMs: 0 });

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('cs-CZ');
    };

    const mapRowToStroke = (row) => ({
        dbId: row.id,
        id: row.hardware_id,
        rallyId: row.rally_id,
        side: row.side,
        type: row.stroke_type,
        speed: row.speed,
        realDate: new Date(row.created_at),
        timestamp: formatTime(row.created_at)
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data, error } = await supabase
                    .from('strokes')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(300);

                if (error) throw error;

                if (data && data.length > 0) {
                    const formattedHistory = data
                        .map(mapRowToStroke)
                        .sort((a, b) => b.realDate - a.realDate);

                    setHistory(formattedHistory);
                }
            } catch (err) {
                console.error("Chyba při načítání historie z databáze:", err);
            }
        };

        fetchHistory();
    }, []);

    const handleStrokeReceived = async (stroke) => {
        const strokeTimeMs = stroke.realDate.getTime();
        if (
            lastPacketRef.current.hwId === stroke.id &&
            Math.abs(strokeTimeMs - lastPacketRef.current.timeMs) < 3000
        ) {
            return;
        }
        lastPacketRef.current = { hwId: stroke.id, timeMs: strokeTimeMs };

        const strokeWithContext = {
            ...stroke,
            rallyId: stroke.rallyId || 1
        };

        try {
            const { data, error } = await supabase
                .from('strokes')
                .insert([
                    {
                        hardware_id: strokeWithContext.id,
                        rally_id: strokeWithContext.rallyId,
                        side: strokeWithContext.side,
                        stroke_type: strokeWithContext.type,
                        speed: strokeWithContext.speed,
                        created_at: strokeWithContext.realDate.toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error("Chyba při ukládání do Supabase:", error);
            } else if (data) {
                const dbStroke = mapRowToStroke(data);

                setHistory((prevHistory) => {
                    const filtered = prevHistory.filter(item => item.dbId !== dbStroke.dbId);
                    return [dbStroke, ...filtered].sort((a, b) => b.realDate - a.realDate);
                });
            }
        } catch (err) {
            console.error("Síťová chyba Supabase:", err);
        }
    };

    const todayStrokes = useMemo(() => {
        const today = new Date();
        return history.filter((s) => isSameDay(s.realDate, today));
    }, [history]);

    const filteredHistory = useMemo(() => {
        const today = new Date();
        return history.filter((stroke) => {
            if (dateFilter === 'today' && !isSameDay(stroke.realDate, today)) return false;
            if (sideFilter !== 'all' && stroke.side !== sideFilter) return false;
            return true;
        });
    }, [history, dateFilter, sideFilter]);

    const groupedSessions = useMemo(() => {
        const sessions = filteredHistory.reduce((acc, stroke) => {
            const strokeDay = stroke.realDate.toLocaleDateString('cs-CZ');
            let currentSession = acc[acc.length - 1];

            let isNewSession = false;
            if (!currentSession) {
                isNewSession = true;
            } else {
                const gapMs = currentSession.lastStroke.realDate - stroke.realDate;
                if (strokeDay !== currentSession.dateLabel || gapMs > SESSION_GAP_MS) {
                    isNewSession = true;
                }
            }

            if (isNewSession) {
                currentSession = {
                    sessionKey: `session-${stroke.realDate.getTime()}`,
                    dateLabel: strokeDay,
                    endTime: stroke.timestamp,
                    startTime: stroke.timestamp,
                    lastStroke: stroke,
                    totalStrokes: 0,
                    rallies: []
                };
                acc.push(currentSession);
            }

            currentSession.startTime = stroke.timestamp;
            currentSession.lastStroke = stroke;
            currentSession.totalStrokes += 1;

            let currentRally = currentSession.rallies[currentSession.rallies.length - 1];
            let isNewRally = false;

            if (!currentRally) {
                isNewRally = true;
            } else {
                const prevStrokeInRally = currentRally.strokes[currentRally.strokes.length - 1];
                const rallyGapMs = prevStrokeInRally.realDate - stroke.realDate;
                if (stroke.rallyId !== currentRally.rawRallyId || rallyGapMs > RALLY_GAP_MS) {
                    isNewRally = true;
                }
            }

            if (isNewRally) {
                currentRally = {
                    groupKey: `${currentSession.sessionKey}-rally-${stroke.rallyId}-${stroke.realDate.getTime()}`,
                    rawRallyId: stroke.rallyId,
                    rallyNumber: stroke.rallyId,
                    startTime: stroke.timestamp,
                    strokes: []
                };
                currentSession.rallies.push(currentRally);
            }

            currentRally.startTime = stroke.timestamp;
            currentRally.strokes.push(stroke);

            return acc;
        }, []);

        sessions.forEach((session) => {
            const totalRallies = session.rallies.length;
            session.rallies.forEach((rally, index) => {
                rally.rallyNumber = totalRallies - index;
            });
        });

        return sessions;
    }, [filteredHistory]);

    return {
        latestStroke: todayStrokes[0] || null,
        todayStrokes,
        allHistory: history,
        filteredHistory,
        groupedSessions,
        handleStrokeReceived
    };
}