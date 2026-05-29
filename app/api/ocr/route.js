import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    console.log('=== OCR Processing with Gemini Vision ===')
    console.log('API Key present:', !!process.env.GEMINI_API_KEY)
    console.log('API Key prefix:', process.env.GEMINI_API_KEY?.substring(0, 10))

    // Convert base64 to proper format for Gemini
    const base64Data = image.split(',')[1] || image
    
    // Use Gemini 2.5 Flash for OCR (latest multimodal model)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    const prompt = `Extract ALL text from this image. 
    
IMPORTANT:
- Read ALL text visible in the image
- Include questions and answers
- Maintain the original structure
- If there are multiple questions/answers, include all of them
- Return ONLY the extracted text, nothing else

If no text is found, return: "Tidak ada teks terdeteksi"`

    console.log('Sending request to Gemini...')
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      }
    ])

    const response = await result.response
    const text = response.text().trim()

    console.log('OCR Result length:', text.length)
    console.log('OCR Preview:', text.substring(0, 200))

    return NextResponse.json({
      text: text || 'Tidak ada teks terdeteksi',
      confidence: text.length > 10 ? 95 : 50,
      success: true
    })

  } catch (error) {
    console.error('OCR Error:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText
    })
    return NextResponse.json(
      { error: 'OCR processing failed', details: error.message },
      { status: 500 }
    )
  }
}
