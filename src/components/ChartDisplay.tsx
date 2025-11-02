"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ChartDisplay() {
  const [chartData, setChartData] = useState<any>(null);
  const [chartTitle, setChartTitle] = useState("Chart Preview");
  const [numericKeys, setNumericKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");

  const generateChart = (columnToUse?: string) => {
    const storedData = localStorage.getItem("csvData");
    if (!storedData) return;

    const parsed = JSON.parse(storedData);
    if (parsed.length === 0) return;

    const numericCols = Object.keys(parsed[0]).filter(
      (key) => !isNaN(Number(parsed[0][key]))
    );

    if (numericCols.length === 0) return;
    setNumericKeys(numericCols);

    const yKey = columnToUse || selectedKey || numericCols[0];
    const xKey = Object.keys(parsed[0])[0]; 
    const grouped: Record<string, number> = {};
    parsed.forEach((row: any) => {
      const label = row[xKey];
      const value = Number(row[yKey]);
      grouped[label] = (grouped[label] || 0) + value;
    });

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    setChartTitle(`${yKey} by ${xKey}`);
    setChartData({
      labels,
      datasets: [
        {
          label: `${yKey}`,
          data: values,
          backgroundColor: "rgba(99, 102, 241, 0.6)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 1,
        },
      ],
    });
  };

  // 💡 Auto-clear old CSV data when page is freshly reloaded or reopened
  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries[0]?.type === "reload" || navEntries[0]?.type === "navigate") {
      localStorage.removeItem("csvData");
      localStorage.removeItem("csvFileName");
      const event = new Event("csvDataUpdated");
      window.dispatchEvent(event);
      setChartData(null); // ensure chart visually resets
    }
  }, []);

  // Load initially and on CSV updates
  useEffect(() => {
    generateChart();

    const handleCSVUpdate = () => generateChart();
    window.addEventListener("csvDataUpdated", handleCSVUpdate);
    return () => window.removeEventListener("csvDataUpdated", handleCSVUpdate);
  }, []);

  // Update when user changes dropdown
  useEffect(() => {
    if (selectedKey) generateChart(selectedKey);
  }, [selectedKey]);

  // 💡 Add manual reset handler
  const handleReset = () => {
    localStorage.removeItem("csvData");
    localStorage.removeItem("csvFileName");
    setChartData(null);
    setNumericKeys([]);
    setSelectedKey("");
    const event = new Event("csvDataUpdated");
    window.dispatchEvent(event);
  };

  if (!chartData) {
    return (
      <Card className="p-4 bg-white shadow-sm">
        <p className="text-gray-500">📊 Upload a CSV to see your chart here</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{chartTitle}</h2>

        <div className="flex gap-2 items-center">
          {numericKeys.length > 1 && (
            <Select
              onValueChange={(val) => {
                setSelectedKey(val);
                generateChart(val);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Column" />
              </SelectTrigger>
              <SelectContent>
                {numericKeys.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 💡 Add Reset Button */}
          <Button
            variant="outline"
            className="text-xs"
            onClick={handleReset}
          >
            🔄 Reset
          </Button>
        </div>
      </div>

      {/* 🧱 FIXED HEIGHT CONTAINER */}
      <div style={{ height: "400px", width: "100%" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: { position: "top" as const },
              title: { display: true, text: chartTitle },
            },
            scales: {
              y: { beginAtZero: true },
            },
          }}
        />
      </div>
    </Card>
  );
}
