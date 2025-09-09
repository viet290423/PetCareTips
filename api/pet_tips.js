import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model hợp lệ
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { name, species, ageMonths, weightKg, conditions } = req.body;

      const prompt = `
      Bạn là bác sĩ thú y. Hãy trả lời theo đúng format sau, với các mục con rõ ràng. Không thêm thắt tiêu đề khác ngoài cấu trúc dưới đây.

      Sức khoẻ:
      - Khám định kỳ: ...
      - Phòng bệnh: ...
      - Theo dõi triệu chứng: ...

      Dinh dưỡng:
      - Thực phẩm nên dùng: ...
      - Thực phẩm nên tránh: ...
      - Khẩu phần: ...

      Chăm sóc:
      - Vệ sinh: ...
      - Môi trường sống: ...
      - Vận động & tinh thần: ...

      Thông tin thú cưng:
      - Tình trạng sức khoẻ: ${conditions.join(", ")}
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      res.status(200).json({ tip: text }); 
    } catch (error) {
      console.error("Gemini error:", error);
      res.status(500).json({ error: "Gemini error", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
