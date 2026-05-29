import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { text, mode } = await request.json()
    
    console.log('=== AI Analysis Request ===')
    console.log('Text length:', text?.length)
    console.log('Text preview:', text?.substring(0, 200))
    console.log('Mode:', mode)

    if (!text || !mode) {
      return NextResponse.json(
        { error: 'Text and mode are required' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Handle empty or invalid text
    if (text === 'Tidak ada teks terdeteksi' || text.trim().length < 3) {
      return NextResponse.json({
        score: 0,
        accuracy: 0,
        status: 'Tidak Ada Jawaban',
        explanation: 'OCR tidak dapat membaca teks dari gambar. Pastikan gambar jelas dan tulisan terbaca.',
        success: true
      })
    }

    // Define grading rules based on mode
    const gradingRules = mode === 'romawi-2' 
      ? `Mode Penilaian: Romawi II (3 tingkat)
- Nilai 2: Jawaban benar/sesuai dengan kunci jawaban (kecocokan 80-100%)
- Nilai 1: Jawaban kurang tepat/sebagian benar (kecocokan 40-79%)
- Nilai 0: Jawaban salah (kecocokan 0-39%)`
      : `Mode Penilaian: Romawi III (5 tingkat)
- Nilai 4: Sangat benar, jawaban sempurna (kecocokan 90-100%)
- Nilai 3: Banyak benar tapi kurang tepat (kecocokan 70-89%)
- Nilai 2: Seimbang antara benar dan kurang tepat (kecocokan 50-69%)
- Nilai 1: Salah tetapi masih ada jawaban (kecocokan 20-49%)
- Nilai 0: Kosong atau salah total (kecocokan 0-19%)`

    // Create AI prompt
    const prompt = `Kamu adalah asisten AI untuk mengoreksi jawaban siswa.

${gradingRules}

INSTRUKSI PENTING:
1. Analisis jawaban siswa dengan memahami MAKNA dan KONTEKS, bukan hanya mencocokkan kata
2. Terima sinonim, parafrase, dan penjelasan dengan kata-kata berbeda
3. Fokus pada pemahaman konsep, bukan hafalan kata per kata
4. Berikan penilaian yang adil dan objektif

TEKS DARI OCR (berisi soal dan jawaban siswa):
${text}

Tugas kamu:
1. Identifikasi soal dan jawaban siswa dari teks OCR
2. Analisis pemahaman siswa terhadap materi
3. Tentukan tingkat kecocokan jawaban (0-100%)
4. Berikan nilai sesuai mode penilaian
5. Berikan penjelasan singkat

Berikan response dalam format JSON:
{
  "score": <nilai_akhir>,
  "accuracy": <persentase_kecocokan>,
  "status": "<kategori_jawaban>",
  "explanation": "<penjelasan_singkat>"
}

Contoh status: "Sangat Benar", "Benar Sebagian", "Kurang Tepat", "Salah", "Kosong"

PENTING: Berikan response HANYA dalam format JSON yang valid, tanpa markdown atau teks tambahan.
`

    // Call Gemini API
    console.log('Calling Gemini API...')
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text_response = response.text()
    
    console.log('Gemini raw response:', text_response)
    
    // Parse JSON response (remove markdown if present)
    const jsonText = text_response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysisResult = JSON.parse(jsonText)

    console.log('Parsed analysis result:', analysisResult)

    return NextResponse.json({
      score: analysisResult.score,
      accuracy: analysisResult.accuracy,
      status: analysisResult.status,
      explanation: analysisResult.explanation,
      success: true
    })

  } catch (error) {
    console.error('=== Gemini Analysis Error ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'AI analysis failed', 
        details: error.message,
        hint: 'Cek console server untuk detail error'
      },
      { status: 500 }
    )
  }
}
