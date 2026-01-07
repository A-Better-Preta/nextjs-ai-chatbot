'use client';

import { useUser } from '@clerk/nextjs';
import { motion } from "framer-motion";
import { FinancialOverview } from "./financial-overview";

export const Greeting = () => {
  const { user, isLoaded } = useUser();

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto">
      <div
        className="mt-4 flex flex-col justify-center px-4 md:mt-16 md:px-8"
        key="overview"
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-xl md:text-2xl"
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5 }}
        >
          Hello there{isLoaded && user?.firstName ? `, ${user.firstName}` : ''}!
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-zinc-500 md:text-2xl"
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.6 }}
        >
          How can I help you today?
        </motion.div>
      </div>

      <FinancialOverview />
    </div>
  );
};