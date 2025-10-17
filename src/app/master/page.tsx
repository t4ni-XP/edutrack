// app/people/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth, isSessionAllowed, isSessionStaff } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session || !isSessionAllowed(session) || !isSessionStaff(session)) notFound();
  redirect("/master/students");
}
