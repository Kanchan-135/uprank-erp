"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm transition-all animate-in fade-in slide-in-from-top duration-300 sticky top-0 z-50">
        <Wifi className="w-3.5 h-3.5 shrink-0" />
        <span>Connection Restored — You are back online. Synchronizing with cloud...</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-600 text-white text-xs font-medium py-2 px-4 flex items-center justify-between shadow-md transition-all sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
        <span>
          <strong>Offline Mode</strong> — You are currently disconnected. Viewing local cached records.
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1.5 bg-amber-700/80 hover:bg-amber-800 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry</span>
      </button>
    </div>
  );
}
