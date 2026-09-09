"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function PwaRegister() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Explicitly exclude Super Admin routes and role from PWA Service Worker
    const isSuperAdminRoute = pathname?.startsWith("/super-admin");
    const isSuperAdminUser = user?.role === "SUPER_ADMIN";

    if (isSuperAdminRoute || isSuperAdminUser) {
      // Unregister any active service worker for Super Admin to guarantee zero caching
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log("[Uprank PWA] Unregistered service worker for Super Admin");
            }
          });
        }
      });
      return;
    }

    // Register service worker for Student, Teacher, Parent, School Admin and general routes
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[Uprank PWA] Service worker active for scope:", reg.scope);

        // Check for updates
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[Uprank PWA] New version available.");
              }
            };
          }
        };
      })
      .catch((err) => {
        console.error("[Uprank PWA] Service worker registration failed:", err);
      });
  }, [pathname, user?.role]);

  return null;
}
