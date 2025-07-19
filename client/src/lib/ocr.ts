import { createWorker } from 'tesseract.js';

export class OCRError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OCRError';
  }
}

export async function extractOdometerReading(imageData: string): Promise<number | null> {
  try {
    const worker = await createWorker('eng', 1, {
      logger: m => console.log(m)
    });
    
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789.',
      tessedit_pageseg_mode: '8', // Single word
    });
    
    const { data: { text } } = await worker.recognize(imageData);
    await worker.terminate();
    
    // Extract numbers from the text
    const numbers = text.match(/\d+/g);
    if (!numbers || numbers.length === 0) {
      return null;
    }
    
    // Find the largest number (likely to be the odometer reading)
    const readings = numbers.map(num => parseInt(num, 10)).filter(num => num > 0);
    if (readings.length === 0) {
      return null;
    }
    
    return Math.max(...readings);
  } catch (error) {
    console.error('OCR Error:', error);
    throw new OCRError('Failed to process image');
  }
}
