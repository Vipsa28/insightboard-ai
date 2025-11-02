"use client";

import UploadCSV from "@/components/UploadCSV";
import ChartDisplay from "@/components/ChartDisplay";
import dynamic from "next/dynamic";
import DownloadReport from "@/components/DownloadReport";

// ⬇️ Dynamically import AIAssistant to disable SSR
const AIAssistant = dynamic(() => import("@/components/AIAssistant"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">
        InsightBoard.AI 📊
      </h1>

      <section className="mb-6">
        <UploadCSV />
      </section>

      <section className="mb-6">
        <ChartDisplay />
        <DownloadReport />
      </section>

      {/* ✅ Hydration-safe dynamic load for browser-only AIAssistant */}
      <section className="mb-6">
        <AIAssistant />
      </section>
    </main>
  );
}
