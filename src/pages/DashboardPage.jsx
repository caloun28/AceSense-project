import React, { useMemo } from 'react';
import { Battery, ChevronRight } from 'lucide-react';
import { formatStrokeCount } from '../utils/formatters';

export default function DashboardPage({
    racketProfile,
    batteryLevel,
    latestStroke,
    todayStrokes,
    onOpenHistory
}) {
    const todayStats = useMemo(() => {
        if (todayStrokes.length === 0) return { maxSpeed: 0, currentRallyCount: 0 };
        const maxSpeed = Math.max(...todayStrokes.map((s) => s.speed));

        let currentRallyCount = 1;
        for (let i = 1; i < todayStrokes.length; i++) {
            const prev = todayStrokes[i - 1];
            const curr = todayStrokes[i];
            if (curr.rallyId !== prev.rallyId || (prev.realDate - curr.realDate) > 10 * 1000) {
                break;
            }
            currentRallyCount++;
        }

        return { maxSpeed, currentRallyCount };
    }, [todayStrokes]);

    return (
        <>
            <div className="dashboard-top-grid">
                <section className="card card-racket">
                    <span className="card-title">MOJE RAKETA</span>
                    <div className="racket-info">
                        <div>
                            <div className="racket-name">{racketProfile.brand}</div>
                            <div className="racket-model">{racketProfile.model} • {racketProfile.hand}</div>
                        </div>
                        <div className={`battery-badge ${batteryLevel === null ? 'offline' : (batteryLevel > 20 ? 'high' : 'low')}`}>
                            <Battery size={20} strokeWidth={3} color="currentColor" />
                            {batteryLevel !== null ? `${batteryLevel}%` : '--%'}
                        </div>
                    </div>
                </section>

                <section className="card card-hero">
                    <span className="card-title">POSLEDNÍ ÚDER</span>
                    {latestStroke ? (
                        <>
                            <div className="stroke-highlight">
                                <span className={`stroke-type ${latestStroke.side === 'Forhend' ? 'fh' : 'bh'}`}>
                                    {latestStroke.side} {latestStroke.type}
                                </span>
                                <span className="stroke-speed">{latestStroke.speed} km/h</span>
                            </div>
                            <div className="card-meta">
                                <span className="rally-badge-hero">Výměna #{latestStroke.rallyId}</span>
                                <span>Čas: {latestStroke.timestamp}</span>
                            </div>
                        </>
                    ) : (
                        <p className="placeholder-text">Dnes zatím žádný úder. Připoj raketu a švihni.</p>
                    )}
                </section>
            </div>

            <div className="kpi-grid">
                <div className="card kpi-card">
                    <span className="card-title">DNES ÚDERŮ</span>
                    <div className="kpi-value">{todayStrokes.length}</div>
                </div>
                <div className="card kpi-card">
                    <span className="card-title">MAX. RYCHLOST DNES</span>
                    <div className="kpi-value clay">{todayStats.maxSpeed} <small>km/h</small></div>
                </div>
                <div className="card kpi-card">
                    <span className="card-title">AKTUÁLNÍ VÝMĚNA</span>
                    <div className="kpi-value">{formatStrokeCount(todayStats.currentRallyCount)}</div>
                </div>
            </div>

            <section className="card">
                <div className="history-header">
                    <span>Poslední údery (živě)</span>
                    <button className="link-btn" onClick={onOpenHistory}>
                        Celá historie <ChevronRight size={15} />
                    </button>
                </div>

                {todayStrokes.length === 0 ? (
                    <p className="placeholder-text">Zatím prázdno</p>
                ) : (
                    <ul className="history-list">
                        {todayStrokes.slice(0, 5).map((item, idx) => (
                            <li
                                key={item.dbId || `recent-${item.id}-${idx}`}
                                className={`history-item ${item.side === 'Forhend' ? 'fh' : 'bh'}`}
                            >
                                <div className="history-item-left">
                                    <span className="history-time">[{item.timestamp}]</span>
                                    <span className="history-tag">{item.side} {item.type}</span>
                                </div>
                                <span className="history-speed">{item.speed} km/h</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}