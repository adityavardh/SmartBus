/**
 * Bus pool per city.
 * The primary bus (index 0) is the "current" bus for the logged-in user.
 * Remaining buses form the city's fleet for admin view.
 *
 * FUTURE BACKEND: Replace with GET /api/buses?cityId=…
 */

import type { BusProfile } from "@/types/location";

export const BUS_DATABASE: Record<string, BusProfile[]> = {
  hyderabad: [
    { id: "b-hyd-1", number: "TS-09", registration: "TS09EA1234", capacity: 42, fuel: 75, battery: 92, engine: "healthy", networkSignal: 5, temperature: 26, occupancy: 14, mileage: 38200, insurance: "Valid until Mar 2027", lastService: "10 Jun 2026", healthStatus: "excellent", cityId: "hyderabad" },
    { id: "b-hyd-2", number: "TS-14", registration: "TS09EA5678", capacity: 42, fuel: 60, battery: 88, engine: "healthy", networkSignal: 4, temperature: 27, occupancy: 22, mileage: 51300, insurance: "Valid until Jul 2027", lastService: "05 May 2026", healthStatus: "good",      cityId: "hyderabad" },
    { id: "b-hyd-3", number: "TS-21", registration: "TS09EA9012", capacity: 38, fuel: 45, battery: 78, engine: "warning", networkSignal: 3, temperature: 29, occupancy: 18, mileage: 67800, insurance: "Valid until Sep 2026", lastService: "20 Apr 2026", healthStatus: "fair",      cityId: "hyderabad" },
    { id: "b-hyd-4", number: "TS-07", registration: "TS09EA3456", capacity: 42, fuel: 88, battery: 95, engine: "healthy", networkSignal: 5, temperature: 25, occupancy: 29, mileage: 22100, insurance: "Valid until Jan 2028", lastService: "12 Jun 2026", healthStatus: "excellent", cityId: "hyderabad" },
    { id: "b-hyd-5", number: "TS-33", registration: "TS09EA7890", capacity: 38, fuel: 32, battery: 70, engine: "healthy", networkSignal: 4, temperature: 28, occupancy: 11, mileage: 89500, insurance: "Valid until Nov 2026", lastService: "15 Mar 2026", healthStatus: "fair",      cityId: "hyderabad" },
  ],
  bengaluru: [
    { id: "b-blr-1", number: "KA-05", registration: "KA05MF2345", capacity: 44, fuel: 80, battery: 94, engine: "healthy", networkSignal: 5, temperature: 23, occupancy: 16, mileage: 29700, insurance: "Valid until Apr 2027", lastService: "08 Jun 2026", healthStatus: "excellent", cityId: "bengaluru" },
    { id: "b-blr-2", number: "KA-19", registration: "KA05MF6789", capacity: 44, fuel: 55, battery: 86, engine: "healthy", networkSignal: 4, temperature: 24, occupancy: 25, mileage: 44500, insurance: "Valid until Aug 2027", lastService: "02 May 2026", healthStatus: "good",      cityId: "bengaluru" },
    { id: "b-blr-3", number: "KA-33", registration: "KA05MF0123", capacity: 40, fuel: 70, battery: 91, engine: "healthy", networkSignal: 5, temperature: 22, occupancy: 20, mileage: 35100, insurance: "Valid until Jun 2027", lastService: "20 May 2026", healthStatus: "good",      cityId: "bengaluru" },
    { id: "b-blr-4", number: "KA-42", registration: "KA05MF4567", capacity: 40, fuel: 40, battery: 75, engine: "warning", networkSignal: 3, temperature: 25, occupancy: 0,  mileage: 72400, insurance: "Valid until Dec 2026", lastService: "10 Mar 2026", healthStatus: "fair",      cityId: "bengaluru" },
    { id: "b-blr-5", number: "KA-11", registration: "KA05MF8901", capacity: 44, fuel: 90, battery: 97, engine: "healthy", networkSignal: 5, temperature: 22, occupancy: 31, mileage: 18200, insurance: "Valid until Feb 2028", lastService: "14 Jun 2026", healthStatus: "excellent", cityId: "bengaluru" },
  ],
  chennai: [
    { id: "b-chn-1", number: "TN-09", registration: "TN09BE1122", capacity: 40, fuel: 72, battery: 90, engine: "healthy", networkSignal: 5, temperature: 30, occupancy: 12, mileage: 41600, insurance: "Valid until May 2027", lastService: "07 Jun 2026", healthStatus: "good",      cityId: "chennai" },
    { id: "b-chn-2", number: "TN-22", registration: "TN09BE3344", capacity: 40, fuel: 58, battery: 83, engine: "healthy", networkSignal: 4, temperature: 31, occupancy: 24, mileage: 55900, insurance: "Valid until Sep 2027", lastService: "28 Apr 2026", healthStatus: "good",      cityId: "chennai" },
    { id: "b-chn-3", number: "TN-37", registration: "TN09BE5566", capacity: 36, fuel: 45, battery: 76, engine: "warning", networkSignal: 3, temperature: 33, occupancy: 0,  mileage: 78300, insurance: "Valid until Jul 2026", lastService: "15 Feb 2026", healthStatus: "fair",      cityId: "chennai" },
    { id: "b-chn-4", number: "TN-44", registration: "TN09BE7788", capacity: 40, fuel: 85, battery: 93, engine: "healthy", networkSignal: 5, temperature: 29, occupancy: 18, mileage: 26500, insurance: "Valid until Jan 2028", lastService: "11 Jun 2026", healthStatus: "excellent", cityId: "chennai" },
  ],
  mumbai: [
    { id: "b-mum-1", number: "MH-02", registration: "MH02CD4432", capacity: 46, fuel: 68, battery: 88, engine: "healthy", networkSignal: 4, temperature: 28, occupancy: 19, mileage: 47300, insurance: "Valid until Jun 2027", lastService: "09 Jun 2026", healthStatus: "good",      cityId: "mumbai" },
    { id: "b-mum-2", number: "MH-17", registration: "MH02CD8876", capacity: 46, fuel: 82, battery: 93, engine: "healthy", networkSignal: 5, temperature: 27, occupancy: 28, mileage: 33200, insurance: "Valid until Oct 2027", lastService: "03 Jun 2026", healthStatus: "excellent", cityId: "mumbai" },
    { id: "b-mum-3", number: "MH-29", registration: "MH02CD2210", capacity: 42, fuel: 50, battery: 80, engine: "healthy", networkSignal: 4, temperature: 29, occupancy: 15, mileage: 61100, insurance: "Valid until Mar 2027", lastService: "22 Apr 2026", healthStatus: "good",      cityId: "mumbai" },
    { id: "b-mum-4", number: "MH-08", registration: "MH02CD6654", capacity: 46, fuel: 35, battery: 70, engine: "warning", networkSignal: 2, temperature: 31, occupancy: 0,  mileage: 88700, insurance: "Valid until Aug 2026", lastService: "10 Jan 2026", healthStatus: "fair",      cityId: "mumbai" },
    { id: "b-mum-5", number: "MH-41", registration: "MH02CD0098", capacity: 46, fuel: 91, battery: 96, engine: "healthy", networkSignal: 5, temperature: 26, occupancy: 33, mileage: 15400, insurance: "Valid until Apr 2028", lastService: "13 Jun 2026", healthStatus: "excellent", cityId: "mumbai" },
  ],
  delhi: [
    { id: "b-del-1", number: "SB-12", registration: "DL01AB1234", capacity: 40, fuel: 72, battery: 94, engine: "healthy", networkSignal: 4, temperature: 24, occupancy: 12, mileage: 45230, insurance: "Valid until Dec 2026", lastService: "15 Jun 2026", healthStatus: "excellent", cityId: "delhi" },
    { id: "b-del-2", number: "SB-07", registration: "DL01AB5678", capacity: 40, fuel: 65, battery: 88, engine: "healthy", networkSignal: 5, temperature: 25, occupancy: 28, mileage: 38100, insurance: "Valid until Mar 2027", lastService: "01 Jun 2026", healthStatus: "good",      cityId: "delhi" },
    { id: "b-del-3", number: "SB-03", registration: "DL01AB9012", capacity: 38, fuel: 48, battery: 78, engine: "warning", networkSignal: 3, temperature: 27, occupancy: 15, mileage: 62700, insurance: "Valid until Jun 2026", lastService: "18 Mar 2026", healthStatus: "fair",      cityId: "delhi" },
    { id: "b-del-4", number: "SB-19", registration: "DL01AB3456", capacity: 40, fuel: 10, battery: 55, engine: "warning", networkSignal: 1, temperature: 23, occupancy: 0,  mileage: 91400, insurance: "Valid until Sep 2026", lastService: "05 Jan 2026", healthStatus: "fair",      cityId: "delhi" },
    { id: "b-del-5", number: "SB-05", registration: "DL01AB7890", capacity: 40, fuel: 85, battery: 92, engine: "healthy", networkSignal: 5, temperature: 24, occupancy: 22, mileage: 27300, insurance: "Valid until Feb 2027", lastService: "10 Jun 2026", healthStatus: "excellent", cityId: "delhi" },
  ],
  pune: [
    { id: "b-pun-1", number: "MH-12", registration: "MH12AC2233", capacity: 42, fuel: 76, battery: 90, engine: "healthy", networkSignal: 5, temperature: 25, occupancy: 14, mileage: 34800, insurance: "Valid until Jul 2027", lastService: "06 Jun 2026", healthStatus: "good",      cityId: "pune" },
    { id: "b-pun-2", number: "MH-28", registration: "MH12AC6677", capacity: 42, fuel: 60, battery: 84, engine: "healthy", networkSignal: 4, temperature: 26, occupancy: 22, mileage: 49600, insurance: "Valid until Nov 2027", lastService: "30 Apr 2026", healthStatus: "good",      cityId: "pune" },
    { id: "b-pun-3", number: "MH-35", registration: "MH12AC0011", capacity: 38, fuel: 90, battery: 96, engine: "healthy", networkSignal: 5, temperature: 24, occupancy: 29, mileage: 19200, insurance: "Valid until May 2028", lastService: "14 Jun 2026", healthStatus: "excellent", cityId: "pune" },
  ],
};

export const FALLBACK_BUSES = BUS_DATABASE.hyderabad;
