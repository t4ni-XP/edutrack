import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";

interface HeaderProps {
  signInStatus?: boolean;
}

export default function Header({ signInStatus }: HeaderProps) {
  // if (!signInStatus) {
  //   signInStatus = false;
  // }
  return (
    <Box sx={{ width: "auto", height: "100px", bgcolor: "#3A606E" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ height: "100%" }}
      >
        <Box pl={"20px"} pt={"20px"}>
          <Typography variant="h2" component="div" gutterBottom>
            EduTrack
          </Typography>
        </Box>
        <Box pr={"20px"}>
          {signInStatus ? (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                src="/userIcon.jpeg"
                alt="User Icon"
                fill
                style={{
                  objectFit: "cover", // 画像が親要素に収まるように、アスペクト比を維持して切り取る
                  objectPosition: "left top", // 切り取りの起点を左上にする
                }}
              />
            </Box>
          ) : (
            <Image src="/googleSignInIcon_r.png" alt="Sign in with Google" width={50} height={50} />
          )}
        </Box>
      </Stack>
    </Box>
  );
}
