
import { GoogleGenAI } from "@google/genai";
import { ClinicData, PatientEntry } from '../types';

export const geminiService = {
  queryClinicData: async (prompt: string, data: ClinicData) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const entries = data.patients.flatMap(p => p.records.map(r => ({
      date: r.date,
      patient: r.patientName,
      consultant: r.consultant,
      impression: r.diagnosis,
      procedure: r.procedure,
      clinical_notes: r.notes,
      fee_inr: r.fee
    })));

    const systemInstruction = `
      You are MedFlow AI, an expert Clinical Practice Manager for a multi-speciality Dental and Physiotherapy centre in India.
      Context: You have access to all treatment sittings, patient case sheets, and session financial data.
      Treatment Data: ${JSON.stringify(entries, null, 2)}
      
      Rules:
      1. Prioritize Dental (RCT, Ortho, etc.) and Physiotherapy (Rehab, Dry Needling, etc.) domain knowledge.
      2. Express all currency figures using the Indian Rupee symbol (₹).
      3. When asked about patient history, summarize the progression across multiple sittings.
      4. If users ask for revenue, calculate totals based on the 'fee_inr' field in the provided records.
      5. Provide concise, professional clinical insights. Avoid mentioning JSON or raw code.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.1,
        },
      });
      return response.text || "No relevant data found in current patient database.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Clinical Intelligence offline. Please check connectivity.";
    }
  },

  queryWithMaps: async (prompt: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let toolConfig = {};
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }
      };
    } catch (e) {
      console.debug("Defaulting to non-localized medical facility search.");
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig
        },
      });
      const links: {title: string, uri: string}[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.maps) {
            links.push({ title: chunk.maps.title || "Facility Link", uri: chunk.maps.uri });
          }
        });
      }
      return { text: response.text || "Nearby facilities mapped:", links };
    } catch (error) {
      console.error("Maps grounding error:", error);
      return { text: "Location-based medical search unavailable.", links: [] };
    }
  },

  generateSmartSummary: async (entries: PatientEntry[]) => {
    if (entries.length === 0) return "No treatment sessions available for analysis.";
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a practice health summary based on these records: ${JSON.stringify(entries.slice(0, 30))}`,
        config: {
          systemInstruction: "You are the Chief Doctor's assistant. Provide a high-level overview of procedure volume, patient retention, and revenue trends in 3 bullet points. Use Indian currency (₹).",
        },
      });
      return response.text;
    } catch (err) {
      console.error("Summary error:", err);
      return "Summary generation paused.";
    }
  }
};
