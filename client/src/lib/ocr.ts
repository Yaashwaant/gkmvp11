import { createWorker } from 'tesseract.js';

export class OCRError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OCRError';
  }
}

export interface OCRResult {
  reading: number | null;
  confidence: number;
  rawText: string;
  detectedNumbers: number[];
  processingTime: number;
}

export async function extractOdometerReading(imageData: string): Promise<OCRResult> {
  const startTime = Date.now();
  
  try {
    const worker = await createWorker('eng', 1, {
      logger: m => console.log(m)
    });
    
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789.',
      tessedit_pageseg_mode: '7', // Single text line
      tessedit_ocr_engine_mode: '2', // LSTM only
    });
    
    const { data } = await worker.recognize(imageData);
    await worker.terminate();
    
    const rawText = data.text.trim();
    const confidence = data.confidence;
    
    // Enhanced number extraction with validation
    const numberMatches = rawText.match(/\d+\.?\d*/g) || [];
    const detectedNumbers = numberMatches
      .map(n => parseFloat(n))
      .filter(n => !isNaN(n) && n >= 100 && n <= 9999999) // Reasonable odometer range
      .sort((a, b) => b - a); // Sort descending
    
    // Smart odometer reading detection
    let bestReading = null;
    
    if (detectedNumbers.length > 0) {
      // Prioritize numbers in typical odometer ranges (1000-999999)
      const prioritized = detectedNumbers.filter(n => n >= 1000 && n <= 999999);
      
      if (prioritized.length > 0) {
        // Take the number with most digits as it's likely the full odometer reading
        bestReading = prioritized
          .sort((a, b) => b.toString().length - a.toString().length)[0];
      } else {
        // Fallback to largest detected number
        bestReading = detectedNumbers[0];
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      reading: bestReading,
      confidence: confidence,
      rawText: rawText,
      detectedNumbers: detectedNumbers,
      processingTime: processingTime
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      reading: null,
      confidence: 0,
      rawText: '',
      detectedNumbers: [],
      processingTime: Date.now() - startTime
    };
  }
}

export function validateOdometerReading(
  currentReading: number,
  lastReading: number | null,
  maxIncrease: number = 2000 // Maximum reasonable km increase between readings
): { isValid: boolean; message: string; severity: 'info' | 'warning' | 'error' } {
  if (!lastReading) {
    return { 
      isValid: true, 
      message: 'First reading accepted', 
      severity: 'info' 
    };
  }
  
  if (currentReading <= lastReading) {
    return { 
      isValid: false, 
      message: 'Reading must be greater than previous reading', 
      severity: 'error' 
    };
  }
  
  const increase = currentReading - lastReading;
  
  if (increase > maxIncrease) {
    return { 
      isValid: false, 
      message: `Increase too large (${increase}km). Maximum allowed: ${maxIncrease}km`, 
      severity: 'error' 
    };
  }
  
  if (increase > 500) {
    return { 
      isValid: true, 
      message: `Large increase detected (${increase}km). Please verify the reading.`, 
      severity: 'warning' 
    };
  }
  
  return { 
    isValid: true, 
    message: `Reading validated (+${increase}km)`, 
    severity: 'info' 
  };
}
