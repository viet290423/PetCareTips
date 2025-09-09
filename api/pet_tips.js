// api/pet_tips.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, species, ageMonths, weightKg, conditions } = req.body;

    const prompt = `Bạn là bác sĩ thú y. Hãy đưa ra tips chăm sóc cho thú cưng dựa trên dữ liệu:
    - Tên: ${name}
    - Loài: ${species}
    - Tuổi: ${ageMonths} tháng
    - Cân nặng: ${weightKg} kg
    - Tình trạng sức khỏe: ${conditions.join(", ")}`;

    // Gọi Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // Lấy text trả về từ Gemini
    const tip = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Không có gợi ý.";

    res.status(200).json({ tip });
  } catch (err) {
    res.status(500).json({ error: "Gemini error", details: err.message });
  }
}
