/**
 * EXAMPLE FIREBASE CLOUD FUNCTION
 * 
 * This file is for reference only. In a production app, you would deploy 
 * this code to Firebase Functions to keep your API_KEY secure.
 */

/*
import * as functions from "firebase-functions";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generatePlan = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { syllabus, settings, title } = data;
  
  // Reuse the logic from geminiService.ts here
  // ...
  
  return generatedJson;
});

export const chatWithAssistant = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const { history, planContext, message } = data;

  // Reuse chat logic
  // ...

  return { response: textResponse };
});
*/
