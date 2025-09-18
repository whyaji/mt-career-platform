import { create } from 'zustand';

import type { UserType } from '@/types/user.type';

type UserStore = {
  user: UserType | null;
  setUser: (user: UserType) => void;
  updateUser: (user: Partial<UserType>) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (user) =>
    set((state) => (state.user ? { user: { ...state.user, ...user } as UserType } : state)),
  clearUser: () => set({ user: null }),
}));
