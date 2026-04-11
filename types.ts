export type Role = 
  | 'Administrator' 
  | 'Admin' 
  | 'Pimpinan' 
  | 'Staff Kelurahan' 
  | 'Operator'
  | 'PPSU' 
  | 'POSYANDU' 
  | 'PKK' 
  | 'Karang Taruna';

export enum Gender {
  MALE = 'Laki-Laki',
  FEMALE = 'Perempuan'
}

export enum DutyStatus {
  ONLINE = 'Online',
  BERTUGAS = 'Bertugas',
  STANDBY = 'Standby',
  OFFLINE = 'Offline',
  ISTIRAHAT = 'Istirahat',
  BAHAYA = 'Dalam Bahaya'
}

export enum ReportStatus {
  NEW = 'Laporan Baru',
  PENDING_ACCEPTANCE = 'Menunggu Petugas',
  ON_THE_WAY = 'Petugas Menuju Lokasi',
  ARRIVED = 'Petugas Sampai Lokasi',
  IN_PROGRESS = 'Sedang Dikerjakan',
  VERIFICATION = 'Menunggu Verifikasi',
  VERIFIED = 'Verified',
  REVISION = 'Revisi Laporan',
  COMPLETED = 'Laporan Selesai',
  REJECTED = 'Ditolak'
}

export interface TugasPPSULog {
  status: ReportStatus;
  timestamp: string;
  note?: string;
  actor?: string;
}

export interface TugasPPSU {
  id: string;
  judulTugas: string;
  deskripsi: string;
  kategori: string;
  lokasi: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  timestamp: string;
  fotoSebelum?: string;
  fotoSesudah?: string;
  staffId?: string;
  priority: 'High' | 'Medium' | 'Low';
  logs: TugasPPSULog[];
  assignedStaffIds?: string[];
  alasanPenolakan?: string;
  estimationTime?: string;
  verifiedBy?: string;
  reporterName: string;
  reporterNik?: string;
}

export interface Staff {
  id: string;
  nik: string;
  nomorAnggota: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: Gender;
  alamatLengkap: string;
  latitude: number;
  longitude: number;
  nomorWhatsapp: string;
  tanggalMasuk: string;
  fotoProfile: string;
  status: DutyStatus;
  totalTugasBerhasil: number;
}

export interface User {
  id: string;
  username: string; 
  name?: string;    
  email?: string;
  nik?: string; 
  role: Role;
  avatar?: string;
  password?: string;
}

export interface SystemSettings {
  systemName: string;
  subName: string;
  footerText: string;
  appVersion: string;
  themeColor: string;
  logo: string | null;
  loginBackground?: string | null;
  anjunganBackground?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  authorName: string;
  targetRole?: Role | 'ALL';
  targetUserId?: string;
}

export type AttendanceType = 'Absen Masuk' | 'Istirahat' | 'Selesai Istirahat' | 'Absen Pulang';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userNik: string;
  userName: string;
  type: AttendanceType;
  timestamp: string;
  latitude: number;
  longitude: number;
  address: string;
  photo: string;
}
