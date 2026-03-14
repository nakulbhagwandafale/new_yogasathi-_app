import axios from 'axios';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Helper to call the Gemini REST API with a specific prompt
 */
async function callGemini(promptText) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API Key is missing. Check your .env setup.');
    }

    try {
        const response = await axios.post(
            `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const generatedText = response.data.candidates[0].content.parts[0].text;
        return JSON.parse(generatedText);
    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || 'Failed to generate content from AI');
    }
}

export async function generateYogaPlan(assessmentData) {
    const prompt = `
    You are an expert Yoga coach. Generate a personalized daily yoga plan for a user with the following profile:
    Age: ${assessmentData.age}
    Fitness Level: ${assessmentData.fitness_level}
    Yoga Experience: ${assessmentData.yoga_experience}
    Goal: ${assessmentData.health_goal}

    Return a JSON array of yoga poses/exercises. The response MUST strictly match this format:
    { "yoga_plan": [ { "name": "Pose Name", "duration": "5 minutes", "description": "How to do it" } ] }
  `;
    try {
        const data = await callGemini(prompt);
        return { success: true, data: data };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function generateFoodPlan(assessmentData) {
    const prompt = `
    You are an expert Nutritionist. Generate a personalized daily food plan for a user with the following profile:
    Diet Preference: ${assessmentData.diet_preference}
    Goal: ${assessmentData.health_goal}

    Return a JSON array of meals. The response MUST strictly match this format:
    { "food_plan": [ { "meal": "Breakfast", "food": "Oatmeal", "calories": "300 kcal", "description": "Healthy oats" } ] }
  `;
    try {
        const data = await callGemini(prompt);
        return { success: true, data: data };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function generateReflectionQuestions(yogaPlan, foodPlan) {
    const prompt = `
    Generate three reflection questions for a user to answer at the end of their day based on the following:
    Today's Yoga Plan: ${JSON.stringify(yogaPlan)}
    Today's Food Plan: ${JSON.stringify(foodPlan)}

    The questions must be answerable with "Yes" or "No".
    Return a JSON array of questions. The response MUST strictly match this format:
    { "questions": ["Did you complete your morning yoga?", "Did you follow the diet plan?", "Did you feel energized today?"] }
  `;
    try {
        const data = await callGemini(prompt);
        return { success: true, data: data };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function generateDailyReport(reflectionAnswers, yogaPlan, foodPlan) {
    const prompt = `
    Analyze the user's performance today and generate a comprehensive daily report.
    Today's Yoga Plan: ${JSON.stringify(yogaPlan)}
    Today's Food Plan: ${JSON.stringify(foodPlan)}
    User's Answers to Reflection Questions: ${JSON.stringify(reflectionAnswers)}

    Return a JSON object containing a score (out of 100), a summary, lists of strengths, weaknesses, and suggestions for tomorrow. 
    The response MUST strictly match this format:
    {
      "report": {
        "score": 85,
        "summary": "Overall a good day...",
        "strengths": ["Completed morning routine"],
        "weaknesses": ["Missed lunch adherence"],
        "suggestions": ["Prep meals in advance"]
      }
    }
  `;
    try {
        const data = await callGemini(prompt);
        return { success: true, data: data };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function generateNextDayPlan(assessmentData, previousYogaPlan, previousFoodPlan, latestReport) {
    const prompt = `
    You are an expert AI Health Coach (Yoga & Nutrition). Based on the user's profile, what they practiced today, and their performance report, create a NEW personalized Yoga and Food plan for TOMORROW. Adjust difficulty and variety based on their strengths and weaknesses.

    User Profile (from initial assessment):
    - Age: ${assessmentData.age || 'Unknown'}
    - Goal: ${assessmentData.health_goal || 'General Fitness'}
    - Fitness Level: ${assessmentData.fitness_level || 'Beginner'}
    - Yoga Experience: ${assessmentData.yoga_experience || 'Beginner'}
    - Diet Preference: ${assessmentData.diet_preference || 'Balanced'}

    Today's Performance Report:
    - Score: ${latestReport.score}/100
    - Summary: ${latestReport.summary}
    - Strengths: ${JSON.stringify(latestReport.strengths || [])}
    - Weaknesses: ${JSON.stringify(latestReport.weaknesses || [])}
    - Suggestions: ${JSON.stringify(latestReport.suggestions || [])}

    Today's Yoga Plan (for reference): ${JSON.stringify(previousYogaPlan)}
    Today's Food Plan (for reference): ${JSON.stringify(previousFoodPlan)}

    Return a combined JSON object for tomorrow. The response MUST strictly match this exact JSON format:
    {
      "yoga_plan": [ { "name": "Pose Name", "duration": "5 minutes", "description": "How to do it" } ],
      "food_plan": [ { "meal": "Breakfast", "food": "Oatmeal", "calories": "300 kcal", "description": "Healthy oats" } ]
    }
  `;
    try {
        const data = await callGemini(prompt);
        return { success: true, data: data };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}
