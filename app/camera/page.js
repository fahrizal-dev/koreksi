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
  const cropCanvasRef = useRef(null)
  
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [error, setError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [showCrop, setShowCrop] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 })

  useEffect(() => {
    if (!mode) {
      router.push('/')
    }
  }, [mode, router])

  const startCamera = async () => {
    try {
      setError(null)
      console.log('Starting camera...')
      
      // Request high quality camera with flash support
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      console.log('Camera granted')
      
      // Check if flash is available
      const track = mediaStream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      if (capabilities.torch) {
        setHasFlash(true)
        console.log('Flash available')
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play()
            console.log('Video playing')
            setCameraReady(true)
          } catch (e) {
            console.error('Play error:', e)
            setCameraReady(true)
          }
        }
      }
      
    } catch (err) {
      console.error('Camera error:', err)
      setError('Tidak dapat mengakses kamera. Gunakan tombol Upload.')
    }
  }

  const toggleFlash = async () => {
    if (!stream || !hasFlash) return
    
    try {
      const track = stream.getVideoTracks()[0]
      await track.applyConstraints({
        advanced: [{ torch: !flashOn }]
      })
      setFlashOn(!flashOn)
    } catch (err) {
      console.error('Flash error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setCameraReady(false)
      setFlashOn(false)
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
      
      const imageData = canvas.toDataURL('image/jpeg', 0.95)
      setCapturedImage(imageData)
      setShowCrop(true)
      stopCamera()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target.result)
        setShowCrop(true)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  const applyCrop = () => {
    if (!capturedImage || !cropCanvasRef.current) return
    
    const img = new Image()
    img.onload = () => {
      const canvas = cropCanvasRef.current
      const scaleX = img.width / 100
      const scaleY = img.height / 100
      
      canvas.width = cropArea.width * scaleX
      canvas.height = cropArea.height * scaleY
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )
      
      const croppedImage = canvas.toDataURL('image/jpeg', 0.95)
      setCapturedImage(croppedImage)
      setShowCrop(false)
    }
    img.src = capturedImage
  }

  const skipCrop = () => {
    setShowCrop(false)
  }

  const analyzeImage = async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    setError(null)
    setOcrResult(null)
    setAiResult(null)

    try {
      console.log('Starting OCR...')
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage })
      })

      if (!ocrResponse.ok) {
        const errorData = await ocrResponse.json()
        throw new Error(errorData.error || 'OCR gagal')
      }

      const ocrData = await ocrResponse.json()
      console.log('OCR Result:', ocrData)
      setOcrResult(ocrData)

      const cleanText = ocrData.text?.trim() || ''
      if (!cleanText || cleanText === 'Tidak ada teks terdeteksi' || cleanText.length < 3) {
        setError('OCR tidak dapat membaca teks. Silakan coba gambar lain yang lebih jelas.')
        setIsProcessing(false)
        return
      }

      console.log('Starting AI analysis...')
      const aiResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          mode: mode
        })
      })

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json()
        throw new Error(errorData.error || 'Analisis AI gagal')
      }

      const aiData = await aiResponse.json()
      console.log('AI Result:', aiData)
      setAiResult(aiData)

    } catch (err) {
      console.error('Analysis error:', err)
      setError(err.message || 'Terjadi kesalahan saat memproses gambar')
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setCapturedImage(null)
    setOcrResult(null)
    setAiResult(null)
    setError(null)
    setShowCrop(false)
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

  // Show crop interface
  if (showCrop && capturedImage) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="relative w-full h-full">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
          
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <h3 className="text-white text-center font-semibold">
              ✂️ Crop Gambar (Opsional)
            </h3>
            <p className="text-white/70 text-center text-sm mt-1">
              Fokuskan ke area jawaban siswa
            </p>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
            <div className="flex gap-3">
              <button
                onClick={skipCrop}
                className="flex-1 bg-gray-700 text-white py-4 rounded-xl font-semibold"
              >
                Lewati Crop
              </button>
              <button
                onClick={applyCrop}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-semibold"
              >
                ✂️ Crop & Lanjut
              </button>
            </div>
            <p className="text-white/50 text-center text-xs mt-3">
              Fitur crop sederhana - akan ditingkatkan
            </p>
          </div>
        </div>
        <canvas ref={cropCanvasRef} className="hidden" />
      </div>
    )
  }

  // Show camera
  if (!capturedImage) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {!cameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-white">Membuka kamera...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center max-w-md p-6">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-white text-lg mb-4">{error}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors w-full"
              >
                📁 Pilih Foto dari Galeri
              </button>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div className="p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto">
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

          <div className="mt-auto p-6 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/20 backdrop-blur-sm text-white rounded-full p-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <button
                onClick={capturePhoto}
                disabled={!cameraReady}
                className="bg-white rounded-full p-2 disabled:opacity-50"
              >
                <div className="w-16 h-16 rounded-full border-4 border-black"></div>
              </button>

              {hasFlash && (
                <button
                  onClick={toggleFlash}
                  className={`rounded-full p-4 transition-colors ${
                    flashOn ? 'bg-yellow-500' : 'bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              )}
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
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }

  // Show captured image and results
  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/90 to-transparent">
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

      <div className="pt-20 pb-6 px-4">
        <div className="space-y-4">
          <div className="w-full">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-auto rounded-lg"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={analyzeImage}
              disabled={isProcessing}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isProcessing ? '⏳ Memproses...' : '🤖 Analisis AI'}
            </button>
            <button
              onClick={reset}
              disabled={isProcessing}
              className="bg-gray-700 text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-600 disabled:opacity-50"
            >
              🔄
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
              <p className="text-red-200">❌ {error}</p>
            </div>
          )}

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
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
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
      </div>
    </div>
  )
}

export default function CameraPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="spinner"></div>
      </div>
    }>
      <CameraContent />
    </Suspense>
  )
}
