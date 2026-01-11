
export interface SecurityLog {
  id: string;
  timestamp: number;
  intruderImage: string;
  screenRecordingUrl: string | null;
  status: 'Detected' | 'Neutralized' | 'Archived';
  threatLevel: 'Low' | 'Medium' | 'High';
  aiAnalysis?: string;
}

export enum SecurityMode {
  IDLE = 'IDLE',
  ENROLLING = 'ENROLLING',
  MONITORING = 'MONITORING',
  ALERT = 'ALERT'
}
