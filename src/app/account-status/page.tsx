import Link from "next/link";
import { getSiteSettings } from "@/lib/db";

export default async function AccountStatusPage({ searchParams }: { searchParams: { status?: string } }) {
  const settings = await getSiteSettings();
  const status = searchParams.status || "restricted";
  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card max-w-xl p-8 text-center">
        <h1 className="text-3xl font-black">Account {status}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          আপনার account বর্তমানে {status}. Payment বা download help লাগলে Elevated Library Facebook page এ knock করুন।
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={settings?.messenger_url || settings?.facebook_url || "https://www.facebook.com/ElevatedLibrary"} className="btn-primary" target="_blank" rel="noreferrer">Message Support</a>
          <Link href="/" className="btn-secondary">Back Home</Link>
        </div>
      </div>
    </main>
  );
}
