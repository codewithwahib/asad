"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify({ id: data.id, email: data.email })
        );
        // ✅ Login success → quotations
        window.location.href = "/quotations";
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 px-4 py-2 text-sm text-black bg-white outline-none focus:border-black focus:ring-1 focus:ring-black tracking-wider rounded-lg transition-all";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-black tracking-wider">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div>
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-black">
            Asad Zaman Photography
          </h1>
          <p className="mt-1 text-xs text-gray-500 tracking-wider">
            Sign in to your dashboard
          </p>
        </div>

        {error && (
          <div className="mb-5 border border-red-200 bg-red-50 p-3 text-xs text-red-700 tracking-wider rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className={inputClass}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 tracking-wider">
                Password
              </label>
              <button
                type="button"
                className="text-[10px] text-gray-500 hover:text-black tracking-wider transition-colors"
                onClick={() =>
                  alert("Forgot password functionality goes here!")
                }
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60 tracking-wider flex justify-center items-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-gray-400 tracking-wider">
          &copy; {new Date().getFullYear()} Asad Zaman Photography. All rights
          reserved.
        </div>
      </div>
    </main>
  );
}