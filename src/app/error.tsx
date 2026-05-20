"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="container-page py-20"><div className="card p-10 text-center"><h1 className="text-3xl font-black">Something went wrong</h1><p className="mt-3 text-slate-600">Please try again.</p><button onClick={reset} className="btn-primary mt-6">Try again</button></div></main>;
}
