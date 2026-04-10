import React, { useRef, useState } from 'react';

const CameraCapture = ({ onCapture, disabled = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Open camera
  const openCamera = async () => {
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error('❌ Camera Error:', err);
      alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Close camera
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOpen(false);
    }
  };

  // Capture photo
  const capturePhoto = async () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);

      // Convert to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], `proof_${Date.now()}.jpg`, { type: 'image/jpeg' });

        // Close camera and pass file to parent
        closeCamera();
        onCapture(file);
      }, 'image/jpeg', 0.9);

    } catch (err) {
      console.error('❌ Capture Error:', err);
      alert('Gagal mengambil foto. Coba lagi.');
    }
  };

  return (
    <div className="camera-capture-container">
      {!isCameraOpen ? (
        <button
          onClick={openCamera}
          disabled={disabled || isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Membuka Kamera...' : '📷 Buka Kamera'}
        </button>
      ) : (
        <div className="camera-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={capturePhoto}
              className="btn btn-success flex-1"
            >
              📸 Jepret Foto
            </button>
            <button
              onClick={closeCamera}
              className="btn btn-secondary flex-1"
            >
              ✕ Tutup Kamera
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style>{`
        .camera-capture-container {
          width: 100%;
        }
        .camera-view {
          width: 100%;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        }
        .btn-success {
          background-color: #10b981;
          color: white;
        }
        .btn-success:hover:not(:disabled) {
          background-color: #059669;
        }
        .btn-secondary {
          background-color: #6b7280;
          color: white;
        }
        .btn-secondary:hover:not(:disabled) {
          background-color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default CameraCapture;
