
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
            shiftConfig: s.shift_config ? (typeof s.shift_config === 'string' ? JSON.parse(s.shift_config) : s.shift_config) : [],
            waGatewayConfig: s.wa_gateway_config ? (typeof s.wa_gateway_config === 'string' ? JSON.parse(s.wa_gateway_config) : s.wa_gateway_config) : {
                enableAnnouncements: false,
                enableAttendance: false,
                enableTasks: false,
                adminPhone: ''
            },
            securityConfig: s.security_config ? (typeof s.security_config === 'string' ? JSON.parse(s.security_config) : s.security_config) : {
                enforceServerTime: true,
                detectMockGps: true,
                gpsAccuracyThreshold: 50,
                lockMockGps: true
            }
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
        shiftConfig,
        waGatewayConfig,
        securityConfig
    } = req.body;
    
    try {
        console.log('Incoming Settings Update Request...');
        
        // 1. Fetch current settings first to merge (Avoid wiping fields not sent by frontend)
        const [currentRows] = await db.query('SELECT * FROM settings WHERE id = ?', ['app_settings']);
        if (currentRows.length === 0) {
            return res.status(404).json({ error: 'Settings row not found in DB' });
        }
        const current = currentRows[0];

        // 2. Prepare merged data (Use incoming if present, otherwise keep current)
        // Map camelCase from body to snake_case for DB
        const data = {
            system_name: systemName !== undefined ? systemName : current.system_name,
            sub_name: subName !== undefined ? subName : current.sub_name,
            footer_text: footerText !== undefined ? footerText : current.footer_text,
            app_version: appVersion !== undefined ? appVersion : current.app_version,
            theme_color: themeColor !== undefined ? themeColor : current.theme_color,
            logo: logo !== undefined ? logo : current.logo,
            login_background: loginBackground !== undefined ? loginBackground : current.login_background,
            anjungan_background: anjunganBackground !== undefined ? anjunganBackground : current.anjungan_background,
            zona_list: zonaList !== undefined ? JSON.stringify(zonaList) : current.zona_list,
            shift_config: shiftConfig !== undefined ? JSON.stringify(shiftConfig) : current.shift_config,
            wa_gateway_config: waGatewayConfig !== undefined ? JSON.stringify(waGatewayConfig) : current.wa_gateway_config,
            security_config: securityConfig !== undefined ? JSON.stringify(securityConfig) : current.security_config
        };

        // 3. Execute Update
        const [result] = await db.query(`
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
                shift_config = ?,
                wa_gateway_config = ?,
                security_config = ?
            WHERE id = ?
        `, [
            data.system_name, 
            data.sub_name, 
            data.footer_text, 
            data.app_version, 
            data.theme_color, 
            data.logo, 
            data.login_background, 
            data.anjungan_background, 
            data.zona_list,
            data.shift_config,
            data.wa_gateway_config,
            data.security_config,
            'app_settings'
        ]);
        
        console.log('Update Success. Rows affected:', result.affectedRows);
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        console.error('Settings Update ERROR:', err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
