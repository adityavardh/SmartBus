"use client";

/**
 * src/components/auth/login-form.tsx
 *
 * Fixes applied:
 *
 * 1. STALE ERROR CLEARING
 *    - handleRoleSelect()  → always clears formErrors
 *    - toggleIsSignUp()    → always clears formErrors
 *    - Every <Input>       → clears the matching field error + the auth
 *                            banner on first keystroke via clearFieldError()
 *
 * 2. ROLE-SCOPED GOOGLE OAUTH
 *    - handleGoogleSignIn() reads selectedRole (defaulting to "student"),
 *      stores it in localStorage as "oauthRole", then calls
 *      signIn("google", { callbackUrl }) so the server callback can
 *      read it back via the /api/auth/callback/google?oauthRole= path.
 *    - The server (auth.ts) reads account.oauthRole in the signIn
 *      callback, upserts the user, and never throws a "not found" error
 *      for OAuth — so no "no account found" banner ever appears here.
 *
 * 3. SEPARATE ERROR SCOPES
 *    - Credentials errors  → set inside onSubmit, cleared on role/tab switch
 *    - Google errors       → set only inside handleGoogleSignIn, cleared
 *                            on role/tab switch
 *    - Field errors        → cleared individually on input change
 */

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
import {
  Chrome,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Truck,
  Users,
  User,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: { role: UserRole; label: string; icon: React.ReactNode }[] = [
  { role: "student", label: "Student", icon: <GraduationCap className="w-4 h-4" /> },
  { role: "parent",  label: "Parent",  icon: <Users         className="w-4 h-4" /> },
  { role: "admin",   label: "Admin",   icon: <Shield        className="w-4 h-4" /> },
  { role: "driver",  label: "Driver",  icon: <Truck         className="w-4 h-4" /> },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type FormFields = { name?: string; email: string; password?: string };

type FormErrors = {
  name?:   string;
  email?:  string;
  password?: string;
  /** credentials-flow auth banner */
  auth?:   string;
  /** google-flow error banner (kept separate so they never bleed into each other) */
  google?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const { setLoading, isLoading } = useAuthStore();

  // ── Role ──────────────────────────────────────────────────────────────────
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("lastLoginRole") as UserRole | null;
    if (saved && ROLES.find((r) => r.role === saved)) setSelectedRole(saved);
  }, []);

  // ── Form state ────────────────────────────────────────────────────────────
  const [isSignUp,    setIsSignUp]    = useState(false);
  const [rememberMe,  setRememberMe]  = useState(true);
  const [formErrors,  setFormErrors]  = useState<FormErrors>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState } = useForm<FormFields>({
    defaultValues: { name: "", email: "", password: "" },
  });
  void formState; // prevent "unused" lint warning

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Clear a single field error (and always wipe the auth banner too,
   * since a new keystroke means the user is correcting their input).
   */
  function clearFieldError(field: keyof FormErrors) {
    setFormErrors((prev) => {
      // Nothing to clear — bail early to avoid a re-render
      if (!prev[field] && !prev.auth) return prev;
      const next = { ...prev };
      delete next[field];
      delete next.auth;
      return next;
    });
  }

  /**
   * Switch role tab.  Always wipes ALL errors — the user is starting fresh.
   */
  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role);
    setFormErrors({});
    if (typeof window !== "undefined") {
      localStorage.setItem("lastLoginRole", role);
    }
  }

  /**
   * Toggle between Login ↔ Signup.  Always wipes ALL errors.
   */
  function toggleIsSignUp() {
    setIsSignUp((prev) => !prev);
    setFormErrors({});
  }

  // ── Credentials submit ────────────────────────────────────────────────────

  const onSubmit = async (data: FormFields) => {
    if (!selectedRole) return;

    // Client-side validation
    const errs: FormErrors = {};
    if (!data.email?.trim())                                 errs.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.email))              errs.email    = "Enter a valid email address";
    if (!data.password?.trim())                              errs.password = "Password is required";
    else if (isSignUp && (data.password?.length ?? 0) < 8)  errs.password = "Password must be at least 8 characters";
    if (isSignUp && !data.name?.trim())                      errs.name     = "Full name is required";

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email:    data.email.trim().toLowerCase(),
        password: data.password ?? "",
        role:     selectedRole,
        name:     data.name ?? "",
        redirect: false,
      });

      if (result?.error) {
        // result.error is now the CredentialsSignin subclass `.code` value,
        // e.g. "wrong_password", "no_account", "wrong_role", "account_exists".
        // Map each short code to a human-readable sentence.
        const CODE_MESSAGES: Record<string, string> = {
          wrong_password: "Incorrect password — please try again.",
          no_account:     "No account found with this email — please sign up first.",
          wrong_role:     `No ${selectedRole} account for this email. Try a different role or sign up.`,
          account_exists: "An account with this email already exists for this role. Please log in.",
          invalid_input:  "Please fill in all required fields correctly.",
        };
        const msg =
          CODE_MESSAGES[result.error] ??
          CODE_MESSAGES[result.error.toLowerCase()] ??
          "Something went wrong — please try again.";

        setFormErrors({ auth: msg });
        setLoading(false);
        return;
      }

      // result.ok === true — login/signup succeeded
      router.push(getRoleDashboard(selectedRole));
      router.refresh();
    } catch {
      setFormErrors({ auth: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    // Always clear ALL errors before starting OAuth — this is the key fix
    // that prevents a stale credentials error showing during/after Google flow.
    setFormErrors({});

    const role: UserRole = selectedRole ?? "student";

    if (typeof window !== "undefined") {
      // Persist so the callback URL can carry it through the redirect round-trip
      localStorage.setItem("lastLoginRole", role);
      localStorage.setItem("oauthRole",     role);
    }

    setGoogleLoading(true);
    try {
      // Append oauthRole as a query param on the callbackUrl.
      // auth.ts reads it in the signIn callback via account.oauthRole.
      const callbackUrl = `${window.location.origin}/dashboard/${role}?oauthRole=${role}`;
      await signIn("google", { callbackUrl });
      // signIn("google") triggers a full-page redirect, so nothing runs after this.
    } catch {
      setFormErrors({ google: "Google sign-in failed. Please try again." });
      setGoogleLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(46,139,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,194,71,0.16),transparent_28%)]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">

        {/* ── Left column: marketing copy ─────────────────────────────────── */}
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
              Student Login, Parent Login, Driver Login and Admin Login in one
              premium interface with live ETA, intelligent notifications, and
              instant route visibility.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {[
              { emoji: "📍", label: "Live GPS",     desc: "Real-time tracking"    },
              { emoji: "🔔", label: "Smart Alerts", desc: "Instant updates"       },
              { emoji: "🛡️", label: "SOS Safety",   desc: "One-tap emergency"     },
            ].map((item) => (
              <div key={item.label} className="glass-panel p-4 text-left">
                <span className="text-2xl">{item.emoji}</span>
                <p className="mt-2 text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-white/40">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right column: auth card ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="order-1 mx-auto w-full max-w-lg lg:order-2"
        >
          <div className="absolute left-1/2 top-20 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-card/82 p-6 shadow-float backdrop-blur-2xl sm:p-8">

            {/* Decorative bus silhouette */}
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

            {/* Header */}
            <div className="relative z-10 mb-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 220 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-accent to-accent/60 shadow-glow-accent"
              >
                <span className="text-2xl">🚌</span>
              </motion.div>
              <h1 className="text-2xl font-semibold text-white">
                {isSignUp ? "Create an account" : "Welcome back"}
              </h1>
              <p className="mt-1 text-white/45">
                {isSignUp
                  ? "Sign up to start tracking buses"
                  : "Sign in to track buses in real time"}
              </p>
            </div>

            {/* Role tabs */}
            <div className="mb-6 grid grid-cols-4 gap-2">
              {ROLES.map(({ role, label, icon }) => (
                <button
                  key={role}
                  type="button"
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

            {/* Credentials form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Credentials auth error banner — ONLY for email/password flow */}
              {formErrors.auth && (
                <motion.div
                  key="auth-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
                >
                  {formErrors.auth}
                </motion.div>
              )}

              {/* Name field (sign-up only) */}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      id="name"
                      className={`pl-10 ${formErrors.name ? "border-danger/60" : ""}`}
                      placeholder="John Doe"
                      {...register("name", {
                        onChange: () => clearFieldError("name"),
                      })}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-danger mt-1">{formErrors.name}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="email"
                    className={`pl-10 ${formErrors.email ? "border-danger/60" : ""}`}
                    {...register("email", {
                      onChange: () => clearFieldError("email"),
                    })}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-danger mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="password"
                    type="password"
                    className={`pl-10 ${formErrors.password ? "border-danger/60" : ""}`}
                    {...register("password", {
                      onChange: () => clearFieldError("password"),
                    })}
                  />
                </div>
                {formErrors.password && (
                  <p className="text-xs text-danger mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* Remember me / Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    id="remember"
                  />
                  <Label htmlFor="remember" className="cursor-pointer text-xs">
                    Remember Me
                  </Label>
                </div>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="accent"
                className="h-12 w-full"
                disabled={isLoading || !selectedRole}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-background/30 border-t-background"
                  />
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Continue"
                )}
              </Button>

              {/* Toggle Login ↔ Signup */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={toggleIsSignUp}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {isSignUp
                    ? "Already have an account? Log in"
                    : "New here? Create an account"}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-white/30">or continue with</span>
              </div>
            </div>

            {/* Google OAuth — separate error banner, separate loading state */}
            {formErrors.google && (
              <motion.div
                key="google-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
              >
                {formErrors.google}
              </motion.div>
            )}

            <div className="grid gap-3">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                variant="glass"
                className="h-12 w-full"
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/70"
                  />
                ) : (
                  <>
                    <Chrome className="w-4 h-4" />
                    {selectedRole
                      ? `Continue with Google as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                      : "Continue with Google"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
