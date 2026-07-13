"use client";

/**
 * src/app/signup/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Signup page — collects name, email, password, and role,
 * then calls NextAuth signIn("credentials") to create a session.
 * ─────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/types";
import {
  GraduationCap,
  Users,
  Shield,
  Truck,
  Mail,
  Lock,
  User,
  MapPin,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

const ROLES: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { role: "student", label: "Student", icon: <GraduationCap className="w-5 h-5" />, desc: "Track your bus & earn rewards" },
  { role: "parent", label: "Parent", icon: <Users className="w-5 h-5" />, desc: "Monitor your child's journey" },
  { role: "driver", label: "Driver", icon: <Truck className="w-5 h-5" />, desc: "Manage your route & trips" },
  { role: "admin", label: "Admin", icon: <Shield className="w-5 h-5" />, desc: "Oversee the full fleet" },
];

type FormData = { name: string; email: string; password: string; confirm: string };

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData & { role: string; auth: string }>>({});

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  // Pre-fill role from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("lastLoginRole") as UserRole | null;
    if (saved && ROLES.find((r) => r.role === saved)) setSelectedRole(saved);
  }, []);

  const onSubmit = async (data: FormData) => {
    // Validate
    const errs: typeof errors = {};
    if (!data.name.trim()) errs.name = "Full name is required";
    if (!data.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.email)) errs.email = "Enter a valid email";
    if (!data.password) errs.password = "Password is required";
    else if (data.password.length < 8) errs.password = "Must be at least 8 characters";
    if (data.confirm !== data.password) errs.confirm = "Passwords don't match";
    if (!selectedRole) errs.role = "Please select a role";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        name: data.name.trim(),
        role: selectedRole!,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ auth: "Could not create your account. Please try again." });
        setIsLoading(false);
        return;
      }

      // Save user to Zustand client-side store for credentials lookup consistency
      signup({
        id: `user-${data.email.trim().toLowerCase()}`,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: selectedRole!,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name.trim())}&backgroundColor=2E8BFF`,
        streak: 0,
        ecoScore: 0,
        rewardPoints: 0,
        tripsCompleted: 0,
        achievements: [],
        emergencyContacts: [],
      });

      // Save role for next visit
      localStorage.setItem("lastLoginRole", selectedRole!);

      // Redirect to role dashboard
      router.push(`/dashboard/${selectedRole}`);
      router.refresh();
    } catch {
      setErrors({ auth: "Something went wrong. Please try again." });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(46,139,255,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,194,71,0.12),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-lg">
        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-accent via-accent/80 to-accent/50 flex items-center justify-center shadow-[0_0_30px_rgba(255,194,71,0.3)]">
              <MapPin className="w-7 h-7 text-background" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-white/50 mt-2">Join SmartBus — your intelligent school transport platform</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[28px] border border-white/10 bg-card/80 backdrop-blur-2xl p-7 shadow-float"
        >
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-white/60 mb-3">I am a…</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(({ role, label, icon, desc }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    localStorage.setItem("lastLoginRole", role);
                  }}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                    selectedRole === role
                      ? "border-primary/30 bg-primary/15 text-white shadow-[0_0_0_1px_rgba(46,139,255,0.2)]"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={selectedRole === role ? "text-primary" : "text-white/40"}>{icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-tight">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-danger mt-2">{errors.role}</p>}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Auth-level error */}
            {errors.auth && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {errors.auth}
              </div>
            )}

            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="signup-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="signup-name"
                  className={`pl-10 ${errors.name ? "border-danger/60" : ""}`}
                  placeholder="e.g. Adi Kumar"
                  {...register("name")}
                />
              </div>
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="signup-email"
                  type="email"
                  className={`pl-10 ${errors.email ? "border-danger/60" : ""}`}
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-danger">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="signup-password"
                  type="password"
                  className={`pl-10 ${errors.password ? "border-danger/60" : ""}`}
                  placeholder="At least 8 characters"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-xs text-danger">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="signup-confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="signup-confirm"
                  type="password"
                  className={`pl-10 ${errors.confirm ? "border-danger/60" : ""}`}
                  placeholder="Repeat your password"
                  {...register("confirm")}
                />
              </div>
              {errors.confirm && <p className="text-xs text-danger">{errors.confirm}</p>}
            </div>

            <Button
              type="submit"
              variant="accent"
              className="h-12 w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 rounded-full border-2 border-background/30 border-t-background"
                />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Account
                </>
              )}
            </Button>

            <p className="text-center text-sm text-white/50 pt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </form>
        </motion.div>

        {/* Demo hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-white/30"
        >
          Want to try a demo account?{" "}
          <Link href="/login" className="text-white/50 hover:text-white underline">
            Use student@demo.com / password123
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
