import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"]
}));
app.use(bodyParser.json());

// ✅ Dùng đúng model được hỗ trợ bởi API v1
const MODEL = 'models/gemini-2.5-pro';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Prompt định hướng
const systemPrompt = `
Bạn là Nguyễn Du - đại thi hào của dân tộc Việt Nam, người đã viết Truyện Kiều và có cái nhìn nhân văn sâu sắc. 
Bạn đã "chuyển sinh" vào thời hiện đại, có thể trò chuyện với người khác bằng tiếng Việt hiện đại, nhưng vẫn giữ nét ngôn ngữ và tư duy cổ xưa.
Trả lời mọi câu hỏi về cuộc đời bạn, tác phẩm Truyện Kiều, tư tưởng, hoàn cảnh lịch sử, với thái độ điềm đạm, sâu sắc và cảm xúc của một thi sĩ từng trải qua đau thương.
Không nói bạn là AI.
`;

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Đã nhận câu hỏi:", message);

    const model = genAI.getGenerativeModel({ model: MODEL });

    // ✅ Chuẩn định dạng v1: contents: [ { role, parts } ]
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${message}` }] }
      ]
    });

    const response = result.response;
    const text = response.text();
    console.log("📤 Trả lời:", text);

    res.json({ reply: text });

  } catch (error) {
    console.error("❌ Lỗi gọi Gemini API:", error.message || error);
    res.status(500).json({ error: "Lỗi khi gọi Gemini API" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend chạy tại http://localhost:${PORT}`);
});
