import { Card, CardContent, Typography } from "@mui/material";

export default function PaymentWagePage() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          講師賃金
        </Typography>
        <Typography color="text.secondary">
          こちらのタブでは講師ごとの賃金を表示する予定です。今後のアップデートをお待ちください。
        </Typography>
      </CardContent>
    </Card>
  );
}
