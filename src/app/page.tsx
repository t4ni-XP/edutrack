import Dashboard from "./_components/Dashboard";
import Header from "./_components/ui/Header";
import SignIn from "./_components/SignIn";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <>
      <Header />
      {session ? <Dashboard /> : <SignIn />}
    </>
  );
}
