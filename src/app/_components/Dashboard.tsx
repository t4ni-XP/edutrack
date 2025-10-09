import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import ClassesTable from "./tables/ClassesTable";
import PrimaryButton from "./ui/PrimaryButton";
import { buildClassVMs } from "@/mock/mock";
// const mockRows = [
//   {
//     id: "mon-101",
//     weekday: "月",
//     className: "英検対策",
//     classroom: "A-101",
//     tutors: ["田中", "佐藤"],
//     students: [s("alice", 2), s("bob", 1), s("chris", 2), s("diana", 1)],
//   },
//   {
//     id: "mon-203",
//     weekday: "月",
//     className: "TOEIC対策",
//     classroom: "B-203",
//     tutors: ["山本"],
//     students: [s("erika", 5), s("fumi", 5), s("gen", 5)],
//   },
//   {
//     id: "tue-110",
//     weekday: "火",
//     className: "個別指導",
//     classroom: "C-110",
//     tutors: ["小林"],
//     students: [s("haru", 6), s("ito", 6)],
//   },
//   {
//     id: "tue-305",
//     weekday: "火",
//     className: "個別指導",
//     classroom: "D-305",
//     tutors: ["高橋"],
//     students: [s("jack", 3), s("ken", 3), s("lena", 3), s("mio", 3), s("noa", 3)],
//   },
//   {
//     id: "wed-101",
//     weekday: "水",
//     className: "IB",
//     classroom: "A-101",
//     tutors: ["斎藤"],
//     students: [s("olivia", 4), s("paul", 4)],
//   },
// ];
const mockRows = buildClassVMs();

export default function Dashboard() {
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
      <PrimaryButton href="/classes" label="出席管理" />
    </Box>
  );
}
