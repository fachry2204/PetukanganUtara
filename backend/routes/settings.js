
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get current settings
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings WHERE id = ?', ['app_settings']);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Settings not found' });
        }
        
        const s = rows[0];
        // Format to match frontend camelCase
        const settings = {
            systemName: s.system_name,
            subName: s.sub_name,
            footerText: s.footer_text,
            appVersion: s.app_version,
            themeColor: s.theme_color,
            logo: s.logo,
            loginBackground: s.login_background,
            anjunganBackground: s.anjungan_background,
            zonaList: s.zona_list ? (typeof s.zona_list === 'string' ? JSON.parse(s.zona_list) : s.zona_list) : ['Zona 1', 'Zona 2', 'Zona 3'],
            shiftConfig: s.shift_config ? (typeof s.shift_config === 'string' ? JSON.parse(s.shift_config) : s.shift_config) : [
                { name: 'Pagi', start: '07:00', end: '15:00' },
                { name: 'Siang', start: '15:00', end: '23:00' },
                { name: 'Malam', start: '23:00', end: '07:00' }
            ]
        };
        
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update settings
router.post('/', async (req, res) => {
    const { 
        systemName, 
        subName, 
        footerText, 
        appVersion, 
        themeColor, 
        logo, 
        loginBackground, 
        anjunganBackground,
        zonaList,
        shiftConfig
    } = req.body;
    
    try {
        await db.query(`
            UPDATE settings SET 
                system_name = ?, 
                sub_name = ?, 
                footer_text = ?, 
                app_version = ?, 
                theme_color = ?, 
                logo = ?, 
                login_background = ?, 
                anjungan_background = ?,
                zona_list = ?,
                shift_config = ?
            WHERE id = ?
        `, [
            systemName, 
            subName, 
            footerText, 
            appVersion, 
            themeColor, 
            logo, 
            loginBackground, 
            anjunganBackground, 
            JSON.stringify(zonaList || []),
            JSON.stringify(shiftConfig || []),
            'app_settings'
        ]);
        
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
