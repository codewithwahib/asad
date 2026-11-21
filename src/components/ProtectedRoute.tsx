"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Check karo ke user login hai ya nahi (localStorage se)
    const user = localStorage.getItem("user");
    
    if (!user) {
      // ❌ Agar user nahi hai, toh root (/) yani login page par bhej do
      router.replace("/");
    } else {
      // ✅ User mil gaya, access allow karo
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  // Jab tak check ho raha hai, tab tak blank ya loading dikhao (taake page flash na ho)
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Agar authenticated hai, toh page ka content dikhao
  return isAuthenticated ? <>{children}</> : null;
}