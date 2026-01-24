import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Set worker source to local worker (not CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

/**
 * Extract full text from a PDF file in the browser
 * @param file - PDF file from input element
 * @returns Promise<string> - Full text content of the PDF
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  console.log('📄 Starting PDF text extraction for:', file.name)
  
  // Convert file to ArrayBuffer
  const buffer = await file.arrayBuffer()
  console.log('✅ File converted to ArrayBuffer:', buffer.byteLength, 'bytes')
  
  // Load PDF document
  const loadingTask = pdfjsLib.getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  console.log('✅ PDF loaded successfully. Pages:', pdf.numPages)
  
  let fullText = ''
  
  // Extract text from each page
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    console.log(`📖 Extracting text from page ${pageNum}/${pdf.numPages}...`)
    
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    
    // Join all text items with spaces
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    
    console.log(`✅ Page ${pageNum} extracted: ${pageText.length} characters`)
    fullText += pageText + '\n'
  }
  
  console.log('✅ Total text extracted:', fullText.length, 'characters')
  return fullText.trim()
}
