import Link from "next/link";

export default function NotFound() {
  return <main className="container-page py-20"><div className="card p-10 text-center"><h1 className="text-3xl font-black">Page not found</h1><p className="mt-3 text-slate-600">এই page পাওয়া যায়নি।</p><Link href="/" className="btn-primary mt-6">Back Home</Link></div></main>;
}
