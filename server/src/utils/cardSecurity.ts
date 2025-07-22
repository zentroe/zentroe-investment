import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.CARD_ENCRYPTION_KEY
  ? Buffer.from(process.env.CARD_ENCRYPTION_KEY, 'hex')
  : crypto.randomBytes(32);
const ALGORITHM = 'aes-256-gcm';

export class CardEncryption {
  /**
   * Encrypt sensitive card data
   */
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive card data
   */
  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate a unique token for card identification
   */
  static generateToken(): string {
    return `card_${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Hash sensitive data for verification without storage
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

/**
 * Card validation utilities
 */
export class CardValidator {
  /**
   * Validate card number using Luhn algorithm
   */
  static validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/\s|-/g, '');

    // Check if all digits
    if (!/^\d+$/.test(cleaned)) return false;

    // Check length (typically 13-19 digits)
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Detect card brand from card number
   */
  static detectCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s|-/g, '');

    // Visa
    if (/^4/.test(cleaned)) return 'Visa';

    // MasterCard
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'MasterCard';

    // American Express
    if (/^3[47]/.test(cleaned)) return 'American Express';

    // Discover
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';

    return 'Other';
  }

  /**
   * Validate expiry date
   */
  static validateExpiry(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Check valid month
    if (month < 1 || month > 12) return false;

    // Check year format (assuming 4-digit year)
    if (year < currentYear || year > currentYear + 20) return false;

    // Check if expired
    if (year === currentYear && month < currentMonth) return false;

    return true;
  }

  /**
   * Validate CVV
   */
  static validateCVV(cvv: string, cardBrand: string): boolean {
    const cleaned = cvv.replace(/\s/g, '');

    // American Express uses 4 digits, others use 3
    const expectedLength = cardBrand === 'American Express' ? 4 : 3;

    return /^\d+$/.test(cleaned) && cleaned.length === expectedLength;
  }
}

/**
 * Risk assessment for card transactions
 */
export class RiskAssessment {
  /**
   * Calculate risk score for a transaction
   */
  static calculateRiskScore(data: {
    amount: number;
    userHistory: any;
    ipAddress: string;
    userAgent: string;
    timeOfDay: number;
    dayOfWeek: number;
  }): { score: number; flags: string[] } {
    let score = 0;
    const flags: string[] = [];

    // High amount risk
    if (data.amount > 10000) {
      score += 30;
      flags.push('HIGH_AMOUNT');
    } else if (data.amount > 5000) {
      score += 15;
      flags.push('MEDIUM_AMOUNT');
    }

    // New user risk
    if (!data.userHistory || data.userHistory.transactionCount === 0) {
      score += 20;
      flags.push('NEW_USER');
    }

    // Unusual time risk (outside business hours)
    if (data.timeOfDay < 6 || data.timeOfDay > 22) {
      score += 10;
      flags.push('UNUSUAL_TIME');
    }

    // Weekend risk
    if (data.dayOfWeek === 0 || data.dayOfWeek === 6) {
      score += 5;
      flags.push('WEEKEND_TRANSACTION');
    }

    // IP address risk (you can add geolocation checks)
    // For now, just check if it's a known IP

    return { score: Math.min(score, 100), flags };
  }
}

/**
 * Generate transaction reference numbers
 */
export class TransactionGenerator {
  /**
   * Generate unique transaction ID
   */
  static generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `ZEN-${timestamp}-${random}`;
  }

  /**
   * Generate payment reference for user display
   */
  static generatePaymentReference(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ZPY-${date}-${random}`;
  }
}
