import React, { useState, useMemo } from 'react';

export default function StatsPage({ todayStrokes, allHistory }) {
    const [statsScope, setStatsScope] = useState('today');

    const detailedStats = useMemo(() => {
        const source = statsScope === 'today' ? todayStrokes : allHistory;
        const total = source.length;
        if (total === 0) return null;

        const fhStrokes = source.filter((s) => s.side === 'Forhend');
        const bhStrokes = source.filter((s) => s.side === 'Bekhend');

        const topspinCount = source.filter((s) => s.type === 'Topspin').length;
        const sliceCount = source.filter((s) => s.type === 'Slice').length;
        const volleyCount = source.filter((s) => s.type === 'Volej').length;

        const avg = (arr) => arr.length ? Math.round(arr.reduce((sum, s) => sum + s.speed, 0) / arr.length) : 0;
        const max = (arr) => arr.length ? Math.max(...arr.map((s) => s.speed)) : 0;

        return {
            total,
            avgSpeed: avg(source),
            maxSpeed: max(source),
            fhCount: fhStrokes.length,
            bhCount: bhStrokes.length,
            fhPct: Math.round((fhStrokes.length / total) * 100),
            bhPct: Math.round((bhStrokes.length / total) * 100),
            fhAvgSpeed: avg(fhStrokes),
            bhAvgSpeed: avg(bhStrokes),
            topspinCount,
            sliceCount,
            volleyCount,
            topspinPct: Math.round((topspinCount / total) * 100),
            slicePct: Math.round((sliceCount / total) * 100),
            volleyPct: Math.round((volleyCount / total) * 100),
        };
    }, [statsScope, todayStrokes, allHistory]);

    return (
        <>
            <div className="card filter-bar">
                <div className="filter-group">
                    <button
                        className={`filter-pill ${statsScope === 'today' ? 'active' : ''}`}
                        onClick={() => setStatsScope('today')}
                    >
                        Dnešní trénink
                    </button>
                    <button
                        className={`filter-pill ${statsScope === 'all' ? 'active' : ''}`}
                        onClick={() => setStatsScope('all')}
                    >
                        Celková historie
                    </button>
                </div>
            </div>

            {!detailedStats ? (
                <div className="card">
                    <p className="placeholder-text">Zatím nejsou k dispozici žádná data pro výpočet statistik.</p>
                </div>
            ) : (
                <>
                    <div className="kpi-grid four-cols">
                        <div className="card kpi-card">
                            <span className="card-title">CELKEM ÚDERŮ</span>
                            <div className="kpi-value">{detailedStats.total}</div>
                        </div>
                        <div className="card kpi-card">
                            <span className="card-title">PRŮMĚRNÁ RYCHLOST</span>
                            <div className="kpi-value">{detailedStats.avgSpeed} <small>km/h</small></div>
                        </div>
                        <div className="card kpi-card">
                            <span className="card-title">MAXIMÁLNÍ RYCHLOST</span>
                            <div className="kpi-value clay">{detailedStats.maxSpeed} <small>km/h</small></div>
                        </div>
                        <div className="card kpi-card">
                            <span className="card-title">PRŮMĚR FH / BH</span>
                            <div className="kpi-value">{detailedStats.fhAvgSpeed} / {detailedStats.bhAvgSpeed} <small>km/h</small></div>
                        </div>
                    </div>

                    <div className="dashboard-top-grid">
                        <section className="card stats-card">
                            <span className="card-title">POMĚR FORHEND VS. BEKHEND</span>
                            <div className="stat-bar-block">
                                <div className="stat-bar-labels">
                                    <span>Forhend ({detailedStats.fhCount})</span>
                                    <strong>{detailedStats.fhPct} %</strong>
                                </div>
                                <div className="stat-track">
                                    <div className="stat-fill fh" style={{ width: `${detailedStats.fhPct}%` }} />
                                </div>
                            </div>

                            <div className="stat-bar-block">
                                <div className="stat-bar-labels">
                                    <span>Bekhend ({detailedStats.bhCount})</span>
                                    <strong>{detailedStats.bhPct} %</strong>
                                </div>
                                <div className="stat-track">
                                    <div className="stat-fill bh" style={{ width: `${detailedStats.bhPct}%` }} />
                                </div>
                            </div>
                        </section>

                        <section className="card stats-card">
                            <span className="card-title">TYPY ÚDERŮ</span>
                            <div className="stat-bar-block">
                                <div className="stat-bar-labels">
                                    <span>Topspin ({detailedStats.topspinCount})</span>
                                    <strong>{detailedStats.topspinPct} %</strong>
                                </div>
                                <div className="stat-track">
                                    <div className="stat-fill fh" style={{ width: `${detailedStats.topspinPct}%` }} />
                                </div>
                            </div>

                            <div className="stat-bar-block">
                                <div className="stat-bar-labels">
                                    <span>Slice ({detailedStats.sliceCount})</span>
                                    <strong>{detailedStats.slicePct} %</strong>
                                </div>
                                <div className="stat-track">
                                    <div className="stat-fill bh" style={{ width: `${detailedStats.slicePct}%` }} />
                                </div>
                            </div>

                            <div className="stat-bar-block">
                                <div className="stat-bar-labels">
                                    <span>Volej ({detailedStats.volleyCount})</span>
                                    <strong>{detailedStats.volleyPct} %</strong>
                                </div>
                                <div className="stat-track">
                                    <div className="stat-fill volley" style={{ width: `${detailedStats.volleyPct}%` }} />
                                </div>
                            </div>
                        </section>
                    </div>
                </>
            )}
        </>
    );
}