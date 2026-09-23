import { saveTextToFile } from '@/actions/saveText';
import { apiFetch } from './client';

interface ProcessAudioResponse {
  success: boolean;
  text: string;
  transcription?: string;
  navigation?: string;
  analysis?: string;
  history?:[];
}

/**
 * يرسل التسجيل الصوتي إلى AI/process endpoint كـ form-data
 * زي ما هو موضّح في الـ Postman request:
 *   prompt   (text)
 *   audio    (file)  <-- التسجيل الصوتي الجديد
 *   file     (file)  <-- ملف اختياري (مثلاً آخر transcription محفوظ)
 *   history  (text)  <-- array بصيغة JSON للمحادثة السابقة
 */
export async function processAudioAndAnalyze(
  audioBlob: Blob,
  options?: {
    prompt?: string;
    file?: File | Blob;
    history?: unknown[];
  }
): Promise<ProcessAudioResponse> {
  if (!audioBlob.size) {
    throw new Error('ملف الصوت فارغ');
  }

  const { prompt = '', file, history = [] } = options ?? {};

  const formData = new FormData();

  const ext = audioBlob.type.includes('mp4') ? 'mp4'
    : audioBlob.type.includes('wav') ? 'wav'
    : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';

  // prompt (text)
  formData.append('prompt', prompt);

  // audio (file) - التسجيل الصوتي القادم من AudioRecorder
  formData.append('audio', audioBlob, `recording.${ext}`);

  // file (file) - اختياري، لو موجود بيتضاف زي ما هو في الصورة
  if (file) {
    const fileName = file instanceof File ? file.name : 'attachment.json';
    formData.append('file', file, fileName);
  }

  // history (text) - بيتبعت كـ JSON string عشان form-data بتاخد نصوص وملفات بس
  formData.append('history', JSON.stringify(history));

  const response = await apiFetch<ProcessAudioResponse>('/ai/process', {
    method: 'POST',
    body: formData,
  });

  if (!response || !response.success) {
    console.log('فشلت معالجة الصوت والتحليل من الخادم');
    return {
      success: false,
      text: 'فشلت معالجة الصوت والتحليل من الخادم',
    };
  }

  console.log(response)

  saveTextToFile(response);

  return response;
}