import React, { useState } from 'react';
import api from '../../services/api';

const ExportButton = ({ eventId, format = 'excel' }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const endpoint = format === 'pdf'
        ? `/event/${eventId}/export/pdf`
        : `/event/${eventId}/export/excel`;

      const res = await api.get(endpoint, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      const filename = format === 'pdf'
        ? `Kehadiran_${eventId}_${Date.now()}.pdf`
        : `Kehadiran_${eventId}_${Date.now()}.xlsx`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Gagal export ke ${format.toUpperCase()}: ` + err.message);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const buttonText = format === 'pdf' ? '📄 PDF' : '📊 Excel';
  const bgColor = format === 'pdf' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`${bgColor} text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isExporting ? '⏳ Exporting...' : buttonText}
    </button>
  );
};

export default ExportButton;
