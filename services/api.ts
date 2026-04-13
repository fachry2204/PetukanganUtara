import { TugasPPSU, Staff, User, SystemSettings } from '../types';

// Konfigurasi URL Backend
// Gunakan environment variable VITE_API_URL jika ada (saat di hosting), jika tidak gunakan localhost
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

// Helper untuk fetch
const fetchData = async (endpoint: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
};

const postData = async (endpoint: string, data: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error);
        throw error;
    }
};

const putData = async (endpoint: string, data: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error updating ${endpoint}:`, error);
        throw error;
    }
};

export const apiService = {
    // --- TUGAS PPSU (Replacement for Reports) ---
    getTugasPPSU: (): Promise<TugasPPSU[]> => fetchData('/reports'),
    createTugasPPSU: (tugas: TugasPPSU) => postData('/reports', tugas),
    updateTugasPPSU: (tugas: TugasPPSU) => putData(`/reports/${tugas.id}`, tugas),

    // --- STAFF ---
    getStaff: (): Promise<Staff[]> => fetchData('/staff'),
    createStaff: (staff: Staff) => postData('/staff', staff),
    updateStaff: (staff: Staff) => putData(`/staff/${staff.id}`, staff),
    deleteStaff: (id: string) => fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/staff/${id}`, { method: 'DELETE' }).then(r => r.json()),

    // --- USERS ---
    getUsers: (): Promise<User[]> => fetchData('/users'),
    createUser: (user: User) => postData('/users', user),
    updateUser: (user: User) => putData(`/users/${user.id}`, user),
    deleteUser: (id: string) => fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/users/${id}`, { method: 'DELETE' }).then(r => r.json()),

    // --- ATTENDANCE ---
    getAttendance: (): Promise<any[]> => fetchData('/attendance'),
    createAttendance: (record: any) => postData('/attendance', record),

    // --- ANNOUNCEMENTS ---
    getAnnouncements: (): Promise<any[]> => fetchData('/announcements'),
    createAnnouncement: (ann: any) => postData('/announcements', ann),
    deleteAnnouncement: (id: string) => fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/announcements/${id}`, { method: 'DELETE' }).then(r => r.json()),

    // --- SOS ---
    getSos: (): Promise<any[]> => fetchData('/sos'),
    createSos: (sos: any) => postData('/sos', sos),
    resolveSos: (key: string) => putData(`/sos/${key}`, {}),

    // --- SETTINGS ---
    getSettings: (): Promise<SystemSettings> => fetchData('/settings'),
    updateSettings: (settings: SystemSettings) => postData('/settings', settings),

    // --- JADWAL ---
    getJadwal: (): Promise<any[]> => fetchData('/jadwal'),
    createJadwal: (jadwal: any) => postData('/jadwal', jadwal),
    deleteJadwal: (id: string) => fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/jadwal/${id}`, { method: 'DELETE' }).then(r => r.json()),

    // --- ATTENDANCE REQUESTS ---
    getAttendanceRequests: (): Promise<any[]> => fetchData('/attendance-requests'),
    getMyAttendanceRequests: (nik: string): Promise<any[]> => fetchData(`/attendance-requests/my/${nik}`),
    createAttendanceRequest: (request: any) => postData('/attendance-requests', request),
    updateAttendanceRequest: (id: number, data: any) => putData(`/attendance-requests/${id}`, data),

    // --- WHATSAPP GATEWAY ---
    getWaStatus: () => fetchData('/whatsapp/status'),
    initWa: (force: boolean = false) => postData('/whatsapp/initialize', { force }),
    logoutWa: () => postData('/whatsapp/logout', {}),
    getWaLogs: (): Promise<any[]> => fetchData('/whatsapp-logs'),
    retryWaMessage: (id: string) => postData(`/whatsapp-logs/retry/${id}`, {}),
    clearWaLogs: () => fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/whatsapp-logs`, { method: 'DELETE' }).then(r => r.json())
};