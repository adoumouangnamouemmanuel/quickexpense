"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function FAB() {
  const router = useRouter();

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+70px)] md:bottom-8 right-1/2 md:right-8 translate-x-1/2 md:translate-x-0 z-50">
      <motion.button
        onClick={() => router.push("/bulk")}
        aria-label="Add transaction"
        id="fab-main"
        className="w-14 h-14 rounded-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black shadow-xl relative overflow-hidden group active:scale-95 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus
          size={32}
          strokeWidth={2.5}
          className="transition-transform duration-300 group-hover:rotate-90"
        />
      </motion.button>
    </div>
  );
}
