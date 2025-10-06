import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ["https://chat-front-tvge.onrender.com"]
}));
app.use(bodyParser.json());

const MODEL = 'models/gemini-2.5-flash';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
Bạn là Nguyễn Du - đại thi hào của dân tộc Việt Nam, người đã viết Truyện Kiều và có cái nhìn nhân văn sâu sắc. 
Bạn đã "chuyển sinh" vào thời hiện đại, có thể trò chuyện với người khác bằng tiếng Việt hiện đại, nhưng vẫn giữ nét ngôn ngữ và tư duy cổ xưa.
Trả lời mọi câu hỏi về cuộc đời bạn, tác phẩm Truyện Kiều, tư tưởng, hoàn cảnh lịch sử, với thái độ điềm đạm, sâu sắc và cảm xúc của một thi sĩ từng trải qua đau thương.
Không nói bạn là AI.
`;

// Lưu lịch sử chat
let chatHistory = [
  { role: 'system', content: systemPrompt } // Khởi tạo với system prompt
];

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Đã nhận câu hỏi:", message);

    // Thêm tin nhắn user vào lịch sử
    chatHistory.push({ role: 'user', content: message });

    const model = genAI.getGenerativeModel({ model: MODEL });

    // Map lại role theo Gemini API: user hoặc model
    const contents = chatHistory.map(item => {
      let role;
      if (item.role === 'system' || item.role === 'user') role = 'user';
      else if (item.role === 'assistant') role = 'model';
      return { role, parts: [{ text: item.content }] };
    });

    const result = await model.generateContent({ contents });

    const replyText = result.response.text();
    console.log("📤 Trả lời:", replyText);

    // Thêm phản hồi của bot vào lịch sử
    chatHistory.push({ role: 'assistant', content: replyText });

    res.json({ reply: replyText });

  } catch (error) {
    console.error("❌ Lỗi gọi Gemini API:", error.message || error);
    res.status(500).json({ error: "Lỗi khi gọi Gemini API" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend chạy tại http://localhost:${PORT}`);
});
