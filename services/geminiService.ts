import { GoogleGenAI } from "@google/genai";
import { PlanSettings, Plan, Week } from "../types";

/**
 * NOTE: In a production environment, these calls should be moved to a 
 * Firebase Cloud Function (backend) to protect the API Key.
 * We are implementing it client-side here for the MVP/Demo to be immediately runnable.
 */

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON string if markdown code blocks are present
const cleanJson = (text: string) => {
  return text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
};

export const generatePlanFromSyllabus = async (
  syllabus: string,
  settings: PlanSettings,
  userTitle: string
): Promise<Partial<Plan>> => {
  
  if (!process.env.API_KEY) throw new Error("Missing Gemini API Key in environment variables.");

  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert curriculum designer and educational planner.
    Your goal is to convert a raw syllabus into a structured, week-by-week learning plan.
    
    Constraints:
    - The output must be valid JSON.
    - Break down the syllabus into ${settings.deadline ? 'a suitable number of weeks based on the deadline' : 'logical weekly modules'}.
    - Respect the user's available time: ${settings.hoursPerWeek} hours/week.
    - Intensity preference: ${settings.intensity}.
    - Hands-on vs Reading: ${settings.handsOnVsReading}% hands-on.
    
    Structure the response exactly as follows:
    {
      "weeks": [
        {
          "weekNumber": 1,
          "theme": "Theme Title",
          "targetHours": number,
          "tasks": [
            {
              "title": "Task Title",
              "type": "reading" | "lab" | "video" | "notes" | "review",
              "estMinutes": number,
              "description": "Short description",
              "resources": [{ "label": "Resource Name", "url": "Optional URL" }]
            }
          ]
        }
      ]
    }
    
    Ensure tasks are granular (30-120 mins).
  `;

  const prompt = `
    Syllabus:
    ${syllabus}

    Plan Title: ${userTitle}
    Available Days: ${settings.availableDays.join(", ")}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        // Using a loose schema structure for robustness, or relying on prompt instruction for flexibility
      },
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const json = JSON.parse(cleanJson(text));
    
    // Post-process to ensure IDs exist (AI might skip them)
    const processedWeeks = json.weeks.map((w: any) => ({
      ...w,
      id: crypto.randomUUID(),
      tasks: w.tasks.map((t: any) => ({
        ...t,
        id: crypto.randomUUID(),
        status: 'not_started'
      }))
    }));

    return {
      weeks: processedWeeks,
      totalWeeks: processedWeeks.length,
      settings: settings,
      title: userTitle || "Generated Plan",
      stats: {
        totalTasks: processedWeeks.reduce((acc: number, w: any) => acc + w.tasks.length, 0),
        completedTasks: 0,
        progress: 0
      }
    };

  } catch (error) {
    console.error("Gemini Plan Generation Error:", error);
    throw error;
  }
};

export const chatWithPlanContext = async (
  history: { role: 'user' | 'model'; text: string }[],
  currentPlan: Plan,
  userQuery: string
): Promise<string> => {
    
  if (!process.env.API_KEY) return "AI Assistant is unavailable (Missing API Key).";

  const model = "gemini-2.5-flash";

  // Create a simplified context string to avoid token limits if plan is huge
  const planContext = JSON.stringify({
    title: currentPlan.title,
    currentProgress: currentPlan.stats.progress + "%",
    weeks: currentPlan.weeks.map(w => ({
      number: w.weekNumber,
      theme: w.theme,
      tasks: w.tasks.map(t => `${t.title} (${t.status})`)
    }))
  });

  const systemInstruction = `
    You are a helpful teaching assistant for the course: "${currentPlan.title}".
    You have access to the user's current learning plan and progress.
    
    Context:
    ${planContext}

    Your goal is to help the user study, suggest what to do next, or explain topics related to the syllabus.
    Keep answers concise and encouraging.
  `;

  // Convert history to Gemini format
  const chat = ai.chats.create({
    model,
    config: { systemInstruction },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message: userQuery });
  return result.text || "I couldn't generate a response.";
};