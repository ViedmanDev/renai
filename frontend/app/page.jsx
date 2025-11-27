import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (token) {
    redirect("/project");
  }

  redirect("/auth/login");
}
