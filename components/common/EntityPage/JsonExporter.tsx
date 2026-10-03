"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportFormat = "excel" | "word" | "pdf";

interface JsonExporterProps {
  data: Array<Record<string, any>>;
  format?: ExportFormat;
  savePath?: string;
}

export default function JsonExporter({
  data,
  format = "excel",
  savePath = "",
}: JsonExporterProps) {
  const [loading, setLoading] = useState(false);

  /**
   * خوارزمية Unnesting / Exploding
   * تقوم بتسطيح الكائنات المتداخلة (Objects) وتكرار الصفوف لكل عنصر داخل المصفوفات (Arrays)
   */
  function explodeData(jsonDataArray: Array<Record<string, any>>): Array<Record<string, any>> {
    if (!Array.isArray(jsonDataArray)) return [];

    /**
     * دالة تساعد في التسطيح ومفككة الصفوف عند مواجهة Array
     */
    function explodeRow(item: any, prefix = ""): Array<Record<string, any>> {
      let rows: Array<Record<string, any>> = [{}];

      if (item === null || typeof item !== "object") {
        return [{ [prefix]: item }];
      }

      for (const [key, value] of Object.entries(item)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        // 1. التعامل مع العناصر العادية (Primitive / Null)
        if (typeof value !== "object" || value === null) {
          rows.forEach((row) => {
            row[newKey] = value ?? "";
          });
        }
        // 2. التعامل مع القوائم والمصفوفات (Unnesting / Exploding)
        else if (Array.isArray(value)) {
          if (value.length === 0) {
            rows.forEach((row) => {
              row[newKey] = "";
            });
          } else {
            const expandedRows: Array<Record<string, any>> = [];

            // تكرار الصف الحالي لكل عنصر داخل المصفوفة (Explode)
            for (const arrayItem of value) {
              const subRows = explodeRow(arrayItem, newKey);

              for (const parentRow of rows) {
                for (const subRow of subRows) {
                  expandedRows.push({
                    ...parentRow,
                    ...subRow,
                  });
                }
              }
            }

            rows = expandedRows;
          }
        }
        // 3. التعامل مع الكائنات المتداخلة (Nested Object)
        else {
          const subRows = explodeRow(value, newKey);
          const expandedRows: Array<Record<string, any>> = [];

          for (const parentRow of rows) {
            for (const subRow of subRows) {
              expandedRows.push({
                ...parentRow,
                ...subRow,
              });
            }
          }

          rows = expandedRows;
        }
      }

      return rows;
    }

    // تطبيق الخوارزمية على كل سجل في المصفوفة الأساسية وتجميع النتائج في قائمة واحدة
    return jsonDataArray.flatMap((item) => explodeRow(item));
  }

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    setLoading(true);
    const fileName = savePath.trim() !== "" ? savePath : `export_${Date.now()}`;
    
    // تطبيق خوارزمية Unnesting / Explode
    const cleanedData = explodeData(data);

    try {
      if (format === "excel") {
        exportToExcel(cleanedData, fileName);
      } else if (format === "word") {
        exportToWord(cleanedData, fileName);
      } else if (format === "pdf") {
        exportToPdf(cleanedData, fileName);
      }
    } catch (error) {
      console.error("حدث خطأ أثناء التصدير:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = (dataToExport: Array<Record<string, any>>, fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToWord = (dataToExport: Array<Record<string, any>>, fileName: string) => {
    const headers = Object.keys(dataToExport[0] || {});

    let tableHtml = `<table border="1" style="border-collapse: collapse; width: 100%;"><thead><tr>`;
    headers.forEach((h) => {
      tableHtml += `<th style="background-color: #f2f2f2; padding: 8px;">${h}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;

    dataToExport.forEach((row) => {
      tableHtml += `<tr>`;
      headers.forEach((h) => {
        tableHtml += `<td style="padding: 8px;">${row[h] !== undefined ? row[h] : ""}</td>`;
      });
      tableHtml += `</tr>`;
    });
    tableHtml += `</tbody></table>`;

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body>${tableHtml}</body>
      </html>
    `;

    const blob = new Blob(["\ufeff", docContent], {
      type: "application/msword",
    });

    downloadBlob(blob, `${fileName}.doc`);
  };

  const exportToPdf = (dataToExport: Array<Record<string, any>>, fileName: string) => {
    const doc = new jsPDF();
    const headers = Object.keys(dataToExport[0] || {});
    const rows = dataToExport.map((row) => headers.map((h) => row[h] !== undefined ? String(row[h]) : ""));

    autoTable(doc, {
      head: [headers],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${fileName}.pdf`);
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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