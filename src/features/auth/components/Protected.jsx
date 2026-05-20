import{useAuth} from "../hooks/useAuth"
import { Navigate, useLocation } from "react-router-dom";
import LoadingScreen from '../../../components/LoadingScreen.jsx'

const Protected = ({children}) => {
    const {loading,user}=useAuth();
    const location = useLocation();

    if(loading){
        return (
            <LoadingScreen
                title="Checking your access..."
                subtitle="Making sure your session and interview tools are ready."
            />
        )
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