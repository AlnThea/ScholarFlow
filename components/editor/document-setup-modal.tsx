// components/editor/document-setup-modal.tsx
'use client';

import React, { useState } from 'react';
import { 
  IconFilePlus, 
  IconCalendar, 
  IconSettings, 
  IconSparkles, 
  IconDatabase,
  IconBookmark,
  IconPageBreak,
  IconInfoCircle,
  IconX,
  IconSearch,
  IconBook,
  IconSchool,
  IconChevronRight,
  IconListDetails,
  IconAward
} from '@tabler/icons-react';
import { CitationStyleModal } from './citation-style-modal';
import { useLanguage } from '../i18n/language-context';
import type { DocumentSettings, DocumentListItem } from '@/lib/api/documents';
import { TEMPLATES_METADATA, TemplateMetadata } from '@/lib/templates';
import { LimitWarningModal } from './limit-warning-modal';
import { SetupProjectMode } from './modals/setup/setup-project-mode';
import { SetupTemplateSelector } from './modals/setup/setup-template-selector';
import { SetupSearchPreferences } from './modals/setup/setup-search-preferences';
import { SetupCitationPreferences } from './modals/setup/setup-citation-preferences';

interface DocumentSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, settings: DocumentSettings) => void;
  documents?: DocumentListItem[];
  activePlanId?: string;
  onUpgrade: () => void;
}

export function DocumentSetupModal({ isOpen, onClose, onSubmit, documents = [], activePlanId = 'free', onUpgrade }: DocumentSetupModalProps) {
  const { language, t } = useLanguage();
  const [title, setTitle] = useState('');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  
  // Project creation states
  const [createMode, setCreateMode] = useState<'independent' | 'new_project' | 'exist_project'>('independent');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<'skripsi' | 'jurnal' | 'makalah' | 'independent'>('skripsi');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectPart, setProjectPart] = useState('');

  // Extract unique existing projects
  const existingProjects = React.useMemo(() => {
    const map: Record<string, { id: string; name: string; type: string }> = {};
    documents.forEach((doc) => {
      const settings = doc.settings;
      if (settings?.projectId && settings?.projectName) {
        map[settings.projectId] = {
          id: settings.projectId,
          name: settings.projectName,
          type: settings.projectType || 'independent'
        };
      }
    });
    return Object.values(map);
  }, [documents]);

  // Set default selected project if available
  React.useEffect(() => {
    if (existingProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(existingProjects[0].id);
    }
  }, [existingProjects, selectedProjectId]);
  
  // Document configurations
  const [publishYear, setPublishYear] = useState<'all' | '5_years' | 'custom'>('all');
  const [publishYearStart, setPublishYearStart] = useState<number>(2020);
  const [publishYearEnd, setPublishYearEnd] = useState<number>(new Date().getFullYear());
  
  const [impactFactor, setImpactFactor] = useState<'all' | '0.25+' | '3+' | '10+'>('all');
  
  const [considerExternal, setConsiderExternal] = useState(false);
  const [considerLibrary, setConsiderLibrary] = useState(false);
  const [limitCollection, setLimitCollection] = useState('all');
  const [templateId, setTemplateId] = useState<'empty' | 'ieee' | 'skripsi' | 'apa' | 'report'>('empty');
  const [templateCategory, setTemplateCategory] = useState<'all' | 'academic' | 'journal' | 'general'>('all');
  const [templateSearch, setTemplateSearch] = useState('');
  
  const [citationStyle, setCitationStyle] = useState('apa');
  const [citationLocale, setCitationLocale] = useState('en-US');
  const [showPageNumber, setShowPageNumber] = useState(false);

  // Citation Style Selection modal visibility
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  const getStyleDisplayName = (styleId: string) => {
    switch (styleId) {
      case 'apa': return 'APA (7th ed.)';
      case 'chicago-author-date': return 'Chicago (17th ed.)';
      case 'harvard1': return 'Harvard';
      case 'ieee': return 'IEEE';
      case 'mla': return 'MLA (9th ed.)';
      case 'vancouver': return 'Vancouver';
      case 'nature': return 'Nature';
      default: return 'APA (7th ed.)';
    }
  };

  const getLocaleDisplayName = (localeId: string) => {
    switch (localeId) {
      case 'en-US': return 'American English';
      case 'en-GB': return 'British English';
      case 'id-ID': return 'Indonesian';
      case 'ar': return 'Arabic';
      case 'es-ES': return 'Spanish';
      case 'fr-FR': return 'French';
      default: return 'American English';
    }
  };

  const handleCreate = () => {
    let finalTitle = title.trim();
    let pId: string | undefined = undefined;
    let pName: string | undefined = undefined;
    let pType: 'skripsi' | 'jurnal' | 'makalah' | 'independent' | undefined = undefined;
    let pPart: string | undefined = undefined;

    if (createMode === 'new_project') {
      if (activePlanId === 'free' && existingProjects.length >= 1) {
        setWarningMessage(t('setup.free_project_limit'));
        return;
      }
      pId = 'proj_' + Math.random().toString(36).substring(2, 9);
      pName = newProjectName.trim() || (language === 'en' ? 'New Project' : 'Proyek Baru');
      pType = newProjectType;
      pPart = projectPart.trim() || (language === 'en' ? 'Chapter 1' : 'Bab 1');
      finalTitle = `${pName} - ${pPart}`;
    } else if (createMode === 'exist_project') {
      const existingDocsInProj = documents.filter(doc => doc.settings?.projectId === selectedProjectId);
      if (activePlanId === 'free' && existingDocsInProj.length >= 3) {
        setWarningMessage(t('setup.free_part_limit'));
        return;
      }
      const proj = existingProjects.find(p => p.id === selectedProjectId);
      if (proj) {
        pId = proj.id;
        pName = proj.name;
        pType = proj.type as any;
      }
      pPart = projectPart.trim() || (language === 'en' ? 'New Section' : 'Bagian Baru');
      finalTitle = `${pName || (language === 'en' ? 'Project' : 'Proyek')} - ${pPart}`;
    } else {
      finalTitle = finalTitle || (language === 'en' ? 'Independent Document' : 'Dokumen Mandiri');
    }

    const settings: DocumentSettings = {
      publishYear,
      publishYearStart: publishYear === 'custom' ? publishYearStart : null,
      publishYearEnd: publishYear === 'custom' ? publishYearEnd : null,
      impactFactor,
      considerExternal,
      considerLibrary,
      limitCollection,
      citationStyle,
      citationLocale,
      showPageNumber,
      projectId: pId,
      projectName: pName,
      projectType: pType,
      projectPart: pPart,
      templateId
    };
    onSubmit(finalTitle, settings);
  };

  const handleSkip = () => {
    const finalTitle = title.trim() || (language === 'en' ? 'Independent Document' : 'Dokumen Mandiri');
    const defaultSettings: DocumentSettings = {
      publishYear: 'all',
      publishYearStart: null,
      publishYearEnd: null,
      impactFactor: 'all',
      considerExternal: false,
      considerLibrary: false,
      limitCollection: 'all',
      citationStyle: 'apa',
      citationLocale: 'en-US',
      showPageNumber: false,
      templateId: 'empty'
    };
    onSubmit(finalTitle, defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <IconFilePlus className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">{t('setup.title')}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Form Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-h-[60vh]">
            
            {/* 0. Project Grouping Mode Selection */}
            <SetupProjectMode
              language={language}
              t={t}
              createMode={createMode}
              setCreateMode={setCreateMode}
              title={title}
              setTitle={setTitle}
              newProjectName={newProjectName}
              setNewProjectName={setNewProjectName}
              newProjectType={newProjectType}
              setNewProjectType={setNewProjectType}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              projectPart={projectPart}
              setProjectPart={setProjectPart}
              existingProjects={existingProjects}
            />

            <div className="h-px bg-slate-100 w-full" />

            {/* 1.5. Writing Template Selector */}
            <SetupTemplateSelector
              language={language}
              templateCategory={templateCategory}
              setTemplateCategory={setTemplateCategory}
              templateSearch={templateSearch}
              setTemplateSearch={setTemplateSearch}
              templateId={templateId}
              setTemplateId={setTemplateId}
            />

            <SetupSearchPreferences
              language={language}
              publishYear={publishYear}
              setPublishYear={setPublishYear}
              publishYearStart={publishYearStart}
              setPublishYearStart={setPublishYearStart}
              publishYearEnd={publishYearEnd}
              setPublishYearEnd={setPublishYearEnd}
              impactFactor={impactFactor}
              setImpactFactor={setImpactFactor}
              considerExternal={considerExternal}
              setConsiderExternal={setConsiderExternal}
              considerLibrary={considerLibrary}
              setConsiderLibrary={setConsiderLibrary}
              limitCollection={limitCollection}
              setLimitCollection={setLimitCollection}
            />

            <SetupCitationPreferences
              language={language}
              t={t}
              citationStyle={citationStyle}
              citationLocale={citationLocale}
              getStyleDisplayName={getStyleDisplayName}
              getLocaleDisplayName={getLocaleDisplayName}
              setIsStyleModalOpen={setIsStyleModalOpen}
              showPageNumber={showPageNumber}
              setShowPageNumber={setShowPageNumber}
            />

            {/* Hint Note */}
            <div className="flex items-start gap-2 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5">
              <IconInfoCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-indigo-800 leading-normal">
                {language === 'en' 
                  ? 'The search preferences and citation style above will be saved and applied specifically to this newly created draft document.'
                  : 'Preferensi pencarian dan gaya sitasi di atas akan disimpan dan diterapkan khusus pada draf dokumen yang baru dibuat ini.'
                }
              </p>
            </div>
          </div>

          {/* Footer Area */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="px-4 py-2 border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition shadow-sm cursor-pointer"
            >
              {language === 'en' ? 'Skip Setup' : 'Lewati (Skip Setup)'}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-transparent text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition"
              >
                {t('setup.cancel')}
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
              >
                {t('setup.create')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Limit / Upgrade Warning Modal */}
      <LimitWarningModal
        isOpen={!!warningMessage}
        onClose={() => setWarningMessage(null)}
        onUpgrade={onUpgrade}
        message={warningMessage || ''}
      />

      {/* Style & Localization Selection Popup */}
      <CitationStyleModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        selectedStyle={citationStyle}
        selectedLocale={citationLocale}
        showPageNumber={showPageNumber}
        onSelect={(style, locale) => {
          setCitationStyle(style);
          setCitationLocale(locale);
        }}
      />
    </>
  );
}
