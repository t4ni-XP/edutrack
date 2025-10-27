"use client";
import { Tabs, Tab, Box, Container } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "../_components/ui/Header";

export default function PeopleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const value = pathname?.includes("/tutors") ? "tutors" : "students";
  return (
    <>
      <Header />
      <Box component="section" sx={{ py: 4 }}>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Tabs value={value} aria-label="master tabs">
            <Tab value="students" label="生徒" component={Link} href="/master/students" />
            <Tab value="tutors" label="講師" component={Link} href="/master/tutors" />
          </Tabs>
          <Box sx={{ mt: 4 }}>{children}</Box>
        </Container>
      </Box>
    </>
  );
}
