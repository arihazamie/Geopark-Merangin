"use client";

import { useState, useEffect } from "react";
import { Calendar, Landmark, Menu, FileText } from "lucide-react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import WisataPage from "./components/pengelolaWisata";
import ArtikelPage from "./components/pengelolaArtikel";
import EventPage from "./components/pengelolaEvent";

export default function PengelolaDashboard() {
  const [activeTab, setActiveTab] = useState("wisata");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    if (isInitialRender) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialRender(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isInitialRender]);

  // Handle tab change with proper state management
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };

  return (
    <div
      className={`flex min-h-screen flex-col bg-background transition-colors duration-300 ${
        isDarkMode ? "dark" : ""
      }`}>
      <header className="sticky top-0 z-30 flex items-center h-16 gap-4 px-4 border-b bg-background/95 backdrop-blur sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Landmark className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">Admin Dashboard</span>
            </div>
            <nav className="grid gap-2 text-lg font-medium">
              <button
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                  activeTab === "wisata"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleTabChange("wisata")}>
                <Landmark className="w-5 h-5" />
                Wisata
              </button>
              <button
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                  activeTab === "artikel"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleTabChange("artikel")}>
                <FileText className="w-5 h-5" />
                Artikel
              </button>
              <button
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                  activeTab === "event"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleTabChange("event")}>
                <Calendar className="w-5 h-5" />
                Event
              </button>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center w-full gap-2 md:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold">
            <Landmark className="w-6 h-6 text-primary" />
            <span className="hidden md:inline">Pengelola Dashboard</span>
          </Link>
          <div className="flex items-center gap-4 ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                      className="mr-2"
                    />
                    <span className="text-sm text-muted-foreground">
                      Dark Mode
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle dark mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r shrink-0 bg-muted/40 md:block">
          <div className="flex flex-col h-full gap-4 p-4">
            <div className="flex flex-col gap-1">
              <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">
                Main Menu
              </h3>
              <nav className="grid gap-1 text-sm font-medium">
                <button
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
                    activeTab === "wisata"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => handleTabChange("wisata")}>
                  <Landmark className="w-4 h-4" />
                  Wisata
                </button>
                <button
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
                    activeTab === "artikel"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => handleTabChange("artikel")}>
                  <FileText className="w-4 h-4" />
                  Artikel
                </button>
                <button
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
                    activeTab === "event"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => handleTabChange("event")}>
                  <Calendar className="w-4 h-4" />
                  Event
                </button>
              </nav>
            </div>
            <div className="mt-auto"></div>
          </div>
        </aside>
        <main className="flex-1 p-4 overflow-auto md:p-6">
          {isLoading ? (
            <div className="grid gap-4 md:gap-8">
              <div className="flex items-center justify-between">
                <div className="w-32 h-8 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                <div className="w-32 h-10 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse"
                  />
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-64 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                <div className="h-64 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
              </div>
            </div>
          ) : (
            <AnimatePresence
              mode="wait"
              initial={false}>
              {activeTab === "wisata" ? (
                <WisataPage key="wisata" />
              ) : activeTab === "event" ? (
                <EventPage key="event" />
              ) : (
                <ArtikelPage key="artikel" />
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
