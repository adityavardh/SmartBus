import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserRole,
  Notification,
  AppSettings,
  DemoState,
  UserProfile,
} from "@/types";
import {
  CURRENT_USER,
  PARENT_USER,
  DRIVER_USER,
  ADMIN_USER,
  DEFAULT_SETTINGS,
  DEFAULT_DEMO,
} from "@/data/mock";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  user: UserProfile;
  registeredUsers: UserProfile[];
  login: (role: UserRole, email?: string, name?: string) => void;
  signup: (user: UserProfile) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

interface DemoStore {
  demo: DemoState;
  setDemoEnabled: (enabled: boolean) => void;
  updateDemo: (partial: Partial<DemoState>) => void;
}

interface AppState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  aiOpen: boolean;
  loaderComplete: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setAiOpen: (open: boolean) => void;
  setLoaderComplete: (complete: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      role: "student",
      user: CURRENT_USER,
      registeredUsers: [],
      login: (role, email, name) => {
        const { registeredUsers } = get();
        let selectedUser = CURRENT_USER;
        
        if (email) {
          const found = registeredUsers.find(u => u.email === email && u.role === role);
          if (found) {
            selectedUser = found;
          } else {
            if (role === "parent") selectedUser = { ...PARENT_USER };
            if (role === "driver") selectedUser = { ...DRIVER_USER };
            if (role === "admin") selectedUser = { ...ADMIN_USER };
            if (role === "student") selectedUser = { ...CURRENT_USER };
          }
          // Override fake data with real session data
          selectedUser = {
            ...selectedUser,
            email: email,
            name: name || selectedUser.name,
            avatar: selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}&backgroundColor=0D1B36`
          };
        } else {
          if (role === "parent") selectedUser = PARENT_USER;
          if (role === "driver") selectedUser = DRIVER_USER;
          if (role === "admin") selectedUser = ADMIN_USER;
          if (role === "student") selectedUser = CURRENT_USER;
        }
        
        set({ isAuthenticated: true, role, user: selectedUser, isLoading: false });
      },
      signup: (user) => {
        set((state) => ({
          registeredUsers: [...state.registeredUsers, user],
          isAuthenticated: true,
          role: user.role,
          user: user,
          isLoading: false
        }));
      },
      logout: () => set({ isAuthenticated: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "smartbus-auth" }
  )
);

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          read: false,
        },
        ...state.notifications,
      ].slice(0, 20),
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearAll: () => set({ notifications: [] }),
}));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
    }),
    { name: "smartbus-settings" }
  )
);

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      demo: DEFAULT_DEMO,
      setDemoEnabled: (enabled) =>
        set(() => ({
          demo: enabled
            ? { ...DEFAULT_DEMO, enabled: true, busProgress: 0.05, tripCompleted: false, gpsConnected: true, isRaining: false, trafficLevel: "low" }
            : { ...DEFAULT_DEMO, enabled: false },
        })),
      updateDemo: (partial) =>
        set((state) => ({
          demo: { ...state.demo, ...partial },
        })),
    }),
    { name: "smartbus-demo" }
  )
);

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  aiOpen: false,
  loaderComplete: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setAiOpen: (open) => set({ aiOpen: open }),
  setLoaderComplete: (complete) => set({ loaderComplete: complete }),
}));
