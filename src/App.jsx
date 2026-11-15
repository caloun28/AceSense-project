import React from 'react';
import { useAceSenseBLE } from './hooks/useAceSenseBLE';
import { useStrokes } from './hooks/useStrokes';
import { Battery } from "lucide-react";
import './App.css';

export default function App() {
  // 1. Získáme logiku úderů a databáze z našeho nového hooku
  const { latestStroke, history, groupedHistory, handleStrokeReceived } = useStrokes();

  // 2. Propojíme Bluetooth a předáme mu funkci na zpracování úderu
  const { connect, disconnect, isConnected, isSearching, batteryLevel } = useAceSenseBLE(handleStrokeReceived);

  // 3. Čisté UI
  return (
    <div className="app-container">
      <div className="app-header">
        <h1>AceSense</h1>
        <span className={`status-badge ${isConnected ? 'connected' : isSearching ? 'searching' : 'disconnected'}`}>
          {isConnected ? 'RAKETA PŘIPOJENA' : isSearching ? 'HLEDÁM RAKETU...' : 'ODPOJENO'}
        </span>

        <button
          className={`btn-toggle ${isConnected ? 'disconnect' : 'connect'}`}
          onClick={isConnected ? disconnect : connect}
          disabled={isSearching}
        >
          {isConnected ? 'Odpojit' : 'Připojit raketu'}
        </button>
      </div>

      <section className="card-racket card">
        <span className="card-title">MOJE RAKETA</span>
        <div className="racket-info">
          <div>
            <div className="racket-name">HEAD</div>
            <div className="racket-model">Graphene 360 Speed Lite</div>
          </div>
          <div className={`battery-badge ${batteryLevel === null ? 'offline' : (batteryLevel > 20 ? 'high' : 'low')}`}>
            <Battery size={20} strokeWidth={3} color="currentColor" />
            {batteryLevel !== null ? `${batteryLevel}%` : '--%'}
          </div>
        </div>
      </section>

      <section className="card-hero card">
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
          <p className="placeholder-text">Zatím žádný úder. Připoj raketu a švihni.</p>
        )}
      </section>

      <section className="card-history card">
        <div className="history-header">
          <span>Historie úderů</span>
          <span>{history.length} celkem</span>
        </div>

        {groupedHistory.length === 0 ? (
          <p className="placeholder-text">Zatím prázdno</p>
        ) : (
          <div className="history-grouped-container">
            {groupedHistory.map((group) => (
              <div key={`rally-${group.rallyId}`} className="rally-group">
                <div className="rally-group-title">
                  Výměna #{group.rallyId}
                  <span className="rally-count">({group.strokes.length} úderů)</span>
                </div>
                <ul className="history-list">
                  {group.strokes.map((item) => (
                    <li
                      key={item.id}
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
        )}
      </section>
    </div>
  );
}