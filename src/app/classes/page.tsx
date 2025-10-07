import ClassTable from "../_components/ClassTable";
import Header from "../_components/Header";
import { Box } from "@mui/material";

type G = 1 | 2 | 3 | 4 | 5 | 6;
const s = (name: string, grade: G) => ({ name, grade });
const mockRows = [
  {
    id: "mon-101",
    weekday: "月",
    className: "英検対策",
    classroom: "A-101",
    tutor: ["田中", "佐藤"],
    students: [s("alice", 2), s("bob", 1), s("chris", 2), s("diana", 1)],
  },
  {
    id: "mon-203",
    weekday: "月",
    className: "TOEIC対策",
    classroom: "B-203",
    tutor: "山本",
    students: [s("erika", 5), s("fumi", 5), s("gen", 5)],
  },
  {
    id: "tue-110",
    weekday: "火",
    className: "個別指導",
    classroom: "C-110",
    tutor: "小林",
    students: [s("haru", 6), s("ito", 6)],
  },
  {
    id: "tue-305",
    weekday: "火",
    className: "個別指導",
    classroom: "D-305",
    tutor: ["高橋"],
    students: [s("jack", 3), s("ken", 3), s("lena", 3), s("mio", 3), s("noa", 3)],
  },
  {
    id: "wed-101",
    weekday: "水",
    className: "IB",
    classroom: "A-101",
    tutor: "斎藤",
    students: [s("olivia", 4), s("paul", 4)],
  },
];

export default function ClassPage() {
  return (
    <>
      <Header signInStatus={true} />
      <Box sx={{ width: "80%", mx: "auto", my: 4 }}>
        <ClassTable
          rows={mockRows}
          weekday
          className
          classroom
          tutor
          students
          studentsMode="detailed"
        />
      </Box>
    </>
  );
}
