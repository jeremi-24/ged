'use client';

import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { fetchDocuments } from '@/lib/services/CRUD/fetchDocument';
import { DocumentData } from "@/types/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DocumentChartProps {
  docs?: DocumentData[];
}

const DocumentChart: React.FC<DocumentChartProps> = ({ docs }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const processData = (documents: DocumentData[]) => {
      
      const classificationCounts: Record<string, number> = {};
      documents.forEach(doc => {
        const classification = doc.classification || 'Sans classification';
        classificationCounts[classification] = (classificationCounts[classification] || 0) + 1;
      });

      const labels = Object.keys(classificationCounts);
      const data = Object.values(classificationCounts);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Documents',
            data,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)', 
              'rgba(16, 185, 129, 0.8)', 
              'rgba(245, 158, 11, 0.8)', 
              'rgba(239, 68, 68, 0.8)',  
              'rgba(139, 92, 246, 0.8)', 
              'rgba(236, 72, 153, 0.8)', 
            ],
            borderWidth: 0,
            hoverOffset: 10
          },
        ],
      });
    };

    if (docs && docs.length > 0) {
      processData(docs);
    } else {
      const getDocs = async () => {
        const documents = await fetchDocuments();
        processData(documents);
      };
      getDocs();
    }
  }, [docs]);

  if (!chartData) {
    return <p>Chargement des données...</p>;
  }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        displayColors: false,
        callbacks: {
          label: (tooltipItem) => {
            return ` ${tooltipItem.label}: ${tooltipItem.raw} documents`;
          },
        },
      },
    },
  };

  return (
    <div className="h-[300px] w-full flex flex-col">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <div className="w-2 h-6 bg-primary rounded-full" />
        Distribution par Classification
      </h2>
      <div className="flex-1 min-h-0">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DocumentChart;
