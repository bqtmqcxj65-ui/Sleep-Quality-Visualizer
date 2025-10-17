import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { type SleepData } from '../models/sleep-data.model';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: The API key is sourced from environment variables.
    // Do not hardcode the API key in the code.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeSleepData(data: SleepData): Promise<string> {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a sleep science expert. Analyze the following sleep data and provide a concise, helpful analysis.
      The analysis should be easy to understand for a layperson.
      Format your response with a summary, positive points, areas for improvement, and actionable tips.
      Use markdown-style bolding for headers (e.g., **Summary**).

      Sleep Data:
      - Bedtime: ${data.bedtime}
      - Wake-up Time: ${data.wakeupTime}
      - Number of Night-time Disturbances: ${data.disturbances}

      Please provide your expert analysis.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating content from Gemini:', error);
      throw new Error('Could not get analysis from Gemini API.');
    }
  }
}
