"use server";

import { AiResultFile } from "@/types/ai";
import fs from "fs";
import path from "path";

export async function getAiResults(): Promise<AiResultFile[]> {
  try {
    const resultsDir = path.join(process.cwd(), "Results");

    if (!fs.existsSync(resultsDir)) {
      return [];
    }

    const files = fs.readdirSync(resultsDir);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    const data: AiResultFile[] = jsonFiles.map((filename) => {
      const filePath = path.join(resultsDir, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(fileContent);
      return {
        filename,
        ...parsed,
      };
    });

    return data.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  } catch (error) {
    console.error("Error reading AI results:", error);
    return [];
  }
}