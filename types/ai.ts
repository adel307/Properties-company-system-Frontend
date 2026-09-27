export interface AiResultFile {
  filename: string;
  success: boolean;
  transcription: string;
  message: string;
  navigation: string;
  time: string;
  history: Array<{
    role: string;
    parts: Array<any>;
  }>;
}