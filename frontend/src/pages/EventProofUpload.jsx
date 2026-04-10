import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CameraCapture from '../components/CameraCapture';
import api from '../services/api';

const EventProofUpload = () => {
  const { eventId, registrationId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [eventStatus, setEventStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    checkEventStatus();
    const interval = setInterval(checkEventStatus, 1000);
    return () => clearInterval(interval);
  }, [eventId]);

  const checkEventStatus = async () => {
    try {
      const res = await api.get(`/event/${eventId}/status`);
      setEventStatus(res.data);
      setTimeRemaining(res.data.time_remaining_seconds);

      if (res.data.is_closed) {
        setError('⏰ Event sudah ditutup. Tidak bisa upload bukti lagi.');
      }
    } catch (err) {
      console.error('Error checking event status:', err);
    }
  };

  const handlePhotoCapture = (file) => {
    setPhotoFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!photoFile) {
      setError('Pilih atau jepret foto terlebih dahulu');
      return;
    }

    if (eventStatus?.is_closed) {
      setError('Event sudah ditutup. Tidak bisa upload.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('proof', photoFile);
      formData.append('event_id', eventId);
      formData.append('registration_id', registrationId);

      const res = await api.post(`/event/${eventId}/proof/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccess(true);
        setPhotoFile(null);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal upload bukti kehadiran');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'DITUTUP';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-3xl font-bold text-green-700 mb-2">📸 Bukti Kehadiran</h1>
          <p className="text-gray-600">Ambil foto untuk mengonfirmasi kehadiran Anda</p>
        </div>

        {/* Timer */}
        {eventStatus && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">⏰ Waktu Tersisa:</span>
              <span className={`text-lg font-bold ${eventStatus.is_closed ? 'text-red-600' : 'text-green-600'}`}>
                {formatTime(timeRemaining || 0)}
              </span>
            </div>
            {eventStatus.is_closed && (
              <div className="text-red-600 text-sm mt-2">Event telah ditutup</div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            ✅ Bukti kehadiran berhasil diupload! Terima kasih.
          </div>
        )}

        {/* Camera Component */}
        {!eventStatus?.is_closed && (
          <div className="bg-white rounded-lg p-6 shadow-lg mb-4">
            <CameraCapture
              onCapture={handlePhotoCapture}
              disabled={isUploading}
            />

            {photoFile && (
              <div className="mt-6">
                <div className="mb-4 text-center">
                  <img
                    src={URL.createObjectURL(photoFile)}
                    alt="Preview"
                    className="w-full max-h-64 rounded-lg object-cover"
                  />
                  <p className="text-sm text-gray-600 mt-2">Pratinjau foto</p>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {isUploading ? '⏳ Mengunggah...' : '✅ Konfirmasi Kehadiran'}
                </button>

                <button
                  onClick={() => setPhotoFile(null)}
                  className="w-full mt-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                >
                  🔄 Ambil Ulang
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Petunjuk:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Pastikan wajah terlihat jelas di foto</li>
            <li>✓ Ambil foto di tempat yang cukup cahaya</li>
            <li>✓ Hanya bisa upload sekali saja</li>
            <li>✓ Upload sebelum event ditutup</li>
          </ul>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition"
        >
          ← Kembali
        </button>
      </div>
    </div>
  );
};

export default EventProofUpload;
