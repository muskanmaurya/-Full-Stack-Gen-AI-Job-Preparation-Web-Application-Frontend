import { useContext,useEffect } from "react";
import { AuthContext } from "../auth.context.jsx";
import {login,register,logout,getMe} from "../services/auth.api.js";

const GUEST_TOKEN_KEY = "temporary_guest_token";



export const useAuth=()=>{
    const context=useContext(AuthContext);
    const {user,setUser,loading,setLoading,isGuestSession,setIsGuestSession}=context;

    const handleLogin=async({email,password})=>{
        setLoading(true);
        try {
            
            const data=await login({email,password})
            sessionStorage.removeItem(GUEST_TOKEN_KEY);
            setUser(data.user);
            setIsGuestSession(false);
        } catch (error) {
            console.log("error in handleLogin context: ",error)
            
        }finally{

            setLoading(false);
        }
    }

    const handleRegister=async({username,email,password})=>{
        setLoading(true);
        try {
            
            const data=await register({username,email,password})
            sessionStorage.removeItem(GUEST_TOKEN_KEY);
            setUser(data.user);
            setIsGuestSession(false);
        } catch (error) {
            console.log("error in handleRegister context: ",error)
        }finally{
            setLoading(false);
            
        }
    }

    const handleLogout=async()=>{
        if (isGuestSession) {
            sessionStorage.removeItem(GUEST_TOKEN_KEY);
            setUser(null);
            setIsGuestSession(false);
            return;
        }

        setLoading(true);
        try {
            
            await logout();
            sessionStorage.removeItem(GUEST_TOKEN_KEY);
            setUser(null);
            setIsGuestSession(false);
        } catch (error) {
            console.log("error in handleLogout context: ",error)
        }finally{
            setLoading(false);
            
        }
    }

    const handleGuestLogin = async () => {
        setLoading(true);
        try {
            const token = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            sessionStorage.setItem(GUEST_TOKEN_KEY, token);
            setUser({
                _id: token,
                username: "Guest User",
                email: "",
                isGuest: true,
            });
            setIsGuestSession(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        const getAndSetUser=async()=>{
            const guestToken = sessionStorage.getItem(GUEST_TOKEN_KEY);

            if (guestToken) {
                setUser({
                    _id: guestToken,
                    username: "Guest User",
                    email: "",
                    isGuest: true,
                });
                setIsGuestSession(true);
                setLoading(false);
                return;
            }

            try {     
                const data=await getMe();
                setUser(data.user);
                setIsGuestSession(false);
            } catch (error) {
                console.log("error in useAuth: ",error)
                setUser(null);
            } finally{
                setLoading(false);

            }
        }

        getAndSetUser();

    },[setIsGuestSession,setLoading,setUser])

    return {user,loading,handleLogin,handleRegister,handleLogout,handleGuestLogin,isGuestSession}
}
