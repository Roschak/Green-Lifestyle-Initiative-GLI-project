import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const AdminAttendance = () => {
  const { eventId } = useParams();
  const [attendance, setAttendance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [eventStatus, setEventStatus] = useState(null);

  useEffect(() => {
    loadAttendance();
    checkEventStatus();
    const interval = setInterval(checkEventStatus, 1000);
    return () => clearInterval(interval);
  }, [eventId]);

  const checkEventStatus = async () => {
    try {
      const res = await api.get(`/event/${eventId}/status`);
      setEventStatus(res.data);
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const loadAttendance = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/event/${eventId}/attendance`);
      setAttendance(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data kehadiran');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      const res = await api.get(`/event/${eventId}/export/excel`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Kehadiran_${eventId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      alert('Gagal export ke Excel: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      const res = await api.get(`/event/${eventId}/export/pdf`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Kehadiran_${eventId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      alert('Gagal export ke PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'DITUTUP';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Memuat data kehadiran...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-red-50">
        <div className="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">Tidak ada data kehadiran</p>
        </div>
      </div>
    );
  }

  const attendanceRate = attendance.total > 0
    ? Math.round((attendance.attended_count / attendance.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-green-700 mb-2">📊 Dashboard Kehadiran</h1>
              <p className="text-gray-600">{attendance.event_title}</p>
            </div>
            <div className="text-right">
              {eventStatus && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">⏰ Waktu Tersisa</p>
                  <p className={`text-2xl font-bold ${eventStatus.is_closed ? 'text-red-600' : 'text-green-600'}`}>
                    {formatTime(eventStatus.time_remaining_seconds || 0)}
                  </p>
                </div>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${eventStatus?.is_closed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                {eventStatus?.is_closed ? 'DITUTUP' : 'AKTIF'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{attendance.total}</div>
            <p className="text-gray-600">Total Peserta</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{attendance.attended_count}</div>
            <p className="text-gray-600">Sudah Hadir</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{attendance.total - attendance.attended_count}</div>
            <p className="text-gray-600">Belum Hadir</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{attendanceRate}%</div>
            <p className="text-gray-600">Tingkat Kehadiran</p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            📊 Export Excel
          </button>
          <button
            onClick={exportToPDF}
            disabled={exporting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            📄 Export PDF
          </button>
          <button
            onClick={loadAttendance}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">No</th>
                  <th className="px-6 py-4 text-left">Nama</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Tipe</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-left">Waktu Upload</th>
                  <th className="px-6 py-4 text-center">Foto</th>
                </tr>
              </thead>
              <tbody>
                {attendance.data.map((item, idx) => (
                  <tr key={item.registration_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-gray-800">{idx + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.is_member
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                        {item.is_member ? 'Member' : 'Guest'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status === 'attended' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          ✓ Hadir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                          ✗ Belum Hadir
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.uploaded_at
                        ? new Date(item.uploaded_at).toLocaleString('id-ID')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.photo_url ? (
                        <a
                          href={item.photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          👁️ Lihat
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {attendance.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Belum ada peserta yang mendaftar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
