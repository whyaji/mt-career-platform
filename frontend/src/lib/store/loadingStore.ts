import { create } from 'zustand';

// Zustand store for loading state
interface LoadingStore {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  showLoading: () => set({ isLoading: true }),
  hideLoading: () => set({ isLoading: false }),
}));
