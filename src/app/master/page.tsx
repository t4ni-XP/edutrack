// app/people/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session) notFound();
  redirect("/master/students");
}
