import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const ProtectedRoute = ({adminOnly=false}) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if(session?.user){
        const {data:profile}=await supabase
        .from("profiles")
        .select("isAdmin")
        .eq("id",session.user.id)
        .single()

        setIsAdmin(profile?.isAdmin || false)
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

  if (!session) return <Navigate to="/login" replace />;

  if(adminOnly && !isAdmin) return <Navigate to="/" replace/>
  if(!adminOnly && isAdmin) return <Navigate to="/admin" replace/>

  return <Outlet />;
};

export default ProtectedRoute;
