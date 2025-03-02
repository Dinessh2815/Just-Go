import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Welcome to TripAdvisor Clone</h1>
      <Link href="/auth/login">Login</Link>
      <br />
      <Link href="/auth/signup">signUp</Link>
    </main>
  );
}
