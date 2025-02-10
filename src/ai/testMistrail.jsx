import { useState } from "react";
import { HfInference } from "@huggingface/inference";

function HuggingFaceMistral({messaging, data}) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Example YouTube JSON data

  const fetchSummary = async () => {
    setLoading(true);

    try {

      console.log("token", import.meta.env.VITE_HUGGING_FACE_TOKEN);
      // Convert JSON to a readable string format

      const client = new HfInference(import.meta.env.VITE_HUGGING_FACE_TOKEN);
      const chatCompletion = await client.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          {
            role: "user",
            content: `${messaging}: ${data}`
          }
        ],
        provider: "together",
        max_tokens: 500
      });

      // const response = await fetch(
      //   "https://api-inference.huggingface.co/models/google/gemma-2-2b-it",
      //   {
      //     method: "POST",
      //     headers: {
      //       Authorization: `Bearer ${import.meta.env.VITE_HUGGING_FACE_TOKEN}`,
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       inputs: `Summarize the following data: ${jsonString}`,
      //       // parameters: { max_new_tokens: 150 }, // Adjust token limit as needed
      //     }),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      // console.log("response", response);
      // const results  = await response.json();
      // console.log("response", results[0]);

      console.log("chatCompletion", chatCompletion);

      setSummary(chatCompletion.choices[0].message.content || "No summary available.");
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary("Failed to fetch summary.");
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-lg font-semibold">YouTube Trend Summary</h2>
      <button
        onClick={fetchSummary}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Loading..." : "Generate Summary"}
      </button>
      <p className="mt-4 text-gray-700 whitespace-pre-line">{summary || "Click to generate a summary!"}</p>
    </div>
  );
};

export default HuggingFaceMistral;
