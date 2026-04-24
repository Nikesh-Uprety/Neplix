import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { getAdminHomeRoute } from "@/lib/portal-routing";

export default function AdminIndex() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(getAdminHomeRoute(user), { replace: true });
  }, [setLocation, user]);

  return null;
}
