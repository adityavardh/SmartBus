"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { DRIVER_TODAY_STUDENTS } from "@/data/mock";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCode, Search, Check, X, Users, MapPin, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Local student type with mutable attendance fields ────────────────────────

type AttendanceStatus = "pending" | "present" | "absent";

interface StudentRow {
  id: string;
  name: string;
  class: string;
  seatNumber: string | number;
  stopName: string;
  photo: string;
  boarded: boolean;
  boardedAt?: string;
  status: AttendanceStatus;
}

function seedStudents(): StudentRow[] {
  return DRIVER_TODAY_STUDENTS.map((s) => ({
    ...s,
    status: s.boarded ? "present" : "pending",
  }));
}

export default function DriverAttendancePage() {
  const searchParams = useSearchParams();

  // ── Attendance state (mutable local copy of the mock roster) ──────────────
  const [students, setStudents] = useState<StudentRow[]>(seedStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null);

  // ── Scanner state ──────────────────────────────────────────────────────────
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Auto-open scanner if navigated here with ?scanner=1
  useEffect(() => {
    if (searchParams.get("scanner") === "1") {
      setScannerOpen(true);
    }
  }, [searchParams]);

  // ── Derived counts ─────────────────────────────────────────────────────────
  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount  = students.filter((s) => s.status === "absent").length;
  const pendingCount = students.filter((s) => s.status === "pending").length;
  const totalCount   = students.length;

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.stopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const showToast = useCallback((message: string, color: string) => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const markPresent = useCallback((id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "present",
              boarded: true,
              boardedAt: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : s
      )
    );
    const student = students.find((s) => s.id === id);
    if (student) {
      showToast(
        `✅ ${student.name} marked Present`,
        "bg-success/20 border-success/30 text-success"
      );
    }
  }, [students, showToast]);

  const markAbsent = useCallback((id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "absent", boarded: false, boardedAt: undefined }
          : s
      )
    );
    const student = students.find((s) => s.id === id);
    if (student) {
      showToast(
        `❌ ${student.name} marked Absent`,
        "bg-danger/20 border-danger/30 text-danger"
      );
    }
  }, [students, showToast]);

  // ── Scanner simulate ───────────────────────────────────────────────────────

  const handleSimulateScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      const pending = students.filter((s) => s.status === "pending");
      if (pending.length > 0) {
        const scanned = pending[0];
        setScanResult(scanned.name);
        // Auto-mark as present
        setStudents((prev) =>
          prev.map((s) =>
            s.id === scanned.id
              ? {
                  ...s,
                  status: "present",
                  boarded: true,
                  boardedAt: new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                }
              : s
          )
        );
      } else {
        setScanResult("All students accounted for");
      }
      setScanning(false);
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Attendance</h1>
            <p className="text-white/50">Mark students present or absent</p>
          </div>
          <Button
            variant="accent"
            className="hidden sm:flex h-12"
            onClick={() => { setScannerOpen(true); setScanResult(null); }}
          >
            <QrCode className="w-5 h-5 mr-2" /> Scanner Mode
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total" value={totalCount} icon={<Users className="w-6 h-6 text-white/20" />} valueColor="text-white" />
          <StatCard label="Present" value={presentCount} icon={<Check className="w-6 h-6 text-success/30" />} valueColor="text-success" />
          <StatCard label="Pending" value={pendingCount} icon={<MapPin className="w-6 h-6 text-accent/30" />} valueColor="text-accent" />
          <StatCard label="Absent"  value={absentCount}  icon={<UserX className="w-6 h-6 text-danger/30" />}  valueColor="text-danger"  />
        </div>

        {/* List */}
        <Card>
          <CardContent className="p-0">
            {/* Search + scanner (mobile) */}
            <div className="p-4 border-b border-white/10 flex gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  placeholder="Search by name or stop..."
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="glass"
                className="h-12 sm:hidden px-4"
                onClick={() => { setScannerOpen(true); setScanResult(null); }}
              >
                <QrCode className="w-5 h-5 text-accent" />
              </Button>
            </div>

            <div className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <p className="p-8 text-center text-white/30 text-sm">No students match your search.</p>
              )}
              {filtered.map((student) => (
                <motion.div
                  key={student.id}
                  layout
                  className={`p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors ${
                    student.status === "absent" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      className={`w-12 h-12 ${
                        student.status === "present"
                          ? "ring-2 ring-success/50"
                          : student.status === "absent"
                          ? "ring-2 ring-danger/40"
                          : "ring-2 ring-white/10"
                      }`}
                    >
                      <AvatarImage src={student.photo} />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{student.name}</p>
                      <p className="text-xs text-white/50">
                        {student.class} • Seat {student.seatNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-white">{student.stopName}</p>
                      {student.status === "present" && student.boardedAt && (
                        <p className="text-xs text-success">Boarded at {student.boardedAt}</p>
                      )}
                      {student.status === "absent" && (
                        <p className="text-xs text-danger">Marked absent</p>
                      )}
                    </div>

                    {student.status === "present" ? (
                      /* Already present — show checkmark, allow undo */
                      <button
                        onClick={() => {
                          setStudents((prev) =>
                            prev.map((s) =>
                              s.id === student.id
                                ? { ...s, status: "pending", boarded: false, boardedAt: undefined }
                                : s
                            )
                          );
                          showToast("↩ Undo — marked as Pending", "bg-white/10 border-white/20 text-white");
                        }}
                        title="Undo — revert to pending"
                        className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success border border-success/30 shrink-0 hover:bg-success/10 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    ) : student.status === "absent" ? (
                      /* Absent — show X, allow undo */
                      <button
                        onClick={() => {
                          setStudents((prev) =>
                            prev.map((s) =>
                              s.id === student.id
                                ? { ...s, status: "pending" }
                                : s
                            )
                          );
                          showToast("↩ Undo — marked as Pending", "bg-white/10 border-white/20 text-white");
                        }}
                        title="Undo — revert to pending"
                        className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center text-danger border border-danger/30 shrink-0 hover:bg-danger/10 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    ) : (
                      /* Pending — show Present / Absent buttons */
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-10 bg-transparent border border-white/20 text-white/70 hover:bg-danger/20 hover:text-danger hover:border-danger/50 transition-colors"
                          onClick={() => markAbsent(student.id)}
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          className="h-10 bg-transparent border border-white/20 text-white/70 hover:bg-success/20 hover:text-success hover:border-success/50 transition-colors"
                          onClick={() => markPresent(student.id)}
                        >
                          Present
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanner Modal */}
      <AnimatePresence>
        {scannerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => { setScannerOpen(false); setScanResult(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-sm rounded-[32px] border border-white/10 bg-card/95 backdrop-blur-2xl shadow-float p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">QR Scanner</h2>
                  <p className="text-xs text-white/40 mt-0.5">
                    Point camera at student ID card
                  </p>
                </div>
                <button
                  onClick={() => { setScannerOpen(false); setScanResult(null); }}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewfinder */}
              <div
                className="relative w-full aspect-square rounded-2xl bg-black/60 border border-white/10 overflow-hidden mb-6 flex items-center justify-center cursor-pointer select-none"
                onClick={handleSimulateScan}
              >
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-accent rounded-tl-md" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-accent rounded-tr-md" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-accent rounded-bl-md" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-accent rounded-br-md" />

                <motion.div
                  className="absolute left-6 right-6 h-0.5 bg-accent/60"
                  animate={{ top: ["20%", "80%", "20%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="text-center p-4">
                  <QrCode className="w-12 h-12 text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/30">
                    {scanning ? "Scanning…" : "Tap to simulate scan"}
                  </p>
                </div>
              </div>

              {/* Scan result */}
              <AnimatePresence>
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-2xl bg-success/10 border border-success/20 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-success">Scanned & Marked Present</p>
                      <p className="text-xs text-white/50">{scanResult}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live counts inside scanner */}
              <div className="flex justify-around mt-5 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-xl font-bold text-success">{presentCount}</p>
                  <p className="text-[10px] text-white/40">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-accent">{pendingCount}</p>
                  <p className="text-[10px] text-white/40">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-danger">{absentCount}</p>
                  <p className="text-[10px] text-white/40">Absent</p>
                </div>
              </div>

              <p className="text-center text-xs text-white/20 mt-4">
                Camera access required on a real device
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-float text-sm font-semibold whitespace-nowrap ${toast.color}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav />
    </AppLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  valueColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  valueColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}
