import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model hợp lệ
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { name, species, ageMonths, weightKg, conditions } = req.body;

      const prompt = `
      Bạn là bác sĩ thú y. Hãy trả lời theo đúng format sau:

      Sức khoẻ: (liệt kê lời khuyên về tình trạng sức khoẻ, phòng bệnh, khám định kỳ)
      Dinh dưỡng: (liệt kê lời khuyên về chế độ ăn, thực phẩm nên/không nên dùng)
      Chăm sóc: (liệt kê lời khuyên về vệ sinh, môi trường sống, vận động)

      Thông tin thú cưng:
      - Tên: ${name}
      - Loài: ${species}
      - Tuổi (tháng): ${ageMonths}
      - Cân nặng (kg): ${weightKg}
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
