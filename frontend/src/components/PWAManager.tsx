"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import React from "react";

export default function PWAManager() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // --- 1. Service Worker Registration & Updates ---
    if ("serviceWorker" in navigator) {
      const showUpdateToast = (worker: ServiceWorker) => {
        toast.info("A new version is available!", {
          description: "Update to get the latest features and fixes.",
          action: {
            label: "Update",
            onClick: () => {
              worker.postMessage({ type: "SKIP_WAITING" });
            },
          },
          duration: Infinity,
          icon: React.createElement(RefreshCw, { className: "h-4 w-4 animate-spin text-indigo-500" }),
        });
      };

      // Register the service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered with scope:", registration.scope);

          // Check if there is already a service worker waiting
          if (registration.waiting) {
            showUpdateToast(registration.waiting);
          }

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener("statechange", () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available; show the update toast
                  showUpdateToast(installingWorker);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });

      // Reload page when the active service worker changes (after skipWaiting)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // --- 2. Connection Status Monitoring ---
    const handleOnline = () => {
      toast.success("Back online!", {
        description: "Your connection has been restored.",
        icon: React.createElement(Wifi, { className: "h-4 w-4 text-emerald-500" }),
        duration: 4000,
      });
    };

    const handleOffline = () => {
      toast.warning("You are offline.", {
        description: "Using cached data. Changes will sync when online.",
        icon: React.createElement(WifiOff, { className: "h-4 w-4 text-amber-500" }),
        duration: 6000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // --- 3. Before Install Prompt Handling ---
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default browser install banner
      e.preventDefault();
      // Save the event to window so we can trigger it in the UI (e.g. Navbar)
      window.deferredPrompt = e as BeforeInstallPromptEvent;
      // Dispatch custom event to notify components that app is installable
      window.dispatchEvent(new CustomEvent("app-installable"));
      console.log("[PWA] 'beforeinstallprompt' event captured.");
    };

    const handleAppInstalled = () => {
      // Clear the deferred prompt
      window.deferredPrompt = null;
      // Notify components that installation was successful
      window.dispatchEvent(new CustomEvent("app-installed"));
      toast.success("Application installed successfully!", {
        description: "You can now launch the app directly from your homescreen or desktop.",
        duration: 5000,
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null; // This component handles side effects, no visual UI element of its own
}
