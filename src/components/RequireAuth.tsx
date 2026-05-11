import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/api";

export function RequireAuth() {
  const location = useLocation();
  const [hasSession, setHasSession] = useState(isAuthenticated());

  useEffect(() => {
    const syncSession = () => setHasSession(isAuthenticated());
    window.addEventListener("bonsae-auth-changed", syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("bonsae-auth-changed", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  if (!hasSession) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
