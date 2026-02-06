import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "@/app/components/LoginPage";
import { Dashboard } from "@/app/components/Dashboard";
import { FlightSearch } from "@/app/components/FlightSearch";
import { FlightResults } from "@/app/components/FlightResults";
import { Layout } from "@/app/components/Layout";
import { LandingPage } from "@/app/components/LandingPage";
import { useEffect, useState } from "react";
import { getCurrentSession, onAuthStateChange } from "@/app/services/supabase";

// Protected route wrapper - requires authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial session
    getCurrentSession().then(session => {
      setIsAuthenticated(!!session);
    }).catch(() => {
      setIsAuthenticated(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - render children
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "search",
        element: <FlightSearch />,
      },
      {
        path: "results/:traceId",
        element: <FlightResults />,
      },
    ],
  },
]);