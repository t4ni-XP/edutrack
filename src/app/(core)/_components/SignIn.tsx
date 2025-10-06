import { Card, CardContent, Typography, Button } from "@mui/material";
import Image from "next/image";

export default function SignIn() {
  return (
    <Card
      variant="outlined" // 枠線を表示
      sx={{
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

        <Button>
          <Image
            src="/googleSignInIcon.png"
            alt="Sign in with Google"
            width={191} // 画像の幅
            height={46} // 画像の高さ
          />
        </Button>
      </CardContent>
    </Card>
  );
}
