
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { money } from "@/lib/utils";
import { authFetch } from "@/lib/auth-fetch";

export function OrdersManager({ orders }: { orders: any[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState("");

  const list = orders.filter((order) =>
    `${order.trx_id} ${order.guest_email || ""} ${order.guest_name || ""} ${order.sender_phone || ""} ${order.products?.title_bn || ""}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  async function update(id: string, status: string) {
    setLoading(id + status);

    try {
      const res = await authFetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert((await res.json()).error || "Failed");
        return;
      }

      router.refresh();
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="mt-6">
      <input
        className="input mb-4"
        placeholder="Search by TrxID/email/name/phone"
        value={q}
        onChange={(event) => setQ(event.target.value)}
      />

      <div className="grid gap-3 md:hidden">
        {list.map((order) => (
          <div key={order.id} className="card p-4 text-sm">
            <p className="font-bold">{order.products?.title_bn || "Untitled PDF"}</p>
            <p className="mt-2 text-slate-500">Customer</p>
            <p className="break-words">{order.guest_name || order.guest_email || order.user_id}</p>
            <p className="text-xs text-slate-500">{order.sender_phone}</p>
            <p className="mt-2"><b>Payment:</b> {order.payment_method} / {order.trx_id}</p>
            <p><b>Amount:</b> {money(order.amount)}</p>
            <p><b>Status:</b> {order.status}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={Boolean(loading)} onClick={() => update(order.id, "verified")} className="rounded-xl bg-green-600 px-3 py-2 text-white">Verify</button>
              <button disabled={Boolean(loading)} onClick={() => update(order.id, "rejected")} className="rounded-xl bg-red-600 px-3 py-2 text-white">Reject</button>
              <button disabled={Boolean(loading)} onClick={() => update(order.id, "archived")} className="rounded-xl bg-slate-700 px-3 py-2 text-white">Archive</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card hidden overflow-auto md:block">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((order) => (
              <tr key={order.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3 font-semibold">{order.products?.title_bn}</td>
                <td className="p-3">
                  {order.guest_name ? <>{order.guest_name}<br /></> : null}
                  {order.guest_email || order.user_id}
                  <br />
                  <span className="text-xs text-slate-500">{order.sender_phone}</span>
                </td>
                <td className="p-3">{order.payment_method}<br /><b>{order.trx_id}</b></td>
                <td className="p-3">{money(order.amount)}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button disabled={Boolean(loading)} onClick={() => update(order.id, "verified")} className="rounded-xl bg-green-600 px-3 py-2 text-white">Verify</button>
                    <button disabled={Boolean(loading)} onClick={() => update(order.id, "rejected")} className="rounded-xl bg-red-600 px-3 py-2 text-white">Reject</button>
                    <button disabled={Boolean(loading)} onClick={() => update(order.id, "archived")} className="rounded-xl bg-slate-700 px-3 py-2 text-white">Archive</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
