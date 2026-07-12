"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { DRIVER_TODAY_STUDENTS } from "@/data/mock";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCode, Search, Check, X, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DriverAttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const students = DRIVER_TODAY_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.stopName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const boardedCount = students.filter(s => s.boarded).length;
  const totalCount = students.length;

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Manifest</h1>
            <p className="text-white/50">Attendance & Boarding Status</p>
          </div>
          <Button variant="accent" className="hidden sm:flex h-12">
            <QrCode className="w-5 h-5 mr-2" /> Scanner Mode
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 mb-1">Total Assigned</p>
                <p className="text-2xl font-bold text-white">{totalCount}</p>
              </div>
              <Users className="w-6 h-6 text-white/20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 mb-1">Boarded</p>
                <p className="text-2xl font-bold text-success">{boardedCount}</p>
              </div>
              <Check className="w-6 h-6 text-success/20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 mb-1">Pending</p>
                <p className="text-2xl font-bold text-accent">{totalCount - boardedCount}</p>
              </div>
              <MapPin className="w-6 h-6 text-accent/20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 mb-1">Absent</p>
                <p className="text-2xl font-bold text-white/30">0</p>
              </div>
              <X className="w-6 h-6 text-white/10" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/10 flex gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input 
                  placeholder="Search students by name or stop..." 
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="glass" className="h-12 sm:hidden px-4">
                <QrCode className="w-5 h-5 text-accent" />
              </Button>
            </div>
            
            <div className="divide-y divide-white/5">
              {students.map(student => (
                <div key={student.id} className={`p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors ${student.boarded ? 'opacity-80' : ''}`}>
                  <div className="flex items-center gap-4">
                    <Avatar className={`w-12 h-12 ${student.boarded ? 'ring-2 ring-success/50' : 'ring-2 ring-white/10'}`}>
                      <AvatarImage src={student.photo} />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{student.name}</p>
                      <p className="text-xs text-white/50">{student.class} • Seat {student.seatNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-white">{student.stopName}</p>
                      {student.boarded && <p className="text-xs text-success">Boarded at {student.boardedAt}</p>}
                    </div>
                    
                    {student.boarded ? (
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success border border-success/30 shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                    ) : (
                      <Button variant="outline" className="h-10 border-white/20 hover:bg-accent/20 hover:text-accent hover:border-accent/50">
                        Mark Present
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileNav />
    </AppLayout>
  );
}
