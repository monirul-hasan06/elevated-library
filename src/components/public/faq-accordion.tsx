"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { T } from "@/components/shared/language-theme-provider";

export function FAQAccordion({ faqs }: { faqs: any[] }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id || null);
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <div key={faq.id} className="card overflow-hidden">
          <button className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold" onClick={() => setOpen(open === faq.id ? null : faq.id)} type="button">
            <T bn={faq.question_bn} en={faq.question_en} />
            <ChevronDown className={`h-5 w-5 transition ${open === faq.id ? "rotate-180" : ""}`} />
          </button>
          {open === faq.id ? <div className="border-t border-slate-200 p-5 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300"><T bn={faq.answer_bn} en={faq.answer_en} /></div> : null}
        </div>
      ))}
    </div>
  );
}
