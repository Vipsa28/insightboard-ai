"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  // ✅ auto-fill text box as you speak
  useEffect(() => {
    if (transcript) {
      setPrompt(transcript);
    }
  }, [transcript]);

  const handleAsk = async () => {
    const data = JSON.parse(localStorage.getItem("csvData") || "[]");
    const userQuery = prompt || transcript;

    if (!userQuery) {
      alert("Please type or speak a question!");
      return;
    }

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userQuery, data }),
    });

    const json = await res.json();
    setResponse(json.result);
    resetTranscript();
  };

  if (!browserSupportsSpeechRecognition) {
    return <p className="text-red-500">❌ Browser does not support voice input. Use Chrome.</p>;
  }

  return (
    <Card className="p-4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Ask InsightBoard.AI 💬</h2>

      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Ask e.g. Which category has highest profit?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handleAsk}>Ask</Button>
       <Button
  onClick={() => {
    if (listening) {
      // 👇 Stop listening if already active
      SpeechRecognition.stopListening();
      resetTranscript();
    } else {
      // 👇 Start listening (and auto-stop after 6s)
      SpeechRecognition.startListening({
        continuous: false,
        language: "en-US",
      });
      // auto stop after 6 seconds
      setTimeout(() => {
        SpeechRecognition.stopListening();
      }, 6000);
    }
  }}
>
  {listening ? "🟥 Stop Listening" : "🎙️ Voice Input"}
</Button>
      </div>

      {response && (
  <div id="ai-response" className="bg-gray-50 p-3 rounded-md text-gray-700">
    <strong>AI:</strong> {response}
  </div>
)}
    </Card>
  );
}
