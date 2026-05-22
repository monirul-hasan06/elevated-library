"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";

export function SettingsForm({ settings }: { settings: any }) {
  const router = useRouter();
  const [form, setForm] = useState(settings || {});
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  function set(key: string, value: any) {
    setForm((current: any) => ({
      ...current,
      [key]: value,
    }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMsg("");
    setSaving(true);

    try {
      const res = await authFetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        setMsg(json.error || "Failed to save settings");
        return;
      }

      setMsg("Saved successfully");
      router.refresh();
    } catch {
      setMsg("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const input = (key: string, label: string) => (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        className="input mt-1"
        value={form[key] || ""}
        onChange={(event) => set(key, event.target.value)}
      />
    </div>
  );

  const area = (key: string, label: string) => (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <textarea
        className="input mt-1 min-h-24"
        value={form[key] || ""}
        onChange={(event) => set(key, event.target.value)}
      />
    </div>
  );

  return (
    <form onSubmit={save} className="card mt-6 grid gap-4 p-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:col-span-2">
        <label className="text-sm font-semibold">Website Mode</label>

        <select
          className="input mt-2"
          value={form.site_mode || "normal"}
          onChange={(event) => set("site_mode", event.target.value)}
        >
          <option value="normal">Normal Mode — Login + Guest Checkout</option>
          <option value="guest">Guest Mode — Guest Checkout Only</option>
        </select>

        <p className="mt-2 text-xs text-slate-500">
          Guest mode hides public login, dashboard, register, and login checkout
          options. Admin can still use the direct login URL.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:col-span-2">
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={Boolean(form.welcome_notice_enabled)}
            onChange={(event) =>
              set("welcome_notice_enabled", event.target.checked)
            }
          />
          Show Top Welcome Message
        </label>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {input("welcome_notice_bn", "Welcome Message BN-Mix")}
          {input("welcome_notice_en", "Welcome Message English")}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Example: Welcome to Elevated Library!
        </p>
      </div>

      {input("site_name", "Site Name")}
      {input("owner_email", "Owner Email")}
      {input("facebook_url", "Facebook URL")}
      {input("messenger_url", "Messenger URL")}
      {input("logo_url", "Logo URL")}
      {input("favicon_url", "Favicon URL")}
      {input("primary_color", "Primary Color")}
      {input("default_language", "Default Language")}
      {input("default_theme", "Default Theme")}

      {area("hero_title_bn", "Hero Title BN")}
      {area("hero_title_en", "Hero Title EN")}
      {area("hero_subtitle_bn", "Hero Subtitle BN")}
      {area("hero_subtitle_en", "Hero Subtitle EN")}

      {input("hero_button_bn", "Hero Button BN")}
      {input("hero_button_en", "Hero Button EN")}

      {area("footer_description_bn", "Footer BN")}
      {area("footer_description_en", "Footer EN")}
      {area("support_text_bn", "Support Text BN")}
      {area("support_text_en", "Support Text EN")}

      <div className="md:col-span-2">
        {msg ? (
          <p className="mb-3 rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
            {msg}
          </p>
        ) : null}

        <button className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}