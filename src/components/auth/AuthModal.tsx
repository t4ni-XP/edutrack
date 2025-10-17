"use client";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const handleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Googleでログイン</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1">
            Googleアカウントでサインインすると、EduTrackの出席管理機能にアクセスできます。
          </Typography>
          <Box>
            <Typography variant="body2" color="text.secondary">
              ・ログイン済みの場合はそのままダッシュボードへ遷移します。
              <br />・初めてのログインでも同じ手順で登録されます。
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>閉じる</Button>
        <Button variant="contained" onClick={handleSignIn}>
          Googleで続行
        </Button>
      </DialogActions>
    </Dialog>
  );
}
