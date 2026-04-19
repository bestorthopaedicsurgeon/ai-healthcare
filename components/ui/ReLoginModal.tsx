import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Loader2 } from "lucide-react";

export function ReLoginModal() {
  const { showReloginModal, setShowReloginModal, physician, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!showReloginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!physician?.email) return;

    setIsLoading(true);
    setError("");

    try {
      await login(physician.email, password, false);
      setShowReloginModal(false);
      setPassword("");
    } catch (err: any) {
      setError("Invalid password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-[#d4c4c9]/20"
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#28030f]/5 rounded-full flex items-center justify-center text-[#28030f]">
              <Lock size={24} />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-[#28030f]">Session Expired</h2>
            <p className="text-sm text-[#755760] mt-1">
              Please re-enter your password to continue as <br />
              <span className="font-medium text-[#28030f]">{physician?.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#d4c4c9]/50 bg-white px-4 text-sm text-[#28030f] placeholder:text-[#d4c4c9] focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444] transition-all"
              />
              {error && <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-[#28030f] text-white text-sm font-medium hover:bg-[#28030f]/90 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Verify & Continue
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
            
            <p className="text-xs text-center text-[#755760] mt-2">
              Or <a href="/login" className="underline hover:text-[#28030f]">sign in with a different account</a>
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
