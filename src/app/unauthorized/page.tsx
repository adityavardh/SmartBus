"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { getRoleDashboard } from "@/lib/auth";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { role, isAuthenticated } = useAuthStore();

  const handleReturn = () => {
    if (isAuthenticated) {
      router.push(getRoleDashboard(role));
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 rounded-[32px] border border-white/10 bg-card/50 backdrop-blur-3xl text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-danger/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6 relative">
          <ShieldAlert className="w-10 h-10 text-danger" />
          <motion.div
            className="absolute inset-0 rounded-full border border-danger/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-white/50 mb-8 text-sm">
          You don&apos;t have permission to view this page. This area is restricted to specific roles.
        </p>

        <Button
          variant="glass"
          className="w-full h-12"
          onClick={handleReturn}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isAuthenticated ? "Return to My Dashboard" : "Go to Login"}
        </Button>
      </motion.div>
    </div>
  );
}
