"use client";

import React, { useState } from "react";
import flattenComplexJSON from "./flattenComplexJSON";
import { exportTableFile, ExportFormat } from "./exportTableFile";

interface JsonExporterProps {
  data: Array<Record<string, any>>;
  format?: ExportFormat;
  savePath?: string;
}

export default function JsonExporter({
  data,
  format = "pdf",
  savePath = "",
}: JsonExporterProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    setLoading(true);

    try {
      // 1. تسطيح الـ JSON المتداخل عبر خوارزمية flattenComplexJSON
      const cleanedData = flattenComplexJSON(data);

      // 2. تصدير البيانات بالصيغة المطلوبة عبر الدالة الخارجية exportTableFile
      exportTableFile({
        data: cleanedData,
        format: format,
        fileName: savePath,
      });
    } catch (error) {
      console.error("حدث خطأ أثناء التصدير:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 border border-slate-700/80 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
    >
      {loading ? "جاري التصدير..." : `تصدير ${format.toUpperCase()}`}
    </button>
  );
}