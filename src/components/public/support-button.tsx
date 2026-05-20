import { MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/types";

export function SupportButton({ settings }: { settings?: SiteSettings | null }) {
  const url = settings?.messenger_url || settings?.facebook_url || "https://www.facebook.com/ElevatedLibrary";
  return (
    <a href={url} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-2xl transition hover:-translate-y-1 hover:bg-blue-700">
      <MessageCircle className="h-5 w-5" /> Help?
    </a>
  );
}
