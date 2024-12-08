// components/ui/DataTable.tsx

import React from 'react';

interface DocumentData {
  id: string;
  name: string;
  classification: string;
  createdAt: Date;
  url: string;
  type: string;
  size: number;
}

interface DataTableProps {
  documents: DocumentData[];
}

const DataTable: React.FC<DataTableProps> = ({ documents }) => {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Nom</th>
            <th className="border border-gray-300 p-2">Classification</th>
            <th className="border border-gray-300 p-2">Taille</th>
            <th className="border border-gray-300 p-2">Type</th>
            <th className="border border-gray-300 p-2">Date de Création</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc.id} className="border-b hover:bg-gray-100">
              <td className="border border-gray-300 p-2">{doc.name}</td>
              <td className="border border-gray-300 p-2">{doc.classification}</td>
              <td className="border border-gray-300 p-2">{doc.size} octets</td>
              <td className="border border-gray-300 p-2">{doc.type}</td>
              <td className="border border-gray-300 p-2">{doc.createdAt.toString()}</td>
              <td className="border border-gray-300 p-2">
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  Télécharger
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
