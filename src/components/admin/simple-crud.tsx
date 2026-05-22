
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";

type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "checkbox" | "date";
  options?: string[];
};

function emptyValue(field: Field) {
  if (field.type === "checkbox") return false;
  if (field.type === "select") return field.options?.[0] ?? "";
  return "";
}

export function SimpleCrud({
  title,
  resource,
  rows,
  fields,
}: {
  title: string;
  resource: string;
  rows: any[];
  fields: Field[];
}) {
  const router = useRouter();
  const empty = Object.fromEntries(fields.map((field) => [field.key, emptyValue(field)]));

  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(key: string, value: any) {
    setForm((current: any) => ({ ...current, [key]: value }));
  }

  function normalizePayload() {
    const payload: any = {};

    fields.forEach((field) => {
      const value = form[field.key];

      if (field.type === "number") {
        payload[field.key] =
          value === "" || value === null || value === undefined
            ? field.key === "sort_order"
              ? 0
              : null
            : Number(value);
      } else if (field.type === "checkbox") {
        payload[field.key] = Boolean(value);
      } else if (field.type === "date") {
        payload[field.key] = value || null;
      } else {
        payload[field.key] = value;
      }
    });

    return payload;
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const url = editId
        ? `/api/admin/simple/${resource}/${editId}`
        : `/api/admin/simple/${resource}`;

      const res = await authFetch(url, {
        method: editId ? "PATCH" : "POST",
        body: JSON.stringify(normalizePayload()),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || "Failed");
        return;
      }

      setForm(empty);
      setEditId(null);
      setMessage(editId ? "Updated successfully" : "Added successfully");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete/Archive this item?")) return;

    const res = await authFetch(`/api/admin/simple/${resource}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert((await res.json()).error || "Failed");
      return;
    }

    router.refresh();
  }

  function startEdit(row: any) {
    setEditId(row.id);
    setForm(
      Object.fromEntries(
        fields.map((field) => [
          field.key,
          row[field.key] ?? emptyValue(field),
        ])
      )
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <h1 className="text-3xl font-black">{title}</h1>

      <form onSubmit={save} className="card mt-6 grid gap-4 p-5 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            <label className="text-sm font-semibold">{field.label}</label>

            {field.type === "textarea" ? (
              <textarea
                className="input mt-1 min-h-24"
                value={form[field.key] || ""}
                onChange={(event) => setField(field.key, event.target.value)}
              />
            ) : field.type === "select" ? (
              <select
                className="input mt-1"
                value={form[field.key] || field.options?.[0] || ""}
                onChange={(event) => setField(field.key, event.target.value)}
              >
                {(field.options || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                className="mt-3 h-5 w-5"
                type="checkbox"
                checked={Boolean(form[field.key])}
                onChange={(event) => setField(field.key, event.target.checked)}
              />
            ) : (
              <input
                className="input mt-1"
                type={field.type || "text"}
                value={form[field.key] || ""}
                onChange={(event) => setField(field.key, event.target.value)}
              />
            )}
          </div>
        ))}

        <div className="md:col-span-2">
          {message ? (
            <p className="mb-3 rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : `${editId ? "Update" : "Add"} ${title}`}
            </button>

            {editId ? (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm(empty);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <div className="mt-6 grid gap-3 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="card p-4 text-sm">
            {fields.slice(0, 4).map((field) => (
              <div key={field.key} className="mb-2">
                <p className="text-xs font-bold text-slate-500">{field.label}</p>
                <p className="break-words">{String(row[field.key] ?? "")}</p>
              </div>
            ))}

            <p className="text-xs font-bold text-slate-500">Status</p>
            <p>{row.status || "-"}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => startEdit(row)} className="font-bold text-brand-700">
                Edit
              </button>
              <button onClick={() => remove(row.id)} className="font-bold text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 hidden overflow-auto md:block">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              {fields.slice(0, 4).map((field) => (
                <th key={field.key} className="p-3 text-left">
                  {field.label}
                </th>
              ))}
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">
                {fields.slice(0, 4).map((field) => (
                  <td key={field.key} className="max-w-[220px] truncate p-3">
                    {String(row[field.key] ?? "")}
                  </td>
                ))}
                <td className="p-3 text-center">{row.status}</td>
                <td className="p-3">
                  <button onClick={() => startEdit(row)} className="font-bold text-brand-700">
                    Edit
                  </button>
                  <button onClick={() => remove(row.id)} className="ml-4 font-bold text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
