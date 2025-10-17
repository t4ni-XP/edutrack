import { Card, CardContent, Typography, Box } from "@mui/material";
import ClassesTable from "./tables/ClassesTable";
import PrimaryButton from "./ui/PrimaryButton";
import { buildClassVMs } from "@/mock/mock";

const mockRows = buildClassVMs();

interface DashboardProps {
  showAttendanceButton?: boolean;
}

export default function Dashboard({ showAttendanceButton = false }: DashboardProps) {
  return (
    <Box
      sx={{
        mb: 4,
        mx: "auto",
        width: "80%",
        display: "flex",
        alignItems: "flex-start",
        flexDirection: "column",
      }}
    >
      <Typography variant="h4" sx={{ mb: 4 }}>
        今日のクラス
      </Typography>
      <Card
        variant="outlined" // 枠線を表示
        sx={{
          mx: "auto",
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
          <ClassesTable rows={mockRows} />
        </CardContent>
      </Card>
      {showAttendanceButton && (
        <Box mt={4} sx={{ alignSelf: "flex-end" }}>
          <PrimaryButton href="/attendance" label="出席管理" />
        </Box>
      )}
    </Box>
  );
}
