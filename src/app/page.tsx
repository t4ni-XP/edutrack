import Dashboard from "./_components/Dashboard";
import Header from "./_components/ui/Header";
import SignIn from "./_components/SignIn";
import { auth, isSessionAllowed, isSessionStaff } from "@/lib/auth";
import { Box, Card, CardContent, Typography } from "@mui/material";

export default async function Home() {
  const session = await auth();
  const isAllowed = isSessionAllowed(session);
  const isStaff = isSessionStaff(session);

  return (
    <>
      <Header />
      {!session && <SignIn />}
      {session && !isAllowed && <UnauthorizedMessage />}
      {session && isAllowed && <Dashboard showAttendanceButton={isStaff} />}
    </>
  );
}

function UnauthorizedMessage() {
  return (
    <Box sx={{ mb: 4, mx: "auto", width: 600 }}>
      <Card variant="outlined" sx={{ borderRadius: "30px" }}>
        <CardContent sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            許可されたユーザのみ使用可能です
          </Typography>
          <Typography variant="body2" color="text.secondary">
            アクセス権限のないアカウントでログインしています。管理者にお問い合わせください。
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
