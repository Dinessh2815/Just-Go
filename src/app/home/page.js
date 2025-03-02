"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, username")
          .eq("id", session.user.id)
          .single();

        setUserData({
          name: profile?.name || session.user.user_metadata.username,
          email: session.user.email,
        });
      } else {
        router.push("/auth/login");
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      {userData ? (
        <>
          <h1>Welcome, {userData.name}!</h1>
          <p>Username: @{userData.username}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
