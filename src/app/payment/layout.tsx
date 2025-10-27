import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Box, Container } from "@mui/material";
import PaymentTabs from "./PaymentTabs";
import { auth, isSessionAllowed, isSessionStaff } from "@/lib/auth";
import Header from "../_components/ui/Header";

export default async function PaymentLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session || !isSessionAllowed(session) || !isSessionStaff(session)) notFound();

  return (
    <>
      <Header />
      <Box component="section" sx={{ py: 4 }}>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <PaymentTabs />
          <Box sx={{ mt: 4 }}>{children}</Box>
        </Container>
      </Box>
    </>
  );
}
