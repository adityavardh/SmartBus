"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Users, CheckCircle2, Clock, MapPin } from "lucide-react";
import { DRIVER_TODAY_STUDENTS } from "@/data/mock";

export default function DriverStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const students = DRIVER_TODAY_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.stopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const boardedCount = DRIVER_TODAY_STUDENTS.filter((s) => s.boarded).length;
  const pendingCount = DRIVER_TODAY_STUDENTS.length - boardedCount;

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Manifest</h1>
            <p className="text-white/50">Today&apos;s assigned students — read-only view</p>
          </div>
        </motion.div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5">
                <Users className="w-5 h-5 text-white/50" />
              </div>
              <div>
                <p className="text-xs text-white/50 mb-0.5">Total</p>
                <p className="text-2xl font-bold text-white">{DRIVER_TODAY_STUDENTS.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-white/50 mb-0.5">Boarded</p>
                <p className="text-2xl font-bold text-success">{boardedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-white/50 mb-0.5">Pending</p>
                <p className="text-2xl font-bold text-accent">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search + list */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  placeholder="Search by name or stop..."
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {students.map((student, i) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <Avatar
                    className={`w-11 h-11 shrink-0 ${
                      student.boarded
                        ? "ring-2 ring-success/40"
                        : "ring-2 ring-white/10"
                    }`}
                  >
                    <AvatarImage src={student.photo} />
                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{student.name}</p>
                    <p className="text-xs text-white/50">
                      {student.class} &bull; Seat {student.seatNumber}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-white/50 text-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{student.stopName}</span>
                  </div>

                  <div className="shrink-0 ml-4">
                    {student.boarded ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs font-semibold text-success px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
                          Boarded
                        </span>
                        {student.boardedAt && (
                          <span className="text-[10px] text-white/30">{student.boardedAt}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-accent/80 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                        Pending
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {students.length === 0 && (
                <div className="p-8 text-center text-white/30">
                  No students match your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileNav />
    </AppLayout>
  );
}
