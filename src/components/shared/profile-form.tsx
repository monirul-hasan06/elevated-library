"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Profile = {
  id: string;
  email: string;
  role: string;
  status: string;
  full_name?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function getAccessToken() {
    const supabase = createSupabaseBrowserClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || null;
  }

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error("Unauthorized. Please login again.");
      }

      const res = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Could not load profile");
      }

      setProfile(json.profile);
      setFullName(json.profile.full_name || "");
      setPhone(json.profile.phone || "");
      setBio(json.profile.bio || "");
      setAvatarUrl(json.profile.avatar_url || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error("Unauthorized. Please login again.");
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          bio,
          avatar_url: avatarUrl,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Could not update profile");
      }

      setProfile(json.profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-red-700 dark:bg-red-950 dark:text-red-100">
        {error || "Profile not found"}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
      <form onSubmit={saveProfile} className="card space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-black">Profile Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            আপনার profile information update করুন।
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold">Full Name</label>
          <input
            className="input mt-1"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Phone</label>
          <input
            className="input mt-1"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Avatar URL</label>
          <input
            className="input mt-1"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://example.com/avatar.png"
          />
          <p className="mt-1 text-xs text-slate-500">
            আপাতত image URL দিন। পরে direct avatar upload add করা যাবে।
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold">Bio</label>
          <textarea
            className="input mt-1 min-h-28"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Short bio"
          />
        </div>

        {message ? (
          <p className="rounded-2xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-100">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-100">
            {error}
          </p>
        ) : null}

        <button className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      <aside className="card h-fit p-6">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-xl font-black text-brand-700 dark:bg-brand-950 dark:text-brand-100">
              {(profile.full_name || profile.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div>
            <p className="font-black">{profile.full_name || "No name set"}</p>
            <p className="text-sm text-slate-500">{profile.email}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Role</span>
            <span className="font-bold capitalize">{profile.role}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Status</span>
            <span className="font-bold capitalize">{profile.status}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Phone</span>
            <span className="font-bold">{profile.phone || "Not set"}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}