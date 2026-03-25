import {getAllInterviewReports,getInterviewReportById,generateInterviewReport,generateResumePdf} from "../services/interview.api.js"
import {useContext,useEffect} from "react"
import { useCallback } from "react";
import {InterviewContext} from "../../interview/interview.context.jsx" 
import { useParams } from "react-router-dom"
// import { useNavigate } from "react-router-dom"

export const useInterview = () =>{

    const context=useContext(InterviewContext)  // Access the context value using useContext hook
    // const navigate = useNavigate();  // Access the navigate function using useNavigate hook
    const {interviewId}= useParams();

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

    const getReports = useCallback(async()=>{
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
    }, [setLoading, setReports])

    const getResumePdf = async(interviewReportId)=>{
        if (!interviewReportId) {
            alert("Interview report id is missing. Please regenerate the report and try again.");
            return;
        }

        setLoading(true);
        try {
            const response = await generateResumePdf({interviewReportId})
            const contentDisposition = response?.headers?.["content-disposition"] || "";

            const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i);
            const filename = filenameMatch?.[1] ? decodeURIComponent(filenameMatch[1]) : `resume_${interviewReportId}.pdf`;

            const blob = response.data instanceof Blob
                ? response.data
                : new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob)
            const link=document.createElement("a")
            link.href=url;
            link.setAttribute("download", filename)
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating resume PDF:", error);
            alert("Unable to download resume right now. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        let isMounted = true;

        const loadReport = async () => {
            if (!interviewId) {
                return;
            }

            setLoading(true);
            try {
                const response = await getInterviewReportById(interviewId);
                if (isMounted) {
                    setReport(response.interviewReport);
                }
            } catch (error) {
                console.log("error in useInterview: ", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadReport();

        return () => {
            isMounted = false;
        }
    },[interviewId,setLoading,setReport,setReports])

    return {loading, report, reports, generateReport, getReportById, getReports, getResumePdf}

}

