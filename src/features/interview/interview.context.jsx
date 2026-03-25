import { createContext, useState } from "react";


export const InterviewContext = createContext()   // Create a context for interview-related state

export const InterviewProvider = ({children})=>{  // Create a provider component to wrap around parts of the app that need access to interview-related state
    const [loading,setLoading]= useState(false);
    const [report,setReport]= useState(null);
    const [reports,setReports] = useState([])

    const resetInterviewState = () => {
        setReport(null);
        setReports([]);
        setLoading(false);
    }

    return (
        //* Provide the loading state, current report, and list of reports to any child components that consume this context */
        <InterviewContext.Provider value={{loading,setLoading,report,setReport,reports,setReports,resetInterviewState}}>  
            {children}
        </InterviewContext.Provider>
    )
}
