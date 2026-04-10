import { Report, Citizen, Staff, ServiceRequest, User } from '../types';

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
    // --- REPORTS ---
    getReports: (): Promise<Report[]> => fetchData('/reports'),
    createReport: (report: Report) => postData('/reports', report),
    updateReport: (report: Report) => putData(`/reports/${report.id}`, report),

    // --- CITIZENS ---
    getCitizens: (): Promise<Citizen[]> => fetchData('/citizens'),
    createCitizen: (citizen: Citizen) => postData('/citizens', citizen),
    // updateCitizen: (citizen: Citizen) => putData(`/citizens/${citizen.id}`, citizen),

    // --- STAFF ---
    getStaff: (): Promise<Staff[]> => fetchData('/staff'),
    // createStaff...
    // updateStaff...

    // --- SERVICES ---
    getServices: (): Promise<ServiceRequest[]> => fetchData('/services'),
    createService: (request: ServiceRequest) => postData('/services', request),
    updateService: (request: ServiceRequest) => putData(`/services/${request.id}`, request),

    // --- USERS ---
    // getUsers...
};