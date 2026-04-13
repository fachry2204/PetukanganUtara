import React, { useState } from 'react';
import { Announcement, User, Role } from '../types';
import { Send, Megaphone, Trash2, Users, Image as ImageIcon, Calendar, X, Clock } from 'lucide-react';
import { apiService } from '../services/api';

interface AnnouncementSectionProps {
  user: User;
  users: User[];
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
}

const AnnouncementSection: React.FC<AnnouncementSectionProps> = ({ user, users, announcements, setAnnouncements }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'ROLE' | 'USER'>('ALL');
  const [targetRole, setTargetRole] = useState<Role | ''>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [image, setImage] = useState<string | null>(null);

  const availableRoles: Role[] = ['Administrator', 'Admin', 'Pimpinan', 'Staff Kelurahan', 'PPSU'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    if (targetType === 'ROLE' && !targetRole) return;
    if (targetType === 'USER' && !targetUserId) return;

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString(),
      authorName: user.name || user.username,
      targetRole: targetType === 'ROLE' ? (targetRole as Role) : targetType === 'ALL' ? 'ALL' : undefined,
      targetUserId: targetType === 'USER' ? targetUserId : undefined,
      startDate,
      endDate,
      image: image || undefined
    };

    try {
      await apiService.createAnnouncement(newAnnouncement);
      setAnnouncements([newAnnouncement, ...announcements]);
      setTitle('');
      setContent('');
      setTargetRole('');
      setTargetUserId('');
      setImage(null);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    } catch (error) {
      console.error("Failed to post announcement:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;
    try {
      await apiService.deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      alert("Gagal menghapus pengumuman");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Megaphone className="text-rose-500" /> Buat Pengumuman Baru
        </h2>

        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Pengumuman</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Contoh: Apel Siaga Banjir"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Isi Pengumuman</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Tuliskan detail pengumuman..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Pengumuman</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
              >
                <option value="ALL">Semua Pengguna (ALL)</option>
                <option value="ROLE">Role / Jabatan Tertentu</option>
                <option value="USER">User Spesifik</option>
              </select>
            </div>

            {targetType === 'ROLE' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  required
                >
                  <option value="" disabled>-- Pilih Role --</option>
                  {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}

            {targetType === 'USER' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih User</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  required
                >
                  <option value="" disabled>-- Pilih User --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name || u.username} ({u.role})</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Mulai Tampil</label>
                <div className="relative">
                   <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input
                     type="date"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                     className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                     required
                   />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Berakhir Tampil</label>
                <div className="relative">
                   <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input
                     type="date"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                     className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                     required
                   />
                </div>
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lampiran Gambar</label>
             <div className="flex gap-4">
                <div className="flex-1 relative">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleImageUpload}
                     className="absolute inset-0 opacity-0 cursor-pointer z-10"
                   />
                   <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 bg-slate-50 text-slate-400 font-bold text-sm group-hover:border-indigo-400 transition-all">
                      <ImageIcon size={20} />
                      {image ? 'Ganti Gambar' : 'Upload Gambar Pengumuman'}
                   </div>
                </div>
                {image && (
                   <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <X size={20} />
                      </button>
                   </div>
                )}
             </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
              <Send size={18} /> Kirim Pengumuman
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Users className="text-indigo-600" /> Histori Pengumuman Terkirim
        </h2>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Megaphone size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold">Belum ada pengumuman yang dikirim.</p>
            </div>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800">{ann.title}</h3>
                  <button onClick={() => handleDelete(ann.id)} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-3">
                  {ann.image && (
                    <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                       <img src={ann.image} alt={ann.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-3">{ann.content}</p>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100 italic">
                        <Clock size={12} className="text-indigo-400" />
                        {new Date(ann.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} {new Date(ann.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100">
                        <Calendar size={12} className="text-amber-500" />
                        Aktif: {ann.startDate ? new Date(ann.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'} s/d {ann.endDate ? new Date(ann.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                      </div>
                      <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md shadow-sm">
                        {ann.targetRole ? `Role: ${ann.targetRole}` : ann.targetUserId ? `User ID: ${ann.targetUserId}` : 'Semua User'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementSection;
