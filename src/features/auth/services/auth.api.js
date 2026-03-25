import axios from "axios";

const API_BASE_URL = "https://full-stack-gen-ai-job-preparation-web.onrender.com";

const api=axios.create({
    baseURL:API_BASE_URL,
    withCredentials:true
})

export async function register({username,email,password}){
    
    try {
        
        const response = await api.post("/api/auth/register",{
            username,email,password
        })

        return response.data;
    } catch (error) {
        console.log("Error in register function in authapi: ", error)
    }
}

export async function login({email,password}){
    
    try {
        
        const response = await api.post("/api/auth/login",{
            email,password
        })

        return response.data;
    } catch (error) {
        console.log("Error in login function in authapi: ", error)
        
    }
}

export async function logout(){
    try {
        const response=await api.get("/api/auth/logout")

        return response.data;
    } catch (error) {
        console.log("Error in logout function in authapi: ", error)
        
    }
}

export async function getMe(){
    try {
        const response=await api.get("/api/auth/get-me")
        return response.data;
        
    } catch (error) {
        console.log("Error in getMe function in authapi: ", error);
        
    }
}
