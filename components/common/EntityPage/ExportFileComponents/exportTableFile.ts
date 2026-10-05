import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportFormat = "excel" | "word" | "pdf" | "csv";

export interface ExportTableOptions {
  data: Array<Record<string, any>>;
  format?: ExportFormat;
  fileName?: string;
  sheetName?: string;
}

/**
 * دالة خارجية لتصدير ومشاركة جداول البيانات إلى ملفات Excel, Word, PDF, CSV
 * @param options خيارات التصدير (البيانات، نوع الصيغة، اسم الملف)
 */
export function exportTableFile({
  data,
  format = "excel",
  fileName = "",
  sheetName = "Sheet1",
}: ExportTableOptions): void {
  if (!data || data.length === 0) {
    console.warn("exportTableFile: لا توجد بيانات للتصدير");
    return;
  }

  const cleanFileName = fileName.trim() !== "" ? fileName : `export_${Date.now()}`;

  switch (format) {
    case "excel":
      exportToExcel(data, cleanFileName, sheetName);
      break;
    case "csv":
      exportToCsv(data, cleanFileName);
      break;
    case "word":
      exportToWord(data, cleanFileName);
      break;
    case "pdf":
      exportToPdf(data, cleanFileName);
      break;
    default:
      console.error(`exportTableFile: صيغة غير مدعومة "${format}"`);
  }
}

// ==================== الدوال المساعدة الداخلية ====================

function exportToExcel(
  data: Array<Record<string, any>>,
  fileName: string,
  sheetName: string
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

function exportToCsv(data: Array<Record<string, any>>, fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob(["\ufeff", csvOutput], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, `${fileName}.csv`);
}

function exportToWord(data: Array<Record<string, any>>, fileName: string) {
  const headers = Object.keys(data[0] || {});

  let tableHtml = `<table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;"><thead><tr style="background-color: #2980b9; color: #ffffff;">`;
  headers.forEach((h) => {
    tableHtml += `<th style="padding: 10px; text-align: left;">${escapeHtml(h)}</th>`;
  });
  tableHtml += `</tr></thead><tbody>`;

  data.forEach((row, idx) => {
    const bgColor = idx % 2 === 0 ? "#ffffff" : "#f9f9f9";
    tableHtml += `<tr style="background-color: ${bgColor};">`;
    headers.forEach((h) => {
      const cellValue = row[h] !== undefined && row[h] !== null ? String(row[h]) : "";
      tableHtml += `<td style="padding: 8px;">${escapeHtml(cellValue)}</td>`;
    });
    tableHtml += `</tr>`;
  });
  tableHtml += `</tbody></table>`;

  const docContent = `
    <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
    </head>
    <body style="padding: 20px;">
      ${tableHtml}
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", docContent], {
    type: "application/msword",
  });

  downloadBlob(blob, `${fileName}.doc`);
}

function exportToPdf(data: Array<Record<string, any>>, fileName: string) {
  const headers = Object.keys(data[0] || {});
  
  // 1. تحديد اتجاه الصفحة (أفقي إذا تجاوزت الأعمدة 5 أعمدة)
  const orientation = headers.length > 5 ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation });

  // 2. معالجة البيانات وتقصير النصوص الطويلة جداً مثل UUIDs وتنسيق التواريخ
  const formattedRows = data.map((row) =>
    headers.map((h) => {
      let val = row[h] !== undefined && row[h] !== null ? String(row[h]) : "";
      
      // إذا كانت القيمة UUID طويل، نقوم بقص جزء منه للعرض فقط
      if (val.length > 20 && val.includes("-")) {
        val = val.substring(0, 8) + "...";
      }
      // إذا كانت القيمة تاريخ ISO طويل، نعرض التاريخ فقط YYYY-MM-DD
      if (val.includes("T00:00:00") || val.length > 20 && val.includes("T")) {
        val = val.split("T")[0];
      }
      return val;
    })
  );

  // 3. تقصير أسماء عناوين الأعمدة (حذف كلمة materials. التكرارية)
  const cleanedHeaders = headers.map((h) => h.replace(/^materials\./, ""));

  // 4. حساسية حجم الخط تلقائياً بناءً على عدد الأعمدة
  const dynamicFontSize = headers.length > 8 ? 6 : headers.length > 5 ? 7 : 8;

  autoTable(doc, {
    head: [cleanedHeaders],
    body: formattedRows,
    styles: { 
      fontSize: dynamicFontSize, 
      cellPadding: 2,
      overflow: "linebreak", // كسر النص تلقائياً داخل الخلية
      halign: "center",
      valign: "middle",
    },
    headStyles: { 
      fillColor: [41, 128, 185], 
      textColor: [255, 255, 255], 
      fontStyle: "bold" 
    },
    alternateRowStyles: { 
      fillColor: [245, 245, 245] 
    },
    margin: { top: 10, right: 8, bottom: 10, left: 8 },
  });

  doc.save(`${fileName}.pdf`);
}

function downloadBlob(blob: Blob, name: string) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}