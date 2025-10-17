"use client";

import { Box, Stack, Typography } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useAuthModal } from "@/components/auth/AuthModalContext";
import PrimaryButton from "./PrimaryButton";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const authenticated = status === "authenticated" && !!session?.user;

  return (
    <Box sx={{ width: "auto", height: "100px", bgcolor: "#3A606E" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ height: "100%" }}
      >
        <Box pl={3} pt={3}>
          <Link href="/">
            <Typography variant="h2" component="div" gutterBottom>
              EduTrack
            </Typography>
          </Link>
        </Box>
        <Box pr={3}>
          {authenticated ? (
            <Stack direction="row" spacing={1} alignItems="center">
              {/* <Avatar src={session.user?.image ?? undefined} alt={session.user?.name ?? "User"} /> */}
              <PrimaryButton
                label="ログアウト"
                borderColor="#F8F8F8"
                borderWidth={1}
                variant="outlined"
                onClick={() => signOut({ callbackUrl: "/" })}
              />
            </Stack>
          ) : (
            <PrimaryButton
              label="ログイン"
              variant="outlined"
              borderColor="#F8F8F8"
              borderWidth={1}
              onClick={openAuthModal}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
}
