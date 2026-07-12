export type UserRole = "student" | "parent" | "admin" | "driver";

export type BusStatus = "running" | "stopped" | "delayed" | "offline" | "completed";

export type NotificationType =
  | "bus_started"
  | "traffic"
  | "route_change"
  | "student_boarded"
  | "sos"
  | "bus_arriving"
  | "delay"
  | "trip_complete";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BusStop extends LatLng {
  id: string;
  name: string;
  studentsWaiting?: number;
  time?: string;
  status?: "completed" | "current" | "upcoming";
}

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  phone: string;
  experience: string;
}

export interface Bus {
  id: string;
  number: string;
  registration: string;
  capacity: number;
  fuel: number;
  battery: number;
  engine: "healthy" | "warning" | "critical";
  networkSignal: number;
  temperature: number;
  occupancy: number;
  mileage: number;
  insurance: string;
  lastService: string;
  healthStatus: "excellent" | "good" | "fair";
  image: string;
}

export interface Student {
  id: string;
  name: string;
  photo: string;
  class: string;
  seatNumber: string;
  guardian: string;
  boarded: boolean;
  currentLocation?: string;
  boardedAt?: string;
}

export interface Child {
  id: string;
  name: string;
  photo: string;
  class: string;
  seatNumber: string;
  busId: string;
  busNumber: string;
  routeId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  boarded: boolean;
  boardedAt?: string;
  boardedStop?: string;
  reachedSchool: boolean;
  reachedHome: boolean;
  currentStop?: string;
}

export interface DriverTodayStudent {
  id: string;
  name: string;
  photo: string;
  class: string;
  seatNumber: string;
  stopName: string;
  boarded: boolean;
  boardedAt?: string;
}

export interface Route {
  id: string;
  name: string;
  stops: BusStop[];
  path: LatLng[];
  school: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface TripEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

export interface AnalyticsData {
  weeklyTrips: { day: string; trips: number }[];
  monthlyDistance: { month: string; km: number }[];
  fuelConsumption: { week: string; liters: number }[];
  averageDelay: { day: string; minutes: number }[];
  peakTimings: { hour: string; riders: number }[];
  attendance: { day: string; present: number; absent: number }[];
}

export interface FleetBus {
  id: string;
  number: string;
  status: BusStatus;
  driver: string;
  studentsOnboard: number;
  position: LatLng;
  eta: number;
  route?: string;
  gpsHealth?: boolean;
}

export interface SearchResult {
  id: string;
  type: "stop" | "route" | "driver" | "school";
  title: string;
  subtitle: string;
}

export interface AppSettings {
  theme: "dark" | "light" | "system";
  notifications: boolean;
  soundEffects: boolean;
  voiceAnnouncements: boolean;
  language: string;
  largeText: boolean;
  highContrast: boolean;
  biometricLogin: boolean;
}

export interface DemoState {
  enabled: boolean;
  busProgress: number;
  eta: number;
  speed: number;
  distance: number;
  attendance: number;
  trafficLevel: "low" | "medium" | "heavy";
  isRaining: boolean;
  tripStarted: boolean;
  tripCompleted: boolean;
  gpsConnected: boolean;
  currentEventIndex: number;
  simulatedOffline?: boolean;
  schoolClosed?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  streak: number;
  ecoScore: number;
  rewardPoints: number;
  tripsCompleted: number;
  achievements: Achievement[];
  emergencyContacts: { name: string; phone: string; relation: string }[];
  // Role-specific associations
  busId?: string;        // Student & Driver
  busNumber?: string;    // Student & Driver
  routeId?: string;      // Student & Driver
  childId?: string;      // Parent
  stopName?: string;     // Student
  assignedBusId?: string; // Driver
}

export interface AdminStats {
  totalBuses: number;
  runningBuses: number;
  delayedBuses: number;
  offlineBuses: number;
  totalStudents: number;
  studentsOnboard: number;
  totalDrivers: number;
  activeDrivers: number;
  revenueThisMonth: number;
  gpsHealthPercent: number;
  openComplaints: number;
  routeHealthPercent: number;
}
