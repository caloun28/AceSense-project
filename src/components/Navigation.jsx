import React from 'react';
import { Battery, Activity, History, BarChart3, Settings } from 'lucide-react';

export const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'history', label: 'Historie', icon: History },
    { id: 'stats', label: 'Statistiky', icon: BarChart3 },
    { id: 'settings', label: 'Nastavení', icon: Settings },
];

export function Sidebar({ activeTab, onSelectTab, batteryLevel }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-dot" />
                <span>AceSense</span>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            title={item.label}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => onSelectTab(item.id)}
                        >
                            <Icon size={19} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div
                    title={batteryLevel !== null ? `Baterie senzoru: ${batteryLevel}%` : 'Senzor nepřipojen'}
                    className={`battery-badge ${batteryLevel === null ? 'offline' : (batteryLevel > 20 ? 'high' : 'low')}`}
                >
                    <Battery size={18} strokeWidth={2.5} />
                    <span>Senzor: {batteryLevel !== null ? `${batteryLevel}%` : '--%'}</span>
                </div>
            </div>
        </aside>
    );
}

export function Topbar({
    activeTab,
    isConnected,
    isSearching,
    batteryLevel,
    onConnect,
    onDisconnect
}) {
    const currentTitle = NAV_ITEMS.find((n) => n.id === activeTab)?.label;
    const showHeaderBattery = activeTab !== 'dashboard' && activeTab !== 'settings';

    return (
        <header className="topbar">
            <div className="topbar-left">
                <h1 className="mobile-brand">AceSense</h1>
                <h2 className="page-title">{currentTitle}</h2>
            </div>

            <div className="topbar-actions">
                {showHeaderBattery && (
                    <div
                        className={`battery-badge mobile-battery-badge ${batteryLevel === null ? 'offline' : (batteryLevel > 20 ? 'high' : 'low')
                            }`}
                        title="Baterie senzoru"
                    >
                        <Battery size={15} strokeWidth={2.5} />
                        <span>{batteryLevel !== null ? `${batteryLevel}%` : '--%'}</span>
                    </div>
                )}

                <span className={`status-badge ${isConnected ? 'connected' : isSearching ? 'searching' : 'disconnected'}`}>
                    {isConnected ? 'PŘIPOJENO' : isSearching ? 'HLEDÁM...' : 'ODPOJENO'}
                </span>

                <button
                    className={`btn-toggle ${isConnected ? 'disconnect' : 'connect'}`}
                    onClick={isConnected ? onDisconnect : onConnect}
                    disabled={isSearching}
                >
                    {isConnected ? 'Odpojit' : 'Připojit'}
                </button>
            </div>
        </header>
    );
}

export function BottomNav({ activeTab, onSelectTab }) {
    return (
        <nav className="bottom-nav">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => onSelectTab(item.id)}
                    >
                        <Icon size={20} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}