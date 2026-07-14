/**
 * Driver pool — each city has a set of drivers.
 * One is randomly selected per session.
 *
 * FUTURE BACKEND: Replace with GET /api/drivers?cityId=…
 */

import type { DriverProfile } from "@/types/location";

export const DRIVER_DATABASE: Record<string, DriverProfile[]> = {
  hyderabad: [
    { id: "drv-hyd-1", name: "Ravi Kumar Reddy", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=RaviKumar&backgroundColor=FFC247", rating: 4.9, phone: "+91 98490 11234", experience: "11 years", licenseNo: "AP09 20130012345", cityId: "hyderabad" },
    { id: "drv-hyd-2", name: "Mohammed Saleem",  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=MohdSaleem&backgroundColor=2E8BFF", rating: 4.7, phone: "+91 90003 22456", experience: "7 years",  licenseNo: "TS09 20160023456", cityId: "hyderabad" },
    { id: "drv-hyd-3", name: "Suresh Naidu",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SureshNaidu&backgroundColor=22C55E", rating: 4.8, phone: "+91 93910 33678", experience: "9 years",  licenseNo: "TS09 20140034567", cityId: "hyderabad" },
    { id: "drv-hyd-4", name: "Nagendra Rao",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=NagendraRao&backgroundColor=EF4444",  rating: 4.6, phone: "+91 99495 44890", experience: "6 years",  licenseNo: "TS09 20170045678", cityId: "hyderabad" },
  ],
  bengaluru: [
    { id: "drv-blr-1", name: "Sunil Gowda",      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SunilGowda&backgroundColor=FFC247",  rating: 4.8, phone: "+91 98440 55012", experience: "10 years", licenseNo: "KA05 20120056789", cityId: "bengaluru" },
    { id: "drv-blr-2", name: "Ramesh Naik",       photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=RameshNaik&backgroundColor=2E8BFF",  rating: 4.6, phone: "+91 80934 66234", experience: "8 years",  licenseNo: "KA05 20150067890", cityId: "bengaluru" },
    { id: "drv-blr-3", name: "Puttaswamy H.",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Puttaswamy&backgroundColor=22C55E", rating: 4.9, phone: "+91 99001 77456", experience: "13 years", licenseNo: "KA05 20100078901", cityId: "bengaluru" },
    { id: "drv-blr-4", name: "Dinesh Kumar",      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=DineshKumar&backgroundColor=EF4444", rating: 4.7, phone: "+91 96200 88678", experience: "5 years",  licenseNo: "KA05 20180089012", cityId: "bengaluru" },
  ],
  chennai: [
    { id: "drv-chn-1", name: "Murugan Pillai",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=MuruganPillai&backgroundColor=FFC247", rating: 4.9, phone: "+91 94440 99012", experience: "12 years", licenseNo: "TN09 20110090123", cityId: "chennai" },
    { id: "drv-chn-2", name: "Krishnamurthy S.", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Krishnamurthy&backgroundColor=2E8BFF", rating: 4.7, phone: "+91 87540 10234", experience: "8 years",  licenseNo: "TN09 20150101234", cityId: "chennai" },
    { id: "drv-chn-3", name: "Senthil Kumar",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SenthilKumar&backgroundColor=22C55E", rating: 4.8, phone: "+91 98410 11456", experience: "9 years",  licenseNo: "TN09 20140112345", cityId: "chennai" },
    { id: "drv-chn-4", name: "Balamurugan D.",   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Balamurugan&backgroundColor=EF4444",  rating: 4.5, phone: "+91 90037 22678", experience: "6 years",  licenseNo: "TN09 20170123456", cityId: "chennai" },
  ],
  mumbai: [
    { id: "drv-mum-1", name: "Santosh Patil",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SantoshPatil&backgroundColor=FFC247", rating: 4.8, phone: "+91 98200 33890", experience: "10 years", licenseNo: "MH02 20130134567", cityId: "mumbai" },
    { id: "drv-mum-2", name: "Vijay Kharade",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=VijayKharade&backgroundColor=2E8BFF",  rating: 4.6, phone: "+91 99676 44012", experience: "7 years",  licenseNo: "MH02 20160145678", cityId: "mumbai" },
    { id: "drv-mum-3", name: "Manoj Sawant",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=ManojSawant&backgroundColor=22C55E",  rating: 4.7, phone: "+91 87690 55234", experience: "9 years",  licenseNo: "MH02 20140156789", cityId: "mumbai" },
    { id: "drv-mum-4", name: "Suresh Waghe",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SureshWaghe&backgroundColor=EF4444",   rating: 4.5, phone: "+91 70456 66456", experience: "5 years",  licenseNo: "MH02 20190167890", cityId: "mumbai" },
  ],
  delhi: [
    { id: "drv-del-1", name: "Rahul Sharma",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=RahulSharma&backgroundColor=FFC247",  rating: 4.8, phone: "+91 98765 12345", experience: "8 years",  licenseNo: "DL01 20150178901", cityId: "delhi" },
    { id: "drv-del-2", name: "Amit Patel",        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AmitPatel&backgroundColor=2E8BFF",     rating: 4.7, phone: "+91 93106 23456", experience: "6 years",  licenseNo: "DL01 20170189012", cityId: "delhi" },
    { id: "drv-del-3", name: "Suresh Kumar",      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=SureshKumar&backgroundColor=22C55E",   rating: 4.5, phone: "+91 97114 34567", experience: "10 years", licenseNo: "DL01 20120190123", cityId: "delhi" },
    { id: "drv-del-4", name: "Deepak Mehta",      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=DeepalMehta&backgroundColor=EF4444",  rating: 4.9, phone: "+91 99990 45678", experience: "14 years", licenseNo: "DL01 20100201234", cityId: "delhi" },
  ],
  pune: [
    { id: "drv-pun-1", name: "Anil Shinde",       photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnilShinde&backgroundColor=FFC247",   rating: 4.8, phone: "+91 98600 56789", experience: "9 years",  licenseNo: "MH12 20140212345", cityId: "pune" },
    { id: "drv-pun-2", name: "Ganesh Bhosale",    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=GaneshBhosale&backgroundColor=2E8BFF", rating: 4.6, phone: "+91 91300 67890", experience: "7 years",  licenseNo: "MH12 20160223456", cityId: "pune" },
    { id: "drv-pun-3", name: "Prashant More",     photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=PrashantMore&backgroundColor=22C55E", rating: 4.7, phone: "+91 75880 78901", experience: "8 years",  licenseNo: "MH12 20150234567", cityId: "pune" },
  ],
};

/** Fallback driver list (used when city has no drivers) */
export const FALLBACK_DRIVERS = DRIVER_DATABASE.hyderabad;
