import React, { useState } from 'react';
import { Announcement, User, Role } from '../types';
import { Send, Megaphone, Trash2, Users } from 'lucide-react';
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

  const availableRoles: Role[] = ['Administrator', 'Admin', 'Pimpinan', 'Staff Kelurahan', 'Operator', 'PPSU', 'Karang Taruna'];

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
    };

    try {
        await apiService.createAnnouncement(newAnnouncement);
        setAnnouncements([newAnnouncement, ...announcements]);
        setTitle('');
        setContent('');
        setTargetType('ALL');
        setTargetRole('');
        setTargetUserId('');
    } catch (error) {
        console.error("Failed to post announcement:", error);
    }
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
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
                     <p className="text-sm text-slate-600 mb-3">{ann.content}</p>
                     <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <div className="flex gap-2">
                            <span>Oleh: {ann.authorName}</span>
                            <span>•</span>
                            <span>{new Date(ann.date).toLocaleString('id-ID')}</span>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                            {ann.targetRole ? `Role: ${ann.targetRole}` : ann.targetUserId ? `User ID: ${ann.targetUserId}` : 'Semua User'}
                        </span>
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
