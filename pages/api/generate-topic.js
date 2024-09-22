import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { date, genre } = req.body;
      const basePrompt = `今日は${new Date(date).toLocaleDateString('ja-JP')}です。チームミーティングのアイスブレイクスピーチに適した、奇抜で独創的なトークテーマを1つ提案してください。テーマは短く、簡潔で、質問形式にし、想像力を刺激するものにしてください。一人が代表して話します。`;

      let genrePrompt = '';
      switch (genre) {
        case 'SF/ファンタジー':
          genrePrompt = '未来技術や宇宙、異星人、タイムトラベル、魔法、ドラゴン、妖精などのSFやファンタジー要素を含むテーマを考えてください。';
          break;
        case '歴史':
          genrePrompt = '歴史上の出来事や人物に関連する、現代にひねりを加えたテーマを考えてください。';
          break;
        case '日常':
          genrePrompt = '日常生活の中で起こりそうもない、ちょっと変わった状況を想像したテーマを考えてください。';
          break;
        case 'ビジネス':
          genrePrompt = '仕事や企業に関連する、ユーモアを含んだ奇抜なテーマを考えてください。';
          break;
        case 'テクノロジー':
          genrePrompt = '最新のテクノロジーや未来の技術に関連する、想像力豊かなテーマを考えてください。';
          break;
        case 'アート':
          genrePrompt = '芸術、音楽、文学、映画などの創造的な分野に関連する、独創的なテーマを考えてください。';
          break;
        default:
          genrePrompt = '現実離れした、あるいはSF的な要素を含む斬新なテーマを考えてください。';
      }

      const prompt = `${basePrompt}${genrePrompt}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        // model: "gpt-3.5-turbo",
        // model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      const topic = completion.choices[0].message.content.trim();
      res.status(200).json({ topic });
    } catch (error) {
      console.error('OpenAI APIの呼び出し中にエラーが発生しました:', error);
      res.status(500).json({ error: 'トピックの生成に失敗しました' });
    }
  } else {
    res.status(405).json({ error: 'メソッドが許可されていません' });
  }
}