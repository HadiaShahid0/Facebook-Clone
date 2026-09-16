import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const ProtectedRoute = ({ adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    let channel;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("isAdmin, isSuspended")
          .eq("id", session.user.id)
          .single();

        setIsAdmin(profile?.isAdmin || false);
        setIsSuspended(profile?.isSuspended || false);

        channel = supabase
          .channel(`profile-status-${session.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${session.user.id}`,
            },
            (payload) => {
              setIsAdmin(payload.new.isAdmin || false);
              setIsSuspended(payload.new.isSuspended || false);
            },
          )
          .subscribe();
      }

      setSession(session);
      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Suspended users can only access the review page
  if (isSuspended && !adminOnly) {
    return <Navigate to="/account-under-review" replace />;
  }

  // Only admins can access admin routes
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Normal users cannot access admin routes
  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
