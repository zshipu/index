import { GoogleGenAI } from "@google/genai";
import { Elder } from "../types";

// Helper to safely get the API key.
const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

export const generateHealthPlan = async (elder: Elder): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    你是一位专业的养老健康顾问和营养师。
    请分析以下老年人的健康数据，并为下周生成一份个性化的“智能健康计划”。
    请使用**简体中文**回答。
    
    老人档案:
    姓名: ${elder.name}
    年龄: ${elder.age}
    性别: ${elder.gender}
    护理等级: ${elder.careLevel}
    风险等级: ${elder.riskLevel}
    
    当前数据:
    体重: ${elder.stats.weight} kg
    日均步数: ${elder.stats.steps}
    心率: ${elder.stats.heartRate} bpm
    睡眠: ${elder.stats.sleep} 小时
    健康评分: ${elder.stats.healthScore}/100
    
    请提供符合以下结构的有效JSON响应（不要包含markdown格式）：
    {
      "summary": "一段简短的健康状况总结（2句话）。",
      "dietPlan": ["早餐建议", "午餐建议", "晚餐建议", "饮食禁忌"],
      "exercisePlan": ["晨间活动", "下午活动", "注意事项"],
      "caregiverTips": ["特别提示1", "特别提示2"],
      "riskAssessment": "基于数据的潜在风险分析。"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "{}";
  } catch (error) {
    console.error("Error generating health plan:", error);
    throw error;
  }
};