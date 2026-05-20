import { AuthForm } from "@/components/public/auth-form";

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string } }) {
  return <AuthForm mode="login" redirectTo={searchParams.redirect || "/dashboard"} />;
}
