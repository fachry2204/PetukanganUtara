
import { Gender, DutyStatus, Staff, Task, TaskStatus, User, Citizen, ResidenceStatus, CitizenshipStatus, VitalStatus, Report, ReportStatus, ServiceRequest, ServiceType, ServiceStatus } from './types';

// Helper functions for random data generation
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

// Data Pools
const MALE_NAMES = [
  'Ahmad', 'Dimas', 'Satria', 'Bagas', 'Rizky', 'Fajar', 'Bayu', 'Aditya', 'Ilham', 'Kevin', 
  'Dwi', 'Eko', 'Rudi', 'Hendra', 'Arif', 'Bambang', 'Candra', 'Dedi', 'Feri', 'Galih',
  'Hadi', 'Iman', 'Jaka', 'Kurnia', 'Lukman', 'Maman', 'Nanang', 'Oki', 'Pandu', 'Rahmat',
  'Slamet', 'Taufik', 'Usman', 'Vicky', 'Wahyu', 'Yudi', 'Zainal', 'Agung', 'Bakti', 'Cipto',
  'Darma', 'Erwin', 'Firman', 'Guntur', 'Hartono', 'Indra', 'Johan', 'Kiki', 'Lutfi', 'Mahendra'
];

const FEMALE_NAMES = [
  'Putri', 'Siti', 'Dewi', 'Rina', 'Sari', 'Ayu', 'Indah', 'Fitri', 'Nia', 'Lestari',
  'Wulan', 'Maya', 'Dian', 'Eka', 'Yuni', 'Ratna', 'Susi', 'Nur', 'Ani', 'Tia',
  'Vina', 'Lia', 'Ratih', 'Desi', 'Rini', 'Tuti', 'Nining', 'Evi', 'Lina', 'Mega',
  'Tari', 'Siska', 'Rosi', 'Mina', 'Yulia', 'Ika', 'Amelia', 'Bella', 'Citra', 'Dina',
  'Elsa', 'Fanny', 'Gita', 'Hana', 'Intan', 'Jelita', 'Kartika', 'Laras', 'Melati', 'Nanda'
];

const LAST_NAMES = [
  'Saputra', 'Wijaya', 'Hidayat', 'Nugroho', 'Pratama', 'Kusuma', 'Suryana', 'Susanto', 'Hermawan', 'Setiawan',
  'Purnomo', 'Wibowo', 'Handayani', 'Mulyani', 'Rahayu', 'Safitri', 'Kurniawan', 'Sudrajat', 'Permana', 'Sudarsono',
  'Pamungkas', 'Wahyudi', 'Prasetyo', 'Ningsih', 'Astuti', 'Hasanah', 'Wulandari', 'Putra', 'Maulana', 'Ramadhan',
  'Firmansyah', 'Irawan', 'Kusnadi', 'Suhendra', 'Gunawan', 'Utama', 'Siregar', 'Nasution', 'Simanjuntak', 'Pasaribu',
  'Sihombing', 'Lubis', 'Harahap', 'Matondang', 'Pane', 'Sitorus', 'Manullang', 'Samosir', 'Purba', 'Ginting'
];

const CITIES = ['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi', 'Bandung', 'Solo', 'Yogyakarta', 'Surabaya', 'Semarang', 'Cirebon', 'Sukabumi'];

const STREETS = [
  'Jl. Kebayoran Lama', 'Jl. Rawa Simprug', 'Jl. Peninggaran', 'Jl. Cidodol Raya', 'Jl. Kemandoran',
  'Jl. Panjang', 'Jl. Cipulir', 'Jl. Seskoal', 'Jl. Ciledug Raya', 'Jl. Swadarma', 
  'Gang H. Aom', 'Gang H. Yasin', 'Komplek Lemigas', 'Jl. Permata Hijau', 'Jl. Kangkung',
  'Jl. Kubur Islam', 'Jl. Jiban', 'Jl. Limo'
];

const JOBS = ['Wiraswasta', 'Karyawan Swasta', 'PNS', 'Ibu Rumah Tangga', 'Pelajar/Mahasiswa', 'Buruh Harian Lepas', 'Pensiunan', 'Pedagang', 'Ojek Online', 'Guru', 'Perawat', 'Mekanik'];
const RELIGIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const MARITAL_STATUS = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];

// Generate Staff Members
const generateStaffData = (): Staff[] => {
  const staff: Staff[] = [];
  const baseLat = -6.2367;
  const baseLng = 106.7583;

  const genderDistribution = [
    ...Array(45).fill(Gender.MALE),
    ...Array(15).fill(Gender.FEMALE)
  ];

  for (let i = genderDistribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [genderDistribution[i], genderDistribution[j]] = [genderDistribution[j], genderDistribution[i]];
  }

  const statusDistribution = [
    ...Array(20).fill(DutyStatus.ONLINE),
    ...Array(25).fill(DutyStatus.BERTUGAS),
    ...Array(10).fill(DutyStatus.STANDBY),
    ...Array(5).fill(DutyStatus.OFFLINE)
  ];

  for (let i = statusDistribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [statusDistribution[i], statusDistribution[j]] = [statusDistribution[j], statusDistribution[i]];
  }

  for (let i = 0; i < 60; i++) {
    const gender = genderDistribution[i];
    const status = statusDistribution[i];
    const isMale = gender === Gender.MALE;
    
    const firstName = getRandomItem(isMale ? MALE_NAMES : FEMALE_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    
    const photoId = i + 1; 
    const photoUrl = `https://randomuser.me/api/portraits/${isMale ? 'men' : 'women'}/${photoId % 99}.jpg`;

    staff.push({
      id: (i + 1).toString(),
      nik: `317101${getRandomInt(10, 30)}${getRandomInt(10, 12)}9${getRandomInt(0, 9)}000${i + 1}`,
      nomorAnggota: `PPSU-${(i + 1).toString().padStart(3, '0')}`,
      namaLengkap: `${firstName} ${lastName}`,
      tempatLahir: getRandomItem(CITIES),
      tanggalLahir: `19${getRandomInt(80, 99)}-${getRandomInt(1, 12).toString().padStart(2, '0')}-${getRandomInt(1, 28).toString().padStart(2, '0')}`,
      jenisKelamin: gender,
      alamatLengkap: `${getRandomItem(STREETS)} No. ${getRandomInt(1, 200)}, Petukangan Utara`,
      latitude: baseLat + getRandomFloat(-0.008, 0.008),
      longitude: baseLng + getRandomFloat(-0.008, 0.008),
      nomorWhatsapp: `628${getRandomInt(12, 59)}${getRandomInt(10000000, 99999999)}`,
      tanggalMasuk: `20${getRandomInt(19, 23)}-${getRandomInt(1, 12).toString().padStart(2, '0')}-${getRandomInt(1, 28).toString().padStart(2, '0')}`,
      fotoProfile: photoUrl,
      status: status,
      totalTugasBerhasil: getRandomInt(5, 350)
    });
  }

  return staff;
};

// Generate Mock Citizens
const generateCitizenData = (): Citizen[] => {
  const citizens: Citizen[] = [];
  
  for (let i = 0; i < 200; i++) { 
    const isMale = Math.random() > 0.5;
    const gender = isMale ? Gender.MALE : Gender.FEMALE;
    const firstName = getRandomItem(isMale ? MALE_NAMES : FEMALE_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    
    const rand = Math.random();
    let statusKtp = ResidenceStatus.KTP_DKI;
    let kewarganegaraan = CitizenshipStatus.WNI;
    let asalProvinsi = 'DKI JAKARTA';
    let asalKota = 'Jakarta Selatan';

    if (rand > 0.75 && rand < 0.95) {
        statusKtp = ResidenceStatus.PENDATANG;
        asalProvinsi = getRandomItem(['JAWA BARAT', 'JAWA TENGAH', 'JAWA TIMUR', 'BANTEN', 'LAMPUNG', 'SUMATERA UTARA']);
        asalKota = 'Lainnya';
    } else if (rand >= 0.95) {
        statusKtp = ResidenceStatus.WNA;
        kewarganegaraan = CitizenshipStatus.WNA;
        asalProvinsi = 'FOREIGN';
    }

    const currentYear = new Date().getFullYear();
    const ageRoll = Math.random();
    let birthYear;
    
    if (ageRoll < 0.10) birthYear = currentYear - getRandomInt(0, 3);
    else if (ageRoll < 0.15) birthYear = currentYear - getRandomInt(4, 5);
    else if (ageRoll < 0.30) birthYear = currentYear - getRandomInt(6, 12);
    else if (ageRoll < 0.45) birthYear = currentYear - getRandomInt(13, 19);
    else if (ageRoll < 0.85) birthYear = currentYear - getRandomInt(20, 60);
    else birthYear = currentYear - getRandomInt(61, 85);

    citizens.push({
      id: `CIT-${i + 1}`,
      nik: `317408${getRandomInt(10, 30)}${getRandomInt(10, 12)}9${getRandomInt(0, 9)}000${i + 1}`,
      kk: `317408${getRandomInt(10, 30)}${getRandomInt(10, 12)}0${getRandomInt(0, 9)}000${getRandomInt(1, 9)}`,
      namaLengkap: `${firstName} ${lastName}`,
      jenisKelamin: gender,
      tempatLahir: getRandomItem(CITIES),
      tanggalLahir: `${birthYear}-${getRandomInt(1, 12).toString().padStart(2, '0')}-${getRandomInt(1, 28).toString().padStart(2, '0')}`,
      alamat: `${getRandomItem(STREETS)} No. ${getRandomInt(1, 200)}`,
      rt: `0${getRandomInt(1, 9)}`,
      rw: `0${getRandomInt(1, 12)}`,
      agama: getRandomItem(RELIGIONS),
      statusPerkawinan: (birthYear > (currentYear - 20)) ? 'Belum Kawin' : getRandomItem(MARITAL_STATUS),
      pekerjaan: (birthYear > (currentYear - 18)) ? 'Pelajar/Mahasiswa' : getRandomItem(JOBS),
      nomorWhatsapp: `628${getRandomInt(12, 59)}${getRandomInt(10000000, 99999999)}`,
      kelurahan: 'Petukangan Utara',
      kecamatan: 'Pesanggrahan',
      kota: 'Jakarta Selatan',
      provinsi: 'DKI Jakarta',
      statusKtp: statusKtp,
      kewarganegaraan: kewarganegaraan,
      asalProvinsi: statusKtp === ResidenceStatus.PENDATANG ? asalProvinsi : undefined,
      asalKota: statusKtp === ResidenceStatus.PENDATANG ? asalKota : undefined,
      statusKematian: VitalStatus.ALIVE,
      latitude: -6.2367 + getRandomFloat(-0.008, 0.008),
      longitude: 106.7583 + getRandomFloat(-0.008, 0.008),
    });
  }
  return citizens;
};

// Generate Mock Reports
const generateReportData = (): Report[] => {
    const reports: Report[] = [];
    const categories = ['Infrastruktur', 'Kebersihan', 'Keamanan', 'Kesehatan', 'Administrasi', 'Sosial'];
    const issues = [
        'Jalan berlubang parah', 'Tumpukan sampah liar', 'Lampu jalan mati', 
        'Saluran air tersumbat', 'Pohon tumbang', 'Keributan antar warga', 
        'Demam berdarah', 'Pengurusan KTP lambat', 'Bantuan sosial belum turun'
    ];
    
    // Status mapping to cover all workflow stages
    const statuses = [
        ReportStatus.NEW,
        ReportStatus.PENDING_ACCEPTANCE,
        ReportStatus.ON_THE_WAY,
        ReportStatus.ARRIVED,
        ReportStatus.IN_PROGRESS,
        ReportStatus.VERIFICATION,
        ReportStatus.COMPLETED,
        ReportStatus.REJECTED,
        ReportStatus.REVISION
    ];

    for (let i = 0; i < 35; i++) {
        const category = getRandomItem(categories);
        const title = getRandomItem(issues);
        const citizen = MOCK_CITIZENS.length > 0 ? getRandomItem(MOCK_CITIZENS) : null;
        const reporter = citizen ? citizen.namaLengkap : 'Warga';
        const reporterNik = citizen ? citizen.nik : '';
        const reporterPhone = citizen ? citizen.nomorWhatsapp : '';
        const status = getRandomItem(statuses);
        
        // Generate Category Code (e.g., INF, KEB, KEA)
        const catCode = category.substring(0, 3).toUpperCase();
        const year = 2024;
        const ticketNumber = `TKT-${catCode}-${year}-${1000 + i}`;

        reports.push({
            id: `REP-${1000 + i}`,
            ticketNumber: ticketNumber,
            title: `${title} di ${getRandomItem(STREETS)}`,
            description: `Mohon segera ditindaklanjuti adanya ${title.toLowerCase()} yang mengganggu kenyamanan warga sekitar.`,
            category: category,
            reporterName: reporter,
            reporterNik: reporterNik,
            reporterPhone: reporterPhone,
            location: `${getRandomItem(STREETS)}, RT 0${getRandomInt(1,9)} / RW 0${getRandomInt(1,12)}`,
            latitude: -6.2367 + getRandomFloat(-0.01, 0.01),
            longitude: 106.7583 + getRandomFloat(-0.01, 0.01),
            status: status,
            timestamp: `2024-${getRandomInt(1,5).toString().padStart(2,'0')}-${getRandomInt(1,28).toString().padStart(2,'0')} ${getRandomInt(8,20)}:00`,
            photoUrl: `https://picsum.photos/seed/${i}/400/300`,
            priority: getRandomItem(['High', 'Medium', 'Low']),
            logs: [
                { status: ReportStatus.NEW, timestamp: `2024-02-01 08:00`, actor: 'System' }
            ]
        });
    }
    return reports;
};

// Generate Mock Service Requests
const generateServiceRequests = (): ServiceRequest[] => {
  const requests: ServiceRequest[] = [];
  const types = Object.values(ServiceType);
  const statuses = Object.values(ServiceStatus);

  for (let i = 0; i < 40; i++) {
    const citizen = getRandomItem(MOCK_CITIZENS);
    const type = getRandomItem(types);
    const status = getRandomItem(statuses);
    const date = `2024-${getRandomInt(1, 5).toString().padStart(2, '0')}-${getRandomInt(1, 28).toString().padStart(2, '0')}`;

    requests.push({
      id: `SRV-${1000 + i}`,
      ticketNumber: `REQ-${type.substring(0, 3).toUpperCase()}-${1000 + i}`,
      requestDate: date,
      type: type,
      applicantNik: citizen.nik,
      applicantName: citizen.namaLengkap,
      // Added applicantPhone and logs to match updated interface
      applicantPhone: citizen.nomorWhatsapp,
      status: status,
      notes: `Permohonan untuk keperluan ${type === ServiceType.SKTM ? 'beasiswa' : type === ServiceType.SKU ? 'usaha warung' : 'administrasi'}.`,
      logs: [
        { status: ServiceStatus.NEW, timestamp: date, actor: 'Warga', note: 'Pengajuan via aplikasi.' }
      ]
    });
  }
  return requests;
};

export const MOCK_STAFF: Staff[] = generateStaffData();
export const MOCK_CITIZENS: Citizen[] = generateCitizenData();
export const MOCK_REPORTS: Report[] = generateReportData();
export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = generateServiceRequests();

export const MOCK_TASKS: Task[] = [
  { id: 'T1', category: 'Saluran Air', status: TaskStatus.COMPLETED, date: '2023-10-01', staffId: '1' },
  { id: 'T2', category: 'Taman', status: TaskStatus.PROGRESS, date: '2023-10-02', staffId: '1' },
  { id: 'T3', category: 'Jalanan', status: TaskStatus.COMPLETED, date: '2023-10-03', staffId: '2' },
  { id: 'T4', category: 'Pohon Tumbang', status: TaskStatus.COMPLETED, date: '2023-10-04', staffId: '3' },
  { id: 'T5', category: 'Sampah Liar', status: TaskStatus.PROGRESS, date: '2023-10-05', staffId: '5' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'ADMIN-001',
    username: 'admin',
    name: 'Administrator System',
    email: 'demo@demo.com', 
    nik: '3171000000000001',
    role: 'Administrator',
    avatar: 'https://ui-avatars.com/api/?name=Administrator&background=ea580c&color=fff',
    password: '123' 
  },
  {
    id: 'USR-001',
    username: 'lurah_budi',
    name: 'Budi Santoso (Lurah)',
    email: 'lurah@jakarta.go.id',
    nik: '3171000000000002',
    role: 'Pimpinan',
    avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=random',
    password: '123' 
  },
  {
    id: 'USR-STAFF-01',
    username: 'staff_nina',
    name: 'Nina (Staff Kelurahan)',
    email: 'nina@jakarta.go.id',
    nik: '3171000000000004',
    role: 'Staff Kelurahan',
    avatar: 'https://ui-avatars.com/api/?name=Nina+Staff&background=random',
    password: '123' 
  },
  {
    id: 'USR-OP-01',
    username: 'operator_danu',
    name: 'Danu (Operator)',
    email: 'danu@jakarta.go.id',
    nik: '3171000000000005',
    role: 'Operator',
    avatar: 'https://ui-avatars.com/api/?name=Danu+Op&background=random',
    password: '123' 
  },
  {
    id: 'USR-KT-01',
    username: 'kt_dina',
    name: 'Dina (Ketua Karang Taruna)',
    email: 'kt@petukanganutara.id',
    nik: '3171000000000014',
    role: 'Karang Taruna',
    avatar: 'https://ui-avatars.com/api/?name=Karang+Taruna&background=ea580c&color=fff',
    password: '123'
  }
];
