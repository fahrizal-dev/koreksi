'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function CameraContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get('mode')
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [error, setError] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoadingCamera, setIsLoadingCamera] = useState(true)

  useEffect(() => {
    if (!mode) {
      router.push('/')
    }
    
    // Check HTTPS requirement
    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1'
      
      if (!isSecure) {
        console.warn('Camera requires HTTPS or localhost')
      }
    }
  }, [mode, router])

  const startCamera = async () => {
    try {
      setIsLoadingCamera(true)
      setError(null)
      
      console.log('Requesting camera access...')
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses kamera')
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      console.log('Camera access granted', mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          videoRef.current.play()
            .then(() => {
              console.log('Video playing successfully')
              setIsCameraActive(true)
              setIsLoadingCamera(false)
            })
            .catch(err => {
              console.error('Video play error:', err)
              setIsCameraActive(true)
              setIsLoadingCamera(false)
            })
        }
        
        // Fallback timeout
        setTimeout(() => {
          if (!isCameraActive) {
            console.log('Forcing camera active state')
            setIsCameraActive(true)
            setIsLoadingCamera(false)
          }
        }, 5000)
      } else {
        setStream(mediaStream)
        setIsCameraActive(true)
        setIsLoadingCamera(false)
      }
      
    } catch (err) {
      console.error('Camera error:', err)
      setIsLoadingCamera(false)
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Kamera tidak ditemukan. Gunakan tombol Upload untuk memilih foto.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain dan coba lagi.')
      } else if (err.message.includes('tidak mendukung')) {
        setError('Browser tidak mendukung akses kamera. Gunakan Chrome, Firefox, atau Safari terbaru.')
      } else {
        setError('Tidak dapat mengakses kamera. Pastikan Anda menggunakan HTTPS atau localhost.')
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      setCapturedImage(imageData)
      setIsCameraActive(false)
      stopCamera()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target.result)
        setIsCameraActive(false)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    setError(null)
    setOcrResult(null)
    setAiResult(null)

    try {
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage })
      })

      if (!ocrResponse.ok) {
        throw new Error('OCR gagal')
      }

      const ocrData = await ocrResponse.json()
      setOcrResult(ocrData)

      const cleanText = ocrData.text?.trim() || ''
      if (!cleanText || cleanText === 'Tidak ada teks terdeteksi' || cleanText.length < 3) {
        setError('OCR tidak dapat membaca teks. Silakan coba gambar lain.')
        setIsProcessing(false)
        return
      }

      const aiResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          mode: mode
        })
      })

      if (!aiResponse.ok) {
        throw new Error('Analisis AI gagal')
      }

      const aiData = await aiResponse.json()
      setAiResult(aiData)

    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memproses gambar')
      console.error('Analysis error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setCapturedImage(null)
    setOcrResult(null)
    setAiResult(null)
    setError(null)
    // Camera will auto-start from useEffect
  }

  const goBack = () => {
    stopCamera()
    router.push('/')
  }

  useEffect(() => {
    if (!capturedImage) {
      startCamera()
    }
    return () => stopCamera()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage])

  // Camera loading or error - show fallback
  if (!capturedImage && !stream) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="text-white bg-black/50 rounded-full px-4 py-2"
            >
              ← Kembali
            </button>
            <div className="bg-black/50 rounded-full px-4 py-2">
              <span className="text-white text-sm font-semibold">
                {mode === 'romawi-2' ? 'Romawi II' : 'Romawi III'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          {isLoadingCamera && !error ? (
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-white text-lg mb-2">Membuka kamera...</p>
              <p className="text-white/60 text-sm">Izinkan akses kamera jika diminta</p>
            </div>
          ) : error ? (
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-white text-lg mb-4">{error}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                📁 Pilih Foto dari Galeri
              </button>
              <button
                onClick={startCamera}
                className="mt-3 bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors block w-full"
              >
                🔄 Coba Lagi
              </button>
            </div>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    )
  }

  // Fullscreen camera view
  if (isCameraActive && stream && !capturedImage) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(1)' }}
        />
        
        {/* Controls */}
        <div className="absolute inset-0 flex flex-col">
          <div className="p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <button
                onClick={goBack}
                className="text-white bg-black/50 rounded-full px-4 py-2 hover:bg-black/70 transition-colors"
              >
                ← Kembali
              </button>
              <div className="bg-black/50 rounded-full px-4 py-2">
                <span className="text-white text-sm font-semibold">
                  {mode === 'romawi-2' ? 'Romawi II' : 'Romawi III'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/20 backdrop-blur-sm text-white rounded-full p-4 hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <button
                onClick={capturePhoto}
                disabled={!stream}
                className="bg-white rounded-full p-2 hover:bg-gray-200 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <div className="w-16 h-16 rounded-full border-4 border-black"></div>
              </button>

              <div className="w-14 h-14"></div>
            </div>
            
            <p className="text-white text-center mt-4 text-sm">
              Foto soal dan jawaban siswa
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="text-white bg-black/50 rounded-full px-4 py-2 hover:bg-black/70 transition-colors"
          >
            ← Kembali
          </button>
          <div className="bg-black/50 rounded-full px-4 py-2">
            <span className="text-white text-sm font-semibold">
              {mode === 'romawi-2' ? 'Romawi II' : 'Romawi III'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-6 px-4">
        {capturedImage && (
          <div className="space-y-4">
            {/* Foto Fullscreen */}
            <div className="w-full">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={analyzeImage}
                disabled={isProcessing}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '⏳ Memproses...' : '🤖 Analisis AI'}
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="bg-gray-700 text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                🔄
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
                <p className="text-red-200">❌ {error}</p>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="bg-gray-900/90 rounded-xl p-6 text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-white font-semibold mb-2">Sedang memproses...</p>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>📝 OCR membaca teks...</p>
                  <p>🤖 AI menganalisis jawaban...</p>
                </div>
              </div>
            )}

            {/* OCR Result */}
            {ocrResult && (
              <div className="bg-gray-900/90 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3 text-indigo-400">
                  📝 Teks Terbaca
                </h3>
                <div className="bg-black/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {ocrResult.text || 'Tidak ada teks terdeteksi'}
                  </p>
                </div>
              </div>
            )}

            {/* AI Result */}
            {aiResult && (
              <div className="bg-gray-900/90 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 text-indigo-400">
                  🤖 Hasil Penilaian
                </h3>
                
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-4 text-center">
                  <p className="text-sm text-white/80 mb-2">Nilai Akhir</p>
                  <p className="text-6xl font-bold text-white">{aiResult.score}</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-black/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <p className="font-semibold text-white">{aiResult.status}</p>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-2">Kecocokan</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${aiResult.accuracy}%` }}
                        />
                      </div>
                      <span className="font-semibold text-white">{aiResult.accuracy}%</span>
                    </div>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-2">Penjelasan</p>
                    <p className="text-sm text-gray-300">{aiResult.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CameraPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <CameraContent />
    </Suspense>
  )
}
