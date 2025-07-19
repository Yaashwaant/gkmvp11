import { createHash } from 'crypto';
import { storage } from './storage';

export interface Block {
  index: number;
  timestamp: Date;
  data: BlockData;
  hash: string;
  previousHash: string;
  nonce: number;
  merkleRoot: string;
}

export interface BlockData {
  type: 'USER_REGISTRY' | 'ODOMETER_READING' | 'FRAUD_ALERT';
  vehicleNumber: string;
  userId?: number;
  odometerReading?: number;
  location?: string;
  imageHash?: string;
  validationProof?: ValidationProof;
}

export interface ValidationProof {
  ocrConfidence: number;
  locationAccuracy: number;
  timeStamp: Date;
  deviceFingerprint: string;
  imageMetadata: string;
}

export interface UserChain {
  vehicleNumber: string;
  chain: Block[];
  isActive: boolean;
  fraudScore: number;
  lastValidReading: number;
}

class BlockchainRegistry {
  private userChains: Map<string, UserChain> = new Map();
  private globalFraudDatabase: Map<string, FraudRecord[]> = new Map();
  private difficulty = 4; // Mining difficulty

  constructor() {
    this.initializeGenesisBlocks();
  }

  // Initialize genesis blocks for existing users
  private async initializeGenesisBlocks() {
    // This would load existing users from database and create chains
  }

  // Create new blockchain for user registration
  async createUserChain(vehicleNumber: string, userId: number): Promise<UserChain> {
    if (this.userChains.has(vehicleNumber)) {
      throw new Error('Blockchain already exists for this vehicle');
    }

    const genesisBlock = this.createGenesisBlock(vehicleNumber, userId);
    const userChain: UserChain = {
      vehicleNumber,
      chain: [genesisBlock],
      isActive: true,
      fraudScore: 0,
      lastValidReading: 0
    };

    this.userChains.set(vehicleNumber, userChain);
    return userChain;
  }

  private createGenesisBlock(vehicleNumber: string, userId: number): Block {
    const data: BlockData = {
      type: 'USER_REGISTRY',
      vehicleNumber,
      userId
    };

    return {
      index: 0,
      timestamp: new Date(),
      data,
      hash: '',
      previousHash: '0',
      nonce: 0,
      merkleRoot: this.calculateMerkleRoot([data])
    };
  }

  // Add new odometer reading to user's blockchain
  async addOdometerReading(
    vehicleNumber: string,
    reading: number,
    imageHash: string,
    location: string,
    validationProof: ValidationProof
  ): Promise<{ success: boolean; blockHash?: string; fraudAlert?: string }> {
    
    const userChain = this.userChains.get(vehicleNumber);
    if (!userChain) {
      throw new Error('No blockchain found for this vehicle');
    }

    // Fraud detection checks
    const fraudCheck = await this.detectFraud(vehicleNumber, reading, validationProof);
    if (fraudCheck.isFraud) {
      // Add fraud alert block
      await this.addFraudAlertBlock(vehicleNumber, fraudCheck.reason);
      return {
        success: false,
        fraudAlert: fraudCheck.reason
      };
    }

    // Create new block
    const blockData: BlockData = {
      type: 'ODOMETER_READING',
      vehicleNumber,
      odometerReading: reading,
      location,
      imageHash,
      validationProof
    };

    const newBlock = this.mineBlock(userChain.chain, blockData);
    userChain.chain.push(newBlock);
    userChain.lastValidReading = reading;

    // Cross-reference with other apps/systems
    await this.updateGlobalFraudDatabase(vehicleNumber, reading, newBlock.hash);

    return {
      success: true,
      blockHash: newBlock.hash
    };
  }

  // Advanced fraud detection system
  private async detectFraud(
    vehicleNumber: string,
    reading: number,
    validation: ValidationProof
  ): Promise<{ isFraud: boolean; reason?: string; confidence: number }> {
    
    const userChain = this.userChains.get(vehicleNumber);
    if (!userChain) {
      return { isFraud: true, reason: 'No user chain found', confidence: 1.0 };
    }

    let fraudScore = 0;
    const checks: string[] = [];

    // 1. Check for impossible distance travelled
    const lastBlock = userChain.chain[userChain.chain.length - 1];
    if (lastBlock.data.odometerReading) {
      const timeDiff = (new Date().getTime() - lastBlock.timestamp.getTime()) / (1000 * 60 * 60); // hours
      const kmDiff = reading - lastBlock.data.odometerReading;
      const speedKmh = kmDiff / timeDiff;
      
      if (speedKmh > 200) { // Impossible speed
        fraudScore += 0.8;
        checks.push('Impossible speed detected');
      }
      
      if (kmDiff < 0) { // Odometer rolled back
        fraudScore += 0.9;
        checks.push('Odometer rollback detected');
      }
    }

    // 2. Check OCR confidence
    if (validation.ocrConfidence < 0.7) {
      fraudScore += 0.3;
      checks.push('Low OCR confidence');
    }

    // 3. Check location consistency
    if (validation.locationAccuracy > 100) { // More than 100m accuracy
      fraudScore += 0.2;
      checks.push('Poor location accuracy');
    }

    // 4. Check for duplicate readings across apps
    const globalCheck = await this.checkGlobalFraudDatabase(vehicleNumber, reading);
    if (globalCheck.isDuplicate) {
      fraudScore += 0.9;
      checks.push('Reading already used in another app');
    }

    // 5. Check image metadata for manipulation
    if (this.detectImageManipulation(validation.imageMetadata)) {
      fraudScore += 0.7;
      checks.push('Image manipulation detected');
    }

    // 6. Device fingerprint consistency
    if (!this.validateDeviceFingerprint(vehicleNumber, validation.deviceFingerprint)) {
      fraudScore += 0.4;
      checks.push('Suspicious device change');
    }

    const isFraud = fraudScore > 0.6;
    return {
      isFraud,
      reason: isFraud ? checks.join(', ') : undefined,
      confidence: Math.min(fraudScore, 1.0)
    };
  }

  // Check reading against global fraud database
  private async checkGlobalFraudDatabase(
    vehicleNumber: string,
    reading: number
  ): Promise<{ isDuplicate: boolean; source?: string }> {
    
    const records = this.globalFraudDatabase.get(vehicleNumber) || [];
    
    // Check if this exact reading was used in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const duplicateRecord = records.find(record => 
      record.reading === reading && 
      record.timestamp > thirtyDaysAgo
    );

    return {
      isDuplicate: !!duplicateRecord,
      source: duplicateRecord?.source
    };
  }

  // Update global fraud prevention database
  private async updateGlobalFraudDatabase(
    vehicleNumber: string,
    reading: number,
    blockHash: string
  ): Promise<void> {
    
    if (!this.globalFraudDatabase.has(vehicleNumber)) {
      this.globalFraudDatabase.set(vehicleNumber, []);
    }

    const records = this.globalFraudDatabase.get(vehicleNumber)!;
    records.push({
      reading,
      timestamp: new Date(),
      source: 'GreenKarma',
      blockHash,
      appSignature: this.generateAppSignature()
    });

    // Keep only last 100 records
    if (records.length > 100) {
      records.shift();
    }
  }

  private detectImageManipulation(metadata: string): boolean {
    // Simple checks for image manipulation
    try {
      const meta = JSON.parse(metadata);
      
      // Check for common photo editing software signatures
      const editingSoftware = ['photoshop', 'gimp', 'pixelmator', 'canva'];
      const software = (meta.software || '').toLowerCase();
      
      return editingSoftware.some(editor => software.includes(editor));
    } catch {
      return false; // If metadata can't be parsed, assume it's fine
    }
  }

  private validateDeviceFingerprint(vehicleNumber: string, fingerprint: string): boolean {
    const userChain = this.userChains.get(vehicleNumber);
    if (!userChain || userChain.chain.length <= 1) {
      return true; // First reading, accept any device
    }

    // Check last 3 blocks for device consistency
    const recentBlocks = userChain.chain.slice(-3);
    const recentFingerprints = recentBlocks
      .map(block => block.data.validationProof?.deviceFingerprint)
      .filter(fp => fp);

    // Allow device change if it's been consistent for at least 2 previous readings
    if (recentFingerprints.length >= 2) {
      const lastFingerprint = recentFingerprints[recentFingerprints.length - 1];
      return fingerprint === lastFingerprint;
    }

    return true;
  }

  // Add fraud alert to user's blockchain
  private async addFraudAlertBlock(vehicleNumber: string, reason: string): Promise<void> {
    const userChain = this.userChains.get(vehicleNumber);
    if (!userChain) return;

    const alertData: BlockData = {
      type: 'FRAUD_ALERT',
      vehicleNumber,
      validationProof: {
        ocrConfidence: 0,
        locationAccuracy: 0,
        timeStamp: new Date(),
        deviceFingerprint: reason,
        imageMetadata: `Fraud detected: ${reason}`
      }
    };

    const fraudBlock = this.mineBlock(userChain.chain, alertData);
    userChain.chain.push(fraudBlock);
    userChain.fraudScore += 1;

    // Temporarily suspend chain if too many fraud attempts
    if (userChain.fraudScore >= 3) {
      userChain.isActive = false;
    }
  }

  // Mine new block with proof of work
  private mineBlock(chain: Block[], data: BlockData): Block {
    const previousBlock = chain[chain.length - 1];
    let nonce = 0;
    let hash = '';

    const block: Omit<Block, 'hash' | 'nonce'> = {
      index: previousBlock.index + 1,
      timestamp: new Date(),
      data,
      previousHash: previousBlock.hash,
      merkleRoot: this.calculateMerkleRoot([data])
    };

    // Proof of work - find hash starting with required zeros
    while (!hash.startsWith('0'.repeat(this.difficulty))) {
      nonce++;
      hash = this.calculateHash({ ...block, nonce });
    }

    return { ...block, hash, nonce };
  }

  private calculateHash(block: Omit<Block, 'hash'>): string {
    const dataString = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash,
      nonce: block.nonce,
      merkleRoot: block.merkleRoot
    });
    
    return createHash('sha256').update(dataString).digest('hex');
  }

  private calculateMerkleRoot(data: BlockData[]): string {
    if (data.length === 0) return '';
    if (data.length === 1) {
      return createHash('sha256').update(JSON.stringify(data[0])).digest('hex');
    }

    // Simple merkle root calculation
    const hashes = data.map(d => createHash('sha256').update(JSON.stringify(d)).digest('hex'));
    while (hashes.length > 1) {
      const newLevel = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        newLevel.push(createHash('sha256').update(left + right).digest('hex'));
      }
      hashes.splice(0, hashes.length, ...newLevel);
    }
    
    return hashes[0];
  }

  private generateAppSignature(): string {
    return createHash('sha256')
      .update('GreenKarma-v1.0-' + new Date().toISOString())
      .digest('hex')
      .substr(0, 16);
  }

  // Verify entire chain integrity
  verifyChain(vehicleNumber: string): { isValid: boolean; errors: string[] } {
    const userChain = this.userChains.get(vehicleNumber);
    if (!userChain) {
      return { isValid: false, errors: ['Chain not found'] };
    }

    const errors: string[] = [];
    const chain = userChain.chain;

    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      // Verify hash
      const calculatedHash = this.calculateHash({
        index: currentBlock.index,
        timestamp: currentBlock.timestamp,
        data: currentBlock.data,
        previousHash: currentBlock.previousHash,
        nonce: currentBlock.nonce,
        merkleRoot: currentBlock.merkleRoot
      });

      if (calculatedHash !== currentBlock.hash) {
        errors.push(`Invalid hash at block ${i}`);
      }

      // Verify chain linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        errors.push(`Broken chain at block ${i}`);
      }

      // Verify proof of work
      if (!currentBlock.hash.startsWith('0'.repeat(this.difficulty))) {
        errors.push(`Invalid proof of work at block ${i}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Get user chain summary
  getUserChainSummary(vehicleNumber: string) {
    const userChain = this.userChains.get(vehicleNumber);
    if (!userChain) return null;

    const totalBlocks = userChain.chain.length;
    const odometerReadings = userChain.chain.filter(b => b.data.type === 'ODOMETER_READING').length;
    const fraudAlerts = userChain.chain.filter(b => b.data.type === 'FRAUD_ALERT').length;

    return {
      vehicleNumber,
      totalBlocks,
      odometerReadings,
      fraudAlerts,
      fraudScore: userChain.fraudScore,
      isActive: userChain.isActive,
      lastValidReading: userChain.lastValidReading,
      chainIntegrity: this.verifyChain(vehicleNumber)
    };
  }

  // Export chain for auditing
  exportChain(vehicleNumber: string): UserChain | null {
    return this.userChains.get(vehicleNumber) || null;
  }
}

interface FraudRecord {
  reading: number;
  timestamp: Date;
  source: string;
  blockHash: string;
  appSignature: string;
}

export const blockchainRegistry = new BlockchainRegistry();