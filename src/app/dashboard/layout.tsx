import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  const links = [
    ["/dashboard", "Overview"],
    ["/dashboard/orders", "Orders"],
    ["/dashboard/pdfs", "My PDFs"],
    ["/dashboard/alerts", "Alerts"],
    ["/dashboard/settings", "Settings"],
  ];

  return (
    <main className="container-page py-10">
      <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
        <aside className="card h-fit p-4">
          <h2 className="mb-4 px-2 text-lg font-black">My Dashboard</h2>

          <nav className="space-y-1">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {label}
              </Link>
            ))}

            <Link
              href="/logout"
              className="mt-4 block rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Logout
            </Link>
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}