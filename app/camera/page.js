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

  useEffect(() => {
    if (!mode) {
      router.push('/')
    }
  }, [mode, router])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsCameraActive(true)
      setError(null)
    } catch (err) {
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.')
      console.error('Camera error:', err)
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
    startCamera()
  }

  const goBack = () => {
    stopCamera()
    router.push('/')
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fullscreen camera view
  if (stream && !capturedImage) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goBack}
            className="glass rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors"
          >
            ← Kembali
          </button>
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-sm text-gray-400">Mode: </span>
            <span className="font-semibold text-indigo-400">
              {mode === 'romawi-2' ? 'Romawi II' : 'Romawi III'}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {capturedImage && (
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Gambar</h2>
                
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-auto"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={analyzeImage}
                    disabled={isProcessing}
                    className="btn-primary flex-1"
                  >
                    {isProcessing ? '⏳ Memproses...' : '🤖 Analisis AI'}
                  </button>
                  <button
                    onClick={reset}
                    disabled={isProcessing}
                    className="btn-secondary"
                  >
                    🔄
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="glass rounded-xl p-4 border-l-4 border-red-500 animate-fade-in">
                <p className="text-red-400">❌ {error}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isProcessing && (
              <div className="glass rounded-2xl p-8 text-center animate-fade-in">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-400 font-semibold mb-2">Sedang memproses gambar...</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📝 OCR membaca teks (2-5 detik)...</p>
                  <p>🤖 AI menganalisis jawaban (5-10 detik)...</p>
                </div>
              </div>
            )}

            {ocrResult && (
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-3 text-indigo-400">
                  📝 Hasil OCR
                </h3>
                <div className="bg-[#1a1a1a]/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {ocrResult.text || 'Tidak ada teks terdeteksi'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Confidence: {ocrResult.confidence}%
                </p>
              </div>
            )}

            {aiResult && (
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-indigo-400">
                  🤖 Hasil Analisis AI
                </h3>
                
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-4 text-center">
                  <p className="text-sm text-white/80 mb-2">Nilai Akhir</p>
                  <p className="text-6xl font-bold text-white">{aiResult.score}</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-[#1a1a1a]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Status Jawaban</p>
                    <p className="font-semibold text-white">{aiResult.status}</p>
                  </div>

                  <div className="bg-[#1a1a1a]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Tingkat Kecocokan</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                          style={{ width: `${aiResult.accuracy}%` }}
                        />
                      </div>
                      <span className="font-semibold text-white">{aiResult.accuracy}%</span>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Penjelasan AI</p>
                    <p className="text-sm text-gray-300">{aiResult.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {!capturedImage && !isProcessing && (
              <div className="glass rounded-xl p-6 animate-fade-in">
                <h3 className="font-semibold mb-3 text-indigo-400">💡 Tips:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Pastikan pencahayaan cukup</li>
                  <li>• Foto soal dan jawaban jelas</li>
                  <li>• Hindari bayangan pada kertas</li>
                  <li>• Tulisan harus terbaca</li>
                </ul>
              </div>
            )}
          </div>
        </div>
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
