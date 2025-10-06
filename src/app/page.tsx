import styles from "./page.module.css";
import SignIn from "./_components/SignIn";
import Dashboard from "./_components/Dashboard";
import Header from "./_components/Header";

interface HomeProps {
  signInStatus?: boolean;
}

export default function Home({ signInStatus = true }: HomeProps) {
  return (
    <main className={styles.main}>
      <Header signInStatus={signInStatus} />
      {signInStatus ? <Dashboard /> : <SignIn />}
    </main>
  );
}
