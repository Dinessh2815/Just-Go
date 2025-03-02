"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/home"); // Ensure this path is correct
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={inputStyle}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={inputStyle}
      />
      <button type="submit" style={buttonStyle}>
        Login
      </button>
    </form>
  );
}

const formStyle = {
  display: "flex",
  flexDirection: "column",
  width: "300px",
  margin: "0 auto",
};

const inputStyle = {
  marginBottom: "10px",
  padding: "10px",
  fontSize: "16px",
};

const buttonStyle = {
  padding: "10px",
  fontSize: "16px",
  backgroundColor: "#0070f3",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};
