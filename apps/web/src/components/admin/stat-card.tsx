"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { AnimatedCounter } from "./animated-counter";

const GLOW: Record<string, string> = {
  purple: "bg-brand-purple/20 text-brand-purple-light",
  blue: "bg-brand-blue/20 text-brand-blue-light",
  cyan: "bg-brand-cyan/20 text-brand-cyan",
  success: "bg-brand-success/20 text-brand-success",
};

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: ReactNode;
  color?: keyof typeof GLOW;
  delay?: number;
}

export function StatCard({ label, value, suffix, icon, color = "purple", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="glass flex flex-col gap-4 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`flex size-9 items-center justify-center rounded-xl ${GLOW[color]}`}>
          {icon}
        </div>
      </div>
      <p className="font-heading text-3xl font-semibold">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
    </motion.div>
  );
}
