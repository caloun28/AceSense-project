import React, { useState, useEffect } from 'react';
import { useAceSenseBLE } from './hooks/useAceSenseBLE';
import { useStrokes } from './hooks/useStrokes';
import { Sidebar, Topbar, BottomNav } from './components/Navigation';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateFilter, setDateFilter] = useState('today');
  const [sideFilter, setSideFilter] = useState('all');

  const [racketProfile, setRacketProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('acesense_racket');
      return saved ? JSON.parse(saved) : {
        brand: 'HEAD',
        model: 'Graphene 360 Speed Lite',
        hand: 'Pravák'
      };
    } catch {
      return { brand: 'HEAD', model: 'Graphene 360 Speed Lite', hand: 'Pravák' };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('acesense_racket', JSON.stringify(racketProfile));
    } catch (e) {
      console.warn('Nelze uložit nastavení do localStorage', e);
    }
  }, [racketProfile]);

  const {
    latestStroke,
    todayStrokes,
    allHistory,
    filteredHistory,
    groupedSessions,
    handleStrokeReceived
  } = useStrokes(dateFilter, sideFilter);

  const { connect, disconnect, isConnected, isSearching, batteryLevel } = useAceSenseBLE(handleStrokeReceived);

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        batteryLevel={batteryLevel}
      />

      <div className="main-area">
        <Topbar
          activeTab={activeTab}
          isConnected={isConnected}
          isSearching={isSearching}
          batteryLevel={batteryLevel}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        <main className="page-content">
          {activeTab === 'dashboard' && (
            <DashboardPage
              racketProfile={racketProfile}
              batteryLevel={batteryLevel}
              latestStroke={latestStroke}
              todayStrokes={todayStrokes}
              onOpenHistory={() => setActiveTab('history')}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPage
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              sideFilter={sideFilter}
              setSideFilter={setSideFilter}
              filteredHistory={filteredHistory}
              groupedSessions={groupedSessions}
            />
          )}

          {activeTab === 'stats' && (
            <StatsPage
              todayStrokes={todayStrokes}
              allHistory={allHistory}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              racketProfile={racketProfile}
              setRacketProfile={setRacketProfile}
              batteryLevel={batteryLevel}
              totalStrokesCount={allHistory.length}
            />
          )}
        </main>
      </div>

      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}