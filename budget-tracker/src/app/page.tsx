import { redirect } from "next/navigation";

export default function Home() {
  // Middleware handles auth - just redirect to dashboard
  redirect("/dashboard");
}
