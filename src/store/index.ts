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

// ─── Auth ─────────────────────────────────────────────────────────────────────

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
          const found = registeredUsers.find(
            (u) => u.email === email && u.role === role
          );
          if (found) {
            selectedUser = found;
          } else {
            if (role === "parent") selectedUser = { ...PARENT_USER };
            if (role === "driver") selectedUser = { ...DRIVER_USER };
            if (role === "admin")  selectedUser = { ...ADMIN_USER };
            if (role === "student") selectedUser = { ...CURRENT_USER };
          }
          selectedUser = {
            ...selectedUser,
            email,
            name: name || selectedUser.name,
            avatar:
              selectedUser.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                name || email
              )}&backgroundColor=0D1B36`,
          };
        } else {
          if (role === "parent")  selectedUser = PARENT_USER;
          if (role === "driver")  selectedUser = DRIVER_USER;
          if (role === "admin")   selectedUser = ADMIN_USER;
          if (role === "student") selectedUser = CURRENT_USER;
        }
        set({ isAuthenticated: true, role, user: selectedUser, isLoading: false });
      },
      signup: (user) => {
        set((state) => ({
          registeredUsers: [...state.registeredUsers, user],
          isAuthenticated: true,
          role: user.role,
          user,
          isLoading: false,
        }));
      },
      logout: () => set({ isAuthenticated: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "smartbus-auth" }
  )
);

// ─── Notifications ────────────────────────────────────────────────────────────

interface NotificationState {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

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

// ─── Settings ─────────────────────────────────────────────────────────────────

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    { name: "smartbus-settings" }
  )
);

// ─── Demo / simulation store ──────────────────────────────────────────────────
//
// DESIGN DECISION: volatile simulation fields are NEVER written to localStorage.
//
// Problem this fixes:
//   Zustand `persist` was saving ALL of DemoState — including busProgress, speed,
//   eta, tripCompleted — to localStorage under "smartbus-demo".  On every page
//   reload those values were rehydrated.  If a previous session ended with
//   tripCompleted:true or speed:0 (bus reached 95%+ of the route), the next
//   session started with the bus already at the end and all stats frozen at 0.
//   The RAF loop and the 4-second interval both read from demo.speed /
//   demo.tripCompleted, so they immediately treated the trip as finished.
//
// Fix:
//   `partialize` only persists user preference fields (enabled, trafficLevel,
//   isRaining, schoolClosed, attendance).  The `merge` callback ensures
//   volatile fields are always taken from DEFAULT_DEMO on rehydration, not
//   from whatever was last stored.

/** Fields that are volatile — reset to DEFAULT_DEMO on every page load. */
const VOLATILE_SIM_KEYS: (keyof DemoState)[] = [
  "busProgress",
  "speed",
  "eta",
  "distance",
  "tripStarted",
  "tripCompleted",
  "gpsConnected",
  "currentEventIndex",
  "simulatedOffline",
];

/** Only these fields are written to localStorage. */
type PersistedDemo = Pick<
  DemoState,
  "enabled" | "trafficLevel" | "isRaining" | "schoolClosed" | "attendance"
>;

interface DemoStore {
  demo: DemoState;
  setDemoEnabled: (enabled: boolean) => void;
  updateDemo: (partial: Partial<DemoState>) => void;
  /**
   * Resets all volatile simulation fields back to DEFAULT_DEMO values.
   * Call this whenever the route changes or the user wants to restart.
   * Preference fields (trafficLevel, isRaining, etc.) are preserved.
   */
  resetSimulation: () => void;
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      demo: DEFAULT_DEMO,

      setDemoEnabled: (enabled) =>
        set(() => ({
          demo: enabled
            ? {
                ...DEFAULT_DEMO,
                enabled: true,
                busProgress: 0.05,
                tripCompleted: false,
                gpsConnected: true,
                isRaining: false,
                trafficLevel: "low",
              }
            : { ...DEFAULT_DEMO, enabled: false },
        })),

      updateDemo: (partial) =>
        set((state) => ({ demo: { ...state.demo, ...partial } })),

      resetSimulation: () =>
        set((state) => ({
          demo: {
            ...state.demo,
            busProgress:       DEFAULT_DEMO.busProgress,
            speed:             DEFAULT_DEMO.speed,
            eta:               DEFAULT_DEMO.eta,
            distance:          DEFAULT_DEMO.distance,
            tripStarted:       DEFAULT_DEMO.tripStarted,
            tripCompleted:     false,
            gpsConnected:      true,
            currentEventIndex: DEFAULT_DEMO.currentEventIndex,
            simulatedOffline:  false,
          },
        })),
    }),
    {
      name: "smartbus-demo",

      // Only persist preference fields
      partialize: (state): PersistedDemo => ({
        enabled:      state.demo.enabled,
        trafficLevel: state.demo.trafficLevel,
        isRaining:    state.demo.isRaining,
        schoolClosed: state.demo.schoolClosed ?? false,
        attendance:   state.demo.attendance,
      }),

      // On rehydration: start from DEFAULT_DEMO and overlay only the
      // persisted preferences — volatile fields always come from DEFAULT_DEMO.
      merge: (persisted, current) => ({
        ...current,
        demo: {
          ...DEFAULT_DEMO,
          ...(persisted as Partial<DemoState>),
          // Explicitly reset every volatile key so no stale value sneaks in
          ...Object.fromEntries(
            VOLATILE_SIM_KEYS.map((k) => [k, DEFAULT_DEMO[k]])
          ),
        },
      }),
    }
  )
);

// ─── App UI state ─────────────────────────────────────────────────────────────

interface AppState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  aiOpen: boolean;
  loaderComplete: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen:  (open: boolean) => void;
  setAiOpen:      (open: boolean) => void;
  setLoaderComplete: (complete: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  aiOpen: false,
  loaderComplete: false,
  setSidebarOpen:    (open)     => set({ sidebarOpen: open }),
  setSearchOpen:     (open)     => set({ searchOpen: open }),
  setAiOpen:         (open)     => set({ aiOpen: open }),
  setLoaderComplete: (complete) => set({ loaderComplete: complete }),
}));
