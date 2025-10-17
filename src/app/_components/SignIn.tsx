"use client";

import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function SignIn() {
  const { openAuthModal } = useAuthModal();

  return (
    <Box sx={{ mb: 4, mx: "auto" }}>
      <Card
        variant="outlined" // 枠線を表示
        sx={{
          my: 4,
          mx: "auto",
          width: 600,
          height: 350,
          borderRadius: "30px", // 角丸を30pxに
        }}
      >
        {/* CardContentで中身のレイアウトを調整 */}
        <CardContent
          sx={{
            height: "100%", // Cardの高さ全体を使う
            display: "flex",
            flexDirection: "column",
            alignItems: "center", // 水平方向の中央揃え
            justifyContent: "center", // 垂直方向の中央揃え
            textAlign: "center",
          }}
        >
          <Typography variant="h5" component="div" sx={{ mb: 4 }}>
            Googleアカウントを使用してEduTrackにログイン
          </Typography>

          <Button variant="contained" onClick={openAuthModal}>
            Googleでログイン
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
