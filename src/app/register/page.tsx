import { AuthForm } from "@/components/public/auth-form";

export default function RegisterPage() {
  return <AuthForm mode="register" redirectTo="/dashboard" />;
}
