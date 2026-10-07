import { redirect } from "next/navigation";

// LoginForm's admin mode lands on /admin; Users is the console's home.
export default function AdminIndex() {
  redirect("/admin/users");
}
