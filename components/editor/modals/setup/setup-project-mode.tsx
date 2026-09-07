import React from 'react';

interface SetupProjectModeProps {
  language: string;
  t: (key: string) => string;
  createMode: 'independent' | 'new_project' | 'exist_project';
  setCreateMode: (mode: 'independent' | 'new_project' | 'exist_project') => void;
  title: string;
  setTitle: (val: string) => void;
  newProjectName: string;
  setNewProjectName: (val: string) => void;
  newProjectType: 'skripsi' | 'jurnal' | 'makalah' | 'independent';
  setNewProjectType: (val: 'skripsi' | 'jurnal' | 'makalah' | 'independent') => void;
  selectedProjectId: string;
  setSelectedProjectId: (val: string) => void;
  projectPart: string;
  setProjectPart: (val: string) => void;
  existingProjects: { id: string; name: string; type: string }[];
}

export function SetupProjectMode({
  language,
  t,
  createMode,
  setCreateMode,
  title,
  setTitle,
  newProjectName,
  setNewProjectName,
  newProjectType,
  setNewProjectType,
  selectedProjectId,
  setSelectedProjectId,
  projectPart,
  setProjectPart,
  existingProjects,
}: SetupProjectModeProps) {
  return (
    <>
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold text-slate-700">{t('setup.type')}</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setCreateMode('independent')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
              createMode === 'independent'
                ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-semibold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-500'
            }`}
          >
            <span className="text-xs">{language === 'en' ? '📄 Independent' : '📄 Lepas'}</span>
            <span className="text-[9px] text-slate-400 mt-0.5">{t('setup.single')}</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateMode('new_project')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
              createMode === 'new_project'
                ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-semibold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-500'
            }`}
          >
            <span className="text-xs">{language === 'en' ? '📁 New Project' : '📁 Proyek Baru'}</span>
            <span className="text-[9px] text-slate-400 mt-0.5">{language === 'en' ? 'Create New Folder' : 'Bikin Folder Baru'}</span>
          </button>
          <button
            type="button"
            disabled={existingProjects.length === 0}
            onClick={() => setCreateMode('exist_project')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              createMode === 'exist_project'
                ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-semibold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-500'
            }`}
          >
            <span className="text-xs">{language === 'en' ? '➕ Join Folder' : '➕ Gabung Folder'}</span>
            <span className="text-[9px] text-slate-400 mt-0.5">{t('setup.folder')}</span>
          </button>
        </div>
      </div>

      {createMode === 'independent' && (
        <div className="flex flex-col gap-1.5 animate-fade-in">
          <label htmlFor="doc-title" className="text-xs font-bold text-slate-700">
            {language === 'en' ? 'Document / Article Title' : 'Judul Dokumen / Artikel'}
          </label>
          <input
            id="doc-title"
            type="text"
            placeholder={language === 'en' ? 'Design and Implementation of Donation Information System...' : 'Rancang Bangun Sistem Informasi Donasi...'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
      )}

      {createMode === 'new_project' && (
        <div className="flex flex-col gap-4 p-4 border border-indigo-100 bg-indigo-50/5 rounded-2xl animate-fade-in">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-name" className="text-xs font-bold text-slate-700">{t('setup.project_name')}</label>
            <input
              id="project-name"
              type="text"
              placeholder={language === 'en' ? 'Twitter Sentiment Analysis using LSTM...' : 'Analisis Sentimen Twitter menggunakan LSTM'}
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">{language === 'en' ? 'Writing Category' : 'Kategori Penulisan'}</label>
              <select
                value={newProjectType}
                onChange={(e) => setNewProjectType(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-white outline-none focus:border-indigo-500 transition"
              >
                <option value="skripsi">{language === 'en' ? '🎓 Thesis / Dissertation' : '🎓 Skripsi / Tesis / Disertasi'}</option>
                <option value="jurnal">{language === 'en' ? '📚 Journal / Scientific Paper' : '📚 Jurnal / Paper Ilmiah'}</option>
                <option value="makalah">{language === 'en' ? '📝 College Paper / Assignment' : '📝 Makalah / Tugas Kuliah'}</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="project-part" className="text-xs font-bold text-slate-700">{language === 'en' ? 'Section / Chapter Document Name' : 'Bagian / Nama Bab Dokumen'}</label>
              <input
                id="project-part"
                type="text"
                placeholder={language === 'en' ? 'Chapter 1: Introduction' : 'Bab 1: Pendahuluan'}
                value={projectPart}
                onChange={(e) => setProjectPart(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>
      )}

      {createMode === 'exist_project' && (
        <div className="flex flex-col gap-4 p-4 border border-indigo-100 bg-indigo-50/5 rounded-2xl animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">{language === 'en' ? 'Choose Project / Folder' : 'Pilih Proyek / Folder'}</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-white outline-none focus:border-indigo-500 transition"
              >
                {existingProjects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    📁 {proj.name} ({proj.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="project-part-exist" className="text-xs font-bold text-slate-700">{language === 'en' ? 'Section / Chapter Document Name' : 'Bagian / Nama Bab Dokumen'}</label>
              <input
                id="project-part-exist"
                type="text"
                placeholder={language === 'en' ? 'Chapter 2: Literature Review' : 'Bab 2: Tinjauan Pustaka'}
                value={projectPart}
                onChange={(e) => setProjectPart(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
