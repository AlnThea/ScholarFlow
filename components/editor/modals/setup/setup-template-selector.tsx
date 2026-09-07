import React from 'react';
import { IconSearch, IconX, IconBook, IconFilePlus, IconSchool, IconListDetails, IconAward } from '@tabler/icons-react';
import { TEMPLATES_METADATA, TemplateMetadata } from '@/lib/templates';

interface SetupTemplateSelectorProps {
  language: string;
  templateCategory: 'all' | 'academic' | 'journal' | 'general';
  setTemplateCategory: (val: 'all' | 'academic' | 'journal' | 'general') => void;
  templateSearch: string;
  setTemplateSearch: (val: string) => void;
  templateId: 'empty' | 'ieee' | 'skripsi' | 'apa' | 'report';
  setTemplateId: (val: 'empty' | 'ieee' | 'skripsi' | 'apa' | 'report') => void;
}

export function SetupTemplateSelector({
  language,
  templateCategory,
  setTemplateCategory,
  templateSearch,
  setTemplateSearch,
  templateId,
  setTemplateId,
}: SetupTemplateSelectorProps) {
  return (
    <div className="flex flex-col gap-4 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-800">
          {language === 'en' ? 'Choose Writing Template (Templates Gallery)' : 'Pilih Templat Penulisan (Templates Gallery)'}
        </label>
        <p className="text-[10px] text-slate-400">
          {language === 'en' ? 'Select a pre-structured template or start with a blank document.' : 'Pilih struktur templat siap pakai atau mulai dengan dokumen kosong.'}
        </p>
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {[
            { id: 'all', label: language === 'en' ? 'All' : 'Semua' },
            { id: 'academic', label: language === 'en' ? 'Academic' : 'Akademik' },
            { id: 'journal', label: language === 'en' ? 'Journals' : 'Jurnal' },
            { id: 'general', label: language === 'en' ? 'General' : 'Umum' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setTemplateCategory(cat.id as any)}
              className={`px-3 py-1.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                templateCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-[200px]">
          <input
            type="text"
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
            placeholder={language === 'en' ? 'Search templates...' : 'Cari templat...'}
            className="w-full border border-slate-200 rounded-lg pl-8 pr-7 py-1 text-[10px] text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          {templateSearch && (
            <button
              type="button"
              onClick={() => setTemplateSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition"
            >
              <IconX className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
        {TEMPLATES_METADATA.filter((t) => {
          if (templateCategory !== 'all' && t.category !== templateCategory) return false;
          if (templateSearch.trim()) {
            const query = templateSearch.toLowerCase().trim();
            const labelStr = (language === 'en' ? t.label.en : t.label.id).toLowerCase();
            const descStr = (language === 'en' ? t.desc.en : t.desc.id).toLowerCase();
            const tagsStr = t.tags.join(' ').toLowerCase();
            return labelStr.includes(query) || descStr.includes(query) || tagsStr.includes(query);
          }
          return true;
        }).map((t) => {
          const isSelected = templateId === t.id;
          const labelText = language === 'en' ? t.label.en : t.label.id;
          const descText = language === 'en' ? t.desc.en : t.desc.id;
          const badgeText = t.badge ? (language === 'en' ? t.badge.en : t.badge.id) : null;
          
          let colorClass = 'indigo';
          let iconBg = 'bg-indigo-50 text-indigo-600 border-indigo-100';
          let activeBorder = 'border-indigo-600 bg-indigo-50/10';
          let borderLine = 'bg-indigo-600';
          
          if (t.color === 'blue') {
            colorClass = 'blue';
            iconBg = 'bg-blue-50 text-blue-600 border-blue-100';
            activeBorder = 'border-blue-600 bg-blue-50/10';
            borderLine = 'bg-blue-600';
          } else if (t.color === 'emerald') {
            colorClass = 'emerald';
            iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-100';
            activeBorder = 'border-emerald-600 bg-emerald-50/10';
            borderLine = 'bg-emerald-600';
          } else if (t.color === 'violet') {
            colorClass = 'violet';
            iconBg = 'bg-violet-50 text-violet-600 border-violet-100';
            activeBorder = 'border-violet-600 bg-violet-50/10';
            borderLine = 'bg-violet-600';
          } else if (t.color === 'slate') {
            colorClass = 'slate';
            iconBg = 'bg-slate-50 text-slate-600 border-slate-200';
            activeBorder = 'border-slate-600 bg-slate-50/10';
            borderLine = 'bg-slate-600';
          }

          let TempIcon = IconBook;
          if (t.id === 'empty') TempIcon = IconFilePlus;
          if (t.id === 'skripsi') TempIcon = IconSchool;
          if (t.id === 'report') TempIcon = IconListDetails;
          if (t.id === 'ieee' || t.id === 'apa') TempIcon = IconAward;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplateId(t.id as any)}
              className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all hover:scale-[1.01] duration-200 cursor-pointer group relative overflow-hidden ${
                isSelected 
                  ? `${activeBorder} border-2 shadow-sm` 
                  : 'border-slate-200 bg-white hover:bg-slate-50/50 hover:shadow-xs'
              }`}
            >
              {isSelected && (
                <div className={`absolute top-0 left-0 right-0 h-1 ${borderLine}`} />
              )}

              <div className="flex gap-2.5 items-start">
                <div className={`p-2 rounded-lg border ${iconBg} shrink-0 group-hover:scale-105 transition duration-200`}>
                  <TempIcon className="h-4 w-4" />
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-900 transition">
                      {labelText}
                    </span>
                    {badgeText && (
                      <span className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        t.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                        t.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        t.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                        t.color === 'violet' ? 'bg-violet-100 text-violet-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {badgeText}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[8.5px] text-slate-400 leading-normal line-clamp-2">
                    {descText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {t.tags.map((tag, idx) => (
                  <span key={idx} className="text-[7.5px] bg-slate-105 text-slate-500 font-medium px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Structure Outline Preview Card */}
      {(() => {
        const selectedTemplate = TEMPLATES_METADATA.find((t) => t.id === templateId);
        if (!selectedTemplate) return null;
        const outlineItems = language === 'en' ? selectedTemplate.outline.en : selectedTemplate.outline.id;
        
        let themeBg = 'bg-indigo-50/10 border-indigo-100';
        let dotColor = 'bg-indigo-500';
        let accentText = 'text-indigo-700';

        if (selectedTemplate.color === 'blue') {
          themeBg = 'bg-blue-50/10 border-blue-100';
          dotColor = 'bg-blue-500';
          accentText = 'text-blue-700';
        } else if (selectedTemplate.color === 'emerald') {
          themeBg = 'bg-emerald-50/10 border-emerald-100';
          dotColor = 'bg-emerald-500';
          accentText = 'text-emerald-700';
        } else if (selectedTemplate.color === 'violet') {
          themeBg = 'bg-violet-50/10 border-violet-100';
          dotColor = 'bg-violet-500';
          accentText = 'text-violet-700';
        } else if (selectedTemplate.color === 'slate') {
          themeBg = 'bg-slate-50/20 border-slate-200';
          dotColor = 'bg-slate-400';
          accentText = 'text-slate-700';
        }

        return (
          <div className={`border rounded-xl p-3.5 ${themeBg} animate-fade-in`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <IconListDetails className={`h-4 w-4 ${accentText}`} />
                <span className={`text-[10px] font-bold ${accentText}`}>
                  {language === 'en' ? 'Template Outline Preview' : 'Pratinjau Struktur Templat'}
                </span>
              </div>
              <span className="text-[8px] bg-white border border-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">
                {selectedTemplate.id}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pl-1.5 relative border-l border-slate-200/80 ml-2">
              {outlineItems.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-2.5 py-0.5 group">
                  <div className={`absolute -left-[10px] top-[5px] h-1.5 w-1.5 rounded-full ${dotColor} border border-white ring-2 ring-transparent group-hover:ring-slate-100 transition`} />
                  
                  <div className="flex flex-col leading-tight">
                    <span className="text-[9px] font-semibold text-slate-700 group-hover:text-slate-900 transition">
                      {item}
                    </span>
                    {selectedTemplate.id !== 'empty' && (
                      <span className="text-[7.5px] text-slate-400">
                        {language === 'en' ? `Generated blocks including heading & instructions.` : `Blok judul & draf instruksi akan otomatis dibuat.`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
