import React, { useState } from 'react';
import { useAceSenseBLE } from './hooks/useAceSenseBLE';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBattery } from "@fortawesome/free-solid-svg-icons";
import { Battery } from "lucide-react";
import './App.css';

export default function App() {
  const [latestStroke, setLatestStroke] = useState(null);
  const [history, setHistory] = useState([]);

  const handleStrokeReceived = (stroke) => {
    console.log("Nový úder:", stroke);
    setLatestStroke(stroke);
    setHistory((prev) => [stroke, ...prev]);
  };

  const { connect, disconnect, isConnected, isSearching, batteryLevel } = useAceSenseBLE(handleStrokeReceived);

  const getStatusClass = () => {
    if (isConnected) return 'connected';
    if (isSearching) return 'searching';
    return 'disconnected';
  };

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
            <Battery
              size={20}
              strokeWidth={3}
              color="currentColor"
            />{batteryLevel !== null ? `${batteryLevel}%` : '--%'}
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

        {history.length === 0 ? (
          <p className="placeholder-text">Zatím prázdno</p>
        ) : (
          <ul className="history-list">
            {history.map((item) => (
              <li
                key={item.id}
                className={`history-item ${item.side === 'Forhend' ? 'fh' : 'bh'}`}
              >
                <div>
                  <span className="history-time">[{item.timestamp}]</span>
                  <span className="history-tag">{item.side} {item.type}</span>
                </div>
                <span className="history-speed">{item.speed} km/h</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}