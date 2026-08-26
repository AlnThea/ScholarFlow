// app/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-context';
import { MinimalSidebar } from '@/components/editor/minimal-sidebar';
import { IconUser, IconMail, IconLock, IconCheck, IconX, IconCrown } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const HelpModal = dynamic(() => import('@/components/editor/help-modal').then((mod) => mod.HelpModal), { ssr: false });
const BackendSettingsModal = dynamic(() => import('@/components/editor/backend-settings-modal').then((mod) => mod.BackendSettingsModal), { ssr: false });

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isBackendSettingsOpen, setIsBackendSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (profile && !fullName) {
      setFullName(profile.full_name || '');
    }
  }, [user, loading, router, profile]);

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="text-sm text-slate-400 font-medium">Loading Settings...</span>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) throw authError;

      // 3. Update password if provided
      if (password) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: password
        });
        if (pwError) throw pwError;
        setPassword(''); // clear field after success
      }

      setSaveStatus('success');
      if (refreshAuth) refreshAuth(); // refresh context
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      setErrorMessage(error.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const greetingName = profile.full_name || user.email?.split('@')[0] || 'Scholar';
  const isPro = profile.subscription_plan !== 'free';

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Left Sidebar */}
      <MinimalSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        documents={[]}
        currentDocumentId={null}
        onSelectDocument={(id) => router.push(`/editor/${id}`)}
        onCreateDocument={() => router.push('/dashboard')}
        onDeleteDocument={() => {}}
        onSelectAdminTab={(tab) => {
          if (tab === 'user') router.push('/dashboard');
          else if (tab === 'billing') router.push('/billing');
          else if (tab.startsWith('admin')) router.push('/admin');
        }}
        activeDashboardTab="user" // Since we don't have a specific tab for settings in the sidebar yet, fall back to user
        onOpenBackendSettings={() => setIsBackendSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-y-auto ${sidebarExpanded ? 'pl-0' : 'pl-0'}`}>
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-700">
                {language === 'en' ? 'Account Settings' : 'Pengaturan Akun'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition border border-slate-200"
              >
                {language === 'en' ? 'EN' : 'ID'}
              </button>
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
                {greetingName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Settings Content */}
        <main className="max-w-4xl w-full mx-auto px-6 py-12">
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Account Info Card */}
            <div className="w-full md:w-1/3">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                
                <div className="w-24 h-24 bg-white rounded-full p-1.5 mt-8 relative z-10 shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {greetingName.charAt(0).toUpperCase()}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-800 mt-4">{greetingName}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>

                <div className="mt-6 w-full flex flex-col gap-2">
                  <div className={`text-xs font-bold uppercase tracking-wider py-2 rounded-lg flex items-center justify-center gap-1.5 ${isPro ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {isPro ? <IconCrown className="w-4 h-4" /> : <IconUser className="w-4 h-4" />}
                    {isPro ? (language === 'en' ? 'Pro Member' : 'Member Pro') : (language === 'en' ? 'Free Plan' : 'Paket Gratis')}
                  </div>
                  {profile.role === 'admin' && (
                    <div className="text-xs font-bold uppercase tracking-wider py-2 rounded-lg bg-emerald-50 text-emerald-700">
                      System Administrator
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Edit Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-800">
                    {language === 'en' ? 'Profile Details' : 'Detail Profil'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {language === 'en' ? 'Update your personal information and security settings.' : 'Perbarui informasi pribadi dan pengaturan keamanan Anda.'}
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="p-6 flex flex-col gap-6">
                  {/* Status Alerts */}
                  {saveStatus === 'success' && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <IconCheck className="w-5 h-5" />
                      {language === 'en' ? 'Profile saved successfully!' : 'Profil berhasil disimpan!'}
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <IconX className="w-5 h-5" />
                      {errorMessage}
                    </div>
                  )}

                  {/* Email (Read Only) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <IconMail className="w-4 h-4 text-slate-400" />
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={user.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                    />
                    <span className="text-[11px] text-slate-400">
                      {language === 'en' ? 'Email address cannot be changed.' : 'Alamat email tidak dapat diubah.'}
                    </span>
                  </div>

                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <IconUser className="w-4 h-4 text-slate-400" />
                      {language === 'en' ? 'Full Name' : 'Nama Lengkap'}
                    </label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={language === 'en' ? 'Enter your full name' : 'Masukkan nama lengkap'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <IconLock className="w-4 h-4 text-slate-400" />
                      {language === 'en' ? 'New Password' : 'Password Baru'}
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={language === 'en' ? 'Leave blank to keep current password' : 'Kosongkan jika tidak ingin diubah'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                          </svg>
                          {language === 'en' ? 'Saving...' : 'Menyimpan...'}
                        </>
                      ) : (
                        language === 'en' ? 'Save Changes' : 'Simpan Perubahan'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </main>
      </div>

      <BackendSettingsModal
        isOpen={isBackendSettingsOpen}
        onClose={() => setIsBackendSettingsOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
