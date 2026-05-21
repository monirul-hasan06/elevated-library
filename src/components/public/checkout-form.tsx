"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CheckoutType = "authenticated" | "guest";
type SiteMode = "normal" | "guest";

type PaymentMethod = {
  id: string;
  label: string;
  account_number: string;
  account_holder: string;
  instructions_bn?: string | null;
  instructions_en?: string | null;
};

type CheckoutFormProps = {
  productId: string;
  isLoggedIn: boolean;
  methods: PaymentMethod[];
  siteMode?: SiteMode;
};

export function CheckoutForm({
  productId,
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

  const selected = methods.find((method) => method.id === paymentMethodId);

  useEffect(() => {
    if (isGuestMode) {
      setCheckoutType("guest");
    }
  }, [isGuestMode]);

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
        <h2 className="text-2xl font-black">Order submitted!</h2>

        <p className="mt-2">
          Admin verification-এর পর download access পাবেন।
        </p>

        {result.downloadUrl ? (
          <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100">
            <p className="font-bold">Guest link save করুন:</p>
            <p className="mt-2 break-all">{result.downloadUrl}</p>
          </div>
        ) : (
          <Link href="/dashboard/orders" className="btn-primary mt-5">
            Go to Dashboard
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
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
        <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-950 dark:text-brand-100">
          Guest Mode is active. Please continue with guest checkout.
        </div>
      )}

      {checkoutType === "guest" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className="input"
            type="email"
            required
            placeholder="Guest email"
            value={guestEmail}
            onChange={(event) => setGuestEmail(event.target.value)}
          />

          <input
            className="input"
            required
            placeholder="Your name"
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
          />
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

        {selected ? (
          <div className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm dark:bg-slate-800">
            <p>
              <b>Number:</b> {selected.account_number}
            </p>

            <p>
              <b>Account:</b> {selected.account_holder}
            </p>

            {selected.instructions_bn ? (
              <p className="mt-2">{selected.instructions_bn}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <input
        className="input"
        required
        placeholder="TrxID"
        value={trxId}
        onChange={(event) => setTrxId(event.target.value)}
      />

      <input
        className="input"
        required
        placeholder="Sender phone: 01XXXXXXXXX"
        value={senderPhone}
        onChange={(event) => setSenderPhone(event.target.value)}
      />

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