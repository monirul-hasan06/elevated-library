"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { T } from "@/components/shared/language-theme-provider";

export function NoticeBar({ notice }: { notice?: any }) {
  const [closed, setClosed] = useState(false);
  if (!notice || closed) return null;
  return (
    <div className="bg-brand-600 px-4 py-2 text-sm text-white">
      <div className="container-page flex items-center justify-between gap-3">
        <p><strong><T bn={notice.title_bn} en={notice.title_en} />:</strong> <T bn={notice.message_bn} en={notice.message_en} /></p>
        {notice.closable ? <button onClick={() => setClosed(true)} type="button"><X className="h-4 w-4" /></button> : null}
      </div>
    </div>
  );
}
