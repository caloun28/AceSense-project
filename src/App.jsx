import React, { useState, useRef } from 'react';
import { useAceSenseBLE } from './hooks/useAceSenseBLE';
import { Battery } from "lucide-react";
import './App.css';

export default function App() {
  const [latestStroke, setLatestStroke] = useState(null);
  const [history, setHistory] = useState([]);

  const lastStrokeTimeRef = useRef(0);
  const rallyCounterRef = useRef(1);
  const RALLY_TIMEOUT_MS = 5000;

  const handleStrokeReceived = (stroke) => {
    const now = Date.now();

    setHistory((prevHistory) => {
      const isDuplicate = prevHistory.some((item) => item.id === stroke.id);

      if (isDuplicate) {
        return prevHistory;
      }

      if (lastStrokeTimeRef.current !== 0) {
        const timeSinceLastStroke = now - lastStrokeTimeRef.current;
        if (timeSinceLastStroke > RALLY_TIMEOUT_MS) {
          rallyCounterRef.current += 1;
        }
      }

      lastStrokeTimeRef.current = now;

      const strokeWithContext = {
        ...stroke,
        rallyId: rallyCounterRef.current
      };

      setLatestStroke(strokeWithContext);
      return [strokeWithContext, ...prevHistory];
    });
  };
  const { connect, disconnect, isConnected, isSearching, batteryLevel } = useAceSenseBLE(handleStrokeReceived);

  const groupedHistory = history.reduce((acc, stroke) => {
    let group = acc.find(g => g.rallyId === stroke.rallyId);
    if (!group) {
      group = { rallyId: stroke.rallyId, strokes: [] };
      acc.push(group);
    }
    group.strokes.push(stroke);
    return acc;
  }, []);

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
              <span className="raw-tag">{latestStroke.raw}</span>
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