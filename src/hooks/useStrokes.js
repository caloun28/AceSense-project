import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabase';

export function useStrokes() {
    const [latestStroke, setLatestStroke] = useState(null);
    const [history, setHistory] = useState([]);

    const processedIdsRef = useRef(new Set());

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('cs-CZ');
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data, error } = await supabase
                    .from('strokes')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (error) throw error;

                if (data && data.length > 0) {
                    const formattedHistory = data.map(row => ({
                        id: row.hardware_id,
                        rallyId: row.rally_id,
                        side: row.side,
                        type: row.stroke_type,
                        speed: row.speed,
                        timestamp: formatTime(row.created_at)
                    }));

                    setHistory(formattedHistory);
                    setLatestStroke(formattedHistory[0]);
                }
            } catch (err) {
                console.error("Chyba při načítání historie z databáze:", err);
            }
        };

        fetchHistory();
    }, []);

    const handleStrokeReceived = async (stroke) => {
        if (processedIdsRef.current.has(stroke.id)) {
            return;
        }
        processedIdsRef.current.add(stroke.id);

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
                const dbStroke = {
                    id: data.hardware_id,
                    rallyId: data.rally_id,
                    side: data.side,
                    type: data.stroke_type,
                    speed: data.speed,
                    timestamp: formatTime(data.created_at)
                };

                setLatestStroke(dbStroke);
                setHistory((prevHistory) => [dbStroke, ...prevHistory]);
            }
        } catch (err) {
            console.error("Síťová chyba Supabase:", err);
        }
    };

    const groupedHistory = history.reduce((acc, stroke) => {
        let group = acc.find(g => g.rallyId === stroke.rallyId);
        if (!group) {
            group = { rallyId: stroke.rallyId, strokes: [] };
            acc.push(group);
        }
        group.strokes.push(stroke);
        return acc;
    }, []);

    return {
        latestStroke,
        history,
        groupedHistory,
        handleStrokeReceived
    };
}