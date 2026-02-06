import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { Button } from "@/app/components/ui/button";
import { LayoutDashboard, Search, LogOut, Plane } from "lucide-react";
import { toast } from "sonner";
import { signOut, getCurrentUser } from "@/app/services/supabase";
import { useEffect, useState } from "react";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || "User");
      }
    }).catch(() => {
      // User will be redirected by ProtectedRoute
      setIsAuthenticated(false);
      setUserName(null);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Logout failed");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Enhanced with better spacing and subtle shadow */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground tracking-tight">Flight Risk AI</h1>
                <p className="text-xs text-muted-foreground">Low Visibility Intelligence</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <Link to="/app/dashboard">
                <Button
                  variant={isActive("/app/dashboard") ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 font-medium transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/app/search">
                <Button
                  variant={isActive("/app/search") ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 font-medium transition-all"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </Link>
              <div className="h-6 w-px bg-border mx-2" />
              <div className="flex items-center gap-3 pl-2">
                <span className="text-sm font-medium text-foreground">{userName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 font-medium transition-all hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Improved spacing */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}