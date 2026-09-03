import React from 'react';
import { IconCreditCard, IconSun, IconMoon, IconFilePlus, IconBook, IconFolderOpen, IconFolder, IconChevronDown, IconFile, IconLoader, IconEdit } from '@tabler/icons-react';
import { Switch } from './editor-switch';

export const DashboardView = (props: any) => {
  const {
    isAnyModalOpen, setIsPricingOpen, toggleDarkMode, isDarkMode, activeDashboardTab,
    onCreateDocument, showAlertModal, language, documents, groupedDocs, dashboardExpandedProjects,
    setDashboardExpandedProjects, onSelectDocument, loadingAdminPlans, adminPlans,
    handleOpenCreateModal, handleOpenEditModal, handleDeletePlan, isEn, aiModels,
    handleOpenCreateProviderModal, handleOpenCreateModelModal, handleToggleModelStatus,
    handleOpenEditModelModal, handleDeleteModel, handleOpenEditProviderModal,
    gatewaysList, handleToggleGateway, togglingGatewayId,
    profile, user, role, activePlanId, DEFAULT_PROVIDERS, aiProviders,
    handleDeleteProvider, handleTestModelConnection, testingModelId
  } = props;

  return (
    <>
        <div className={`flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 font-sans ${isAnyModalOpen ? 'select-none pointer-events-none' : ''}`}>
          <header className="flex items-center justify-between border-b border-slate-200/60 bg-white/95 px-6 py-3 sticky top-0 z-10 backdrop-blur">
            <div className="flex items-center gap-3">

              <span className="text-base font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                ScholarFlow Dashboard
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPricingOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm cursor-pointer"
              >
                <IconCreditCard className="h-4 w-4 text-slate-400" />
                Pricing
              </button>

              <button
                onClick={toggleDarkMode}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm cursor-pointer"
                title="Toggle Mode Gelap/Terang"
              >
                {isDarkMode ? (
                  <>
                    <IconSun className="h-4 w-4 text-amber-500" />
                    <span>Terang</span>
                  </>
                ) : (
                  <>
                    <IconMoon className="h-4 w-4 text-indigo-500" />
                    <span>Gelap</span>
                  </>
                )}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">

            {activeDashboardTab === 'user' ? (
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-fade-in">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-col gap-2 max-w-lg">
                    <h1 className="text-xl md:text-2xl font-bold leading-tight">
                      Selamat datang kembali di ScholarFlow!
                    </h1>
                    <p className="text-xs md:text-sm text-indigo-100/90 leading-normal">
                      Platform asisten penulisan karya ilmiah Anda. Kelola draf jurnal akademik dan referensi PDF dalam satu tempat.
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 h-64 w-64 rounded-full border-[20px] border-white" />
                </div>

                {/* Quick Actions Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={onCreateDocument}
                    className="flex items-start gap-4 p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md rounded-2xl text-left cursor-pointer transition group"
                  >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition">
                      <IconFilePlus className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-800">Buat Dokumen Baru</span>
                      <span className="text-xs text-slate-400 leading-normal">Mulai menulis draf jurnal akademik baru dengan panduan format sitasi CSL.</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      showAlertModal(
                        'Kelola Rujukan PDF',
                        language === 'en'
                          ? "Please click the 'Library' menu in the left sidebar to manage your PDF references."
                          : "Silakan klik menu 'Library' di sidebar kiri untuk mengelola rujukan PDF Anda.",
                        'info'
                      );
                    }}
                    className="flex items-start gap-4 p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md rounded-2xl text-left cursor-pointer transition group"
                  >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition">
                      <IconBook className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-800">Kelola Koleksi Jurnal (Library)</span>
                      <span className="text-xs text-slate-400 leading-normal">Unggah berkas PDF / RIS Anda untuk dijadikan rujukan asisten AI.</span>
                    </div>
                  </button>
                </div>

                {/* Recent Documents list */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
                  <span className="text-sm font-bold text-slate-800">Daftar Dokumen Anda</span>

                  <div className="flex flex-col gap-1.5">
                    {documents.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {/* 1. Project Folders */}
                        {groupedDocs.projects.map((proj) => {
                          const isExpandedProject = !!dashboardExpandedProjects[proj.id];

                          return (
                            <div key={proj.id} className="flex flex-col gap-1 border border-slate-100 bg-slate-50/10 rounded-2xl p-3 shadow-sm">
                              {/* Project Header Row */}
                              <button
                                type="button"
                                onClick={() => setDashboardExpandedProjects(prev => ({ ...prev, [proj.id]: !isExpandedProject }))}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left transition hover:bg-slate-100/50 cursor-pointer"
                              >
                                <div className="flex items-center gap-3 truncate">
                                  {isExpandedProject ? (
                                    <IconFolderOpen className="h-5 w-5 text-indigo-500 shrink-0" />
                                  ) : (
                                    <IconFolder className="h-5 w-5 text-slate-400 shrink-0" />
                                  )}
                                  <span className="text-sm font-bold text-slate-800 truncate">{proj.name}</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize shrink-0">
                                    {proj.type}
                                  </span>
                                </div>
                                <IconChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpandedProject ? 'rotate-180' : ''}`} />
                              </button>

                              {/* Project Sub Documents */}
                              {isExpandedProject && (
                                <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-slate-100 ml-4.5 mt-1 animate-slide-in-top">
                                  {proj.docs.map((doc) => (
                                    <button
                                      key={doc.id}
                                      onClick={() => onSelectDocument?.(doc.id)}
                                      className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 rounded-xl text-left transition cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3">
                                        <IconFile className="h-4.5 w-4.5 text-slate-400" />
                                        <span className="text-xs font-semibold text-slate-700">
                                          📄 {doc.settings?.projectPart || doc.title}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        Diperbarui: {new Date(doc.updated_at).toLocaleDateString()}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* 2. Independent / Single Documents */}
                        {groupedDocs.independent.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1">Dokumen Mandiri</span>
                            {groupedDocs.independent.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() => onSelectDocument?.(doc.id)}
                                className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 rounded-xl text-left transition cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <IconFile className="h-4.5 w-4.5 text-slate-400" />
                                  <span className="text-xs font-semibold text-slate-700">{doc.title}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  Diperbarui: {new Date(doc.updated_at).toLocaleDateString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
                        <IconFile className="h-10 w-10 text-slate-300" />
                        <span className="text-xs text-slate-400">Belum ada dokumen yang dibuat.</span>
                        <button
                          onClick={onCreateDocument}
                          className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                        >
                          Buat Dokumen Sekarang
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeDashboardTab === 'admin-pricing' ? (
              /* Admin Pricing Dashboard View - Enterprise Layout */
              <div className="w-full flex flex-col gap-6 animate-fade-in px-4 md:px-8 py-2">
                {/* Header Banner - Enterprise Rounded-XL */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-7 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative z-10 flex flex-col gap-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
                        Pricing Control Panel
                      </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold leading-tight text-slate-100">
                      Kelola Paket Harga & Layanan
                    </h1>
                    <p className="text-xs text-slate-300 leading-normal font-normal">
                      Atur harga paket langganan secara dinamis, berikan teks promosi musiman, ubah daftar fitur unggulan, dan kelola CRUD data paket.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreateModal}
                    className="relative z-10 flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition-all duration-200 cursor-pointer self-start md:self-auto"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Paket Baru
                  </button>
                </div>

                {loadingAdminPlans ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200/90 rounded-xl shadow-sm">
                    <IconLoader className="h-8 w-8 text-indigo-600 animate-spin" />
                    <span className="text-xs text-slate-400 font-semibold">Memuat data paket pricing...</span>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-6 py-3 font-semibold min-w-[140px]">ID Paket</th>
                            <th className="px-6 py-3 font-semibold min-w-[200px]">Nama Paket</th>
                            <th className="px-6 py-3 font-semibold min-w-[160px]">Harga (Rp)</th>
                            <th className="px-6 py-3 font-semibold min-w-[120px]">Periode</th>
                            <th className="px-6 py-3 font-semibold min-w-[220px]">Promo Tagline</th>
                            <th className="px-6 py-3 font-semibold text-center w-[140px]">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {adminPlans.map((plan) => {
                            return (
                              <tr key={plan.id} className="hover:bg-slate-50/60 transition-all duration-150">
                                {/* ID Paket */}
                                <td className="px-6 py-4 align-middle font-mono font-bold text-slate-800">
                                  {plan.id}
                                </td>

                                {/* Nama Paket */}
                                <td className="px-6 py-4 align-middle font-bold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    {plan.name}
                                    {plan.is_popular && (
                                      <span className="text-[9px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                        Terpopuler
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Harga */}
                                <td className="px-6 py-4 align-middle">
                                  {plan.price === 0 ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200/60">
                                      Gratis
                                    </span>
                                  ) : plan.price < 0 ? (
                                    <span className="text-slate-500 font-medium">Custom (Hubungi Kami)</span>
                                  ) : (
                                    <span className="font-mono text-slate-700 font-medium text-[11px]">Rp {plan.price.toLocaleString('id-ID')}</span>
                                  )}
                                </td>

                                {/* Periode */}
                                <td className="px-6 py-4 align-middle text-slate-600 capitalize">
                                  {plan.price < 0 ? '-' : `/${plan.price_period}`}
                                </td>

                                {/* Promo Tagline */}
                                <td className="px-6 py-4 align-middle">
                                  {plan.promo_text ? (
                                    <span className="text-slate-600">{plan.promo_text}</span>
                                  ) : (
                                    <span className="text-slate-300 italic text-[11px]">- Kosong -</span>
                                  )}
                                </td>

                                {/* Aksi */}
                                <td className="px-6 py-4 align-middle text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleOpenEditModal(plan)}
                                      className="flex items-center justify-center p-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer"
                                      title="Edit detail & fitur paket"
                                    >
                                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                      </svg>
                                    </button>

                                    <button
                                      onClick={() => handleDeletePlan(plan.id)}
                                      className="flex items-center justify-center p-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-650 rounded-xl transition cursor-pointer"
                                      title="Hapus paket langganan"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : activeDashboardTab === 'admin-models' ? (
              /* Admin AI Models Dashboard View - Enterprise 2-Section Grouped Layout */
              <div className="w-full flex flex-col gap-6 animate-fade-in px-4 md:px-8 py-2">
                {/* Header Banner - Enterprise Rounded-XL */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-7 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative z-10 flex flex-col gap-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
                        AI Gateway Admin Panel
                      </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold leading-tight text-slate-100">
                      {isEn ? 'Manage AI Models & LLM Gateway' : 'Kelola Model AI & LLM Gateway'}
                    </h1>
                    <p className="text-xs text-slate-300 leading-normal font-normal">
                      {isEn
                        ? 'Configure AI models, API Model IDs (Google Gemini & OpenRouter), and set subscription access limits (Free vs Pro Writer).'
                        : 'Atur model kecerdasan buatan, konfigurasi API Model ID (Google Gemini & OpenRouter), dan tentukan batasan paket langganan (Free vs Pro Writer).'}
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center gap-2.5 self-start md:self-auto">
                    <button
                      onClick={handleOpenCreateProviderModal}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.14.15-.3.3-.46.46m4.24-4.24a5 5 0 11-7.07 0 5 5 0 017.07 0z" />
                      </svg>
                      {isEn ? 'Manage Providers' : 'Kelola Provider AI'}
                    </button>
                    <button
                      onClick={handleOpenCreateModelModal}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      {isEn ? 'Add New Model' : 'Tambah Model Baru'}
                    </button>
                  </div>
                </div>

                {/* Stats Overview Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-500">{isEn ? 'Total AI Models' : 'Total Model AI'}</span>
                      <span className="text-xl font-bold text-slate-900">{aiModels.length}</span>
                    </div>
                    <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600 font-bold text-xs">
                      LLM
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-500">{isEn ? 'Free Tier Models' : 'Model Free Tier'}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl font-bold text-slate-900">
                          {aiModels.filter(m => !m.is_premium).length}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                          {aiModels.filter(m => !m.is_premium && m.is_enabled).length} {isEn ? 'Active' : 'Aktif'}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600 font-bold text-xs">
                      FREE
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-500">{isEn ? 'Pro Writer Models' : 'Model Pro Writer'}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl font-bold text-slate-900">
                          {aiModels.filter(m => m.is_premium).length}
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                          {aiModels.filter(m => m.is_premium && m.is_enabled).length} {isEn ? 'Active' : 'Aktif'}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600 font-bold text-xs">
                      PRO
                    </div>
                  </div>
                </div>

                {/* Section 0: Registered AI Providers */}
                <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md font-bold text-xs">
                        🔌
                      </span>
                      <div className="flex flex-col">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          {isEn ? 'Registered AI Providers & Gateways' : 'Provider AI Terdaftar & Gateway Kredensial'}
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                            {(aiProviders || DEFAULT_PROVIDERS).length} {isEn ? 'Providers' : 'Provider'}
                          </span>
                        </h2>
                        <p className="text-xs text-slate-500 font-normal">
                          {isEn ? 'Configure API keys and endpoints once for multi-model integration.' : 'Konfigurasi API key dan base URL sekali saja untuk menghubungkan banyak model AI.'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleOpenCreateProviderModal}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer self-start md:self-auto"
                    >
                      + {isEn ? 'Add Provider' : 'Tambah Provider AI'}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3 font-semibold min-w-[140px]">{isEn ? 'Provider ID' : 'ID Provider'}</th>
                          <th className="px-6 py-3 font-semibold min-w-[200px]">{isEn ? 'Provider Name' : 'Nama Provider'}</th>
                          <th className="px-6 py-3 font-semibold min-w-[140px]">{isEn ? 'Engine Type' : 'Tipe Engine'}</th>
                          <th className="px-6 py-3 font-semibold min-w-[220px]">{isEn ? 'API Base URL' : 'API Base URL'}</th>
                          <th className="px-6 py-3 font-semibold min-w-[160px]">{isEn ? 'API Key Status' : 'Status API Key'}</th>
                          <th className="px-6 py-3 font-semibold text-center w-[140px]">{isEn ? 'Actions' : 'Aksi'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {(aiProviders || DEFAULT_PROVIDERS).map((provider) => (
                          <tr key={provider.id} className="hover:bg-slate-50/60 transition-all duration-150">
                            <td className="px-6 py-4 align-middle font-mono font-bold text-slate-800">
                              {provider.id}
                            </td>
                            <td className="px-6 py-4 align-middle font-bold text-slate-900">
                              {provider.name}
                            </td>
                            <td className="px-6 py-4 align-middle">
                              <span className="px-2 py-1 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                {provider.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 align-middle font-mono text-[11px] text-slate-600">
                              {provider.base_url || <span className="text-slate-400 italic">Default API Endpoint</span>}
                            </td>
                            <td className="px-6 py-4 align-middle">
                              {provider.api_key ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200/60">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  Key Set (...{provider.api_key.slice(-4)})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono text-[11px] font-bold border border-amber-200/60">
                                  Global .env Key
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 align-middle text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditProviderModal(provider)}
                                  className="flex items-center justify-center p-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer"
                                  title="Edit detail provider & API Key"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>
                                {provider.is_built_in ? (
                                  <span className="text-[10px] text-slate-400 font-bold px-1.5 py-1 bg-slate-100 rounded" title="Provider bawaan sistem tidak dapat dihapus">Built-in</span>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteProvider(provider.id)}
                                    className="flex items-center justify-center p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                                    title="Hapus provider AI ini"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 1: Model Free Tier (Gratis) */}
                <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md font-bold text-xs">
                        🎁
                      </span>
                      <div className="flex flex-col">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          {isEn ? 'Free Tier AI Models (Free)' : 'Model AI Free Tier (Gratis)'}
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                            {aiModels.filter(m => !m.is_premium).length} {isEn ? 'Models' : 'Model'}
                          </span>
                        </h2>
                        <p className="text-xs text-slate-500 font-normal">
                          {isEn ? 'Accessible directly by all basic account users (Free Writer).' : 'Dapat diakses langsung oleh seluruh pengguna akun dasar (Free Writer).'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3 font-semibold min-w-[140px]">{isEn ? 'Status & Toggle' : 'Status & Toggle'}</th>
                          <th className="px-6 py-3 font-semibold min-w-[130px]">{isEn ? 'Gateway Key' : 'Gateway Key'}</th>
                          <th className="px-6 py-3 font-semibold min-w-[200px]">{isEn ? 'Model Display Name' : 'Nama Tampilan Model'}</th>
                          <th className="px-6 py-3 font-semibold min-w-[170px]">{isEn ? 'API Provider Type' : 'Tipe Provider API'}</th>
                          <th className="px-6 py-3 font-semibold min-w-[240px]">{isEn ? 'Real API Model ID' : 'ID Model API Asli'}</th>
                          <th className="px-6 py-3 font-semibold min-w-[130px]">{isEn ? 'Access Tier' : 'Hak Akses'}</th>
                          <th className="px-6 py-3 font-semibold text-center w-[140px]">{isEn ? 'Actions' : 'Aksi'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {aiModels.filter(m => !m.is_premium).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs font-normal">
                              {isEn ? 'No Free Tier AI models added yet. Click Add New Model above.' : 'Belum ada model AI untuk Free Tier. Klik tombol Tambah Model Baru di atas.'}
                            </td>
                          </tr>
                        ) : (
                          aiModels.filter(m => !m.is_premium).map((model) => (
                            <tr key={model.id} className="hover:bg-slate-50/60 transition-all duration-150">
                              {/* Status & Quick Toggle */}
                              <td className="px-6 py-4 align-middle">
                                <button
                                  onClick={() => handleToggleModelStatus(model)}
                                  className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
                                  title={isEn ? 'Click to toggle active status' : 'Klik untuk mengubah status aktif/non-aktif'}
                                >
                                  <div className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-200 ease-in-out ${model.is_enabled
                                    ? 'bg-emerald-500 border-emerald-600 shadow-sm shadow-emerald-500/20 ring-2 ring-emerald-500/20'
                                    : 'bg-slate-300 border-slate-400/90 shadow-inner'
                                    }`}>
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${model.is_enabled ? 'translate-x-5' : 'translate-x-0.5'
                                      }`} />
                                  </div>
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-all ${model.is_enabled
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200/80'
                                    : 'text-slate-600 bg-slate-100 border-slate-300'
                                    }`}>
                                    {model.is_enabled ? (isEn ? 'Active' : 'Aktif') : 'Off'}
                                  </span>
                                </button>
                              </td>

                              {/* Gateway Key */}
                              <td className="px-6 py-4 align-middle font-bold text-slate-800 uppercase tracking-wide">
                                {model.id}
                              </td>

                              {/* Nama Tampilan Model */}
                              <td className="px-6 py-4 align-middle font-semibold text-slate-900 text-xs">
                                {model.name}
                              </td>

                              {/* Tipe Provider API */}
                              <td className="px-6 py-4 align-middle">
                                {model.provider_type === 'gemini' || model.id === 'gemini' || model.model_id.includes('gemini') ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                    Google Gemini
                                  </span>
                                ) : model.provider_type === 'huggingface' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Hugging Face
                                  </span>
                                ) : model.provider_type === 'groq' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Groq Cloud
                                  </span>
                                ) : model.provider_type === 'together' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Together AI
                                  </span>
                                ) : model.provider_type === 'custom_openai' || (model.base_url && model.base_url.trim().length > 0) ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                      Custom OpenAI
                                    </span>
                                    {model.base_url && (
                                      <span className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]" title={model.base_url}>
                                        {model.base_url}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    OpenRouter
                                  </span>
                                )}
                              </td>

                              {/* ID Model API Asli */}
                              <td className="px-6 py-4 align-middle font-mono text-slate-600 text-xs">
                                {model.model_id}
                              </td>

                              {/* Hak Akses */}
                              <td className="px-6 py-4 align-middle">
                                <span className="text-[10px] font-semibold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                                  Free Tier
                                </span>
                              </td>

                              {/* Aksi */}
                              <td className="px-6 py-4 align-middle text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleTestModelConnection(model)}
                                    disabled={testingModelId === model.id}
                                    className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition cursor-pointer disabled:opacity-50"
                                    title={isEn ? 'Test API Model Connection' : 'Uji Koneksi API Model'}
                                  >
                                    {testingModelId === model.id ? (
                                      <IconLoader className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                      </svg>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleOpenEditModelModal(model)}
                                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                    title={isEn ? 'Edit Details & API ID' : 'Edit Detail & API ID'}
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteModel(model.id)}
                                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                    title={isEn ? 'Delete Model' : 'Hapus Model'}
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 2: Model Pro Writer / Premium (Berbayar) */}
                <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-200/80 bg-indigo-50/30 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md font-bold text-xs">
                        ⭐
                      </span>
                      <div className="flex flex-col">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          {isEn ? 'Pro Writer AI Models (Premium)' : 'Model AI Pro Writer / Premium (Berbayar)'}
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                            {aiModels.filter(m => m.is_premium).length} {isEn ? 'Models' : 'Model'}
                          </span>
                        </h2>
                        <p className="text-xs text-slate-500 font-normal">
                          {isEn ? 'Restricted to Pro Writer subscription plan subscribers.' : 'Khusus untuk pengguna berlangganan paket Pro Writer.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3 font-semibold min-w-[140px]">Status & Toggle</th>
                          <th className="px-6 py-3 font-semibold min-w-[130px]">Gateway Key</th>
                          <th className="px-6 py-3 font-semibold min-w-[200px]">Nama Tampilan Model</th>
                          <th className="px-6 py-3 font-semibold min-w-[170px]">Tipe Provider API</th>
                          <th className="px-6 py-3 font-semibold min-w-[240px]">ID Model API Asli</th>
                          <th className="px-6 py-3 font-semibold min-w-[130px]">Hak Akses</th>
                          <th className="px-6 py-3 font-semibold text-center w-[140px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {aiModels.filter(m => m.is_premium).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs font-normal">
                              {isEn ? 'No Pro Writer AI models added yet. Click Add New Model above.' : 'Belum ada model AI untuk Pro Writer. Klik tombol Tambah Model Baru di atas.'}
                            </td>
                          </tr>
                        ) : (
                          aiModels.filter(m => m.is_premium).map((model) => (
                            <tr key={model.id} className="hover:bg-slate-50/60 transition-all duration-150">
                              {/* Status & Quick Toggle */}
                              <td className="px-6 py-4 align-middle">
                                <button
                                  onClick={() => handleToggleModelStatus(model)}
                                  className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
                                  title={isEn ? 'Click to toggle active status' : 'Klik untuk mengubah status aktif/non-aktif'}
                                >
                                  <div className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-200 ease-in-out ${model.is_enabled
                                    ? 'bg-indigo-600 border-indigo-700 shadow-sm shadow-indigo-500/20 ring-2 ring-indigo-500/20'
                                    : 'bg-slate-300 border-slate-400/90 shadow-inner'
                                    }`}>
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${model.is_enabled ? 'translate-x-5' : 'translate-x-0.5'
                                      }`} />
                                  </div>
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-all ${model.is_enabled
                                    ? 'text-indigo-700 bg-indigo-50 border-indigo-200/80'
                                    : 'text-slate-600 bg-slate-100 border-slate-300'
                                    }`}>
                                    {model.is_enabled ? (isEn ? 'Active' : 'Aktif') : 'Off'}
                                  </span>
                                </button>
                              </td>

                              {/* Gateway Key */}
                              <td className="px-6 py-4 align-middle font-bold text-slate-800 uppercase tracking-wide">
                                {model.id}
                              </td>

                              {/* Nama Tampilan Model */}
                              <td className="px-6 py-4 align-middle font-semibold text-slate-900 text-xs">
                                {model.name}
                              </td>

                              {/* Tipe Provider API */}
                              <td className="px-6 py-4 align-middle">
                                {model.provider_type === 'gemini' || model.id === 'gemini' || model.model_id.includes('gemini') ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                    Google Gemini
                                  </span>
                                ) : model.provider_type === 'huggingface' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Hugging Face
                                  </span>
                                ) : model.provider_type === 'groq' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Groq Cloud
                                  </span>
                                ) : model.provider_type === 'together' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Together AI
                                  </span>
                                ) : model.provider_type === 'custom_openai' || (model.base_url && model.base_url.trim().length > 0) ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                      Custom OpenAI
                                    </span>
                                    {model.base_url && (
                                      <span className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]" title={model.base_url}>
                                        {model.base_url}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    OpenRouter
                                  </span>
                                )}
                              </td>

                              {/* ID Model API Asli */}
                              <td className="px-6 py-4 align-middle font-mono text-slate-600 text-xs">
                                {model.model_id}
                              </td>

                              {/* Hak Akses */}
                              <td className="px-6 py-4 align-middle">
                                <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                                  Pro Writer
                                </span>
                              </td>

                              {/* Aksi */}
                              <td className="px-6 py-4 align-middle text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleTestModelConnection(model)}
                                    disabled={testingModelId === model.id}
                                    className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition cursor-pointer disabled:opacity-50"
                                    title={isEn ? 'Test API Model Connection' : 'Uji Koneksi API Model'}
                                  >
                                    {testingModelId === model.id ? (
                                      <IconLoader className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                      </svg>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleOpenEditModelModal(model)}
                                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                    title={isEn ? 'Edit Details & API ID' : 'Edit Detail & API ID'}
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteModel(model.id)}
                                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                    title={isEn ? 'Delete Model' : 'Hapus Model'}
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            ) : activeDashboardTab === 'admin-gateways' ? (
              /* Admin Payment Gateways Dashboard View - Enterprise Layout */
              <div className="w-full flex flex-col gap-6 animate-fade-in px-4 md:px-8 py-2">
                {/* Header Banner - Enterprise Rounded-XL */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-7 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative z-10 flex flex-col gap-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
                        Finance & Gateway
                      </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold leading-tight text-slate-100">
                      Kelola Saluran Pembayaran
                    </h1>
                    <p className="text-xs text-slate-300 leading-normal font-normal">
                      Konfigurasikan metode pembayaran Stripe dan Midtrans, atur API Merchant Key, dan aktifkan integrasi transaksi tagihan langganan otomatis.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3 font-semibold min-w-[140px]">Status</th>
                          <th className="px-6 py-3 font-semibold min-w-[200px]">Platform Gateway</th>
                          <th className="px-6 py-3 font-semibold min-w-[260px]">Client Key / Publishable Key</th>
                          <th className="px-6 py-3 font-semibold min-w-[260px]">Server Key / Secret Key</th>
                          <th className="px-6 py-3 font-semibold text-center w-[100px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {gatewaysList.map((g) => (
                          <tr key={g.id} className="hover:bg-slate-50/60 transition-all duration-150">
                            {/* Status */}
                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={g.is_enabled}
                                  onChange={() => handleToggleGateway(g.id, !g.is_enabled)}
                                  disabled={togglingGatewayId === g.id}
                                />
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${g.is_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                  <span className="text-[10px] text-slate-500 font-bold uppercase">{g.is_enabled ? 'Aktif' : 'Off'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Platform Gateway */}
                            <td className="px-6 py-4 align-middle">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-900">{g.name}</span>
                                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">
                                  {g.id === 'stripe' ? 'Internasional' : 'Lokal / Bank'}
                                </span>
                              </div>
                            </td>

                            {/* Client/Publishable Key */}
                            <td className="px-6 py-4 align-middle">
                              <input
                                type="text"
                                value={g.id === 'stripe' ? 'pk_test_51NxM2aGS9r89123891789' : 'SB-Mid-client-8aHs12Hsa'}
                                disabled
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 outline-none transition bg-slate-50 font-mono select-all"
                              />
                            </td>

                            {/* Server/Secret Key */}
                            <td className="px-6 py-4 align-middle">
                              <input
                                type="password"
                                value="••••••••••••••••••••••••••••••••••••"
                                disabled
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 outline-none transition bg-slate-50 font-mono"
                              />
                            </td>

                            {/* Aksi */}
                            <td className="px-6 py-4 align-middle text-center">
                              <div className="flex items-center justify-center">
                                <button
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                                  title="Edit Kredensial"
                                >
                                  <IconEdit className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* Billing & Account View */
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-fade-in">
                {/* Account profile card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-2xl font-extrabold text-indigo-700">
                    {profile?.full_name?.slice(0, 2).toUpperCase() || 'SF'}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-center md:text-left">
                    <span className="text-base font-bold text-slate-800">{profile?.full_name || 'User ScholarFlow'}</span>
                    <span className="text-xs text-slate-400">{user?.email || 'email@scholarflow.app'}</span>
                    <div className="mt-2 flex flex-wrap gap-2 items-center justify-center md:justify-start">
                      <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Role: {role}
                      </span>
                      <span className={`px-2.5 py-0.5 border rounded-md text-[10px] font-bold uppercase tracking-wider ${activePlanId === 'pro'
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                        : 'bg-slate-100 border-slate-200/80 text-slate-500'
                        }`}>
                        Paket: {activePlanId === 'pro' ? 'Pro Writer' : 'Free Plan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing Status & Expiration info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <span className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Status Langganan</span>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Masa Aktif Layanan</span>
                      {activePlanId === 'pro' ? (
                        <span className="text-xs font-semibold text-slate-700">
                          Aktif sampai dengan: <span className="text-indigo-600 font-bold">{profile?.subscription_end ? new Date(profile.subscription_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Anda saat ini menggunakan paket gratis dengan fitur terbatas.
                        </span>
                      )}
                    </div>
                    {activePlanId !== 'pro' && (
                      <button
                        onClick={() => setIsPricingOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                      >
                        Upgrade ke Pro Writer
                      </button>
                    )}
                  </div>
                </div>

                {/* Transaction History & printable receipt */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <span className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Riwayat Transaksi</span>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-2 font-bold">No. Invoice</th>
                          <th className="pb-2 font-bold">Tanggal</th>
                          <th className="pb-2 font-bold">Nominal</th>
                          <th className="pb-2 font-bold">Metode</th>
                          <th className="pb-2 font-bold">Status</th>
                          <th className="pb-2 text-right font-bold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {activePlanId === 'pro' ? (
                          <tr>
                            <td className="py-3 font-semibold text-slate-700">INV-SF-90342</td>
                            <td className="py-3">Hari Ini</td>
                            <td className="py-3 font-bold text-slate-800">Rp 149.000</td>
                            <td className="py-3">Simulated Checkout</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded text-[9px] uppercase">
                                Lunas
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  const w = window.open('', '_blank');
                                  if (w) {
                                    w.document.write(`
                                    <html>
                                      <head>
                                        <title>Invoice INV-SF-90342</title>
                                        <style>
                                          body { font-family: sans-serif; padding: 40px; color: #333; }
                                          .invoice-box { max-w: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
                                          table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
                                          table td { padding: 5px; vertical-align: top; }
                                          table tr td:nth-child(2) { text-align: right; }
                                          table tr.top table td { padding-bottom: 20px; }
                                          table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; font-weight: bold; }
                                          table tr.information table td { padding-bottom: 40px; }
                                          table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
                                          table tr.details td { padding-bottom: 20px; }
                                          table tr.item td { border-bottom: 1px solid #eee; }
                                          table tr.item.last td { border-bottom: none; }
                                          table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="invoice-box">
                                          <table>
                                            <tr class="top">
                                              <td colspan="2">
                                                <table>
                                                  <tr>
                                                    <td class="title">ScholarFlow</td>
                                                    <td>
                                                      Invoice #: INV-SF-90342<br>
                                                      Tanggal: ${new Date().toLocaleDateString('id-ID')}<br>
                                                      Jatuh Tempo: LUNAS
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr class="information">
                                              <td colspan="2">
                                                <table>
                                                  <tr>
                                                    <td>
                                                      ScholarFlow Indonesia Inc.<br>
                                                      support@scholarflow.app
                                                    </td>
                                                    <td>
                                                      ${profile?.full_name || 'User ScholarFlow'}<br>
                                                      ${user?.email || 'email@scholarflow.app'}
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr class="heading">
                                              <td>Metode Pembayaran</td>
                                              <td>Jumlah</td>
                                            </tr>
                                            <tr class="details">
                                              <td>Global Gateway Simulation</td>
                                              <td>Rp 149.000</td>
                                            </tr>
                                            <tr class="heading">
                                              <td>Item Paket</td>
                                              <td>Harga</td>
                                            </tr>
                                            <tr class="item last">
                                              <td>Langganan Paket Pro Writer (30 Hari)</td>
                                              <td>Rp 149.000</td>
                                            </tr>
                                            <tr class="total">
                                              <td></td>
                                              <td>Total: Rp 149.000</td>
                                            </tr>
                                          </table>
                                        </div>
                                        <script>window.print();</script>
                                      </body>
                                    </html>
                                  `);
                                    w.document.close();
                                  }
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-850 font-bold transition cursor-pointer"
                              >
                                Cetak Struk
                              </button>
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-400">
                              Belum ada riwayat transaksi pembayaran.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </>
  );
}
