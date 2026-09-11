import { useState, useEffect } from 'react';
import { type PricingPlan, updatePricingPlan, createPricingPlan, deletePricingPlan, fetchPricingPlans } from '@/lib/api/pricing';
import { type PaymentGateway, fetchPaymentGateways, updatePaymentGatewayStatus } from '@/lib/api/payment-gateways';
import { type AIModel, type AIProvider, DEFAULT_PROVIDERS } from '@/lib/api/ai-models';

export function useAdminModals({
  activeDashboardTab,
  aiModels,
  onUpdateAIModel,
  onCreateAIModel,
  onDeleteAIModel,
  aiProviders,
  onUpdateAIProvider,
  onCreateAIProvider,
  onDeleteAIProvider
}: any) {
  const [adminPlans, setAdminPlans] = useState<PricingPlan[]>([]);
  const [loadingAdminPlans, setLoadingAdminPlans] = useState(false);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [editStates, setEditStates] = useState<Record<string, {
    price: number;
    price_period: string;
    promo_text: string;
    description: string;
    features: string;
  }>>({});

  const [gatewaysList, setGatewaysList] = useState<PaymentGateway[]>([]);
  const [togglingGatewayId, setTogglingGatewayId] = useState<string | null>(null);

  const [alertModalState, setAlertModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    isConfirm?: boolean;
  } | null>(null);

  const showAlertModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    onConfirm?: () => void
  ) => {
    setAlertModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      isConfirm: false,
    });
  };

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning',
    confirmText?: string
  ) => {
    setAlertModalState({
      isOpen: true,
      title,
      message,
      type: type === 'danger' ? 'error' : (type as any),
      onConfirm,
      isConfirm: true,
      confirmText,
    });
  };

  const [savingModelId, setSavingModelId] = useState<string | null>(null);
  const [editModelStates, setEditModelStates] = useState<Record<string, {
    name: string;
    model_id: string;
    is_enabled: boolean;
    is_premium: boolean;
  }>>({});

  useEffect(() => {
    if (aiModels && aiModels.length > 0) {
      const initial: Record<string, any> = {};
      aiModels.forEach((m) => {
        initial[m.id] = {
          name: m.name,
          model_id: m.model_id,
          is_enabled: m.is_enabled,
          is_premium: m.is_premium
        };
      });
      setEditModelStates(initial);
    }
  }, [aiModels]);

  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [selectedModelForModal, setSelectedModelForModal] = useState<AIModel | null>(null);
  const [modalModelState, setModalModelState] = useState<Omit<AIModel, 'updated_at'>>({
    id: '',
    name: '',
    model_id: '',
    provider_id: 'openrouter',
    is_enabled: true,
    is_premium: false,
    provider_type: 'openrouter',
    base_url: '',
    custom_api_key: ''
  });

  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [selectedProviderForModal, setSelectedProviderForModal] = useState<AIProvider | null>(null);
  const [modalProviderState, setModalProviderState] = useState<Omit<AIProvider, 'updated_at'>>({
    id: '',
    name: '',
    type: 'custom_openai',
    base_url: '',
    api_key: ''
  });

  const handleOpenEditModelModal = (model: AIModel) => {
    setSelectedModelForModal(model);
    setModalModelState({
      id: model.id,
      name: model.name,
      model_id: model.model_id,
      provider_id: model.provider_id || model.provider_type || 'openrouter',
      is_enabled: model.is_enabled,
      is_premium: model.is_premium,
      provider_type: model.provider_type || (model.id === 'gemini' || model.model_id.includes('gemini') ? 'gemini' : 'openrouter'),
      base_url: model.base_url || '',
      custom_api_key: model.custom_api_key || ''
    });
    setIsModelModalOpen(true);
  };

  const handleOpenCreateModelModal = () => {
    const firstProv = (aiProviders && aiProviders.length > 0) ? aiProviders[0] : DEFAULT_PROVIDERS[0];
    setSelectedModelForModal(null);
    setModalModelState({
      id: '',
      name: '',
      model_id: '',
      provider_id: firstProv.id,
      is_enabled: true,
      is_premium: false,
      provider_type: firstProv.type,
      base_url: firstProv.base_url || '',
      custom_api_key: firstProv.api_key || ''
    });
    setIsModelModalOpen(true);
  };

  const handleOpenCreateProviderModal = () => {
    setSelectedProviderForModal(null);
    setModalProviderState({
      id: '',
      name: '',
      type: 'custom_openai',
      base_url: '',
      api_key: ''
    });
    setIsProviderModalOpen(true);
  };

  const handleOpenEditProviderModal = (provider: AIProvider) => {
    setSelectedProviderForModal(provider);
    setModalProviderState({
      id: provider.id,
      name: provider.name,
      type: provider.type,
      base_url: provider.base_url || '',
      api_key: provider.api_key || '',
      is_built_in: provider.is_built_in
    });
    setIsProviderModalOpen(true);
  };

  const handleSaveModalProvider = async () => {
    if (!modalProviderState.id.trim() || !modalProviderState.name.trim()) {
      showAlertModal('Input Tidak Lengkap', 'Mohon isi ID Provider dan Nama Provider.', 'warning');
      return;
    }

    try {
      if (selectedProviderForModal) {
        await onUpdateAIProvider?.(modalProviderState.id, {
          name: modalProviderState.name,
          type: modalProviderState.type,
          base_url: modalProviderState.base_url,
          api_key: modalProviderState.api_key
        });
        showAlertModal('Berhasil', `Provider ${modalProviderState.name} berhasil diperbarui.`, 'success');
      } else {
        await onCreateAIProvider?.(modalProviderState);
        showAlertModal('Berhasil', `Provider baru ${modalProviderState.name} berhasil ditambahkan.`, 'success');
      }
      setIsProviderModalOpen(false);
    } catch (err: any) {
      showAlertModal('Gagal Menyimpan Provider', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleDeleteProvider = (id: string) => {
    showConfirmModal(
      'Hapus Provider AI',
      'Apakah Anda yakin ingin menghapus Provider AI ini? Model AI yang terhubung ke provider ini mungkin akan terpengaruh.',
      async () => {
        try {
          await onDeleteAIProvider?.(id);
          showAlertModal('Berhasil', 'Provider AI berhasil dihapus.', 'success');
        } catch (err: any) {
          showAlertModal('Gagal Menghapus', err.message || 'Terjadi kesalahan.', 'error');
        }
      },
      'danger'
    );
  };

  const [testingModelId, setTestingModelId] = useState<string | null>(null);

  const handleTestModelConnection = async (targetModel?: {
    id: string;
    model_id: string;
    provider_type?: string;
    base_url?: string;
    custom_api_key?: string;
  }) => {
    const modelToTest = targetModel || {
      id: modalModelState.id || 'modal-preview',
      model_id: modalModelState.model_id,
      provider_type: modalModelState.provider_type,
      base_url: modalModelState.base_url,
      custom_api_key: modalModelState.custom_api_key,
    };

    if (!modelToTest.model_id || !modelToTest.model_id.trim()) {
      showAlertModal('Perhatian', 'ID Model API (model_id) harus diisi sebelum menguji koneksi.', 'warning');
      return;
    }

    setTestingModelId(modelToTest.id);

    try {
      const res = await fetch('/api/v1/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_type: modelToTest.provider_type || 'openrouter',
          model_id: modelToTest.model_id,
          base_url: modelToTest.base_url,
          custom_api_key: modelToTest.custom_api_key,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showAlertModal('Koneksi Berhasil', `${data.message}\n\nRespon Uji Provider: "${data.sample_response}"`, 'success');
      } else {
        showAlertModal('Gagal Terhubung', `Tidak dapat terhubung ke Provider AI:\n\n${data.message}`, 'error');
      }
    } catch (err: any) {
      showAlertModal('Kendala Jaringan', `Terjadi kendala koneksi:\n${err.message}`, 'error');
    } finally {
      setTestingModelId(null);
    }
  };

  const handleSaveModalModel = async () => {
    if (!modalModelState.id.trim() || !modalModelState.name.trim() || !modalModelState.model_id.trim()) {
      showAlertModal('Perhatian', 'ID Gateway, Nama Model, dan ID Model API harus diisi.', 'warning');
      return;
    }

    if (modalModelState.provider_type === 'custom_openai' && (!modalModelState.base_url || !modalModelState.base_url.trim())) {
      showAlertModal('Perhatian', 'Custom API Base URL wajib diisi untuk provider Custom OpenAI-Compatible.', 'warning');
      return;
    }

    setSavingModelId(modalModelState.id);
    try {
      if (selectedModelForModal) {
        // Edit mode
        await onUpdateAIModel(selectedModelForModal.id, {
          name: modalModelState.name,
          model_id: modalModelState.model_id,
          is_enabled: modalModelState.is_enabled,
          is_premium: modalModelState.is_premium,
          provider_type: modalModelState.provider_type,
          base_url: modalModelState.base_url,
          custom_api_key: modalModelState.custom_api_key
        });
        showAlertModal('Berhasil', 'Model AI berhasil diperbarui!', 'success');
        setIsModelModalOpen(false);
      } else {
        // Create mode
        await onCreateAIModel(modalModelState);
        showAlertModal('Berhasil', 'Model AI baru berhasil ditambahkan!', 'success');
        setIsModelModalOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      showAlertModal('Gagal Menyimpan', `Gagal menyimpan model AI: ${err.message || err}`, 'error');
    } finally {
      setSavingModelId(null);
    }
  };

  const handleDeleteModel = (modelId: string) => {
    showConfirmModal(
      'Hapus Model AI',
      `Apakah Anda yakin ingin menghapus model AI "${modelId}" dari sistem?`,
      async () => {
        setSavingModelId(modelId);
        try {
          await onDeleteAIModel(modelId);
          showAlertModal('Berhasil Hapus', `Model AI "${modelId}" berhasil dihapus!`, 'success');
        } catch (err: any) {
          console.error(err);
          showAlertModal('Gagal Hapus', `Gagal menghapus model AI: ${err.message || err}`, 'error');
        } finally {
          setSavingModelId(null);
        }
      },
      'danger',
      'Hapus Model'
    );
  };

  const handleToggleModelStatus = async (model: AIModel) => {
    setSavingModelId(model.id);
    try {
      await onUpdateAIModel(model.id, {
        is_enabled: !model.is_enabled,
      });
      showAlertModal(
        'Status Model AI',
        `Model "${model.name}" berhasil di${!model.is_enabled ? 'aktifkan' : 'non-aktifkan'}!`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showAlertModal('Gagal', `Gagal mengubah status model AI: ${err.message || err}`, 'error');
    } finally {
      setSavingModelId(null);
    }
  };


  useEffect(() => {
    if (activeDashboardTab === 'admin-pricing' || activeDashboardTab === 'admin-gateways') {
      setLoadingAdminPlans(true);
      Promise.all([fetchPricingPlans(), fetchPaymentGateways()])
        .then(([plansData, gatewaysData]) => {
          setAdminPlans(plansData);
          setGatewaysList(gatewaysData);

          const states: typeof editStates = {};
          plansData.forEach((p) => {
            states[p.id] = {
              price: p.price,
              price_period: p.price_period,
              promo_text: p.promo_text || '',
              description: p.description || '',
              features: p.features.join('\n')
            };
          });
          setEditStates(states);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingAdminPlans(false));
    }
  }, [activeDashboardTab]);

  const handleToggleGateway = async (gatewayId: string, isEnabled: boolean) => {
    setTogglingGatewayId(gatewayId);
    try {
      const res = await updatePaymentGatewayStatus(gatewayId, isEnabled);
      if (res.success) {
        showAlertModal('Gateway Pembayaran', `Status gateway "${gatewayId}" berhasil diubah!`, 'success');
      } else {
        showAlertModal('Gagal', `Gagal mengubah status gateway: ${res.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showAlertModal('Error', 'Terjadi kesalahan saat mengubah status gateway.', 'error');
    } finally {
      setTogglingGatewayId(null);
    }
  };

  const handleSavePlan = async (planId: string) => {
    const state = editStates[planId];
    if (!state) return;

    setSavingPlanId(planId);
    try {
      const res = await updatePricingPlan(planId, {
        price: Number(state.price),
        price_period: state.price_period,
        promo_text: state.promo_text || null,
        description: state.description,
        features: state.features.split('\n').map(f => f.trim()).filter(Boolean)
      });

      if (res.success) {
        showAlertModal('Paket Harga', 'Paket harga berhasil diperbarui!', 'success');
      } else {
        showAlertModal('Gagal', `Gagal memperbarui paket: ${res.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showAlertModal('Error', 'Terjadi kesalahan saat menyimpan perubahan.', 'error');
    } finally {
      setSavingPlanId(null);
    }
  };

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PricingPlan | null>(null);
  const [modalPlanState, setModalPlanState] = useState<Omit<PricingPlan, 'updated_at'>>({
    id: '',
    name: '',
    price: 0,
    price_period: '/bulan',
    description: '',
    features: [],
    is_popular: false,
    promo_text: ''
  });

  const handleOpenEditModal = (plan: PricingPlan) => {
    setSelectedPlanForModal(plan);
    setModalPlanState({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      price_period: plan.price_period,
      description: plan.description || '',
      features: plan.features || [],
      is_popular: plan.is_popular || false,
      promo_text: plan.promo_text || ''
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedPlanForModal(null);
    setModalPlanState({
      id: '',
      name: '',
      price: 0,
      price_period: '/bulan',
      description: '',
      features: [],
      is_popular: false,
      promo_text: ''
    });
    setIsPlanModalOpen(true);
  };

  const handleSaveModalPlan = async () => {
    if (!modalPlanState.id.trim() || !modalPlanState.name.trim()) {
      alert('ID Paket dan Nama Paket harus diisi.');
      return;
    }
    setSavingPlanId(modalPlanState.id);
    try {
      if (selectedPlanForModal) {
        // Edit mode
        const res = await updatePricingPlan(selectedPlanForModal.id, {
          name: modalPlanState.name,
          price: Number(modalPlanState.price),
          price_period: modalPlanState.price_period,
          promo_text: modalPlanState.promo_text || null,
          description: modalPlanState.description || null,
          features: modalPlanState.features,
          is_popular: modalPlanState.is_popular
        });
        if (res.success) {
          alert('Paket berhasil diperbarui!');
          setIsPlanModalOpen(false);
          // reload plans
          const plansData = await fetchPricingPlans();
          setAdminPlans(plansData);
        } else {
          alert(`Gagal memperbarui paket: ${res.error}`);
        }
      } else {
        // Create mode
        const res = await createPricingPlan(modalPlanState);
        if (res.success) {
          alert('Paket baru berhasil ditambahkan!');
          setIsPlanModalOpen(false);
          // reload plans
          const plansData = await fetchPricingPlans();
          setAdminPlans(plansData);
        } else {
          alert(`Gagal menambahkan paket baru: ${res.error}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSavingPlanId(null);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${planId}"?`)) return;
    setSavingPlanId(planId);
    try {
      const res = await deletePricingPlan(planId);
      if (res.success) {
        alert('Paket berhasil dihapus!');
        const plansData = await fetchPricingPlans();
        setAdminPlans(plansData);
      } else {
        alert(`Gagal menghapus paket: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus paket.');
    } finally {
      setSavingPlanId(null);
    }
  };



  return {
    adminPlans, setAdminPlans,
    loadingAdminPlans,
    gatewaysList,
    togglingGatewayId,
    alertModalState, showAlertModal, showConfirmModal,
    savingModelId, editModelStates,
    isModelModalOpen, setIsModelModalOpen,
    selectedModelForModal, modalModelState,
    handleOpenEditModelModal, handleOpenCreateModelModal,
    testingModelId, handleTestModelConnection,
    handleSaveModalModel, handleDeleteModel, handleToggleModelStatus,
    isProviderModalOpen, setIsProviderModalOpen,
    selectedProviderForModal, modalProviderState,
    handleOpenCreateProviderModal, handleOpenEditProviderModal,
    handleSaveModalProvider, handleDeleteProvider,
    handleToggleGateway, handleSavePlan,
    isPlanModalOpen, setIsPlanModalOpen,
    selectedPlanForModal, modalPlanState,
    handleOpenEditModal, handleOpenCreateModal,
    handleSaveModalPlan, handleDeletePlan,
    editStates, setEditStates, savingPlanId,
  };
}
