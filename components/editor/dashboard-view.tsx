import React from 'react';
import { IconCreditCard, IconSun, IconMoon, IconFilePlus, IconBook, IconFolderOpen, IconFolder, IconChevronDown, IconFile, IconLoader, IconEdit } from '@tabler/icons-react';
import { Switch } from './editor-switch';
import { UserDashboardTab } from './user-dashboard-tab';
import { AdminPricingTab } from './admin-pricing-tab';
import { AdminModelsTab } from './admin-models-tab';
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
              <UserDashboardTab
                onCreateDocument={onCreateDocument}
                showAlertModal={showAlertModal}
                language={language}
                documents={documents}
                groupedDocs={groupedDocs}
                dashboardExpandedProjects={dashboardExpandedProjects}
                setDashboardExpandedProjects={setDashboardExpandedProjects}
                onSelectDocument={onSelectDocument}
              />
            ) : activeDashboardTab === 'admin-pricing' ? (
              <AdminPricingTab
                handleOpenCreateModal={handleOpenCreateModal}
                loadingAdminPlans={loadingAdminPlans}
                adminPlans={adminPlans}
                handleOpenEditModal={handleOpenEditModal}
                handleDeletePlan={handleDeletePlan}
              />
            ) : activeDashboardTab === 'admin-models' ? (
              <AdminModelsTab
                isEn={isEn}
                aiModels={aiModels}
                handleOpenCreateProviderModal={handleOpenCreateProviderModal}
                handleOpenCreateModelModal={handleOpenCreateModelModal}
                handleToggleModelStatus={handleToggleModelStatus}
                handleOpenEditModelModal={handleOpenEditModelModal}
                handleDeleteModel={handleDeleteModel}
                handleOpenEditProviderModal={handleOpenEditProviderModal}
                gatewaysList={gatewaysList}
                handleToggleGateway={handleToggleGateway}
                togglingGatewayId={togglingGatewayId}
                aiProviders={aiProviders}
                DEFAULT_PROVIDERS={DEFAULT_PROVIDERS}
                handleDeleteProvider={handleDeleteProvider}
                handleTestModelConnection={handleTestModelConnection}
                testingModelId={testingModelId}
              />
            ) : null}
          </div>
        </div>
      </>
    );
  };
