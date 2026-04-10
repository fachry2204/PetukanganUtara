
import React, { useState, ChangeEvent } from 'react';
import { X, Camera, MapPin, Save } from 'lucide-react';
import { Staff, Gender, DutyStatus } from '../types';

interface AddStaffModalProps {
  onClose: () => void;
  staff?: Staff | null;
  onSave: (staff: Staff) => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose, staff, onSave }) => {
  const isEditMode = !!staff;

  // Initial State based on staff prop or empty defaults
  const [formData, setFormData] = useState<Staff>({
    id: staff?.id || Date.now().toString(), // Generate simplified ID for new
    nik: staff?.nik || '',
    nomorAnggota: staff?.nomorAnggota || '',
    namaLengkap: staff?.namaLengkap || '',
    tempatLahir: staff?.tempatLahir || '',
    tanggalLahir: staff?.tanggalLahir || '',
    jenisKelamin: staff?.jenisKelamin || Gender.MALE,
    alamatLengkap: staff?.alamatLengkap || '',
    latitude: staff?.latitude || -6.2297,
    longitude: staff?.longitude || 106.7800,
    nomorWhatsapp: staff?.nomorWhatsapp || '',
    tanggalMasuk: staff?.tanggalMasuk || new Date().toISOString().split('T')[0],
    fotoProfile: staff?.fotoProfile || '',
    status: staff?.status || DutyStatus.OFFLINE,
    totalTugasBerhasil: staff?.totalTugasBerhasil || 0
  });

  const [locationInput, setLocationInput] = useState(`${formData.latitude}, ${formData.longitude}`);

  // Handle Text Inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Location Input specifically to parse Lat, Long
  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    
    // Try to parse "lat, lng"
    const parts = value.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
      }
    }
  };

  // Handle Image Upload with FileReader for Preview
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, fotoProfile: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl my-8 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Anggota PPSU' : 'Tambah Anggota PPSU'}</h3>
            <p className="text-sm text-slate-500">{isEditMode ? 'Perbarui informasi anggota.' : 'Lengkapi formulir untuk menambahkan petugas baru.'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Photo Upload Area */}
              <div className="w-full md:w-1/3 space-y-4">
                <div className="aspect-square w-full max-w-[240px] mx-auto bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 relative overflow-hidden group cursor-pointer hover:bg-slate-100 transition-colors">
                  {formData.fotoProfile ? (
                    /* FIX: Changed object-cover to object-contain and added bg-white */
                    <img src={formData.fotoProfile} alt="Preview" className="w-full h-full object-contain bg-white" />
                  ) : (
                    <>
                      <Camera size={40} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                      <p className="text-xs font-bold text-slate-400 group-hover:text-orange-500">Upload Foto Profil</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl text-[11px] text-amber-700 leading-relaxed border border-amber-100">
                  Pastikan foto berlatar belakang polos dan wajah terlihat jelas dengan seragam PPSU. Klik area diatas untuk mengganti foto.
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Nomor Anggota</label>
                  <input 
                    type="text" 
                    name="nomorAnggota"
                    value={formData.nomorAnggota}
                    onChange={handleChange}
                    placeholder="PPSU-XXXX" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">NIK (Sesuai KTP)</label>
                  <input 
                    type="text" 
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    placeholder="16 Digit NIK" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    name="namaLengkap"
                    value={formData.namaLengkap}
                    onChange={handleChange}
                    placeholder="Masukkan nama sesuai identitas" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Tempat Lahir</label>
                  <input 
                    type="text" 
                    name="tempatLahir"
                    value={formData.tempatLahir}
                    onChange={handleChange}
                    placeholder="Kota Kelahiran" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    name="tanggalLahir"
                    value={formData.tanggalLahir}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Jenis Kelamin</label>
                  <select 
                    name="jenisKelamin"
                    value={formData.jenisKelamin}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                  >
                    <option value="">Pilih Gender</option>
                    <option value={Gender.MALE}>Laki-Laki</option>
                    <option value={Gender.FEMALE}>Perempuan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Nomor WhatsApp</label>
                  <input 
                    type="text" 
                    name="nomorWhatsapp"
                    value={formData.nomorWhatsapp}
                    onChange={handleChange}
                    placeholder="628xxxxxxxx" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Alamat Lengkap</label>
                  <textarea 
                    rows={3} 
                    name="alamatLengkap"
                    value={formData.alamatLengkap}
                    onChange={handleChange}
                    placeholder="Jl. Contoh No. 123..." 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  ></textarea>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Pin Lokasi (Format: Latitude, Longitude)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={locationInput}
                      onChange={handleLocationChange}
                      placeholder="-6.2224, 106.7822" 
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 ml-1">Contoh: -6.2224, 106.7822</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Tanggal Masuk Kerja</label>
                  <input 
                    type="date" 
                    name="tanggalMasuk"
                    value={formData.tanggalMasuk}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-2">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
              >
                Batalkan
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-100 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Save size={18} /> {isEditMode ? 'Simpan Perubahan' : 'Simpan Anggota'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
