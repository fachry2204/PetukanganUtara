import React, { useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';

interface GpsTrackerProps {
    user: User | null;
    isOnDuty?: boolean;
}

const GpsTracker: React.FC<GpsTrackerProps> = ({ user, isOnDuty }) => {
    const watchId = useRef<number | null>(null);

    useEffect(() => {
        if (!user || !isOnDuty) {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            return;
        }

        // 1. START CONTINUOUS GPS TRACKING
        const startTracking = () => {
            if (!navigator.geolocation) return;

            watchId.current = navigator.geolocation.watchPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    try {
                        // Send location to server
                        await fetch('/api/tracking/location', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: user.nik || user.id,
                                name: user.name || user.username,
                                latitude,
                                longitude
                            })
                        });
                    } catch (e) { console.error('Tracking failed', e); }
                },
                (err) => console.error('GPS Watch error', err),
                { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
            );
        };

        startTracking();

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, [user, isOnDuty]);

    useEffect(() => {
        if (!user) return;

        // 2. REQUEST PUSH NOTIFICATION PERMISSION & SUBSCRIBE
        const subscribePush = async () => {
            try {
                // Wait for SW to be ready
                const registration = await navigator.serviceWorker.ready;
                
                // Get VAPID Public Key from server
                const keyRes = await fetch('/api/tracking/key').then(r => r.json());
                const publicKey = keyRes.publicKey;

                // Subscribe
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });

                // Send subscription to server
                await fetch('/api/tracking/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.nik || user.id,
                        subscription
                    })
                });

                console.log('Push notification subscribed');
            } catch (e) {
                console.error('Push subscription failed', e);
            }
        };

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            subscribePush();
        }
    }, [user]);

    return null; // Silent background component
};

// HELPER: Convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default GpsTracker;
