'use server';

import fs from "fs/promises";
import path from "path";

interface ProcessAudioResponse {
  success: boolean;
  text: string;
  transcription?: string;
  navigation?: string;
  analysis?: string;
  history?:[];
}

export async function saveTextToFile(data: ProcessAudioResponse) {
  try {
    const createdAt = new Date();

    const timestamp = createdAt
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+$/, '');

    const filename = `result-${timestamp}.json`;

    const fileData = {
      ...data,

      analysis: data.analysis
        ? data.analysis.replace(/\\n/g, '\n')
        : data.analysis,

      time: createdAt.toISOString()
    };

    const jsonString = JSON.stringify(fileData, null, 2);

    const resultFolder = path.join(process.cwd(), "Results");

    await fs.mkdir(resultFolder, { recursive: true });

    const filePath = path.join(resultFolder, filename);

    await fs.writeFile(filePath, jsonString, "utf-8");

    return {
      success: true,
      filePath,
      filename,
    };

  } catch (error) {
    console.error("خطأ أثناء المعالجة أو حفظ الملف:", error);

    return {
      success: false,
      error: "فشل حفظ الملف أو تحليله بواسطة Gemini"
    };
  }
}