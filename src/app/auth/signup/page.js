"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supabase = createClient();

    // Sign up user with metadata
    const { data: signupData, error: signupError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            name: name, // Pass name entered by user
            username: username, // Pass username entered by user
          },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      }
    );

    if (signupError) {
      console.error("Signup Error:", signupError.message);
      alert("Error signing up:", signupError.message);
      return;
    }

    alert("Signup successful! Please check your email for verification.");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Sign Up</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="mb-2 p-2 w-full border border-gray-300 rounded text-gray-800"
          required
        />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="mb-2 p-2 w-full border border-gray-300 rounded text-gray-800"
          maxLength={40}
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mb-2 p-2 w-full border border-gray-300 rounded text-gray-800"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4 p-2 w-full border border-gray-300 rounded text-gray-800"
          required
        />
        <button
          type="submit"
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Sign Up
        </button>
      </form>
    </main>
  );
}
