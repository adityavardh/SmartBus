export interface BusTelemetry {
  busNumber: string;
  driverName: string;
  routeName: string;
  speed: number;
  eta: number;
  distanceRemaining: number;
  passengerCount: number;
  status: "running" | "stopped" | "delayed" | "arriving";
  progress: number;
  currentStop: string;
  nextStop: string;
  arrivalTime: string;
  lastUpdated: string;
}
