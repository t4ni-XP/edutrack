import styles from "./page.module.css";
import SignIn from "./(core)/_components/SignIn";
import Dashboard from "./(core)/_components/Dashboard";
import Header from "./(core)/_components/Header";
import { Box } from "@mui/material";

interface HomeProps {
  signInStatus?: boolean;
}

export default function Home({ signInStatus = false }: HomeProps) {
  return (
    <main className={styles.main}>
      <Header signInStatus={signInStatus} />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {signInStatus ? <Dashboard /> : <SignIn />}
      </Box>
    </main>
  );
}
