import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/public/checkout-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/db";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: {
    productId?: string;
  };
}) {
  const productId = searchParams.productId;

  if (!productId) {
    redirect("/products");
  }

  const supabase = createSupabaseServerClient();
  const settings = await getSiteSettings();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("status", "active")
    .single();

  if (productError || !product) {
    redirect("/products");
  }

  const { data: methods } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  const siteMode = (settings?.site_mode as "normal" | "guest") || "normal";
  const isGuestMode = siteMode === "guest";

  return (
    <main className="container-page py-12">
      <div className="mb-8">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm text-slate-500 hover:text-brand-600"
        >
          ← Back
        </Link>

        <h1 className="mt-4 text-4xl font-black">Checkout</h1>

        {isGuestMode ? (
          <p className="mt-2 text-sm text-slate-500">
            Guest mode is active. Continue with name, email, payment details,
            and TrxID.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Choose login checkout for dashboard access, or guest checkout for a
            secure download link.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="card h-fit p-6">
          <h2 className="text-xl font-black">
            {product.title_bn || product.title_en}
          </h2>

          <p className="mt-3 text-3xl font-black text-brand-700">
            {money(product.discount_price || product.price)}
          </p>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            {isGuestMode
              ? "Guest checkout করলে name, email এবং payment details দিয়ে order submit করবেন। Admin verify করলে secure download link পাবেন।"
              : "Login checkout করলে dashboard access পাবেন, Guest checkout করলে secure link পাবেন।"}
          </p>
        </aside>

        <section className="card p-6 lg:col-span-2">
          <CheckoutForm
            productId={product.id}
            isLoggedIn={!!user}
            methods={methods || []}
            siteMode={siteMode}
          />
        </section>
      </div>
    </main>
  );
}