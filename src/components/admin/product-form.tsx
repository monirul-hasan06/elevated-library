"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/utils";
import { authFetch } from "@/lib/auth-fetch";

type ProductFormProps = {
  product?: any;
  categories: any[];
  selectedCategories?: string[];
};

export function ProductForm({
  product,
  categories,
  selectedCategories = [],
}: ProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<any>({
    title_bn: product?.title_bn || "",
    title_en: product?.title_en || "",
    slug: product?.slug || "",

    short_hook_bn: product?.short_hook_bn || "",
    short_hook_en: product?.short_hook_en || "",
    description_bn: product?.description_bn || "",
    description_en: product?.description_en || "",
    what_you_learn_bn: product?.what_you_learn_bn || "",
    what_you_learn_en: product?.what_you_learn_en || "",
    who_is_for_bn: product?.who_is_for_bn || "",
    who_is_for_en: product?.who_is_for_en || "",
    inside_pdf_bn: product?.inside_pdf_bn || "",
    inside_pdf_en: product?.inside_pdf_en || "",
    preview_text_bn: product?.preview_text_bn || "",
    preview_text_en: product?.preview_text_en || "",

    cover_url: product?.cover_url || "",
    file_key: product?.file_key || "",

    price: product?.price ?? 0,
    discount_price: product?.discount_price ?? "",

    status: product?.status || "active",
    featured: Boolean(product?.featured),

    category_ids: selectedCategories || [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function setField(key: string, value: any) {
    setForm((current: any) => ({
      ...current,
      [key]: value,
    }));
  }

  async function uploadPdf(file: File) {
    setLoading(true);
    setMessage("Uploading PDF...");

    try {
      const res = await authFetch("/api/admin/upload-url", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/pdf",
          prefix: "pdfs",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload URL failed");
      }

      if (json.provider === "supabase") {
        const supabase = createSupabaseBrowserClient();

        const { error } = await supabase.storage
          .from(json.bucket)
          .uploadToSignedUrl(json.key, json.token, file);

        if (error) {
          throw new Error(error.message || "Supabase upload failed");
        }
      } else {
        const uploadRes = await fetch(json.url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/pdf",
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error("Storage upload failed");
        }
      }

      setField("file_key", json.key);
      setMessage("PDF uploaded successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDF upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const endpoint = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";

      const payload = {
        ...form,
        price: Number(form.price || 0),
        discount_price:
          form.discount_price === "" || form.discount_price === null
            ? null
            : Number(form.discount_price),
      };

      const res = await authFetch(endpoint, {
        method: product ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Save failed");
      }

      setMessage("Saved successfully.");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const input = (key: string, label: string, type = "text") => (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        className="input mt-1"
        type={type}
        value={form[key] ?? ""}
        onChange={(event) => setField(key, event.target.value)}
      />
    </div>
  );

  const area = (key: string, label: string) => (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <textarea
        className="input mt-1 min-h-28"
        value={form[key] ?? ""}
        onChange={(event) => setField(key, event.target.value)}
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="card mt-6 space-y-5 p-4 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        {input("title_bn", "Title BN-Mix")}
        {input("title_en", "Title English")}

        <div>
          <label className="text-sm font-semibold">Slug</label>

          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              className="input"
              value={form.slug}
              onChange={(event) => setField("slug", event.target.value)}
            />

            <button
              type="button"
              onClick={() => setField("slug", slugify(form.title_en || form.title_bn))}
              className="btn-secondary shrink-0"
            >
              Generate
            </button>
          </div>
        </div>

        {input("cover_url", "Cover image URL")}
      </div>

      <div>
        <label className="text-sm font-semibold">PDF File Upload</label>

        <input
          className="input mt-1"
          type="file"
          accept="application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadPdf(file);
          }}
        />

        <p className="mt-2 break-all text-xs text-slate-500">
          Storage key: {form.file_key || "No file uploaded yet"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {input("price", "Price", "number")}
        {input("discount_price", "Discount Price", "number")}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {area("short_hook_bn", "Short Hook BN-Mix")}
        {area("short_hook_en", "Short Hook English")}
        {area("description_bn", "Description BN-Mix")}
        {area("description_en", "Description English")}
        {area("what_you_learn_bn", "What You Will Learn BN-Mix")}
        {area("what_you_learn_en", "What You Will Learn English")}
        {area("who_is_for_bn", "Who This Is For BN-Mix")}
        {area("who_is_for_en", "Who This Is For English")}
        {area("inside_pdf_bn", "Inside PDF BN-Mix")}
        {area("inside_pdf_en", "Inside PDF English")}
        {area("preview_text_bn", "Preview BN-Mix")}
        {area("preview_text_en", "Preview English")}
      </div>

      <div>
        <label className="text-sm font-semibold">Categories</label>

        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <label
              key={category.id}
              className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-800"
            >
              <input
                type="checkbox"
                checked={form.category_ids.includes(category.id)}
                onChange={(event) =>
                  setField(
                    "category_ids",
                    event.target.checked
                      ? [...form.category_ids, category.id]
                      : form.category_ids.filter((id: string) => id !== category.id)
                  )
                }
              />

              <span className="ml-2">{category.name_bn || category.name_en}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold">Status</label>

          <select
            className="input mt-1"
            value={form.status}
            onChange={(event) => setField("status", event.target.value)}
          >
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        <label className="flex items-center gap-2 md:mt-8">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => setField("featured", event.target.checked)}
          />
          Featured
        </label>
      </div>

      {message ? (
        <p className="rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
          {message}
        </p>
      ) : null}

      <button className="btn-primary w-full sm:w-auto" disabled={loading}>
        {loading ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
}