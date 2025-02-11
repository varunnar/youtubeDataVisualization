
import { GoogleGenerativeAI } from "@google/generative-ai";
import {useState} from "react";
//const { GoogleGenerativeAI } = require("@google/generative-ai");
//import GoogleGenerativeAI from "@google/generative-ai";

function Gemini({messaging, data}) {
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchSum = async () => {
        try {
            const text_prompt = `${messaging}: ${data}. Keep your response under 300 characters`;
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_API);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            setLoading(true);
            const result = await model.generateContent(text_prompt);
            console.log(result.response.text());
            setSummary(result.response.text());
        } catch (error) {  
            console.error("Error fetching summary:", error);
            setSummary("Failed to fetch summary.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="button_centered">
            <button
                onClick={fetchSum}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                disabled={loading}
            >{loading ? "Loading..." : "Generate Summary"}</button>
            <p>{summary || "Click to generate a summary!"}</p>
        </div>
    )
} 

export default Gemini;