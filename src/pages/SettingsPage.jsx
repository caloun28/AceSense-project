import React from 'react';

export default function SettingsPage({
    racketProfile,
    setRacketProfile,
    batteryLevel,
    totalStrokesCount
}) {
    return (
        <div className="dashboard-top-grid">
            <section className="card settings-card">
                <span className="card-title">PROFIL RAKETY</span>
                <div className="form-group">
                    <label>Značka rakety</label>
                    <input
                        type="text"
                        value={racketProfile.brand}
                        onChange={(e) => setRacketProfile({ ...racketProfile, brand: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Model</label>
                    <input
                        type="text"
                        value={racketProfile.model}
                        onChange={(e) => setRacketProfile({ ...racketProfile, model: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Dominantní ruka</label>
                    <div className="filter-group">
                        {['Pravák', 'Levák'].map((h) => (
                            <button
                                key={h}
                                type="button"
                                className={`filter-pill ${racketProfile.hand === h ? 'active' : ''}`}
                                onClick={() => setRacketProfile({ ...racketProfile, hand: h })}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="card settings-card">
                <span className="card-title">HARDWARE & BLUETOOTH</span>
                <div className="settings-info-row">
                    <span>Zařízení</span>
                    <strong>AceSense-Projekt (XIAO nRF52840)</strong>
                </div>
                <div className="settings-info-row">
                    <span>Stav baterie</span>
                    <strong>{batteryLevel !== null ? `${batteryLevel} %` : 'Nepřipojeno'}</strong>
                </div>
                <div className="settings-info-row">
                    <span>Uložených úderů v DB</span>
                    <strong>{totalStrokesCount}</strong>
                </div>
            </section>
        </div>
    );
}