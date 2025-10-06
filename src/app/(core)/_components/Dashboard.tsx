import { Card, CardContent, Typography, Button } from "@mui/material";

export default function Dashboard() {
  return (
    <Card
      variant="outlined" // 枠線を表示
      sx={{
        position: "absolute",
        width: 600,
        height: 350,
        left: 660,
        top: 365,
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
          {" "}
          {/* mb: 4でボタンとの間に余白を設ける */}
          ダッシュボード
        </Typography>
      </CardContent>
    </Card>
  );
}
