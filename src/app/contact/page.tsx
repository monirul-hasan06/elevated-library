import { getSiteSettings } from "@/lib/db";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return <main className="container-page py-12"><div className="card max-w-3xl p-8"><h1 className="text-4xl font-black">Contact / Support</h1><p className="mt-4 text-slate-600 dark:text-slate-300">Payment বা download নিয়ে problem হলে Facebook page এ knock করুন।</p><div className="mt-6 flex flex-wrap gap-3"><a href={settings?.facebook_url || "https://www.facebook.com/ElevatedLibrary"} className="btn-primary" target="_blank" rel="noreferrer">Message on Facebook</a><a href={`mailto:${settings?.owner_email || "dev.get.in.touch@gmail.com"}`} className="btn-secondary">Email Support</a></div></div></main>;
}
