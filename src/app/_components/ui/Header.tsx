"use client";

import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useAuthModal } from "@/components/auth/AuthModalContext";

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
          <Typography variant="h2" component="div" gutterBottom>
            EduTrack
          </Typography>
        </Box>
        <Box pr={3}>
          {authenticated ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar src={session.user?.image ?? undefined} alt={session.user?.name ?? "User"} />
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                ログアウト
              </Button>
            </Stack>
          ) : (
            <Button variant="contained" color="secondary" onClick={openAuthModal}>
              ログイン
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
