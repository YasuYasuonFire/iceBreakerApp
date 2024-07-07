import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { date } = req.body;
      const prompt = `今日は${new Date(date).toLocaleDateString('ja-JP')}です。チームミーティングのアイスブレイクスピーチに適した、面白くて興味深いトークテーマを1つ提案してください。テーマは短く、簡潔で、質問形式にしてください。一人が代表して話します。身近でカジュアルなテーマにしてください。`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        // model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      const topic = completion.choices[0].message.content.trim();
      res.status(200).json({ topic });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      res.status(500).json({ error: 'Failed to generate topic' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}