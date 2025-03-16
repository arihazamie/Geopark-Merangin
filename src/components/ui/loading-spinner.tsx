"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({
  size = "md",
  text = "Loading...",
  className,
  fullPage = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const spinnerContent = (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullPage ? "h-[70vh]" : "",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <motion.div
        variants={itemVariants}
        className="relative">
        <Loader2
          className={cn("animate-spin text-primary", sizeClasses[size])}
        />
        <div className="absolute inset-0 rounded-full animate-pulse-opacity bg-primary/10" />
      </motion.div>
      {text && (
        <motion.p
          variants={itemVariants}
          className="text-sm font-medium text-muted-foreground">
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  return spinnerContent;
}

export function LoadingCards() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="w-full space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-full h-24 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
          variants={itemVariants}
          animate={{
            backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </motion.div>
  );
}

export function LoadingTable() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="w-full p-4 space-y-4 border rounded-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <motion.div
        className="flex items-center justify-between"
        variants={rowVariants}>
        <div className="w-1/3 h-8 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
        <div className="w-32 h-8 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
      </motion.div>

      <motion.div
        className="w-full h-12 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
        variants={rowVariants}
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="flex items-center w-full h-16 gap-4 rounded-md"
          variants={rowVariants}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
          <div className="w-1/4 h-8 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
          <div className="w-1/5 h-8 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
          <div className="w-1/5 h-8 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
          <div className="w-20 h-8 ml-auto rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
        </motion.div>
      ))}
    </motion.div>
  );
}
