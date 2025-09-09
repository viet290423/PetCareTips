// api/pet-tips.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) return res.status(500).json({ error: 'Server misconfigured' });

    const pet = req.body || {};
    // Prompt: yêu cầu trả về JSON thuần
    const messages = [
      { role: 'system', content: 'Bạn là bác sĩ thú y. Trả lời ngắn gọn, thực tế. KHÔNG CHẨN ĐOÁN THAY KHÁM.' },
      { role: 'user', content:
        `Hãy trả về CHỈ một JSON hợp lệ (không văn bản giải thích) gồm các trường: diet, exercise, grooming, medical_followup, warnings.
        Dữ liệu thú cưng: ${JSON.stringify(pet)}
        Ngôn ngữ: tiếng Việt. Mỗi trường là chuỗi ngắn.` }
    ];

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',     // hoặc 'gpt-3.5-turbo' nếu muốn rẻ hơn
        messages,
        temperature: 0.2,
        max_tokens: 500
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(502).json({ error: 'OpenAI error', details: errText });
    }

    const json = await resp.json();
    const assistantText = json.choices?.[0]?.message?.content ?? '';

    // Thử parse assistantText thành JSON; nếu fail, trả raw để client xử lý
    let parsed = null;
    try { parsed = JSON.parse(assistantText); } catch (e) { /* không parse được */ }

    return res.status(200).json({ raw: assistantText, parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
