
import React from 'react';
import { CsvData } from '../types';

interface DataTableProps {
  csvData: CsvData | null;
}

export const DataTable: React.FC<DataTableProps> = ({ csvData }) => {
  if (!csvData) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg bg-slate-800/50 border border-slate-700/60">
        <p className="text-slate-500">Upload a CSV to see a data preview</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto rounded-lg bg-slate-950/50 border border-slate-700/60 custom-scrollbar">
      <table className="min-w-full text-sm text-left text-slate-400">
        <thead className="text-xs text-slate-300 uppercase bg-slate-800 sticky top-0">
          <tr>
            {csvData.headers.map((header) => (
              <th key={header} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {csvData.data.slice(0, 100).map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-slate-900 border-b border-slate-800 hover:bg-slate-800/50">
              {csvData.headers.map((header, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`} className="px-4 py-2 whitespace-nowrap">
                  {String(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
