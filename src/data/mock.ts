import type {
  Bus,
  Driver,
  Route,
  Student,
  Child,
  DriverTodayStudent,
  FleetBus,
  AnalyticsData,
  UserProfile,
  AppSettings,
  DemoState,
  SearchResult,
  TripEvent,
  AdminStats,
} from "@/types";

// ─── STUDENT USER (Adi Kumar) ────────────────────────────────────────────────
export const CURRENT_USER: UserProfile = {
  id: "u1",
  name: "Adi",
  email: "adi@smartbus.io",
  role: "student",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adi&backgroundColor=0D1B36",
  streak: 14,
  ecoScore: 87,
  rewardPoints: 2450,
  tripsCompleted: 156,
  busId: "b1",
  busNumber: "SB-12",
  routeId: "r1",
  stopName: "Saket District Centre",
  achievements: [
    { id: "a1", title: "Green Rider", description: "30 days eco-friendly travel", icon: "🌿", unlocked: true },
    { id: "a2", title: "Early Bird", description: "Board before 7:30 AM 10 times", icon: "🌅", unlocked: true },
    { id: "a3", title: "Streak Master", description: "14 day travel streak", icon: "🔥", unlocked: true },
    { id: "a4", title: "Perfect Attendance", description: "No missed buses this month", icon: "⭐", unlocked: false, progress: 78 },
    { id: "a5", title: "Top 10", description: "Reach leaderboard top 10", icon: "🏆", unlocked: false, progress: 45 },
  ],
  emergencyContacts: [
    { name: "Priya Sharma", phone: "+91 98765 43210", relation: "Mother" },
    { name: "Transport Office", phone: "+91 1800 123 456", relation: "School" },
  ],
};

// ─── PARENT USER (Priya Sharma, parent of Aarav) ─────────────────────────────
export const PARENT_USER: UserProfile = {
  id: "u2",
  name: "Priya",
  email: "priya@smartbus.io",
  role: "parent",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=7C3AED",
  streak: 0,
  ecoScore: 0,
  rewardPoints: 0,
  tripsCompleted: 0,
  childId: "c1",
  achievements: [],
  emergencyContacts: [
    { name: "Rahul Sharma", phone: "+91 98765 12345", relation: "Bus Driver" },
    { name: "Transport Office", phone: "+91 1800 123 456", relation: "School" },
  ],
};

// ─── DRIVER USER (Rahul Sharma) ───────────────────────────────────────────────
export const DRIVER_USER: UserProfile = {
  id: "u3",
  name: "Rahul",
  email: "rahul@smartbus.io",
  role: "driver",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=FFC247",
  streak: 0,
  ecoScore: 0,
  rewardPoints: 0,
  tripsCompleted: 0,
  assignedBusId: "b1",
  busNumber: "SB-12",
  routeId: "r1",
  achievements: [],
  emergencyContacts: [
    { name: "Transport Office", phone: "+91 1800 123 456", relation: "Office" },
    { name: "Police Control", phone: "100", relation: "Emergency" },
  ],
};

// ─── ADMIN USER ───────────────────────────────────────────────────────────────
export const ADMIN_USER: UserProfile = {
  id: "u4",
  name: "Admin",
  email: "admin@smartbus.io",
  role: "admin",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=EF4444",
  streak: 0,
  ecoScore: 0,
  rewardPoints: 0,
  tripsCompleted: 0,
  achievements: [],
  emergencyContacts: [
    { name: "Police Control", phone: "100", relation: "Emergency" },
    { name: "Ambulance", phone: "108", relation: "Medical" },
  ],
};

// ─── CURRENT BUS ──────────────────────────────────────────────────────────────
export const CURRENT_BUS: Bus = {
  id: "b1",
  number: "SB-12",
  registration: "MH-12-AB-3456",
  capacity: 40,
  fuel: 72,
  battery: 94,
  engine: "healthy",
  networkSignal: 4,
  temperature: 24,
  occupancy: 12,
  mileage: 45230,
  insurance: "Valid until Dec 2026",
  lastService: "15 Jun 2026",
  healthStatus: "excellent",
  image: "/bus-illustration.svg",
};

// ─── CURRENT DRIVER ───────────────────────────────────────────────────────────
export const CURRENT_DRIVER: Driver = {
  id: "d1",
  name: "Rahul Sharma",
  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=FFC247",
  rating: 4.8,
  phone: "+91 98765 12345",
  experience: "8 years",
};

// ─── CURRENT STUDENT (Adi Kumar — as seen by him/the system) ─────────────────
export const CURRENT_STUDENT: Student = {
  id: "s1",
  name: "Adi Kumar",
  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdiStudent&backgroundColor=2E8BFF",
  class: "Class 10-A",
  seatNumber: "S-14",
  guardian: "Priya Sharma",
  boarded: false,
  currentLocation: "Near Green Park Stop",
};

// ─── PARENT'S CHILD (Aarav — what parent Priya sees) ─────────────────────────
export const CHILD_DATA: Child = {
  id: "c1",
  name: "Aarav Kumar",
  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav&backgroundColor=7C3AED",
  class: "Class 7-B",
  seatNumber: "S-08",
  busId: "b1",
  busNumber: "SB-12",
  routeId: "r1",
  driverId: "d1",
  driverName: "Rahul Sharma",
  driverPhone: "+91 98765 12345",
  boarded: true,
  boardedAt: "08:12 AM",
  boardedStop: "Green Park Metro",
  reachedSchool: false,
  reachedHome: false,
  currentStop: "Saket District Centre",
};

// ─── DRIVER TODAY STUDENTS (students on Rahul's bus SB-12) ───────────────────
export const DRIVER_TODAY_STUDENTS: DriverTodayStudent[] = [
  { id: "s1", name: "Adi Kumar", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdiStudent", class: "10-A", seatNumber: "S-14", stopName: "Saket DC", boarded: true, boardedAt: "08:19 AM" },
  { id: "s2", name: "Aarav Kumar", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav", class: "7-B", seatNumber: "S-08", stopName: "Green Park", boarded: true, boardedAt: "08:12 AM" },
  { id: "s3", name: "Ananya Roy", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya", class: "9-C", seatNumber: "S-21", stopName: "Hauz Khas", boarded: true, boardedAt: "08:25 AM" },
  { id: "s4", name: "Rohan Mehta", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan", class: "8-A", seatNumber: "S-05", stopName: "Malviya Nagar", boarded: false },
  { id: "s5", name: "Priya Singh", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaS", class: "10-B", seatNumber: "S-32", stopName: "Malviya Nagar", boarded: false },
  { id: "s6", name: "Arjun Kapoor", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun", class: "6-D", seatNumber: "S-12", stopName: "Green Park", boarded: true, boardedAt: "08:12 AM" },
  { id: "s7", name: "Sneha Patel", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha", class: "7-A", seatNumber: "S-16", stopName: "Saket DC", boarded: true, boardedAt: "08:19 AM" },
  { id: "s8", name: "Karan Das", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan", class: "11-B", seatNumber: "S-03", stopName: "Hauz Khas", boarded: true, boardedAt: "08:25 AM" },
  { id: "s9", name: "Meera Nair", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera", class: "9-A", seatNumber: "S-28", stopName: "Saket DC", boarded: true, boardedAt: "08:19 AM" },
  { id: "s10", name: "Vivek Gupta", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vivek", class: "8-C", seatNumber: "S-09", stopName: "Green Park", boarded: true, boardedAt: "08:12 AM" },
  { id: "s11", name: "Tanya Sharma", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanya", class: "10-C", seatNumber: "S-11", stopName: "Malviya Nagar", boarded: false },
  { id: "s12", name: "Dev Agarwal", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev", class: "6-A", seatNumber: "S-37", stopName: "Hauz Khas", boarded: true, boardedAt: "08:25 AM" },
];

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
export const ADMIN_STATS: AdminStats = {
  totalBuses: 24,
  runningBuses: 19,
  delayedBuses: 3,
  offlineBuses: 2,
  totalStudents: 480,
  studentsOnboard: 342,
  totalDrivers: 24,
  activeDrivers: 21,
  revenueThisMonth: 245000,
  gpsHealthPercent: 98,
  openComplaints: 3,
  routeHealthPercent: 94,
};

// ─── MAIN ROUTE ───────────────────────────────────────────────────────────────
export const MAIN_ROUTE: Route = {
  id: "r1",
  name: "Route A — Green Park to Delhi Public School",
  school: "Delhi Public School",
  stops: [
    { id: "st1", name: "Green Park Metro", lat: 28.559, lng: 77.207, studentsWaiting: 0, time: "08:05 AM", status: "completed" },
    { id: "st2", name: "Hauz Khas Village", lat: 28.553, lng: 77.194, studentsWaiting: 0, time: "08:18 AM", status: "completed" },
    { id: "st3", name: "Saket District Centre", lat: 28.524, lng: 77.206, studentsWaiting: 2, time: "08:32 AM", status: "current" },
    { id: "st4", name: "Malviya Nagar", lat: 28.535, lng: 77.214, studentsWaiting: 3, time: "08:47 AM", status: "upcoming" },
    { id: "st5", name: "Delhi Public School", lat: 28.545, lng: 77.228, studentsWaiting: 0, time: "09:00 AM", status: "upcoming" },
  ],
  path: [
    { lat: 28.559, lng: 77.207 },
    { lat: 28.556, lng: 77.201 },
    { lat: 28.553, lng: 77.194 },
    { lat: 28.548, lng: 77.198 },
    { lat: 28.542, lng: 77.203 },
    { lat: 28.535, lng: 77.214 },
    { lat: 28.538, lng: 77.221 },
    { lat: 28.545, lng: 77.228 },
  ],
};

// ─── FLEET BUSES (Admin sees all of these) ────────────────────────────────────
export const FLEET_BUSES: FleetBus[] = [
  { id: "b1", number: "SB-12", status: "running", driver: "Rahul Sharma", studentsOnboard: 12, position: { lat: 28.542, lng: 77.203 }, eta: 4, route: "Route A", gpsHealth: true },
  { id: "b2", number: "SB-07", status: "running", driver: "Amit Patel", studentsOnboard: 28, position: { lat: 28.551, lng: 77.198 }, eta: 8, route: "Route B", gpsHealth: true },
  { id: "b3", number: "SB-03", status: "delayed", driver: "Suresh Kumar", studentsOnboard: 15, position: { lat: 28.530, lng: 77.210 }, eta: 15, route: "Route C", gpsHealth: true },
  { id: "b4", number: "SB-19", status: "stopped", driver: "Vikram Singh", studentsOnboard: 0, position: { lat: 28.548, lng: 77.215 }, eta: 0, route: "Route D", gpsHealth: false },
  { id: "b5", number: "SB-05", status: "running", driver: "Deepak Mehta", studentsOnboard: 22, position: { lat: 28.525, lng: 77.205 }, eta: 6, route: "Route E", gpsHealth: true },
];

// ─── TRIP TIMELINE ────────────────────────────────────────────────────────────
export const TRIP_TIMELINE: TripEvent[] = [
  { id: "t1", time: "07:45 AM", title: "Trip Started", description: "Bus departed from depot", status: "completed" },
  { id: "t2", time: "08:05 AM", title: "Green Park Stop", description: "4 students boarded", status: "completed" },
  { id: "t3", time: "08:18 AM", title: "Hauz Khas Stop", description: "3 students boarded", status: "completed" },
  { id: "t4", time: "08:32 AM", title: "Your Stop — Saket", description: "Expected pickup in ~4 min", status: "current" },
  { id: "t5", time: "08:47 AM", title: "Malviya Nagar", description: "3 students waiting", status: "upcoming" },
  { id: "t6", time: "09:00 AM", title: "School Arrival", description: "Delhi Public School", status: "upcoming" },
];

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const ANALYTICS: AnalyticsData = {
  weeklyTrips: [
    { day: "Mon", trips: 2 },
    { day: "Tue", trips: 2 },
    { day: "Wed", trips: 2 },
    { day: "Thu", trips: 2 },
    { day: "Fri", trips: 2 },
    { day: "Sat", trips: 0 },
    { day: "Sun", trips: 0 },
  ],
  monthlyDistance: [
    { month: "Jan", km: 420 },
    { month: "Feb", km: 380 },
    { month: "Mar", km: 450 },
    { month: "Apr", km: 410 },
    { month: "May", km: 390 },
    { month: "Jun", km: 430 },
  ],
  fuelConsumption: [
    { week: "W1", liters: 180 },
    { week: "W2", liters: 195 },
    { week: "W3", liters: 170 },
    { week: "W4", liters: 188 },
  ],
  averageDelay: [
    { day: "Mon", minutes: 3 },
    { day: "Tue", minutes: 1 },
    { day: "Wed", minutes: 5 },
    { day: "Thu", minutes: 2 },
    { day: "Fri", minutes: 4 },
  ],
  peakTimings: [
    { hour: "6AM", riders: 45 },
    { hour: "7AM", riders: 120 },
    { hour: "8AM", riders: 85 },
    { hour: "2PM", riders: 95 },
    { hour: "3PM", riders: 110 },
  ],
  attendance: [
    { day: "Mon", present: 38, absent: 2 },
    { day: "Tue", present: 39, absent: 1 },
    { day: "Wed", present: 37, absent: 3 },
    { day: "Thu", present: 40, absent: 0 },
    { day: "Fri", present: 38, absent: 2 },
  ],
};

// ─── SEARCH DATA ──────────────────────────────────────────────────────────────
export const SEARCH_DATA: SearchResult[] = [
  { id: "sr1", type: "stop", title: "Green Park Metro", subtitle: "Route A • 3 students waiting" },
  { id: "sr2", type: "stop", title: "Saket District Centre", subtitle: "Route A • Your stop" },
  { id: "sr3", type: "route", title: "Route A", subtitle: "Green Park → DPS • 5 stops" },
  { id: "sr4", type: "driver", title: "Rahul Sharma", subtitle: "SB-12 • 4.8★ rating" },
  { id: "sr5", type: "school", title: "Delhi Public School", subtitle: "12 buses • 480 students" },
];

// ─── AI RESPONSES ─────────────────────────────────────────────────────────────
export const AI_RESPONSES: Record<string, string> = {
  "where is my bus": "Your bus SB-12 is currently near Hauz Khas Village, approximately 1.8 KM away. It's moving at 38 km/h on Route A.",
  "when will it arrive": "Based on current traffic and speed, your bus is estimated to arrive in 4 minutes at Saket District Centre.",
  "why is it late": "There's moderate traffic on Ring Road near Malviya Nagar. The driver has taken an alternate route to save 3 minutes.",
  "call driver": "Connecting you to Rahul Sharma (SB-12). Driver rating: 4.8★. Phone: +91 98765 12345.",
  "nearest stop": "Your nearest stop is Saket District Centre, 450 meters away. The bus will arrive there in approximately 4 minutes.",
  "estimated travel time": "Total travel time from your stop to school is approximately 22 minutes, including 2 intermediate stops.",
  default: "I can help you track your bus, check ETA, find nearest stops, or contact your driver. What would you like to know?",
};

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
export const LEADERBOARD = [
  { rank: 1, name: "Ananya R.", points: 3200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya" },
  { rank: 2, name: "Rohan K.", points: 2980, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan" },
  { rank: 3, name: "Adi", points: 2450, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adi" },
  { rank: 4, name: "Priya M.", points: 2100, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
  { rank: 5, name: "Arjun S.", points: 1890, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" },
];

// ─── DEFAULT SETTINGS ─────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  notifications: true,
  soundEffects: true,
  voiceAnnouncements: true,
  language: "English",
  largeText: false,
  highContrast: false,
  biometricLogin: false,
};

// ─── DEFAULT DEMO ─────────────────────────────────────────────────────────────
export const DEFAULT_DEMO: DemoState = {
  enabled: false,
  busProgress: 0.45,
  eta: 4,
  speed: 38,
  distance: 1.8,
  attendance: 9,
  trafficLevel: "low",
  isRaining: false,
  tripStarted: true,
  tripCompleted: false,
  gpsConnected: true,
  currentEventIndex: 3,
  simulatedOffline: false,
  schoolClosed: false,
};

// ─── WEATHER ──────────────────────────────────────────────────────────────────
export const WEATHER = {
  temp: 29,
  condition: "Sunny",
  icon: "☀️",
};
