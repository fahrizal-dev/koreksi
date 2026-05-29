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
  const [manualText, setManualText] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

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
      stopCamera()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target.result)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  const preprocessImage = async (imageData) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        // Resize image untuk mempercepat OCR (max width 1200px)
        const maxWidth = 1200
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to grayscale untuk OCR lebih cepat
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          data[i] = data[i + 1] = data[i + 2] = gray
        }
        ctx.putImageData(imageData, 0, 0)
        
        // Return compressed image
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = imageData
    })
  }

  const analyzeImage = async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    setError(null)
    setOcrResult(null)
    setAiResult(null)

    try {
      // Preprocess image: resize untuk mempercepat OCR
      const processedImage = await preprocessImage(capturedImage)
      
      // Step 1: OCR
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: processedImage })
      })

      if (!ocrResponse.ok) {
        throw new Error('OCR gagal')
      }

      const ocrData = await ocrResponse.json()
      setOcrResult(ocrData)

      // Check if OCR failed to read text
      const cleanText = ocrData.text?.trim() || ''
      if (!cleanText || cleanText === 'Tidak ada teks terdeteksi' || cleanText.length < 3) {
        setError('OCR tidak dapat membaca teks. Silakan input manual atau coba gambar lain.')
        setIsProcessing(false)
        return
      }

      // Step 2: AI Analysis
      console.log('Sending to AI:', { text: cleanText, mode })
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
    setManualText('')
    setShowManualInput(false)
    startCamera()
  }

  const analyzeManual = async () => {
    if (!manualText.trim()) {
      setError('Silakan masukkan teks jawaban')
      return
    }

    setIsProcessing(true)
    setError(null)
    setAiResult(null)

    try {
      const aiResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: manualText,
          mode: mode
        })
      })

      if (!aiResponse.ok) {
        throw new Error('Analisis AI gagal')
      }

      const aiData = await aiResponse.json()
      setAiResult(aiData)
      setOcrResult({ text: manualText, confidence: 100 })

    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat analisis')
    } finally {
      setIsProcessing(false)
    }
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
          {/* Left Column - Camera/Image */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Kamera</h2>
              
              {!capturedImage ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={capturePhoto}
                      disabled={!stream}
                      className="btn-primary flex-1"
                    >
                      📸 Ambil Foto
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary flex-1"
                    >
                      📁 Upload
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-xl overflow-hidden">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <div className="flex gap-3">
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
            </div>

            {/* Error Display */}
            {error && (
              <div className="glass rounded-xl p-4 border-l-4 border-red-500 animate-fade-in">
                <p className="text-red-400">❌ {error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Processing Indicator */}
            {isProcessing && (
              <div className="glass rounded-2xl p-8 text-center animate-fade-in">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-400 font-semibold mb-2">Sedang memproses gambar...</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>⏳ Langkah 1: Preprocessing gambar...</p>
                  <p>📝 Langkah 2: OCR membaca teks (2-5 detik)...</p>
                  <p>🤖 Langkah 3: AI menganalisis jawaban (5-10 detik)...</p>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  Total waktu: ~7-15 detik
                </p>
              </div>
            )}

            {/* OCR Result */}
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

            {/* AI Result */}
            {aiResult && (
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-indigo-400">
                  🤖 Hasil Analisis AI
                </h3>
                
                {/* Score Display */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-4 text-center">
                  <p className="text-sm text-white/80 mb-2">Nilai Akhir</p>
                  <p className="text-6xl font-bold text-white">{aiResult.score}</p>
                </div>

                {/* Details */}
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

            {/* Instructions */}
            {!capturedImage && !isProcessing && (
              <div className="glass rounded-xl p-6 animate-fade-in">
                <h3 className="font-semibold mb-3 text-indigo-400">💡 Tips:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Pastikan pencahayaan cukup</li>
                  <li>• Foto soal dan jawaban dalam satu frame</li>
                  <li>• Hindari bayangan pada kertas</li>
                  <li>• Tulisan harus terbaca jelas</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
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
