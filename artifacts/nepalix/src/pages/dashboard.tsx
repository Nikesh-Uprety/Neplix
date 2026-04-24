import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedHomeRoute } from "@/lib/portal-routing";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    setLocation(isAuthenticated ? getAuthenticatedHomeRoute(user) : "/", {
      replace: true,
    });
  }, [isAuthenticated, isLoading, setLocation, user]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#5B4FF9]/20 border-t-[#5B4FF9] rounded-full animate-spin" />
    </div>
  );
}
