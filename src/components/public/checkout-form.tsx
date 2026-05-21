"use client";

import Link from "next/link";
import { Check, Clipboard, Copy, Info, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CheckoutType = "authenticated" | "guest";
type SiteMode = "normal" | "guest";

type PaymentMethod = {
  id: string;
  method?: string;
  label: string;
  account_type?: string | null;
  account_number: string;
  account_holder: string;
  instructions_bn?: string | null;
  instructions_en?: string | null;
  qr_code_url?: string | null;
};

type CheckoutFormProps = {
  productId: string;
  productTitle?: string;
  amount?: number;
  isLoggedIn: boolean;
  methods: PaymentMethod[];
  siteMode?: SiteMode;
};

function formatMoney(amount?: number) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

export function CheckoutForm({
  productId,
  productTitle,
  amount,
  isLoggedIn,
  methods,
  siteMode = "normal",
}: CheckoutFormProps) {
  const isGuestMode = siteMode === "guest";

  const [checkoutType, setCheckoutType] = useState<CheckoutType>(
    isGuestMode ? "guest" : isLoggedIn ? "authenticated" : "guest"
  );

  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState(methods[0]?.id || "");
  const [trxId, setTrxId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const selected = useMemo(
    () => methods.find((method) => method.id === paymentMethodId),
    [methods, paymentMethodId]
  );

  useEffect(() => {
    if (isGuestMode) {
      setCheckoutType("guest");
    }
  }, [isGuestMode]);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);

      window.setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch {
      setCopied("");
      alert("Copy failed. Please copy manually.");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutType,
          productId,
          paymentMethodId,
          trxId,
          senderPhone,
          ...(checkoutType === "guest" ? { guestEmail, guestName } : {}),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Order failed");
      }

      setResult(json);
      setTrxId("");
      setSenderPhone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!methods.length) {
    return (
      <div className="rounded-2xl bg-amber-50 p-5 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
        No active payment method found. Please contact support.
      </div>
    );
  }

  if (result) {
    return (
      <div className="rounded-2xl bg-green-50 p-6 text-green-900 dark:bg-green-950 dark:text-green-100">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-green-100 p-3 dark:bg-green-900">
            <Check className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-2xl font-black">Order submitted!</h2>

            <p className="mt-2">
              Admin verification-এর পর download access পাবেন।
            </p>
          </div>
        </div>

        {result.downloadUrl ? (
          <div className="mt-5 rounded-xl bg-white p-4 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100">
            <p className="font-bold">Guest link save করুন:</p>

            <p className="mt-2 break-all">{result.downloadUrl}</p>

            <button
              type="button"
              onClick={() => copyText(result.downloadUrl, "Guest link")}
              className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Copy Guest Link
            </button>
          </div>
        ) : (
          <Link href="/dashboard/orders" className="btn-primary mt-5">
            Go to Dashboard
          </Link>
        )}

        <div className="mt-5 rounded-2xl bg-white/70 p-4 text-sm dark:bg-slate-900/70">
          <p className="font-bold">Next step</p>
          <p className="mt-1">
            Payment app-এর TrxID ঠিক আছে কিনা check করুন। Verification delay
            হলে Facebook page এ knock করুন।
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {copied ? (
        <div className="rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700 dark:bg-green-950 dark:text-green-100">
          {copied} copied successfully.
        </div>
      ) : null}

      {!isGuestMode ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setCheckoutType("authenticated")}
            className={`rounded-2xl border p-4 text-left transition ${
              checkoutType === "authenticated"
                ? "border-brand-600 bg-brand-50 dark:bg-brand-950"
                : "border-slate-200 hover:border-brand-300 dark:border-slate-800"
            }`}
          >
            <b>Login Checkout</b>

            <p className="mt-1 text-sm text-slate-500">
              Dashboard থেকে PDF পাবেন।
            </p>

            {!isLoggedIn ? (
              <Link
                className="mt-3 inline-flex text-sm font-bold text-brand-700"
                href={`/login?redirect=/checkout?productId=${productId}`}
              >
                Login first
              </Link>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setCheckoutType("guest")}
            className={`rounded-2xl border p-4 text-left transition ${
              checkoutType === "guest"
                ? "border-brand-600 bg-brand-50 dark:bg-brand-950"
                : "border-slate-200 hover:border-brand-300 dark:border-slate-800"
            }`}
          >
            <b>Guest Checkout</b>

            <p className="mt-1 text-sm text-slate-500">
              Name + email দিয়ে secure link পাবেন।
            </p>
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-950 dark:text-brand-100">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Guest checkout active আছে। Name, email, payment details এবং TrxID
            দিয়ে order submit করুন।
          </p>
        </div>
      )}

      {checkoutType === "guest" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Your Name</label>
            <input
              className="input mt-1"
              required
              placeholder="Your name"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Guest Email</label>
            <input
              className="input mt-1"
              type="email"
              required
              placeholder="your@email.com"
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
            />
          </div>
        </div>
      ) : null}

      <div>
        <label className="text-sm font-semibold">Payment Method</label>

        <select
          className="input mt-2"
          value={paymentMethodId}
          onChange={(event) => setPaymentMethodId(event.target.value)}
        >
          {methods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.label}
            </option>
          ))}
        </select>
      </div>

      {selected ? (
        <div className="rounded-3xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900 dark:bg-brand-950/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">
                Send Money To
              </p>

              <h3 className="mt-1 text-2xl font-black">
                {selected.label}
                {selected.account_type ? (
                  <span className="ml-2 text-sm font-semibold text-slate-500">
                    ({selected.account_type})
                  </span>
                ) : null}
              </h3>
            </div>

            <ShieldCheck className="h-7 w-7 text-brand-700 dark:text-brand-200" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
              <p className="text-xs font-bold text-slate-500">Payment Number</p>

              <p className="mt-1 break-all text-2xl font-black">
                {selected.account_number}
              </p>

              <button
                type="button"
                onClick={() =>
                  copyText(selected.account_number, "Payment number")
                }
                className="mt-3 inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 dark:bg-white dark:text-slate-950"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Number
              </button>
            </div>

            <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
              <p className="text-xs font-bold text-slate-500">Amount</p>

              <p className="mt-1 text-2xl font-black">
                {formatMoney(amount)}
              </p>

              <button
                type="button"
                onClick={() => copyText(String(amount || 0), "Amount")}
                className="mt-3 inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 dark:bg-white dark:text-slate-950"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Amount
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 text-sm dark:bg-slate-900">
            <p>
              <b>Account Holder:</b> {selected.account_holder}
            </p>

            {productTitle ? (
              <p className="mt-1">
                <b>Product:</b> {productTitle}
              </p>
            ) : null}

            {selected.instructions_bn ? (
              <p className="mt-3 leading-6 text-slate-600 dark:text-slate-300">
                {selected.instructions_bn}
              </p>
            ) : null}
          </div>

          <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <p className="font-bold">Important</p>
            <p className="mt-1">
              Payment করার পর TrxID exact copy করে নিচের form-এ submit করুন।
              একই TrxID একবারের বেশি submit করা যাবে না।
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold">TrxID</label>
          <div className="mt-1 flex gap-2">
            <input
              className="input"
              required
              placeholder="Example: 9A7B8C123D"
              value={trxId}
              onChange={(event) => setTrxId(event.target.value)}
            />

            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setTrxId(text.trim());
                } catch {
                  alert("Clipboard read failed. Paste manually.");
                }
              }}
              className="rounded-xl border border-slate-200 px-3 text-sm font-bold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              title="Paste from clipboard"
            >
              <Clipboard className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Sender Phone</label>
          <input
            className="input mt-1"
            required
            placeholder="01XXXXXXXXX"
            value={senderPhone}
            onChange={(event) => setSenderPhone(event.target.value)}
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-100">
          {error}
        </p>
      ) : null}

      <button
        className="btn-primary w-full"
        disabled={loading || (checkoutType === "authenticated" && !isLoggedIn)}
      >
        {loading ? "Submitting..." : "Submit Payment Details"}
      </button>
    </form>
  );
}