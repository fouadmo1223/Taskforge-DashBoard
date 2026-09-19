import { create } from 'zustand';

interface AdminUiState {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useAdminUi = create<AdminUiState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
}));
