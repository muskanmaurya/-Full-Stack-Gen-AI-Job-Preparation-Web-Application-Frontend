import {getAllInterviewReports,getInterviewReportById,generateInterviewReport} from "../services/interview.api.js"
import {useContext} from "react"
import {InterviewContext} from "../../interview/interview.context.jsx" 
// import { useNavigate } from "react-router-dom"

export const useInterview = () =>{

    const context=useContext(InterviewContext)  // Access the context value using useContext hook
    // const navigate = useNavigate();  // Access the navigate function using useNavigate hook

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading,setLoading,report,setReport,reports,setReports} = context;  // Destructure the context value to get the state and functions

    const generateReport = async ({jobDescription, selfDescription, resumeFile})=>{  // Function to generate interview report
        setLoading(true);
        let response = null;
        try{
            response = await generateInterviewReport({jobDescription, selfDescription, resumeFile})  // Call the API function to generate interview report
            setReport(response.interviewReport)  
        }catch(error){
            console.log("error in useInterview: ", error);
            const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
            throw new Error(apiMessage || error.message || "Failed to generate interview report");
        }finally{
            setLoading(false);
        }

        return response?.interviewReport || null;
    }

    const getReportById = async(interviewId)=>{   // Function to get interview report by ID
        setLoading(true);
        let response =null;
        try {
            response = await getInterviewReportById(interviewId);  // Call the API function to get interview report by ID
            setReport(response.interviewReport);
        } catch (error) {
            console.log("error in useInterview: ", error);
            const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
            throw new Error(apiMessage || error.message || "Failed to fetch interview report");
        } finally {
            setLoading(false);
        }

        return response?.interviewReport || null;
    }

    const getReports = async()=>{
        setLoading(true);
        let response =null;
        try {
            response = await getAllInterviewReports();
            setReports(response.interviewReports);
            
        } catch (error) {
            console.log("error in useInterview: ", error);
            const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
            throw new Error(apiMessage || error.message || "Failed to fetch interview reports");
        } finally {
            setLoading(false);
        }

        return response?.interviewReports || [];
    }

    return {loading, report, reports, generateReport, getReportById, getReports}

}

