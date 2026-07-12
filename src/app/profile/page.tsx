"use client";

import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store";
import { LEADERBOARD, CURRENT_BUS } from "@/data/mock";
import Link from "next/link";
import { Trophy, Flame, Leaf, MapPin, Phone, Award } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-white/50">Your travel journey</p>
        </motion.div>

        {/* Profile header */}
        <Card glow>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Avatar className="w-24 h-24 ring-4 ring-accent/30">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-white/50 capitalize">{user.role} • {user.email}</p>
                <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
                  <Badge icon={<Flame className="w-3 h-3" />} label={`${user.streak} day streak`} color="text-accent" />
                  <Badge icon={<Leaf className="w-3 h-3" />} label={`Eco ${user.ecoScore}`} color="text-success" />
                  <Badge icon={<Trophy className="w-3 h-3" />} label={`${user.rewardPoints} pts`} color="text-primary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Trips" value={String(user.tripsCompleted)} />
          <StatBox label="Eco Score" value={String(user.ecoScore)} />
          <StatBox label="Points" value={String(user.rewardPoints)} />
        </div>

        {/* Achievements */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-2xl border ${
                    achievement.unlocked
                      ? "bg-accent/5 border-accent/20"
                      : "bg-white/5 border-glass-border opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{achievement.title}</p>
                      <p className="text-xs text-white/40">{achievement.description}</p>
                      {!achievement.unlocked && achievement.progress && (
                        <Progress value={achievement.progress} className="mt-2 h-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Leaderboard</h3>
            <div className="space-y-3">
              {LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    entry.name === user.name ? "bg-primary/10 border border-primary/20" : "bg-white/5"
                  }`}
                >
                  <span className={`w-8 text-center font-bold ${entry.rank <= 3 ? "text-accent" : "text-white/40"}`}>
                    #{entry.rank}
                  </span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback>{entry.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm font-medium text-white">{entry.name}</span>
                  <span className="text-sm text-white/50">{entry.points} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency contacts */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Emergency Contacts</h3>
            <div className="space-y-3">
              {user.emergencyContacts.map((contact) => (
                <div key={contact.phone} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Phone className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{contact.name}</p>
                    <p className="text-xs text-white/40">{contact.relation}</p>
                  </div>
                  <span className="text-xs text-white/50">{contact.phone}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bus details link */}
        <Link href={user.role === 'admin' ? '/fleet/admin' : user.role === 'driver' ? '/dashboard/driver' : '/map/student'}>
          <Card float className="cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-3xl">
                  🚌
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{CURRENT_BUS.number}</p>
                  <p className="text-sm text-white/40">{CURRENT_BUS.registration}</p>
                </div>
                <MapPin className="w-5 h-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      <MobileNav />
    </AppLayout>
  );
}

function Badge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/40">{label}</p>
      </CardContent>
    </Card>
  );
}
