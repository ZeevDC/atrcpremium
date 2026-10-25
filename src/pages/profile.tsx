import { useState, useRef } from 'react';
import { profile } from 'virtual:content';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Camera, Edit2, Save, X, Bell, BellOff, User, GraduationCap, Mail, Hash, Lock, AtSign } from 'lucide-react';
import AppShell from '@/components/app/AppShell';
import { useSession } from '@/lib/auth/auth-client';

const BUILT_IN_AVATARS = [
{ id: 'av1', emoji: '🦁', label: 'Lion' },
{ id: 'av2', emoji: '🐯', label: 'Tiger' },
{ id: 'av3', emoji: '🦊', label: 'Fox' },
{ id: 'av4', emoji: '🐺', label: 'Wolf' },
{ id: 'av5', emoji: '🦅', label: 'Eagle' },
{ id: 'av6', emoji: '🦋', label: 'Butterfly' },
{ id: 'av7', emoji: '🌸', label: 'Blossom' },
{ id: 'av8', emoji: '⭐', label: 'Star' },
{ id: 'av9', emoji: '🔥', label: 'Fire' },
{ id: 'av10', emoji: '💎', label: 'Diamond' },
{ id: 'av11', emoji: '🎯', label: 'Target' },
{ id: 'av12', emoji: '🏆', label: 'Trophy' }];


function SectionCard({ header, children }: {header: React.ReactNode;children: React.ReactNode;}) {
  return (
    <div style={{
      background: 'hsl(var(--color-card-cream))',
      border: '3px solid hsl(var(--color-black-border))',
      borderRadius: '10px',
      boxShadow: '5px 5px 0 hsl(var(--color-black-border))',
      overflow: 'hidden'
    }}>
      <div className="px-5 py-3" style={{ background: 'hsl(var(--color-card-cream))', borderBottom: '1px solid hsl(222 50% 16% / 0.10)' }}>
        {header}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>);

}

function InputField({ label, icon: Icon, value, onChange, type = 'text', disabled = false

}: {label: string;icon: React.ElementType;value: string;onChange?: (v: string) => void;type?: string;disabled?: boolean;}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-black uppercase tracking-wide" style={{ color: 'hsl(var(--color-label))' }}>{label}</label>
      <div className="flex items-center gap-2 px-3 py-2 rounded" style={{
        background: disabled ? 'hsl(var(--color-navy-mid))' : 'hsl(var(--color-card-cream))',
        border: '2px solid hsl(var(--color-input-border))'
      }}>
        <Icon size={14} style={{ color: 'hsl(var(--color-sidebar-text))' }} />
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'hsl(var(--color-input-text))' }} />
        
      </div>
    </div>);

}

export default function ProfilePage() {
  const { data: session } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedAvatar, setSelectedAvatar] = useState('av1');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [name, setName] = useState(session?.user?.name ?? '');
  const [university, setUniversity] = useState('');
  // Auto-generate student number from user id — format: ATRC-YYYY-XXXXX
  const generateStudentNumber = (userId: string) => {
    const year = new Date().getFullYear();
    const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const seq = String(hash % 100000).padStart(5, '0');
    return `ATRC-${year}-${seq}`;
  };
  const [studentNumber] = useState(() => generateStudentNumber(session?.user?.id ?? 'guest'));
  const [editingId, setEditingId] = useState(false);

  const [username, setUsername] = useState('');
  const [uniCred, setUniCred] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [editingCreds, setEditingCreds] = useState(false);

  const [notifAchievements, setNotifAchievements] = useState(true);
  const [notifEvents, setNotifEvents] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const currentAvatarEmoji = BUILT_IN_AVATARS.find((a) => a.id === selectedAvatar)?.emoji ?? '🦁';

  return (
    <AppShell activeSection="profile">
      <Helmet>
        <title>Profile — ATRC Premium</title>
        <meta name="description" content="Manage your ATRC ID, credentials, and notification preferences." />
      </Helmet>

      <div className="p-3 sm:p-4 md:p-6 max-w-3xl mx-auto space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black uppercase" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))' }}>{profile.heading}</h1>

        {/* ATRC ID Card */}
        <SectionCard header={<h2 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{profile.sections.idCard}</h2>}>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
                style={{ border: '3px solid hsl(var(--color-gold))', background: 'hsl(var(--color-navy-mid))' }}
                onClick={() => setShowAvatarPicker(true)}>
                
                {uploadedPhoto ?
                <img src={uploadedPhoto} alt="avatar" className="w-full h-full object-cover" /> :
                <span className="text-5xl">{currentAvatarEmoji}</span>
                }
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                  <Camera size={20} style={{ color: 'hsl(var(--color-gold))' }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAvatarPicker(true)} className="text-[10px] font-bold uppercase px-2 py-1 rounded" style={{ background: 'hsl(var(--color-gold) / 0.15)', color: 'hsl(var(--color-gold))', border: '1.5px solid hsl(var(--color-gold) / 0.4)' }}>Avatar</button>
                <button onClick={() => fileRef.current?.click()} className="text-[10px] font-bold uppercase px-2 py-1 rounded" style={{ background: 'hsl(var(--color-gold) / 0.15)', color: 'hsl(var(--color-gold))', border: '1.5px solid hsl(var(--color-gold) / 0.4)' }}>Upload</button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <InputField label="Full Name" icon={User} value={name} onChange={editingId ? setName : undefined} disabled={!editingId} />
              <InputField label="University" icon={GraduationCap} value={university} onChange={editingId ? setUniversity : undefined} disabled={!editingId} />
              <InputField label="Email" icon={Mail} value={session?.user?.email ?? ''} disabled />
              <InputField label="Student Number" icon={Hash} value={studentNumber} onChange={undefined} disabled={true} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            {editingId ?
            <div className="flex gap-2">
                <button onClick={() => setEditingId(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ border: '2px solid hsl(var(--color-black-border))', color: 'hsl(var(--color-body-text))' }}><X size={13} /> Cancel</button>
                <button onClick={() => setEditingId(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Save size={13} /> Save</button>
              </div> :

            <button onClick={() => setEditingId(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Edit2 size={13} /> Edit</button>
            }
          </div>
        </SectionCard>

        {/* Avatar Picker Modal */}
        {showAvatarPicker &&
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAvatarPicker(false)}>
            <div className="w-full max-w-sm p-5 rounded-xl" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', boxShadow: '6px 6px 0 hsl(var(--color-black-border))' }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black uppercase text-sm" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{profile.sections.chooseAvatar}</h3>
                <button onClick={() => setShowAvatarPicker(false)}><X size={16} /></button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {BUILT_IN_AVATARS.map((av) =>
              <button key={av.id} onClick={() => {setSelectedAvatar(av.id);setUploadedPhoto(null);setShowAvatarPicker(false);}} className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all" style={{ background: selectedAvatar === av.id ? 'hsl(var(--color-gold) / 0.2)' : 'transparent', border: selectedAvatar === av.id ? '2px solid hsl(var(--color-gold))' : '2px solid transparent' }}>
                    <span className="text-3xl">{av.emoji}</span>
                    <span className="text-[9px] font-bold uppercase" style={{ color: 'hsl(var(--color-body-muted))' }}>{av.label}</span>
                  </button>
              )}
              </div>
            </div>
          </div>
        }

        {/* Manage Credentials */}
        <SectionCard header={<h2 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{profile.sections.credentials}</h2>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Username" icon={AtSign} value={username} onChange={editingCreds ? setUsername : undefined} disabled={!editingCreds} />
            <InputField label="University" icon={GraduationCap} value={uniCred} onChange={editingCreds ? setUniCred : undefined} disabled={!editingCreds} />
            {editingCreds && <>
              <InputField label="Current Password" icon={Lock} value={currentPw} onChange={setCurrentPw} type="password" />
              <InputField label="New Password" icon={Lock} value={newPw} onChange={setNewPw} type="password" />
            </>}
          </div>
          <div className="flex justify-end mt-4">
            {editingCreds ?
            <div className="flex gap-2">
                <button onClick={() => setEditingCreds(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ border: '2px solid hsl(var(--color-black-border))', color: 'hsl(var(--color-body-text))' }}><X size={13} /> Cancel</button>
                <button onClick={() => setEditingCreds(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Save size={13} /> Save</button>
              </div> :

            <button onClick={() => setEditingCreds(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Edit2 size={13} /> Edit</button>
            }
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard header={<h2 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{profile.sections.notifications}</h2>}>
          <div className="space-y-3">
            {([
            { label: 'Achievement unlocked', sub: 'Get notified when you earn a new badge or title', value: notifAchievements, set: setNotifAchievements },
            { label: 'Events & announcements', sub: 'Upcoming events, new announcements from admin', value: notifEvents, set: setNotifEvents },
            { label: 'Streak milestones', sub: 'Alerts at 7, 14, 30, 60, and 100-day streaks', value: notifStreak, set: setNotifStreak }] as
            {label: string;sub: string;value: boolean;set: (v: boolean) => void;}[]).map(({ label, sub, value, set }) =>
            <div key={label} className="flex items-center justify-between gap-4 py-2" style={{ borderBottom: '1px solid hsl(var(--color-divider-cream))' }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'hsl(var(--color-body-text))' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>{sub}</p>
                </div>
                <button onClick={() => set(!value)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded shrink-0 transition-all" style={{ background: value ? 'hsl(var(--color-gold))' : 'hsl(var(--color-navy-mid))', color: value ? 'hsl(var(--color-black-border))' : 'hsl(var(--color-body-muted))', border: '2px solid hsl(var(--color-black-border))', boxShadow: value ? '2px 2px 0 hsl(var(--color-black-border))' : 'none' }}>
                  {value ? <><Bell size={12} /> On</> : <><BellOff size={12} /> Off</>}
                </button>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </AppShell>);

}