const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const db = require('../db');

class WhatsAppService {
    constructor() {
        this.client = null;
        this.qrCode = null;
        this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, QR_READY, CONNECTED
        this.sessionData = null;
        this.isInitialized = false;
    }

    async logToDb(to, message, type, status, error = null) {
        try {
            const sql = 'INSERT INTO wa_logs (penerima, pesan, tipe, status, error_detail) VALUES (?, ?, ?, ?, ?)';
            await db.query(sql, [
                to,
                message.substring(0, 1000), // Limit message length in log
                type,
                status,
                error
            ]);
        } catch (err) {
            console.error('Failed to write WA log to DB:', err);
        }
    }

    async init(force = false) {
        if (this.isInitialized && !force) return;
        
        if (force) {
            console.log('Force resetting WA Client...');
            this.status = 'DISCONNECTED';
            this.qrCode = null;
            if (this.client) {
                try {
                    await this.client.destroy();
                } catch (e) {
                    console.error('Error destroying client:', e.message);
                }
            }
            this.client = null;
            this.isInitialized = false;

            // Delete session folder for a clean start
            const fs = require('fs');
            const sessionPath = path.join(__dirname, '../whatsapp_auth/session-sipetut_session');
            if (fs.existsSync(sessionPath)) {
                try {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    console.log('Session folder deleted for hard reset');
                } catch (err) {
                    console.error('Failed to delete session folder:', err);
                }
            }
        }

        console.log('Initializing WhatsApp Client...');
        this.status = 'CONNECTING';
        this.qrCode = null;

        this.client = new Client({
            authStrategy: new LocalAuth({ 
                clientId: 'sipetut_session',
                dataPath: path.join(__dirname, '../whatsapp_auth')
            }),
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1014587000-alpha.html',
            },
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    '--disable-blink-features=AutomationControlled'
                ],
                executablePath: process.env.CHROME_PATH || undefined
            }
        });

        this.client.on('qr', async (qr) => {
            console.log('WA QR RECEIVED');
            this.status = 'QR_READY';
            this.qrCode = await qrcode.toDataURL(qr);
        });

        this.client.on('ready', () => {
            console.log('WHATSAPP CLIENT IS READY');
            this.status = 'CONNECTED';
            this.qrCode = null;
        });

        this.client.on('authenticated', () => {
            console.log('WA AUTHENTICATED');
            this.status = 'AUTHENTICATING';
        });

        this.client.on('auth_failure', (msg) => {
            console.error('WA AUTHENTICATION FAILURE', msg);
            this.status = 'DISCONNECTED';
            this.qrCode = null;
        });

        this.client.on('disconnected', (reason) => {
            console.log('WA Client was logged out', reason);
            this.status = 'DISCONNECTED';
            this.qrCode = null;
            // Try to re-init after 10 seconds
            setTimeout(() => this.client.initialize(), 10000);
        });

        try {
            await this.client.initialize();
            this.isInitialized = true;
        } catch (err) {
            console.error('Failed to initialize WA client:', err);
            this.status = 'DISCONNECTED';
        }
    }

    getStatus() {
        let effectiveStatus = this.status;
        
        // Deep Check: If status is CONNECTED but internal page is dead, report as DISCONNECTED
        if (effectiveStatus === 'CONNECTED' && this.client) {
            if (!this.client.pupPage || this.client.pupPage.isClosed()) {
                effectiveStatus = 'DISCONNECTED';
            }
        }

        return {
            status: effectiveStatus,
            qrCode: this.qrCode
        };
    }

    formatNumber(to) {
        let number = to.replace(/\D/g, '');
        if (number.startsWith('0')) {
            number = '62' + number.slice(1);
        }
        if (!number.endsWith('@c.us')) {
            number += '@c.us';
        }
        return number;
    }

    async sendMessage(to, message) {
        if (this.status !== 'CONNECTED' || !this.client) {
            console.warn('Cannot send WA message: Client not connected');
            await this.logToDb(to, message, 'TEXT', 'FAILED', 'Client not connected');
            return false;
        }

        // Deep check for puppeteer page
        if (!this.client.pupPage || this.client.pupPage.isClosed()) {
            console.warn('Cannot send WA message: Puppeteer page is null or closed');
            await this.logToDb(to, message, 'TEXT', 'FAILED', 'WhatsApp engine page crashed (evaluate error). Please reset WA.');
            return false;
        }

        try {
            const number = this.formatNumber(to);
            await this.client.sendMessage(number, message);
            await this.logToDb(to, message, 'TEXT', 'SENT');
            return true;
        } catch (error) {
            console.error('Failed to send WA message:', error);
            await this.logToDb(to, message, 'TEXT', 'FAILED', error.message);
            return false;
        }
    }

    async sendMessageWithMedia(to, message, base64Image) {
        if (this.status !== 'CONNECTED' || !this.client) {
            console.warn('Cannot send WA media message: Client not connected');
            await this.logToDb(to, message, 'MEDIA', 'FAILED', 'Client not connected');
            return false;
        }

        // Deep check for puppeteer page
        if (!this.client.pupPage || this.client.pupPage.isClosed()) {
            console.warn('Cannot send WA media message: Puppeteer page is null or closed');
            await this.logToDb(to, message, 'MEDIA', 'FAILED', 'WhatsApp engine page crashed (evaluate error). Please reset WA.');
            return false;
        }

        try {
            const number = this.formatNumber(to);
            
            if (base64Image) {
                try {
                    let media;
                    if (base64Image.startsWith('http')) {
                        media = await MessageMedia.fromUrl(base64Image);
                    } else {
                        // If base64 contains data URL prefix, strip it
                        const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            media = new MessageMedia(matches[1], matches[2]);
                        } else {
                            media = new MessageMedia('image/jpeg', base64Image);
                        }
                    }
                    
                    await this.client.sendMessage(number, media, { caption: message });
                    await this.logToDb(to, message, 'MEDIA', 'SENT');
                    return true;
                } catch (mediaErr) {
                    console.error('Media processing error, falling back to text:', mediaErr);
                    await this.client.sendMessage(number, message);
                    await this.logToDb(to, message, 'MEDIA-FALLBACK', 'SENT', mediaErr.message);
                    return true;
                }
            } else {
                await this.client.sendMessage(number, message);
                await this.logToDb(to, message, 'TEXT', 'SENT');
                return true;
            }
        } catch (error) {
            console.error('Failed to send WA message:', error);
            await this.logToDb(to, message, 'MEDIA', 'FAILED', error.message);
            return false;
        }
    }

    async logout() {
        console.log('Attempting WA Logout...');
        if (this.client) {
            try {
                // Try clean logout
                try {
                    await this.client.logout();
                    console.log('WA Logout Success');
                } catch (logoutErr) {
                    console.warn('Standard WA logout failed, forcing destroy...', logoutErr.message);
                }
                
                // Always destroy client to free up puppeteer resources
                await this.client.destroy();
                this.client = null;
                this.status = 'DISCONNECTED';
                this.qrCode = null;
                this.isInitialized = false;
                return true;
            } catch (err) {
                console.error('Critical WA Logout/Destroy Error:', err);
                // Reset state anyway to allow re-init
                this.client = null;
                this.status = 'DISCONNECTED';
                this.qrCode = null;
                this.isInitialized = false;
                return true; // Return true because we successfully "cleared" the state even if puppeteer crashed
            }
        }
        this.status = 'DISCONNECTED';
        this.isInitialized = false;
        return true;
    }
}

module.exports = new WhatsAppService();
