"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { processAudioAndAnalyze } from "@/lib/api/processAudioAndAnalyze";

interface AudioRecorderProps {
  onAnalysisComplete?: (data: { text: string; analysis: string }) => void;
  onTranscriptChange?: (text: string) => void;
}

const ALLOWED_ROUTES = ['/employees', '/suppliers', '/materials', '/expenses'];

export default function AudioRecorder({ 
  onAnalysisComplete, 
  onTranscriptChange 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const router = useRouter();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getSupportedMimeType = (): string => {
    const types = [
      "audio/webm",
      "audio/mp4",
      "audio/ogg",
      "audio/wav",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: actualType });
        
        setIsLoading(true);
        try {
          const result = await processAudioAndAnalyze(audioBlob);
          
          if (result && result.success) {
            if (onAnalysisComplete) {
              onAnalysisComplete({ text: result.text, analysis: result.analysis });
            }

            if (onTranscriptChange) {
              onTranscriptChange(result.analysis || result.text);
            }

            if (result.navigation && ALLOWED_ROUTES.includes(result.navigation)) {
              router.push(result.navigation);
              router.refresh();
            }
          }
        } catch (err) {
          console.error("Processing error:", err);
          alert("حدث خطأ أثناء معالجة الصوت وتحليله");
        } finally {
          setIsLoading(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("تعذر الوصول إلى الميكروفون، تأكد من إعطاء الصلاحيات.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isLoading}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2 ${
        isLoading
          ? "bg-neutral-700 text-neutral-300 cursor-wait"
          : isRecording
          ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
          : "bg-teal-600 hover:bg-teal-500 text-white"
      }`}
    >
      <span>{isLoading ? "⏳" : isRecording ? "⏹️" : "🎤"}</span>
      <span>
        {isLoading
          ? "جاري المعالجة والتحليل..."
          : isRecording
          ? "إيقاف التسجيل"
          : "تسجيل صوتي"}
      </span>
    </button>
  );
}