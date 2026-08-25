// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';
import { 
  IconSparkles, 
  IconBook, 
  IconFileExport, 
  IconLanguage,
  IconArrowRight,
  IconCheck,
  IconBrain,
  IconBulb
} from '@tabler/icons-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show nothing while checking auth state to prevent flash, 
  // but if it takes too long, we can just show the page.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">S</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, they will be redirected, return null to avoid flash
  if (user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Custom Keyframes for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}} />

      {/* Navbar */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="text-white font-bold text-lg leading-none">S</span>
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">
              ScholarFlow
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">Fitur</a>
            <a href="#pricing" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">Harga</a>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition px-2">
                Masuk
              </Link>
              <Link href="/login" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Mulai Gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-[20%] right-[-5%] w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up opacity-0">
            <IconSparkles className="w-4 h-4" />
            Platform Penulisan Jurnal Masa Depan
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl animate-fade-in-up opacity-0 animation-delay-200">
            Tulis Riset Ilmiah <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              10x Lebih Cepat
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed animate-fade-in-up opacity-0 animation-delay-400">
            Ruang kerja lengkap untuk peneliti dan mahasiswa. Dilengkapi Editor Cerdas, Manajemen Sitasi Otomatis, dan Asisten AI khusus untuk penulisan akademik.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up opacity-0 animation-delay-400">
            <Link href="/login" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold px-8 py-4 rounded-full transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-1 flex items-center justify-center gap-2">
              Mulai Menulis Sekarang
              <IconArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-base font-bold px-8 py-4 rounded-full transition flex items-center justify-center">
              Pelajari Lebih Lanjut
            </a>
          </div>

          {/* Interactive Hero Mockup */}
          <div className="mt-20 w-full max-w-5xl relative animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s' }}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white animate-float">
              {/* Mockup Header */}
              <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <div className="mx-auto bg-white border border-slate-200 rounded-md text-[10px] font-medium text-slate-400 px-10 py-1">
                  scholarflow.com/editor
                </div>
              </div>
              {/* Mockup Content */}
              <div className="flex h-[400px]">
                {/* Mock Sidebar */}
                <div className="hidden md:block w-48 border-r border-slate-100 bg-slate-50 p-4">
                  <div className="w-full h-4 bg-slate-200 rounded mb-4"></div>
                  <div className="w-3/4 h-3 bg-slate-200 rounded mb-3"></div>
                  <div className="w-5/6 h-3 bg-slate-200 rounded mb-3"></div>
                  <div className="w-2/3 h-3 bg-slate-200 rounded mb-3"></div>
                </div>
                {/* Mock Editor Area */}
                <div className="flex-1 p-8 lg:p-12 relative text-left">
                  <div className="w-3/4 h-8 bg-slate-200 rounded-md mb-6"></div>
                  <div className="w-full h-4 bg-slate-100 rounded mb-3"></div>
                  <div className="w-full h-4 bg-slate-100 rounded mb-3"></div>
                  <div className="w-5/6 h-4 bg-slate-100 rounded mb-6"></div>
                  
                  {/* Highlighted text being improved */}
                  <div className="inline-block relative">
                    <div className="w-96 h-4 bg-indigo-100 rounded mb-3"></div>
                    
                    {/* Floating AI Tool */}
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-indigo-100 p-3 flex items-center gap-3 w-64 z-20">
                      <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                        <IconSparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-indigo-600 uppercase mb-0.5">AI Suggestion</div>
                        <div className="w-full h-2 bg-slate-100 rounded"></div>
                      </div>
                      <div className="bg-indigo-50 text-indigo-600 rounded px-2 py-1 text-[10px] font-bold">
                        Apply
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-4 bg-slate-100 rounded mt-12 mb-3"></div>
                  <div className="w-4/5 h-4 bg-slate-100 rounded mb-3"></div>
                </div>
              </div>
            </div>
            
            {/* Decorative blurs behind mockup */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur-2xl opacity-20 -z-10"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Senjata Rahasia Akademisi</h2>
            <p className="text-slate-500 text-lg">
              Semua fitur yang Anda butuhkan untuk menyelesaikan riset, tesis, dan jurnal tanpa stres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <IconBrain className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">AI Academic Co-Pilot</h3>
              <p className="text-slate-600 leading-relaxed">
                Asisten AI cerdas (Gemini) yang siap memoles kalimat Anda menjadi lebih baku, merangkum paragraf, hingga membuatkan Abstrak secara otomatis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <IconBook className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Manajemen Sitasi Otomatis</h3>
              <p className="text-slate-600 leading-relaxed">
                Cari jutaan jurnal, masukkan sitasi dengan 1 klik, dan ScholarFlow akan menyusun Daftar Pustaka format APA secara real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <IconFileExport className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Export 1-Klik Sempurna</h3>
              <p className="text-slate-600 leading-relaxed">
                Ubah tulisan Anda menjadi file dokumen MS Word (.doc) atau PDF format standar kampus tanpa perlu merapikan margin lagi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <IconBulb className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Berhenti Membuang Waktu untuk Formatting. <br/> Fokus Pada Ide Anda.
          </h2>
          <p className="text-slate-300 text-xl mb-10">
            Bergabunglah dengan ribuan mahasiswa dan peneliti yang telah mempercepat proses penulisan akademik mereka.
          </p>
          <Link href="/login" className="inline-block bg-white text-slate-900 text-lg font-bold px-10 py-4 rounded-full hover:bg-indigo-50 transition shadow-xl hover:shadow-2xl hover:-translate-y-1">
            Buat Akun Gratis Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center">
              <span className="text-slate-500 font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-slate-700">ScholarFlow</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ScholarFlow Inc. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition">Privasi</a>
            <a href="#" className="hover:text-indigo-600 transition">Ketentuan</a>
            <a href="#" className="hover:text-indigo-600 transition">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
