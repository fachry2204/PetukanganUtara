
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

export type ServiceRatingValue = 'Buruk' | 'Biasa' | 'Baik' | 'Sangat Baik';

export interface ServiceRating {
  id: string;
  ticketNumber: string;
  rating: ServiceRatingValue;
  timestamp: string;
  serviceType: string;
}

export enum Gender {
  MALE = 'Laki-Laki',
  FEMALE = 'Perempuan'
}

export enum BloodType {
  A = 'A',
  B = 'B',
  AB = 'AB',
  O = 'O',
  UNKNOWN = '-'
}

export enum CitizenshipStatus {
  WNI = 'WNI',
  WNA = 'WNA'
}

export enum ResidenceStatus {
  KTP_DKI = 'KTP DKI',
  PENDATANG = 'Pendatang',
  WNA = 'WNA'
}

export enum VitalStatus {
  ALIVE = 'Hidup',
  DECEASED = 'Meninggal'
}

export enum DutyStatus {
  ONLINE = 'Online',
  BERTUGAS = 'Bertugas',
  STANDBY = 'Standby',
  OFFLINE = 'Offline',
  ISTIRAHAT = 'Istirahat',
  BAHAYA = 'Dalam Bahaya'
}

export enum TaskStatus {
  PROGRESS = 'Sedang Berjalan',
  COMPLETED = 'Selesai',
  PENDING = 'Tertunda'
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

export interface ReportLog {
  status: ReportStatus;
  timestamp: string;
  note?: string;
  actor?: string;
}

export interface Report {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string; 
  reporterName: string;
  reporterNik?: string;
  reporterPhone?: string;
  location: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  timestamp: string;
  photoUrl: string;
  photoArrival?: string;
  gpsArrival?: { lat: number, lng: number };
  photoCompletion?: string;
  photoRevision?: string;
  priority: 'High' | 'Medium' | 'Low';
  logs: ReportLog[];
  assignedStaffIds?: string[];
  rejectionReason?: string;
  estimationTime?: string;
  verifiedBy?: string;
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

export interface Citizen {
  id: string;
  nik: string;
  kk: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  statusPerkawinan: string;
  golonganDarah?: BloodType;
  pekerjaan: string;
  nomorWhatsapp: string;
  fotoWajah?: string; 
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  latitude?: number;
  longitude?: number;
  statusKtp: ResidenceStatus;
  asalProvinsi?: string; 
  asalKota?: string; 
  asalKelurahan?: string; 
  asalKecamatan?: string; 
  alamatAsli?: string; 
  kewarganegaraan: CitizenshipStatus;
  negaraAsal?: string; 
  nomorPaspor?: string; 
  fotoDokumen?: string; 
  statusKematian: VitalStatus;
  sudahPunyaKtp?: boolean; 
}

export interface Task {
  id: string;
  category: string;
  status: TaskStatus;
  date: string;
  staffId: string;
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

export enum ServiceType {
  NTCR = 'Surat Pengantar Nikah (NTCR)',
  SKTM = 'Surat Keterangan Tidak Mampu (SKTM)',
  PENGHASILAN = 'Surat Keterangan Penghasilan',
  SKU = 'Surat Keterangan Usaha (SKU)',
  LEGALISASI = 'Legalisasi Dokumen',
  UMUM = 'Surat Keterangan Umum'
}

export enum ServiceStatus {
  NEW = 'Pengajuan Baru',
  ACCEPTED = 'Pengajuan Diterima',
  WAITING = 'Dalam Antrian',
  PROCESSED = 'Menunggu Surat Terbit',
  READY = 'Siap Diambil',
  COMPLETED = 'Selesai',
  REJECTED = 'Ditolak'
}

export interface ServiceLog {
  status: ServiceStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface ServiceRequest {
  id: string;
  ticketNumber: string;
  letterNumber?: string; 
  rtLetterNumber?: string; 
  requestDate: string; 
  completionDate?: string; 
  type: ServiceType;
  applicantNik: string;
  applicantName: string;
  applicantPhone: string;
  status: ServiceStatus;
  notes?: string; 
  documents?: string[]; 
  signedLetterUrl?: string; 
  verificationCode?: string; 
  logs: ServiceLog[];
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
