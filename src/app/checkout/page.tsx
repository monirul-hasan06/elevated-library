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

  const siteMode = (settings?.site_mode as "normal" | "guest") || "normal";
  const isGuestMode = siteMode === "guest";

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

  const amount = Number(product.discount_price || product.price || 0);

  return (
    <main className="container-page py-12">
      <div className="mb-8">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-semibold text-slate-500 hover:text-brand-600"
        >
          ← Back to PDF
        </Link>

        <h1 className="mt-4 text-4xl font-black">Checkout</h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          {isGuestMode
            ? "Name, email, payment details এবং TrxID দিয়ে order submit করুন।"
            : "Payment complete করার পর TrxID এবং sender phone number submit করুন। Admin verify করলে download access পাবেন।"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="card h-fit p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Order Summary
          </p>

          <h2 className="mt-3 text-xl font-black">
            {product.title_bn || product.title_en}
          </h2>

          <p className="mt-3 text-3xl font-black text-brand-700">
            {money(amount)}
          </p>

          <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <p className="font-bold">Payment Process</p>

            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Payment number copy করুন।</li>
              <li>bKash/Nagad app থেকে Send Money করুন।</li>
              <li>TrxID copy করুন।</li>
              <li>TrxID + sender phone submit করুন।</li>
              <li>Admin verify করলে PDF download পাবেন।</li>
            </ol>
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-500">
            ভুল TrxID দিলে verification delay হতে পারে। Help লাগলে Facebook
            support button ব্যবহার করুন।
          </p>
        </aside>

        <section className="card p-6 lg:col-span-2">
          <CheckoutForm
            productId={product.id}
            productTitle={product.title_bn || product.title_en}
            amount={amount}
            isLoggedIn={isGuestMode ? false : !!user}
            methods={methods || []}
            siteMode={siteMode}
          />
        </section>
      </div>
    </main>
  );
}