// Assurez-vous d'importer la bonne fonction
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

// Enregistrez les composants nécessaires de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const DocumentChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const getDocumentCounts = async () => {
      const documents = await fetchDocuments(); // Récupérez tous les documents

      // Comptez le nombre de documents par classification
      const classificationCounts: Record<string, number> = {};
      documents.forEach(doc => {
        const classification = doc.classification; // Assurez-vous que 'classification' est le bon champ
        classificationCounts[classification] = (classificationCounts[classification] || 0) + 1;
      });

      // Préparez les données pour le graphique
      const labels = Object.keys(classificationCounts);
      const data = Object.values(classificationCounts);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Nombre de Documents par Classification',
            data,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', '#9966FF'], // Couleurs pour le graphique
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', '#9966FF'],
          },
        ],
      });
    };

    getDocumentCounts();
  }, []);

  if (!chartData) {
    return <p>Chargement des données...</p>;
  }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false, // Permet de contrôler la taille
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="flex items-center justify-between m-5"> {/* Utilisation de Flexbox */}
      <div className="flex flex-col justify-center"> {/* Texte à gauche */}
        <h2 className="text-lg font-semibold">Distribution des Documents par Classification</h2>
      </div>
      <div className="w-1/2 h-full"> {/* Graphique à droite */}
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DocumentChart;
