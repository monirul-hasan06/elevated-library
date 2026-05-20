export default function HowItWorksPage() {
  const steps = ["PDF choose করুন", "Checkout option select করুন", "bKash/Nagad payment করুন", "TrxID ও sender phone submit করুন", "Admin verify করার পর PDF download করুন"];
  return <main className="container-page py-12"><h1 className="text-4xl font-black">How It Works</h1><p className="mt-3 text-slate-600 dark:text-slate-300">Elevated Library থেকে PDF কেনা খুব সহজ।</p><div className="mt-8 grid gap-4">{steps.map((s, i) => <div key={s} className="card p-6"><p className="text-sm font-bold text-brand-700">Step {i+1}</p><h2 className="mt-2 text-xl font-black">{s}</h2></div>)}</div></main>;
}
