'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function analyzeResume(resumeInput: string, jobDescription: string = "") {
    if (!apiKey) {
        return {
            error: "API Key not configured. Please add GEMINI_API_KEY to .env.local"
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let userContent: any[] = [];

        // Check if input is a Data URI (Base64)
        if (resumeInput.startsWith('data:')) {
            const matches = resumeInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const base64Data = matches[2];

                userContent.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                });
            } else {
                return { error: "Invalid file format." };
            }
        } else {
            // Treat as plain text
            userContent.push(resumeInput);
        }

        const prompt = `
        You are an expert ATS (Applicant Tracking System) and Career Coach.
        Analyze the provided resume against the job description (if any).
        
        ${jobDescription ? `Job Description:\n${jobDescription.slice(0, 2000)}` : "No specific job description provided. Analyze for general software engineering roles."}

        Provide the output in the following JSON format ONLY:
        {
            "score": <number 0-100>,
            "summary": "<short summary of the resume quality>",
            "missingSkills": ["<skill1>", "<skill2>"],
            "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>"]
        }
        `;

        userContent.push(prompt);

        const result = await model.generateContent(userContent);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return {
            error: `Failed to analyze resume: ${error.message}`
        };
    }
}
