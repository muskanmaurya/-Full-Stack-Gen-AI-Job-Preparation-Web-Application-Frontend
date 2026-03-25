import{useAuth} from "../hooks/useAuth"
import { Navigate, useLocation } from "react-router-dom";

const Protected = ({children}) => {
    const {loading,user}=useAuth();
    const location = useLocation();

    if(loading){
        return (<main><h1>Loading...</h1></main>)
    }

    if(!user){
        return <Navigate to="/login" replace />;
    }

    if (user?.isGuest) {
        const pathname = location.pathname;
        const canAccessHome = pathname === "/";
        const canAccessInterviewReport = /^\/interview\/[^/]+$/.test(pathname);

        if (!canAccessHome && !canAccessInterviewReport) {
            return <Navigate to="/login" replace />;
        }
    }

  return children
}

export default Protected