// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/utils/supabase/client";

// export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let cancelled = false;

//     const checkAuth = async () => {
//       // 1) Pehle localStorage check
//       let hasLocalUser = false;
//       try {
//         hasLocalUser = !!localStorage.getItem("user");
//       } catch {
//         hasLocalUser = false;
//       }

//       if (hasLocalUser) {
//         if (!cancelled) {
//           setIsAuthenticated(true);
//           setLoading(false);
//         }
//         return;
//       }

//       // 2) Fallback: Supabase session (cookies) check
//       try {
//         const supabase = createClient();
//         const { data } = await supabase.auth.getSession();
//         if (data.session) {
//           if (!cancelled) {
//             setIsAuthenticated(true);
//             setLoading(false);
//           }
//           return;
//         }
//       } catch (err) {
//         console.error("Auth check error:", err);
//       }

//       // 3) Dono nahi mile to login par bhejo
//       if (!cancelled) {
//         setLoading(false);
//         router.replace("/");
//       }
//     };

//     checkAuth();

//     return () => {
//       cancelled = true;
//     };
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return isAuthenticated ? <>{children}</> : null;
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      // 1) localStorage check (fast path)
      let hasLocalUser = false;
      try {
        hasLocalUser = !!localStorage.getItem("user");
      } catch {
        hasLocalUser = false;
      }

      if (hasLocalUser) {
        if (!cancelled) {
          setIsAuthenticated(true);
          setLoading(false);
        }
        return;
      }

      // 2) Supabase session fallback (cookies)
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session) {
          // Repopulate localStorage so future checks are instant
          try {
            localStorage.setItem(
              "user",
              JSON.stringify({
                email: data.session.user.email,
                id: data.session.user.id,
              })
            );
          } catch {}
          if (!cancelled) {
            setIsAuthenticated(true);
            setLoading(false);
          }
          return;
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }

      // 3) Not authenticated → redirect to login
      if (!cancelled) {
        setLoading(false);
        const redirect =
          pathname && pathname !== "/"
            ? `/?redirect=${encodeURIComponent(pathname)}`
            : "/";
        router.replace(redirect);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spinner"></div>
        <style>{`.animate-spinner{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}