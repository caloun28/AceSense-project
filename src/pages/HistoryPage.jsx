import React from 'react';
import { formatStrokeCount } from '../utils/formatters';

export default function HistoryPage({
    dateFilter,
    setDateFilter,
    sideFilter,
    setSideFilter,
    filteredHistory,
    groupedSessions
}) {
    return (
        <section className="card">
            <div className="filter-bar">
                <div className="filter-group">
                    <button
                        className={`filter-pill ${dateFilter === 'today' ? 'active' : ''}`}
                        onClick={() => setDateFilter('today')}
                    >
                        Dnes
                    </button>
                    <button
                        className={`filter-pill ${dateFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setDateFilter('all')}
                    >
                        Všechny dny
                    </button>
                </div>

                <div className="filter-group">
                    {['all', 'Forhend', 'Bekhend'].map((side) => (
                        <button
                            key={side}
                            className={`filter-pill ${sideFilter === side ? 'active' : ''}`}
                            onClick={() => setSideFilter(side)}
                        >
                            {side === 'all' ? 'Všechny údery' : side}
                        </button>
                    ))}
                </div>

                <span className="filter-count">{formatStrokeCount(filteredHistory.length)}</span>
            </div>

            {groupedSessions.length === 0 ? (
                <p className="placeholder-text">Pro zvolený filtr tu zatím nejsou žádné údery.</p>
            ) : (
                <div className="history-grouped-container full-page">
                    {groupedSessions.map((session) => (
                        <div key={session.sessionKey} className="session-group">
                            <div className="session-header">
                                <strong>{session.dateLabel}</strong>
                                <span>
                                    {' '}• {session.startTime.slice(0, 5)}–{session.endTime.slice(0, 5)} ({formatStrokeCount(session.totalStrokes)})
                                </span>
                            </div>

                            <div className="session-body">
                                {session.rallies.map((group) => (
                                    <div key={group.groupKey} className="rally-group">
                                        <div className="rally-group-title">
                                            <span>Výměna #{group.rallyNumber}</span>
                                            <span className="rally-count">
                                                ({formatStrokeCount(group.strokes.length)} • {group.startTime})
                                            </span>
                                        </div>
                                        <ul className="history-list">
                                            {group.strokes.map((item, idx) => (
                                                <li
                                                    key={item.dbId || `${group.groupKey}-${item.id}-${idx}`}
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}