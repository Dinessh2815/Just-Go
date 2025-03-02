"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        router.push("/auth/login");
      }
    };

    getSession();
  }, []);

  return (
    <div>{user ? <h1>Welcome, {user.email}!</h1> : <p>Loading...</p>}</div>
  );
}
