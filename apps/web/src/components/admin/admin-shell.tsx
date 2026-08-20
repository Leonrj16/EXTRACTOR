"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";
import { PageTransition } from "./page-transition";
import type { ProfileData } from "@/types/profile";

export function AdminShell({
  profile,
  children,
}: {
  profile: ProfileData;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen gap-4 p-3 sm:p-4">
      <div className="hidden lg:block">
        <AdminSidebar profile={profile} />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-3 left-3 z-50 lg:hidden"
            >
              <AdminSidebar profile={profile} onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-[calc(100vh-1.5rem)] flex-1 flex-col gap-4 overflow-x-hidden sm:min-h-[calc(100vh-2rem)]">
        <AdminHeader profile={profile} onMenuClick={() => setMobileOpen(true)} />
        <div className="flex-1">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </div>
  );
}
