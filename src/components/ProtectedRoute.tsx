"use client";

import { useAuth } from "../components/contexts/authContext"; 
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "./ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (!loading && user === null) {
      router.push("/connexion");
    }
  }, [user, loading, router]);

  if (loading) {
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-12 h-12" /> {}
      </div>
    );
  }

  if (user === null) {
    return null; 
  }

  return <>{children}</>;
};

export default ProtectedRoute;
