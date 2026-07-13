"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getRoleDashboard } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { UserRole } from "@/types";
import { Chrome, GraduationCap, Lock, Mail, Shield, Sparkles, Truck, Users, User } from "lucide-react";


const ROLES: { role: UserRole; label: string; icon: React.ReactNode }[] = [
  { role: "student", label: "Student", icon: <GraduationCap className="w-4 h-4" /> },
  { role: "parent", label: "Parent", icon: <Users className="w-4 h-4" /> },
  { role: "admin", label: "Admin", icon: <Shield className="w-4 h-4" /> },
  { role: "driver", label: "Driver", icon: <Truck className="w-4 h-4" /> },
];

export function LoginForm() {
  const router = useRouter();
  const { setLoading, isLoading } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastRole = localStorage.getItem("lastLoginRole") as UserRole;
      if (lastRole && ROLES.find((r) => r.role === lastRole)) {
        setSelectedRole(lastRole);
      }
    }
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("lastLoginRole", role);
    }
  };
  const [rememberMe, setRememberMe] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; name?: string; auth?: string }>({});

  const { register, handleSubmit } = useForm({
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: { name?: string; email: string; password?: string }) => {
    if (!selectedRole) return;

    // Client-side validation
    const errors: { email?: string; password?: string; name?: string; auth?: string } = {};
    if (!data.email || !data.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = "Enter a valid email address";
    if (!data.password || !data.password.trim()) errors.password = "Password is required";
    else if (isSignUp && (data.password?.length ?? 0) < 8)
      errors.password = "Password must be at least 8 characters";
    if (isSignUp && (!data.name || !data.name.trim())) errors.name = "Full name is required";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setLoading(true);

    try {
      // Call NextAuth's signIn with the credentials provider
      const result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password ?? "",
        role: selectedRole,
        name: data.name ?? "",
        redirect: false, // handle redirect ourselves
      });

      if (result?.error) {
        // Retrieve registered users from Zustand store to determine the type of error
        const state = useAuthStore.getState();
        const registeredUsers = state.registeredUsers || [];
        const demoEmails = ["student@demo.com", "parent@demo.com", "driver@demo.com", "admin@demo.com"];
        const emailExists = demoEmails.includes(data.email.trim().toLowerCase()) ||
                            registeredUsers.some((u) => u.email.trim().toLowerCase() === data.email.trim().toLowerCase());

        let errorMsg = "Incorrect email or password.";
        if (!emailExists) {
          errorMsg = "No account found with this email — please sign up first";
        } else {
          errorMsg = "Incorrect password";
        }

        setFormErrors({ auth: errorMsg });
        setLoading(false);
        return;
      }

      // Success — navigate to the role's dashboard
      const dashboardPath = getRoleDashboard(selectedRole);
      router.push(dashboardPath);
      router.refresh(); // re-run server components so session is available
    } catch {
      setFormErrors({ auth: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(46,139,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,194,71,0.16),transparent_28%)]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 space-y-8 text-center lg:order-1 lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            Secure access for students, parents, drivers and admins
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-6xl"
            >
              Never wait for a bus blindly again.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="max-w-xl text-base leading-8 text-white/60 sm:text-lg"
            >
              Student Login, Parent Login, Driver Login and Admin Login in one premium interface with live ETA, intelligent notifications, and instant route visibility.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {[
              { emoji: "📍", label: "Live GPS", desc: "Real-time tracking" },
              { emoji: "🔔", label: "Smart Alerts", desc: "Instant updates" },
              { emoji: "🛡️", label: "SOS Safety", desc: "One-tap emergency" },
            ].map((item) => (
              <div key={item.label} className="glass-panel p-4 text-left">
                <span className="text-2xl">{item.emoji}</span>
                <p className="mt-2 text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-white/40">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="order-1 mx-auto w-full max-w-lg lg:order-2"
        >
          <div className="absolute left-1/2 top-20 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-card/82 p-6 shadow-float backdrop-blur-2xl sm:p-8">


            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center opacity-15">
              <motion.div
                animate={{ x: [-90, 90, -90] }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              >
                <svg width="360" height="170" viewBox="0 0 400 200">
                  <rect x="50" y="60" width="300" height="100" rx="28" fill="#FFC247" />
                  <rect x="70" y="80" width="50" height="40" rx="10" fill="#071225" opacity="0.24" />
                  <rect x="140" y="80" width="50" height="40" rx="10" fill="#071225" opacity="0.24" />
                  <rect x="210" y="80" width="50" height="40" rx="10" fill="#071225" opacity="0.24" />
                  <rect x="280" y="80" width="50" height="40" rx="10" fill="#071225" opacity="0.24" />
                  <circle cx="120" cy="165" r="20" fill="#111827" />
                  <circle cx="280" cy="165" r="20" fill="#111827" />
                </svg>
              </motion.div>
            </div>

            <div className="relative z-10 mb-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 220 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-accent to-accent/60 shadow-glow-accent"
              >
                <span className="text-2xl">🚌</span>
              </motion.div>
              <h1 className="text-2xl font-semibold text-white">{isSignUp ? "Create an account" : "Welcome back"}</h1>
              <p className="mt-1 text-white/45">{isSignUp ? "Sign up to start tracking buses" : "Sign in to track buses in real time"}</p>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-2">
              {ROLES.map(({ role, label, icon }) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`flex flex-col items-center gap-1.5 rounded-[18px] border p-3 text-xs font-medium transition-all ${
                    selectedRole === role
                      ? "border-primary/25 bg-primary/20 text-white shadow-[0_0_0_1px_rgba(46,139,255,0.15)]"
                      : "border-white/10 bg-white/6 text-white/45 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Auth-level error (wrong password, etc.) */}
              {(formErrors as { auth?: string }).auth && (
                <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {(formErrors as { auth?: string }).auth}
                </div>
              )}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input id="name" className={`pl-10 ${formErrors.name ? 'border-danger/60' : ''}`} placeholder="John Doe" {...register("name")} />
                  </div>
                  {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input id="email" className={`pl-10 ${formErrors.email ? 'border-danger/60' : ''}`} {...register("email")} />
                </div>
                {formErrors.email && <p className="text-xs text-danger mt-1">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input id="password" type="password" className={`pl-10 ${formErrors.password ? 'border-danger/60' : ''}`} {...register("password")} />
                </div>
                {formErrors.password && <p className="text-xs text-danger mt-1">{formErrors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={rememberMe} onCheckedChange={setRememberMe} id="remember" />
                  <Label htmlFor="remember" className="cursor-pointer text-xs">Remember Me</Label>
                </div>
                <button type="button" className="text-xs text-primary hover:underline">
                  {isSignUp ? "" : "Forgot Password?"}
                </button>
              </div>

              <Button type="submit" variant="accent" className="h-12 w-full" disabled={isLoading || !selectedRole}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-background/30 border-t-background"
                  />
                ) : (
                  isSignUp ? "Create Account" : "Continue"
                )}
              </Button>
              
              <div className="text-center mt-4">
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-white/60 hover:text-white transition-colors">
                  {isSignUp ? "Already have an account? Log in" : "New here? Create an account"}
                </button>
              </div>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-white/30">or continue with</span>
              </div>
            </div>

            <div className="grid gap-3">
              <Button type="button" onClick={() => signIn("google")} variant="glass" className="h-12 w-full">
                <Chrome className="w-4 h-4" />
                Login with Google
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}