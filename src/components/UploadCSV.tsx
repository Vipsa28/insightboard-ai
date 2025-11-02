"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function UploadCSV() {
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
        localStorage.setItem("csvData", JSON.stringify(result.data));

        // ✅ Dispatch a custom event to notify other components
        window.dispatchEvent(new Event("csvDataUpdated"));

        alert("✅ CSV uploaded and stored successfully!");
      },
    });
  };

  return (
    <Card className="p-4 shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Upload CSV File</h2>
      <Input type="file" accept=".csv" onChange={handleFileUpload} />
      {fileName && (
        <p className="mt-2 text-sm text-gray-600">📁 Uploaded: {fileName}</p>
      )}
    </Card>
  );
}
