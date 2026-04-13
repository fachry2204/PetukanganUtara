
const express = require('express');
const router = express.Router();
const waService = require('../services/whatsappService');

// Initialize WA on first access
waService.init();

// GET WA Status and QR
router.get('/status', (req, res) => {
    res.json(waService.getStatus());
});

// Restart / Re-init WA
router.post('/initialize', async (req, res) => {
    const { force } = req.body;
    await waService.init(force === true);
    res.json({ message: force ? 'Resetting and Initializing...' : 'Initializing...' });
});

// Logout WA
router.post('/logout', async (req, res) => {
    const success = await waService.logout();
    if (success) {
        res.json({ message: 'Logged out successfully' });
    } else {
        res.status(500).json({ error: 'Failed to logout' });
    }
});

module.exports = router;
