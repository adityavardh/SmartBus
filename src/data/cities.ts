/**
 * City registry — add more cities here.
 * Each city carries its own centre coordinates, known stop clusters,
 * and a set of pre-defined school routes.
 *
 * FUTURE BACKEND: Replace with GET /api/cities
 */

import type { CityData } from "@/types/location";

export const CITY_DATABASE: Record<string, CityData> = {
  hyderabad: {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    country: "India",
    center: { lat: 17.385, lng: 78.4867 },
    zoom: 12.5,
    timezone: "Asia/Kolkata",
    routes: [
      {
        id: "hyd-r1",
        name: "Route 1 — KPHB to Oakridge",
        schoolId: "oakridge-hyd",
        stops: [
          { id: "hyd-s1", name: "KPHB Colony",                lat: 17.4977, lng: 78.3918, studentsWaiting: 4, time: "07:45 AM", status: "completed" },
          { id: "hyd-s2", name: "Miyapur Metro",              lat: 17.4940, lng: 78.3573, studentsWaiting: 0, time: "08:00 AM", status: "completed" },
          { id: "hyd-s3", name: "Kukatpally",                 lat: 17.4849, lng: 78.4138, studentsWaiting: 3, time: "08:15 AM", status: "current"   },
          { id: "hyd-s4", name: "JNTU",                       lat: 17.4930, lng: 78.3893, studentsWaiting: 2, time: "08:30 AM", status: "upcoming"  },
          { id: "hyd-s5", name: "Nizampet",                   lat: 17.5087, lng: 78.3882, studentsWaiting: 0, time: "08:45 AM", status: "upcoming"  },
          { id: "hyd-s6", name: "Oakridge International School", lat: 17.4947, lng: 78.3989, studentsWaiting: 0, time: "09:00 AM", status: "upcoming" },
        ],
        // path = stop coords in order — OSRM supplies road geometry between them.
        // Never add intermediate points that cause a directional reversal.
        path: [
          { lat: 17.4977, lng: 78.3918 }, // KPHB Colony
          { lat: 17.4940, lng: 78.3573 }, // Miyapur Metro
          { lat: 17.4849, lng: 78.4138 }, // Kukatpally
          { lat: 17.4930, lng: 78.3893 }, // JNTU
          { lat: 17.5087, lng: 78.3882 }, // Nizampet
          { lat: 17.4947, lng: 78.3989 }, // Oakridge
        ],
      },
      {
        id: "hyd-r2",
        name: "Route 2 — Gachibowli to DPS",
        schoolId: "dps-hyd",
        stops: [
          { id: "hyd-s7",  name: "Gachibowli",   lat: 17.4401, lng: 78.3489, studentsWaiting: 5, time: "07:50 AM", status: "completed" },
          { id: "hyd-s8",  name: "Hitech City",  lat: 17.4474, lng: 78.3762, studentsWaiting: 0, time: "08:05 AM", status: "completed" },
          { id: "hyd-s9",  name: "Madhapur",     lat: 17.4519, lng: 78.3920, studentsWaiting: 2, time: "08:20 AM", status: "current"   },
          { id: "hyd-s10", name: "Jubilee Hills", lat: 17.4317, lng: 78.4072, studentsWaiting: 3, time: "08:35 AM", status: "upcoming"  },
          { id: "hyd-s11", name: "DPS Hyderabad", lat: 17.4154, lng: 78.4259, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 17.4401, lng: 78.3489 }, // Gachibowli
          { lat: 17.4474, lng: 78.3762 }, // Hitech City
          { lat: 17.4519, lng: 78.3920 }, // Madhapur
          { lat: 17.4317, lng: 78.4072 }, // Jubilee Hills
          { lat: 17.4154, lng: 78.4259 }, // DPS Hyderabad
        ],
      },
    ],
    fleetOffset: { lat: 17.4849, lng: 78.4138 },
  },

  bengaluru: {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    country: "India",
    center: { lat: 12.9716, lng: 77.5946 },
    zoom: 12.5,
    timezone: "Asia/Kolkata",
    routes: [
      {
        id: "blr-r1",
        name: "Route 1 — Whitefield to DPS",
        schoolId: "dps-blr",
        stops: [
          { id: "blr-s1", name: "Whitefield",    lat: 12.9698, lng: 77.7499, studentsWaiting: 4, time: "07:40 AM", status: "completed" },
          { id: "blr-s2", name: "Marathahalli",  lat: 12.9565, lng: 77.7010, studentsWaiting: 0, time: "07:55 AM", status: "completed" },
          { id: "blr-s3", name: "Indiranagar",   lat: 12.9784, lng: 77.6408, studentsWaiting: 3, time: "08:15 AM", status: "current"   },
          { id: "blr-s4", name: "Koramangala",   lat: 12.9352, lng: 77.6245, studentsWaiting: 2, time: "08:30 AM", status: "upcoming"  },
          { id: "blr-s5", name: "HSR Layout",    lat: 12.9116, lng: 77.6473, studentsWaiting: 1, time: "08:45 AM", status: "upcoming"  },
          { id: "blr-s6", name: "DPS Bangalore", lat: 12.9050, lng: 77.6701, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 12.9698, lng: 77.7499 }, // Whitefield
          { lat: 12.9565, lng: 77.7010 }, // Marathahalli
          { lat: 12.9784, lng: 77.6408 }, // Indiranagar
          { lat: 12.9352, lng: 77.6245 }, // Koramangala
          { lat: 12.9116, lng: 77.6473 }, // HSR Layout
          { lat: 12.9050, lng: 77.6701 }, // DPS Bangalore
        ],
      },
      {
        id: "blr-r2",
        name: "Route 2 — Electronic City to Oakridge",
        schoolId: "oakridge-blr",
        stops: [
          { id: "blr-s7",  name: "Electronic City",    lat: 12.8452, lng: 77.6601, studentsWaiting: 5, time: "07:50 AM", status: "completed" },
          { id: "blr-s8",  name: "Bommanahalli",       lat: 12.8824, lng: 77.6275, studentsWaiting: 0, time: "08:05 AM", status: "completed" },
          { id: "blr-s9",  name: "BTM Layout",         lat: 12.9166, lng: 77.6101, studentsWaiting: 3, time: "08:20 AM", status: "current"   },
          { id: "blr-s10", name: "Jayanagar",          lat: 12.9299, lng: 77.5933, studentsWaiting: 2, time: "08:35 AM", status: "upcoming"  },
          { id: "blr-s11", name: "Oakridge Bangalore", lat: 12.9450, lng: 77.5750, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 12.8452, lng: 77.6601 }, // Electronic City
          { lat: 12.8824, lng: 77.6275 }, // Bommanahalli
          { lat: 12.9166, lng: 77.6101 }, // BTM Layout
          { lat: 12.9299, lng: 77.5933 }, // Jayanagar
          { lat: 12.9450, lng: 77.5750 }, // Oakridge Bangalore
        ],
      },
    ],
    fleetOffset: { lat: 12.9565, lng: 77.7010 },
  },

  chennai: {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    center: { lat: 13.0827, lng: 80.2707 },
    zoom: 12.5,
    timezone: "Asia/Kolkata",
    routes: [
      {
        id: "chn-r1",
        name: "Route 1 — Velachery to PSBB",
        schoolId: "psbb-chn",
        stops: [
          { id: "chn-s1", name: "Velachery",    lat: 12.9815, lng: 80.2180, studentsWaiting: 4, time: "07:45 AM", status: "completed" },
          { id: "chn-s2", name: "Guindy",       lat: 13.0067, lng: 80.2206, studentsWaiting: 0, time: "08:00 AM", status: "completed" },
          { id: "chn-s3", name: "T. Nagar",     lat: 13.0418, lng: 80.2341, studentsWaiting: 3, time: "08:15 AM", status: "current"   },
          { id: "chn-s4", name: "Nungambakkam", lat: 13.0604, lng: 80.2442, studentsWaiting: 2, time: "08:30 AM", status: "upcoming"  },
          { id: "chn-s5", name: "PSBB School",  lat: 13.0827, lng: 80.2707, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 12.9815, lng: 80.2180 }, // Velachery
          { lat: 13.0067, lng: 80.2206 }, // Guindy
          { lat: 13.0418, lng: 80.2341 }, // T. Nagar
          { lat: 13.0604, lng: 80.2442 }, // Nungambakkam
          { lat: 13.0827, lng: 80.2707 }, // PSBB School
        ],
      },
      {
        id: "chn-r2",
        name: "Route 2 — Anna Nagar to DAV",
        schoolId: "dav-chn",
        stops: [
          { id: "chn-s6",  name: "Anna Nagar",  lat: 13.0850, lng: 80.2101, studentsWaiting: 5, time: "07:50 AM", status: "completed" },
          { id: "chn-s7",  name: "Kilpauk",     lat: 13.0817, lng: 80.2414, studentsWaiting: 0, time: "08:05 AM", status: "completed" },
          { id: "chn-s8",  name: "Egmore",      lat: 13.0732, lng: 80.2609, studentsWaiting: 3, time: "08:20 AM", status: "current"   },
          { id: "chn-s9",  name: "Royapettah",  lat: 13.0553, lng: 80.2631, studentsWaiting: 2, time: "08:35 AM", status: "upcoming"  },
          { id: "chn-s10", name: "DAV School",  lat: 13.0352, lng: 80.2707, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 13.0850, lng: 80.2101 }, // Anna Nagar
          { lat: 13.0817, lng: 80.2414 }, // Kilpauk
          { lat: 13.0732, lng: 80.2609 }, // Egmore
          { lat: 13.0553, lng: 80.2631 }, // Royapettah
          { lat: 13.0352, lng: 80.2707 }, // DAV School
        ],
      },
    ],
    fleetOffset: { lat: 13.0418, lng: 80.2341 },
  },

  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    country: "India",
    center: { lat: 19.076, lng: 72.8777 },
    zoom: 12,
    timezone: "Asia/Kolkata",
    routes: [
      {
        id: "mum-r1",
        name: "Route 1 — Andheri to Ryan International",
        schoolId: "ryan-mum",
        stops: [
          { id: "mum-s1", name: "Andheri West",      lat: 19.1197, lng: 72.8372, studentsWaiting: 5, time: "07:40 AM", status: "completed" },
          { id: "mum-s2", name: "Versova",            lat: 19.1310, lng: 72.8199, studentsWaiting: 0, time: "07:55 AM", status: "completed" },
          { id: "mum-s3", name: "Jogeshwari",         lat: 19.1425, lng: 72.8494, studentsWaiting: 3, time: "08:15 AM", status: "current"   },
          { id: "mum-s4", name: "Goregaon",           lat: 19.1663, lng: 72.8526, studentsWaiting: 2, time: "08:30 AM", status: "upcoming"  },
          { id: "mum-s5", name: "Malad",              lat: 19.1872, lng: 72.8482, studentsWaiting: 1, time: "08:45 AM", status: "upcoming"  },
          { id: "mum-s6", name: "Ryan International", lat: 19.2016, lng: 72.8561, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 19.1197, lng: 72.8372 }, // Andheri West
          { lat: 19.1310, lng: 72.8199 }, // Versova
          { lat: 19.1425, lng: 72.8494 }, // Jogeshwari
          { lat: 19.1663, lng: 72.8526 }, // Goregaon
          { lat: 19.1872, lng: 72.8482 }, // Malad
          { lat: 19.2016, lng: 72.8561 }, // Ryan International
        ],
      },
      {
        id: "mum-r2",
        name: "Route 2 — Bandra to Campion",
        schoolId: "campion-mum",
        stops: [
          { id: "mum-s7",  name: "Bandra West",   lat: 19.0596, lng: 72.8295, studentsWaiting: 5, time: "07:50 AM", status: "completed" },
          { id: "mum-s8",  name: "Mahim",         lat: 19.0388, lng: 72.8397, studentsWaiting: 0, time: "08:05 AM", status: "completed" },
          { id: "mum-s9",  name: "Dadar",         lat: 19.0199, lng: 72.8427, studentsWaiting: 3, time: "08:20 AM", status: "current"   },
          { id: "mum-s10", name: "Parel",         lat: 18.9952, lng: 72.8413, studentsWaiting: 2, time: "08:35 AM", status: "upcoming"  },
          { id: "mum-s11", name: "Campion School", lat: 18.9768, lng: 72.8297, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 19.0596, lng: 72.8295 }, // Bandra West
          { lat: 19.0388, lng: 72.8397 }, // Mahim
          { lat: 19.0199, lng: 72.8427 }, // Dadar
          { lat: 18.9952, lng: 72.8413 }, // Parel
          { lat: 18.9768, lng: 72.8297 }, // Campion School
        ],
      },
    ],
    fleetOffset: { lat: 19.1197, lng: 72.8372 },
  },

  delhi: {
    id: "delhi",
    name: "Delhi",
    state: "Delhi",
    country: "India",
    center: { lat: 28.6139, lng: 77.209 },
    zoom: 12,
    timezone: "Asia/Kolkata",
    routes: [
      {
        id: "del-r1",
        name: "Route 1 — Green Park to DPS",
        schoolId: "dps-del",
        stops: [
          { id: "del-s1", name: "Green Park Metro",      lat: 28.559, lng: 77.207, studentsWaiting: 0, time: "08:05 AM", status: "completed" },
          { id: "del-s2", name: "Hauz Khas Village",     lat: 28.553, lng: 77.194, studentsWaiting: 0, time: "08:18 AM", status: "completed" },
          { id: "del-s3", name: "Saket District Centre", lat: 28.524, lng: 77.206, studentsWaiting: 2, time: "08:32 AM", status: "current"   },
          { id: "del-s4", name: "Malviya Nagar",         lat: 28.535, lng: 77.214, studentsWaiting: 3, time: "08:47 AM", status: "upcoming"  },
          { id: "del-s5", name: "Delhi Public School",   lat: 28.545, lng: 77.228, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 28.559, lng: 77.207 }, // Green Park Metro
          { lat: 28.553, lng: 77.194 }, // Hauz Khas Village
          { lat: 28.524, lng: 77.206 }, // Saket District Centre
          { lat: 28.535, lng: 77.214 }, // Malviya Nagar
          { lat: 28.545, lng: 77.228 }, // Delhi Public School
        ],
      },
      {
        id: "del-r2",
        name: "Route 2 — Rohini to Modern School",
        schoolId: "modern-del",
        stops: [
          { id: "del-s6",  name: "Rohini Sector 3", lat: 28.7199, lng: 77.1120, studentsWaiting: 4, time: "07:50 AM", status: "completed" },
          { id: "del-s7",  name: "Pitampura",        lat: 28.7050, lng: 77.1310, studentsWaiting: 0, time: "08:05 AM", status: "completed" },
          { id: "del-s8",  name: "Shalimar Bagh",    lat: 28.7110, lng: 77.1580, studentsWaiting: 2, time: "08:20 AM", status: "current"   },
          { id: "del-s9",  name: "Ashok Vihar",      lat: 28.6950, lng: 77.1680, studentsWaiting: 3, time: "08:35 AM", status: "upcoming"  },
          { id: "del-s10", name: "Modern School",    lat: 28.6742, lng: 77.2219, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 28.7199, lng: 77.1120 }, // Rohini Sector 3
          { lat: 28.7050, lng: 77.1310 }, // Pitampura
          { lat: 28.7110, lng: 77.1580 }, // Shalimar Bagh
          { lat: 28.6950, lng: 77.1680 }, // Ashok Vihar
          { lat: 28.6742, lng: 77.2219 }, // Modern School
        ],
      },
    ],
    fleetOffset: { lat: 28.553, lng: 77.194 },
  },

  pune: {
    id: "pune",
    name: "Pune",
    state: "Maharashtra",
    country: "India",
    center: { lat: 18.5204, lng: 73.8567 },
    zoom: 12.5,
    timezone: "Asia/Kolkata",
    routes: [
      {
        id: "pun-r1",
        name: "Route 1 — Hinjewadi to Bishop's",
        schoolId: "bishops-pun",
        stops: [
          { id: "pun-s1", name: "Hinjewadi Phase 1", lat: 18.5916, lng: 73.7392, studentsWaiting: 4, time: "07:45 AM", status: "completed" },
          { id: "pun-s2", name: "Wakad",             lat: 18.6015, lng: 73.7617, studentsWaiting: 0, time: "08:00 AM", status: "completed" },
          { id: "pun-s3", name: "Pimple Saudagar",   lat: 18.6126, lng: 73.7936, studentsWaiting: 3, time: "08:15 AM", status: "current"   },
          { id: "pun-s4", name: "Baner",             lat: 18.5590, lng: 73.7868, studentsWaiting: 2, time: "08:30 AM", status: "upcoming"  },
          { id: "pun-s5", name: "Aundh",             lat: 18.5590, lng: 73.8076, studentsWaiting: 1, time: "08:45 AM", status: "upcoming"  },
          { id: "pun-s6", name: "Bishop's School",   lat: 18.5353, lng: 73.8812, studentsWaiting: 0, time: "09:00 AM", status: "upcoming"  },
        ],
        path: [
          { lat: 18.5916, lng: 73.7392 }, // Hinjewadi Phase 1
          { lat: 18.6015, lng: 73.7617 }, // Wakad
          { lat: 18.6126, lng: 73.7936 }, // Pimple Saudagar
          { lat: 18.5590, lng: 73.7868 }, // Baner
          { lat: 18.5590, lng: 73.8076 }, // Aundh
          { lat: 18.5353, lng: 73.8812 }, // Bishop's School
        ],
      },
    ],
    fleetOffset: { lat: 18.5590, lng: 73.7868 },
  },
};

/** Ordered list used for distance-based fallback matching */
export const CITY_LIST = Object.values(CITY_DATABASE);

/** Default city if geolocation is denied */
export const DEFAULT_CITY_ID = "hyderabad";
