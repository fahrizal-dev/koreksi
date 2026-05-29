'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState(null)

  const modes = [
    {
      id: 'romawi-2',
      title: 'Romawi II',
      description: 'Penilaian 3 tingkat',
      rules: [
        { label: 'Benar / Sesuai', value: '2' },
        { label: 'Kurang Tepat / Sebagian Benar', value: '1' },
        { label: 'Salah', value: '0' }
      ],
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'romawi-3',
      title: 'Romawi III',
      description: 'Penilaian 5 tingkat',
      rules: [
        { label: 'Sangat Benar', value: '4' },
        { label: 'Banyak Benar tapi Kurang Tepat', value: '3' },
        { label: 'Seimbang Benar dan Kurang Tepat', value: '2' },
        { label: 'Salah tapi Ada Jawaban', value: '1' },
        { label: 'Kosong / Salah Total', value: '0' }
      ],
      color: 'from-purple-600 to-pink-600'
    }
  ]

  const handleStart = () => {
    if (selectedMode) {
      router.push(`/camera?mode=${selectedMode}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Koreksi
          </h1>
          <p className="text-gray-400 text-lg">
            Koreksi jawaban siswa otomatis dengan AI
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Pilih Mode Penilaian
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {modes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`glass rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedMode === mode.id
                    ? 'ring-4 ring-indigo-500 shadow-2xl shadow-indigo-500/50'
                    : 'hover:shadow-xl'
                }`}
              >
                <div className={`bg-gradient-to-r ${mode.color} rounded-xl p-4 mb-4`}>
                  <h3 className="text-2xl font-bold text-white">{mode.title}</h3>
                  <p className="text-white/80 text-sm">{mode.description}</p>
                </div>

                <div className="space-y-2">
                  {mode.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-[#1a1a1a]/50 rounded-lg p-3"
                    >
                      <span className="text-sm text-gray-300">{rule.label}</span>
                      <span className="font-bold text-indigo-400">{rule.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={!selectedMode}
            className={`btn-primary text-xl ${
              !selectedMode ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {selectedMode ? 'Mulai Koreksi' : 'Pilih Mode Terlebih Dahulu'}
          </button>
        </div>

        {/* Info */}
        <div className="mt-12 glass rounded-xl p-6">
          <h3 className="font-semibold mb-3 text-indigo-400">Cara Menggunakan:</h3>
          <ol className="space-y-2 text-gray-300 text-sm">
            <li>1. Pilih mode penilaian (Romawi II atau III)</li>
            <li>2. Klik &quot;Mulai Koreksi&quot;</li>
            <li>3. Foto soal dan jawaban siswa</li>
            <li>4. AI akan membaca dan menilai otomatis</li>
            <li>5. Lihat hasil penilaian langsung</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
