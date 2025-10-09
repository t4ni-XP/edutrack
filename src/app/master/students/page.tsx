// app/people/students/page.tsx
import StudentsTable from "@/app/_components/tables/StudentsTable";
import { buildStudentsRows } from "@/mock/mastar";

export default async function StudentsPage() {
  // const students = await prisma.student.findMany({
  //   orderBy: { createdAt: "desc" },
  // });
  const rows = buildStudentsRows({ by: "session" });
  return <StudentsTable rows={rows} />;
}
