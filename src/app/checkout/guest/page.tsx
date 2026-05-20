import { redirect } from "next/navigation";
export default function GuestRedirect({ searchParams }: { searchParams: { productId?: string } }) { redirect(`/checkout?productId=${searchParams.productId || ""}`); }
