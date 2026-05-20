import Link from "next/link";
import { requireStaff } from "@/lib/auth";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/profile", "My Profile"],
  ["/admin/orders", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/coming-soon", "Coming Soon"],
  ["/admin/payment-methods", "Payment Methods"],
  ["/admin/users", "Users"],
  ["/admin/staff", "Staff & Roles"],
  ["/admin/work-tracking", "Work Tracking"],
  ["/admin/payroll", "Payroll"],
  ["/admin/ranking", "Ranking"],
  ["/admin/settings", "Website Settings"],
  ["/admin/faq", "FAQ"],
  ["/admin/notices", "Notices"],
  ["/admin/reports", "Reports"],
  ["/admin/download-logs", "Download Logs"],
  ["/admin/audit-logs", "Audit Logs"],
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();

  return (
    <main className="container-page py-8">
      <div className="mb-6 rounded-3xl bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
        <h1 className="text-2xl font-black">Elevated Library Admin</h1>
        <p className="text-sm opacity-70">Role: {profile.role}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="card h-fit max-h-[80vh] overflow-auto p-4">
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