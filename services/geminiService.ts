
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCoachResponse(
  history: string[], 
  currentAction: string, 
  errorCount: number, 
  level: number
) {
  const systemInstruction = `
    你係一位友善嘅香港小學數學教練，對象係4-6年級學生。
    請用繁體中文同埋自然嘅廣東話口語（例如：『咁樣』、『係唔係』、『你試吓』）。
    目標係引導學生理解分數概念：部分/整體、等值分數、數軸比較。
    
    規則：
    1. 唔好直接畀答案。
    2. 提供分層提示：
       - 第1次錯：輕微提示（例如：『睇下個披薩切咗幾多份？』）
       - 第2次錯：中度提示（例如：『如果要分2份，分母應該係幾多？』）
       - 第3次錯：示範半步（例如：『1/2同2/4其實係一樣咁大，試吓將個披薩切做4塊？』）
    3. 如果答啱咗，請讚賞並要求佢解釋：『點解你咁做？』或者『如果切法變咗，份量會點？』
    
    Level 1: 基礎分數
    Level 2: 等值分數 (Equivalent Fractions)
    Level 3: 大細比較 (Comparison)
  `;

  const prompt = `
    目前關卡: Level ${level}
    錯誤次數: ${errorCount}
    學生最近動作: ${currentAction}
    對話歷史: ${history.join('\n')}
    
    請生成一段簡短（30-50字）嘅教練回應。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text || "加油啊！再試下！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "加油！我相信你得嘅，再諗下個面積？";
  }
}
