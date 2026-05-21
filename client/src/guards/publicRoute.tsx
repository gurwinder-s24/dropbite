import { useAppData } from "../context/AppContext";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { loading, isAuth } = useAppData();
  
  if (loading) return null;

  return isAuth ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
