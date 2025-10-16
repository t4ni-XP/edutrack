// app/people/students/page.tsx
import { buildStudentsRows } from "@/mock/mastar";
import StudentsPageClient from "./StudentsPageClient";

export default async function StudentsPage() {
  // const students = await prisma.student.findMany({
  //   orderBy: { createdAt: "desc" },
  // });
  const rows = buildStudentsRows({ by: "session" });
  return <StudentsPageClient rows={rows} />;
}
