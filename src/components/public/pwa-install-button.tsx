"use client";

import { Download, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function PwaInstallButton({ enabled = true }: { enabled?: boolean }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsInstalled(standalone);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [enabled]);

  if (!enabled || isInstalled) return null;

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    setShowHelp(true);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={installApp}
        className="inline-flex min-h-10 items-center rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-100 dark:hover:bg-brand-900 sm:text-sm"
      >
        <Download className="mr-1.5 h-4 w-4" />
        Install
      </button>

      {showHelp ? (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center font-black">
                <Info className="mr-2 h-4 w-4" />
                Install manually
              </p>

              <p className="mt-2 text-slate-600 dark:text-slate-300">
                If install popup does not appear, open browser menu and tap
                “Add to Home Screen” or “Install App”.
              </p>

              <p className="mt-2 text-xs text-slate-500">
                On iPhone/iPad: Safari → Share → Add to Home Screen.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}