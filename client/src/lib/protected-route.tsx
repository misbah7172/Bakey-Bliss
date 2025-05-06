import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { roleRedirectMap } from "@/lib/utils";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: {
  path: string;
  component: () => React.JSX.Element | null;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();

  console.log('ProtectedRoute Debug:', {
    path,
    userRole: user?.role,
    allowedRoles,
    isLoading,
    isAuthenticated: !!user
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to auth');
    return <Redirect to="/auth" />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('User role not allowed, redirecting to appropriate dashboard', {
      userRole: user.role,
      allowedRoles,
      redirectTo: roleRedirectMap[user.role] || '/dashboard/customer'
    });
    return <Redirect to={roleRedirectMap[user.role] || '/dashboard/customer'} />;
  }

  console.log('Access granted to dashboard');
  return <Component />;
}
