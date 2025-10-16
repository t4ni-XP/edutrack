"use client";
import { Tabs, Tab } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PeopleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const value = pathname?.includes("/tutors") ? "tutors" : "students";
  return (
    <>
      <Tabs value={value} sx={{ mb: 2 }}>
        <Tab value="students" label="生徒" component={Link} href="/master/students" />
        <Tab value="tutors" label="講師" component={Link} href="/master/tutors" />
      </Tabs>
      {children}
    </>
  );
}
