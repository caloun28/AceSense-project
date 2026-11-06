import { useState, useCallback, useEffect, useRef } from 'react';

const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const TX_CHAR_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214";
const RX_CHAR_UUID = "19b10002-e8f2-537e-4f6c-d104768a1214";

export function useAceSenseBLE(onStrokeReceived) {
    const [device, setDevice] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const strokeCallbackRef = useRef(onStrokeReceived);
    const intentionalDisconnectRef = useRef(false);


    const txCharRef = useRef(null);
    const rxCharRef = useRef(null);
    const notificationHandlerRef = useRef(null);
    const reconnectingRef = useRef(false);
    const reconnectTimerRef = useRef(null);

    useEffect(() => {
        strokeCallbackRef.current = onStrokeReceived;
    }, [onStrokeReceived]);

    const parseStroke = (payload) => {
        const mainParts = payload.trim().split('|');
        const seqId = mainParts.length > 1 ? parseInt(mainParts[0], 10) : 0;
        const data = mainParts.length > 1 ? mainParts[1] : mainParts[0];

        const parts = data.split(' ');
        const code = parts[0] || '';
        const speedRaw = parts[1] || '0';
        const speed = parseInt(speedRaw, 10) || 0;

        let side = code.startsWith('BH') ? 'Bekhend' : 'Forhend';
        let type = 'Úder';
        if (code.includes('-T')) type = 'Topspin';
        else if (code.includes('-S')) type = 'Slice';
        else if (code.includes('-V')) type = 'Volej';

        return {
            id: seqId,
            timestamp: new Date().toLocaleTimeString(),
            side,
            type,
            speed,
            raw: payload
        };
    };

    const setupGattConnection = async (bleDevice) => {
        const server = await bleDevice.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);

        const txCharacteristic = await service.getCharacteristic(TX_CHAR_UUID);
        const rxCharacteristic = await service.getCharacteristic(RX_CHAR_UUID);

        if (txCharRef.current && notificationHandlerRef.current) {
            try {
                txCharRef.current.removeEventListener('characteristicvaluechanged', notificationHandlerRef.current);
            } catch (e) {
                console.warn("Chyba při odstraňování listeneru", e);
            }
        }

        const handler = async (e) => {
            const text = new TextDecoder().decode(e.target.value).trim();
            if (text && text !== 'Ready') {
                const parsed = parseStroke(text);
                if (parsed.id > 0) {
                    strokeCallbackRef.current?.(parsed);

                    if (rxCharRef.current) {
                        try {
                            const ackMsg = new TextEncoder().encode(`ACK ${parsed.id}`);
                            await rxCharRef.current.writeValue(ackMsg);
                        } catch (err) {
                            console.error("Chyba při odesílání ACK:", err);
                        }
                    }
                }
            }
        };

        txCharacteristic.addEventListener('characteristicvaluechanged', handler);

        txCharRef.current = txCharacteristic;
        rxCharRef.current = rxCharacteristic;
        notificationHandlerRef.current = handler;

        await txCharacteristic.startNotifications();

        setDevice(bleDevice);
        setIsConnected(true);
        reconnectingRef.current = false;
    };

    const connect = useCallback(async () => {
        try {
            setIsSearching(true);
            intentionalDisconnectRef.current = false;

            const bleDevice = await navigator.bluetooth.requestDevice({
                filters: [
                    { namePrefix: 'AceSense' },
                    { namePrefix: 'Arduino' }
                ],
                optionalServices: [SERVICE_UUID]
            });

            bleDevice.addEventListener('gattserverdisconnected', () => {
                setIsConnected(false);

                if (intentionalDisconnectRef.current) {
                    console.log('Záměrné odpojení.');
                    return;
                }

                if (reconnectingRef.current) return;
                reconnectingRef.current = true;
                console.warn('Spojení přerušeno. Zkouším reconnect...');

                let attemptDelay = 1500;

                const attemptReconnect = async () => {
                    if (!bleDevice || bleDevice.gatt.connected || intentionalDisconnectRef.current) {
                        reconnectingRef.current = false;
                        return;
                    }

                    try {
                        console.log('Pokus o připojení...');
                        await setupGattConnection(bleDevice);
                        console.log('Úspěšně připojeno.');
                    } catch (err) {
                        console.error('Reconnect selhal:', err);
                        attemptDelay = Math.min(attemptDelay * 1.5, 10000);
                        reconnectTimerRef.current = setTimeout(attemptReconnect, attemptDelay);
                    }
                };

                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = setTimeout(attemptReconnect, attemptDelay);
            });

            await setupGattConnection(bleDevice);
        } catch (err) {
            if (err.name !== 'NotFoundError') {
                console.error('BLE connection error:', err);
            }
            setIsConnected(false);
            setDevice(null);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        intentionalDisconnectRef.current = true;
        clearTimeout(reconnectTimerRef.current);
        reconnectingRef.current = false;

        if (device && device.gatt && device.gatt.connected) {
            device.gatt.disconnect();
        }
        setIsConnected(false);
        setDevice(null);
    }, [device]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            intentionalDisconnectRef.current = true;
            if (device && device.gatt && device.gatt.connected) {
                device.gatt.disconnect();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [device]);

    return { connect, disconnect, isConnected, isSearching };
}