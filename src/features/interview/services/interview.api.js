import axios from "axios";

const GUEST_TOKEN_KEY = "temporary_guest_token";
const API_BASE_URL = "https://full-stack-gen-ai-job-preparation-web.onrender.com";

const api=axios.create({
    baseURL:API_BASE_URL,
    withCredentials:true,
})

api.interceptors.request.use((config) => {
    const guestToken = sessionStorage.getItem(GUEST_TOKEN_KEY);

    if (guestToken) {
        config.headers["x-guest-token"] = guestToken;
    }

    return config;
})

/**
 * @description service to generate interview report by sending job description, self description and resume file to the backend
 */
export const generateInterviewReport=async({jobDescription, selfDescription, resumeFile})=>{

    const formData=new FormData();  //to send file data from frontend to backend we have to use form data

    formData.append("jobDescription",jobDescription);
    formData.append("selfDescription",selfDescription);
    if (resumeFile) {
        formData.append("resume",resumeFile);
    }

    const response = await api.post("/api/interview", formData)

    return response.data;


}

/**
 * @description service to get interview report by interview id
 */
export const getInterviewReportById=async(interviewId)=>{
    const response =await api.get(`/api/interview/report/${interviewId}`)

    return response.data;
}

/**
 * @description service to get all interview reports of the logged in user
 */
export const getAllInterviewReports= async()=>{
    const response =await api.get("/api/interview/")

    return response.data;
}

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */

export const generateResumePdf=async({interviewReportId})=>{
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`,null,{
        responseType:"blob",
    })

    return response;
}