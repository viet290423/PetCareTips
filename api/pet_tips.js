import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { mode, name, species, ageMonths, weightKg, conditions, weightHistory } = req.body;

      let prompt = "";

      if (mode === "tips") {
        // Gợi ý chăm sóc chung
        prompt = `
        Bạn là bác sĩ thú y. Hãy trả lời theo đúng format sau, với các mục con rõ ràng. 
        Không thêm thắt tiêu đề khác ngoài cấu trúc dưới đây.

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
        - Tên: ${name}
        - Loài: ${species}
        - Tuổi (tháng): ${ageMonths}
        - Cân nặng (kg): ${weightKg}
        - Tình trạng sức khoẻ: ${conditions?.join(", ") || "không có"}
        `;
      } else if (mode === "growth") {
        // Gợi ý theo biểu đồ cân nặng
        prompt = `
        Dựa trên dữ liệu cân nặng sau:
        - Loài: ${species}
        - Tuổi (tháng): ${ageMonths}
        - Lịch sử cân nặng: ${JSON.stringify(weightHistory)}

        Nếu cân nặng thay đổi bất thường, hãy:
        1. Đưa ra cảnh báo (tăng/giảm nhanh).
        2. Đưa ra tips điều chỉnh chi tiết cho chế độ ăn, vận động, và chăm sóc.
        3. Giữ câu trả lời ngắn gọn, dễ hiểu cho người nuôi thú cưng.
        `;
      } else {
        return res.status(400).json({ error: "Invalid mode" });
      }

      // Gọi Gemini AI
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
