import { TugasPPSU, Citizen, Staff, ServiceRequest, User } from '../types';

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

    // --- SOS ---
    getSos: (): Promise<any[]> => fetchData('/sos'),
    createSos: (sos: any) => postData('/sos', sos),
    resolveSos: (key: string) => putData(`/sos/${key}`, {})
};