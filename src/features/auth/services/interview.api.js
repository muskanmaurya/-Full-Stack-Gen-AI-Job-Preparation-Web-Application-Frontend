import axios from "axios";

const api=axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true,
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

