import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const ProtectedRoute = () => {
  const { loading, isAuth, user } = useAppData();
  const currentURL = useLocation();

  if (loading) return null;

  if (!isAuth) {
    return <Navigate to={"/login"} replace />;
  }

  if (user?.role === null && currentURL.pathname !== "/select-role") {
    return <Navigate to={"/select-role"} replace />;
  }

  if (user?.role !== null && currentURL.pathname === "/select-role") {
    return <Navigate to={"/"} replace />;
  }



  if (user && user.role === "seller" && currentURL.pathname !== "/seller") {
    return <Navigate to={"/seller"} replace />;
  }

  if (user && user.role === "rider" && currentURL.pathname !== "/rider") {
    return <Navigate to={"/rider"} replace />;
  }
  
  if (user && user.role === "admin" && currentURL.pathname !== "/admin") {
    return <Navigate to={"/admin"} replace />;
  }

  if (
    user && user.role === "customer" && 
    (currentURL.pathname === "/admin" || 
    currentURL.pathname === "/seller" || 
    currentURL.pathname === "/rider")
  ) {
    return <Navigate to={"/"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
