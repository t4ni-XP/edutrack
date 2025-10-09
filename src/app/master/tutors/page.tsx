// app/people/tutors/page.tsx
import TutorsTable from "@/app/_components/tables/TutorsTable";
import { buildTutorsRows } from "@/mock/mastar";

export default async function TutorsPage() {
  // const tutors = await prisma.tutor.findMany({ orderBy: { createdAt: "desc" } });
  const rows = buildTutorsRows();
  return <TutorsTable rows={rows} />;
}
