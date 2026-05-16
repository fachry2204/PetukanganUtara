const express = require('express');
const router = express.Router();
const db = require('../db');
const webpush = require('web-push');

// VAPID Configuration
const publicVapidKey = 'BMa1uPtKOhglUphDoFxJcPTl8AscEP9gMPFkLZ-JD3yKmOjndczRLycdxJ5EgwCHZZggyfiGfRlKYISD-7BLUT8';
const privateVapidKey = 'LUFqRbn9hFN7dQV7yhpQFV8Xbu6qqAy9ShueKQAe5a0';

webpush.setVapidDetails(
  'mailto:admin@sipetut.jakarta.go.id',
  publicVapidKey,
  privateVapidKey
);

// 1. PUSH NOTIFICATION: SUBSCRIBE
router.post('/subscribe', async (req, res) => {
    const { userId, subscription } = req.body;
    try {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            await conn.execute('DELETE FROM push_subscriptions WHERE user_id = ?', [userId]);
            await conn.execute('INSERT INTO push_subscriptions (user_id, subscription_data) VALUES (?, ?)', 
                [userId, JSON.stringify(subscription)]);
            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }
        res.status(201).json({ message: 'Subscribed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. LIVE TRACKING: SAVE LOCATION
router.post('/location', async (req, res) => {
    const { userId, name, latitude, longitude } = req.body;
    try {
        await db.execute('INSERT INTO staff_locations (user_id, name, latitude, longitude) VALUES (?, ?, ?, ?)', 
            userId, name, latitude, longitude);
        res.json({ status: 'Location updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. BROADCAST NOTIFICATION (Internal helper / Admin API)
router.post('/broadcast', async (req, res) => {
    const { title, message } = req.body;
    try {
        const subs = await db.execute('SELECT subscription_data FROM push_subscriptions').then(res => res[0]);
        const payload = JSON.stringify({ title, message });

        const promises = subs.map(s => {
            const subscription = JSON.parse(s.subscription_data);
            return webpush.sendNotification(subscription, payload).catch(e => {
                console.error('Push Error:', e);
            });
        });

        await Promise.all(promises);
        res.json({ message: 'Broadcast sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET PUBLIC KEY
router.get('/key', (req, res) => {
    res.json({ publicKey: publicVapidKey });
});

module.exports = router;
