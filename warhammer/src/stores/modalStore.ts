import { create } from 'zustand';

interface ModalState {
  activeModal: 'lorebook' | 'preset' | 'settings' | null;
  openModal: (modal: 'lorebook' | 'preset' | 'settings') => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));
