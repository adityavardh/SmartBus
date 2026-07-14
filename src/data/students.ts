/**
 * Student and parent pools per city.
 * One student + one child + one parent is randomly selected per session.
 *
 * FUTURE BACKEND: Replace with GET /api/students?cityId=…
 */

import type { StudentProfile, ChildProfile, ParentProfile } from "@/types/location";

// ─── Student pools ────────────────────────────────────────────────────────────
export const STUDENT_DATABASE: Record<string, StudentProfile[]> = {
  hyderabad: [
    { id: "stu-hyd-1", name: "Arjun Reddy",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunReddy&backgroundColor=2E8BFF",  class: "Class 9-A",  seatNumber: "S-12", guardian: "Sunita Reddy",  stopName: "KPHB Colony",  cityId: "hyderabad" },
    { id: "stu-hyd-2", name: "Priya Sharma",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharmA&backgroundColor=7C3AED", class: "Class 10-B", seatNumber: "S-07", guardian: "Mohan Sharma",  stopName: "Kukatpally",   cityId: "hyderabad" },
    { id: "stu-hyd-3", name: "Rohit Naidu",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=RohitNaidu&backgroundColor=FFC247",  class: "Class 8-C",  seatNumber: "S-22", guardian: "Latha Naidu",   stopName: "JNTU",         cityId: "hyderabad" },
    { id: "stu-hyd-4", name: "Sneha Rao",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaRao&backgroundColor=22C55E",    class: "Class 11-A", seatNumber: "S-05", guardian: "Venkat Rao",    stopName: "Miyapur Metro",cityId: "hyderabad" },
  ],
  bengaluru: [
    { id: "stu-blr-1", name: "Kiran Gowda",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=KiranGowda&backgroundColor=2E8BFF",  class: "Class 9-B",  seatNumber: "S-09", guardian: "Kavitha Gowda", stopName: "Whitefield",   cityId: "bengaluru" },
    { id: "stu-blr-2", name: "Divya Nair",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=DivyaNair&backgroundColor=7C3AED",   class: "Class 10-A", seatNumber: "S-14", guardian: "Suresh Nair",   stopName: "Indiranagar",  cityId: "bengaluru" },
    { id: "stu-blr-3", name: "Rahul Hegde",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=RahulHegde&backgroundColor=FFC247",  class: "Class 8-A",  seatNumber: "S-28", guardian: "Mala Hegde",    stopName: "Koramangala",  cityId: "bengaluru" },
    { id: "stu-blr-4", name: "Ananya Kumar",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaKumar&backgroundColor=22C55E", class: "Class 11-C", seatNumber: "S-03", guardian: "Ravi Kumar",    stopName: "HSR Layout",   cityId: "bengaluru" },
  ],
  chennai: [
    { id: "stu-chn-1", name: "Vikram Rajan",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=VikramRajan&backgroundColor=2E8BFF", class: "Class 9-C",  seatNumber: "S-18", guardian: "Meena Rajan",   stopName: "T. Nagar",     cityId: "chennai" },
    { id: "stu-chn-2", name: "Lakshmi Iyer",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=LakshmiIyer&backgroundColor=7C3AED", class: "Class 10-C", seatNumber: "S-11", guardian: "Anand Iyer",    stopName: "Nungambakkam", cityId: "chennai" },
    { id: "stu-chn-3", name: "Karthik Pillai",photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikPillai&backgroundColor=FFC247",class: "Class 8-B",  seatNumber: "S-25", guardian: "Radha Pillai",  stopName: "Velachery",    cityId: "chennai" },
    { id: "stu-chn-4", name: "Deepa Venkat",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=DeepaVenkat&backgroundColor=22C55E", class: "Class 11-B", seatNumber: "S-06", guardian: "Suresh Venkat", stopName: "Guindy",       cityId: "chennai" },
  ],
  mumbai: [
    { id: "stu-mum-1", name: "Rohan Patil",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=RohanPatil&backgroundColor=2E8BFF",  class: "Class 9-A",  seatNumber: "S-16", guardian: "Sunita Patil",  stopName: "Andheri West", cityId: "mumbai" },
    { id: "stu-mum-2", name: "Isha Shah",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=IshaShah&backgroundColor=7C3AED",    class: "Class 10-D", seatNumber: "S-08", guardian: "Neel Shah",     stopName: "Bandra West",  cityId: "mumbai" },
    { id: "stu-mum-3", name: "Varun Mehta",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=VarunMehta&backgroundColor=FFC247",  class: "Class 8-C",  seatNumber: "S-33", guardian: "Priya Mehta",   stopName: "Jogeshwari",   cityId: "mumbai" },
    { id: "stu-mum-4", name: "Nisha Joshi",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=NishaJoshi&backgroundColor=22C55E",  class: "Class 11-A", seatNumber: "S-04", guardian: "Anil Joshi",    stopName: "Goregaon",     cityId: "mumbai" },
  ],
  delhi: [
    { id: "stu-del-1", name: "Adi Kumar",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdiStudent&backgroundColor=2E8BFF",  class: "Class 10-A", seatNumber: "S-14", guardian: "Priya Kumar",   stopName: "Saket District Centre", cityId: "delhi" },
    { id: "stu-del-2", name: "Aarav Sharma",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AaravSharma&backgroundColor=7C3AED", class: "Class 7-B",  seatNumber: "S-08", guardian: "Meera Sharma",  stopName: "Green Park Metro", cityId: "delhi" },
    { id: "stu-del-3", name: "Ananya Roy",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaRoy&backgroundColor=FFC247",   class: "Class 9-C",  seatNumber: "S-21", guardian: "Suresh Roy",    stopName: "Hauz Khas Village", cityId: "delhi" },
    { id: "stu-del-4", name: "Riya Singh",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=RiyaSingh&backgroundColor=22C55E",   class: "Class 11-B", seatNumber: "S-03", guardian: "Arun Singh",    stopName: "Malviya Nagar",    cityId: "delhi" },
  ],
  pune: [
    { id: "stu-pun-1", name: "Aditya More",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaMore&backgroundColor=2E8BFF",  class: "Class 9-A",  seatNumber: "S-10", guardian: "Kavita More",   stopName: "Baner",        cityId: "pune" },
    { id: "stu-pun-2", name: "Pooja Desai",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=PoojaDesai&backgroundColor=7C3AED",  class: "Class 10-B", seatNumber: "S-19", guardian: "Vikram Desai",  stopName: "Wakad",        cityId: "pune" },
    { id: "stu-pun-3", name: "Sahil Kulkarni",photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SahilKulkarni&backgroundColor=FFC247",class: "Class 8-C",  seatNumber: "S-27", guardian: "Smita Kulkarni",stopName: "Pimple Saudagar",cityId: "pune" },
  ],
};

// ─── Child profiles (what a parent sees) ─────────────────────────────────────
export const CHILD_DATABASE: Record<string, ChildProfile[]> = {
  hyderabad: [
    { id: "chd-hyd-1", name: "Arjun Reddy",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunReddy&backgroundColor=7C3AED",  class: "Class 9-A",  seatNumber: "S-12", busId: "b-hyd-1", busNumber: "TS-09", routeId: "hyd-r1", driverId: "drv-hyd-1", driverName: "Ravi Kumar Reddy", driverPhone: "+91 98490 11234", boarded: true,  boardedAt: "08:00 AM", boardedStop: "KPHB Colony",   reachedSchool: false, reachedHome: false, currentStop: "Kukatpally",   cityId: "hyderabad" },
    { id: "chd-hyd-2", name: "Priya Sharma",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharmA&backgroundColor=2E8BFF", class: "Class 10-B", seatNumber: "S-07", busId: "b-hyd-2", busNumber: "TS-14", routeId: "hyd-r2", driverId: "drv-hyd-2", driverName: "Mohammed Saleem",  driverPhone: "+91 90003 22456", boarded: true,  boardedAt: "07:55 AM", boardedStop: "Gachibowli",    reachedSchool: false, reachedHome: false, currentStop: "Madhapur",     cityId: "hyderabad" },
    { id: "chd-hyd-3", name: "Rohit Naidu",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=RohitNaidu&backgroundColor=FFC247",  class: "Class 8-C",  seatNumber: "S-22", busId: "b-hyd-1", busNumber: "TS-09", routeId: "hyd-r1", driverId: "drv-hyd-1", driverName: "Ravi Kumar Reddy", driverPhone: "+91 98490 11234", boarded: false, boardedAt: undefined,  boardedStop: undefined,       reachedSchool: false, reachedHome: false, currentStop: "JNTU",         cityId: "hyderabad" },
  ],
  bengaluru: [
    { id: "chd-blr-1", name: "Kiran Gowda",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=KiranGowda&backgroundColor=7C3AED",  class: "Class 9-B",  seatNumber: "S-09", busId: "b-blr-1", busNumber: "KA-05", routeId: "blr-r1", driverId: "drv-blr-1", driverName: "Sunil Gowda",      driverPhone: "+91 98440 55012", boarded: true,  boardedAt: "07:45 AM", boardedStop: "Whitefield",    reachedSchool: false, reachedHome: false, currentStop: "Indiranagar",   cityId: "bengaluru" },
    { id: "chd-blr-2", name: "Divya Nair",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=DivyaNair&backgroundColor=2E8BFF",   class: "Class 10-A", seatNumber: "S-14", busId: "b-blr-2", busNumber: "KA-19", routeId: "blr-r2", driverId: "drv-blr-2", driverName: "Ramesh Naik",      driverPhone: "+91 80934 66234", boarded: false, boardedAt: undefined,  boardedStop: undefined,       reachedSchool: false, reachedHome: false, currentStop: "BTM Layout",   cityId: "bengaluru" },
  ],
  chennai: [
    { id: "chd-chn-1", name: "Vikram Rajan",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=VikramRajan&backgroundColor=7C3AED", class: "Class 9-C",  seatNumber: "S-18", busId: "b-chn-1", busNumber: "TN-09", routeId: "chn-r1", driverId: "drv-chn-1", driverName: "Murugan Pillai",   driverPhone: "+91 94440 99012", boarded: true,  boardedAt: "08:00 AM", boardedStop: "Velachery",     reachedSchool: false, reachedHome: false, currentStop: "T. Nagar",     cityId: "chennai" },
    { id: "chd-chn-2", name: "Lakshmi Iyer",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=LakshmiIyer&backgroundColor=2E8BFF", class: "Class 10-C", seatNumber: "S-11", busId: "b-chn-2", busNumber: "TN-22", routeId: "chn-r2", driverId: "drv-chn-2", driverName: "Krishnamurthy S.", driverPhone: "+91 87540 10234", boarded: false, boardedAt: undefined,  boardedStop: undefined,       reachedSchool: false, reachedHome: false, currentStop: "Egmore",       cityId: "chennai" },
  ],
  mumbai: [
    { id: "chd-mum-1", name: "Rohan Patil",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=RohanPatil&backgroundColor=7C3AED",  class: "Class 9-A",  seatNumber: "S-16", busId: "b-mum-1", busNumber: "MH-02", routeId: "mum-r1", driverId: "drv-mum-1", driverName: "Santosh Patil",    driverPhone: "+91 98200 33890", boarded: true,  boardedAt: "07:45 AM", boardedStop: "Andheri West",  reachedSchool: false, reachedHome: false, currentStop: "Jogeshwari",   cityId: "mumbai" },
    { id: "chd-mum-2", name: "Isha Shah",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=IshaShah&backgroundColor=2E8BFF",    class: "Class 10-D", seatNumber: "S-08", busId: "b-mum-2", busNumber: "MH-17", routeId: "mum-r2", driverId: "drv-mum-2", driverName: "Vijay Kharade",    driverPhone: "+91 99676 44012", boarded: false, boardedAt: undefined,  boardedStop: undefined,       reachedSchool: false, reachedHome: false, currentStop: "Dadar",        cityId: "mumbai" },
  ],
  delhi: [
    { id: "chd-del-1", name: "Aarav Kumar",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav&backgroundColor=7C3AED",       class: "Class 7-B",  seatNumber: "S-08", busId: "b-del-1", busNumber: "SB-12", routeId: "del-r1", driverId: "drv-del-1", driverName: "Rahul Sharma",     driverPhone: "+91 98765 12345", boarded: true,  boardedAt: "08:12 AM", boardedStop: "Green Park Metro",reachedSchool: false, reachedHome: false, currentStop: "Saket District Centre", cityId: "delhi" },
  ],
  pune: [
    { id: "chd-pun-1", name: "Aditya More",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaMore&backgroundColor=7C3AED",  class: "Class 9-A",  seatNumber: "S-10", busId: "b-pun-1", busNumber: "MH-12", routeId: "pun-r1", driverId: "drv-pun-1", driverName: "Anil Shinde",      driverPhone: "+91 98600 56789", boarded: true,  boardedAt: "07:50 AM", boardedStop: "Hinjewadi Phase 1",reachedSchool: false, reachedHome: false, currentStop: "Baner",       cityId: "pune" },
  ],
};

// ─── Parent profiles ──────────────────────────────────────────────────────────
export const PARENT_DATABASE: Record<string, ParentProfile[]> = {
  hyderabad: [
    { id: "par-hyd-1", name: "Sunita Reddy",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SunitaReddy&backgroundColor=7C3AED",  childId: "chd-hyd-1", cityId: "hyderabad" },
    { id: "par-hyd-2", name: "Mohan Sharma",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=MohanSharma&backgroundColor=EF4444",  childId: "chd-hyd-2", cityId: "hyderabad" },
    { id: "par-hyd-3", name: "Latha Naidu",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=LathaNaidu&backgroundColor=22C55E",   childId: "chd-hyd-3", cityId: "hyderabad" },
  ],
  bengaluru: [
    { id: "par-blr-1", name: "Kavitha Gowda",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=KavithaGowda&backgroundColor=7C3AED", childId: "chd-blr-1", cityId: "bengaluru" },
    { id: "par-blr-2", name: "Suresh Nair",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SureshNair&backgroundColor=2E8BFF",   childId: "chd-blr-2", cityId: "bengaluru" },
  ],
  chennai: [
    { id: "par-chn-1", name: "Meena Rajan",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=MeenaRajan&backgroundColor=7C3AED",   childId: "chd-chn-1", cityId: "chennai" },
    { id: "par-chn-2", name: "Anand Iyer",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnandIyer&backgroundColor=2E8BFF",    childId: "chd-chn-2", cityId: "chennai" },
  ],
  mumbai: [
    { id: "par-mum-1", name: "Sunita Patil",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SunitaPatil&backgroundColor=7C3AED",  childId: "chd-mum-1", cityId: "mumbai" },
    { id: "par-mum-2", name: "Neel Shah",      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=NeelShah&backgroundColor=2E8BFF",     childId: "chd-mum-2", cityId: "mumbai" },
  ],
  delhi: [
    { id: "par-del-1", name: "Priya Sharma",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=7C3AED",        childId: "chd-del-1", cityId: "delhi" },
  ],
  pune: [
    { id: "par-pun-1", name: "Kavita More",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=KavitaMore&backgroundColor=7C3AED",   childId: "chd-pun-1", cityId: "pune" },
  ],
};
