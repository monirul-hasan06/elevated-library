import Link from "next/link";

export default function DownloadPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  return <main className="container-page py-16"><div className="card mx-auto max-w-xl p-8 text-center"><h1 className="text-3xl font-black">Secure Download</h1><p className="mt-3 text-slate-600 dark:text-slate-300">Order verified হলে নিচের button দিয়ে PDF download করুন।</p>{token ? <a className="btn-primary mt-6" href={`/api/download?token=${encodeURIComponent(token)}`}>Download PDF</a> : <Link className="btn-secondary mt-6" href="/products">Browse PDFs</Link>}<p className="mt-5 text-xs text-slate-500">Guest link 48h valid এবং maximum 3 uses.</p></div></main>;
}
