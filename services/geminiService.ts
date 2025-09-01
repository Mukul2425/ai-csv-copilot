import { GoogleGenAI, Type } from "@google/genai";
import Papa from 'papaparse';
import { CsvRow, GeminiResponse, CsvData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    insight: {
      type: Type.STRING,
      description: "A concise, text-based insight answering the user's question based on the CSV data.",
    },
    chart: {
      type: Type.OBJECT,
      nullable: true,
      description: "A chart object to visualize the data, or null if no chart is appropriate.",
      properties: {
        type: {
          type: Type.STRING,
          enum: ['bar', 'line', 'scatter'],
          description: "The type of chart to display.",
        },
        data: {
          type: Type.ARRAY,
          description: "The data for the chart, as an array of objects. Each object must conform to the {x, y, z?} structure.",
          items: {
            type: Type.OBJECT,
            properties: {
              x: {
                type: Type.STRING,
                description: "Value for the x-axis. Can be a category name (string) or a numerical value formatted as a string.",
              },
              y: {
                type: Type.NUMBER,
                description: "Value for the y-axis (must be numerical).",
              },
              z: {
                type: Type.NUMBER,
                description: "Value for the z-axis for scatter plots (must be numerical).",
                nullable: true,
              },
            },
            required: ['x', 'y'],
          },
        },
        xKey: {
          type: Type.STRING,
          description: "The key from the data objects to use for the X-axis. This MUST be 'x'.",
        },
        yKey: {
          type: Type.STRING,
          description: "The key from the data objects to use for the Y-axis. This MUST be 'y'.",
        },
        zKey: {
          type: Type.STRING,
          nullable: true,
          description: "The key for the Z-axis (scatter plots). This MUST be 'z' if used.",
        },
      },
    },
  },
  required: ['insight', 'chart'],
};

export async function getInsightsAndChart(prompt: string, csvData: CsvRow[]): Promise<GeminiResponse> {
  // Limit the data sent to the model to avoid exceeding token limits
  const dataSnippet = csvData.slice(0, 100);
  const csvString = Papa.unparse(dataSnippet);

  const fullPrompt = `
    Analyze the following CSV data snippet to answer the user's question.
    
    CSV Data:
    ---
    ${csvString}
    ---
    
    User Question: "${prompt}"
    
    Your Task:
    1.  Analyze the provided CSV data to answer the user's question.
    2.  Provide a concise, text-based insight.
    3.  If a visualization is appropriate, determine the best chart type (bar, line, or scatter).
    4.  Generate a JSON object for the chart that strictly adheres to the provided schema.
    5.  For the chart 'data' field, create an array of objects. Each object MUST have an 'x' key for the x-axis and a 'y' key for the y-axis. For scatter plots, you can also include a 'z' key for the z-axis. The 'x' property should be a string (even for numerical values). The 'y' and 'z' properties must be numbers.
    6.  The 'xKey' in your response must be 'x', 'yKey' must be 'y', and 'zKey' (if used) must be 'z'.
    7.  If a chart is not possible or relevant, the 'chart' field in the JSON output should be null.
    
    Generate a JSON response that follows the specified schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    // Basic validation
    if (typeof parsedResponse.insight !== 'string') {
        throw new Error("Invalid response format: 'insight' is missing or not a string.");
    }

    return parsedResponse as GeminiResponse;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get insights from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
}
