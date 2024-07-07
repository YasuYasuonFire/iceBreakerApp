"use client";
import React from "react";

function MainComponent() {
  const [members, setMembers] = React.useState([]);
  const [newMember, setNewMember] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [speaker, setSpeaker] = React.useState("");
  const [commentator, setCommentator] = React.useState("");
  const [showConfetti, setShowConfetti] = React.useState(false);

  const addMember = () => {
    if (newMember.trim() !== "") {
      const newMembers = newMember
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name !== "");
      setMembers((prevMembers) => [...prevMembers, ...newMembers]);
      setNewMember("");
    }
  };

  const removeMember = (index) => {
    setMembers((prevMembers) => prevMembers.filter((_, i) => i !== index));
  };

  const generateTopic = () => {
    const topics = [
      "あなたの人生で最も影響を受けた本は何ですか？",
      "子供の頃の夢は何でしたか？",
      "最近あった面白い出来事を教えてください。",
      "もし無人島に1つだけ物を持っていけるとしたら何を選びますか？",
      "タイムマシンがあったら、どの時代に行きたいですか？",
    ];
    setTopic(topics[Math.floor(Math.random() * topics.length)]);
  };

  const selectParticipants = () => {
    if (members.length < 2) {
      alert("メンバーを2人以上追加してください。");
      return;
    }
    const shuffled = [...members].sort(() => 0.5 - Math.random());
    setSpeaker(shuffled[0]);
    setCommentator(shuffled[1]);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="p-4 max-w-md mx-auto font-roboto">
      <h1 className="text-2xl font-bold mb-4">アイスブレイクアプリ</h1>

      <div className="mb-4 p-4 border rounded shadow-md">
        <h2 className="font-semibold mb-2">メンバー追加</h2>
        <textarea
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          placeholder="名前を入力 (複数行で入力可能)"
          className="mb-2 p-2 border rounded w-full h-[100px]"
          name="newMember"
        />
        <button
          onClick={addMember}
          className="w-auto px-4 py-2 bg-[#b0e0e6] rounded hover:bg-[#99d6e0] font-semibold"
        >
          追加
        </button>
      </div>

      <div className="mb-4 p-4 border rounded shadow-md">
        <h2 className="font-semibold mb-2">メンバー一覧</h2>
        <div>
          {members.map((member, index) => (
            <div key={index} className="flex justify-between items-center mb-2">
              <span>{member}</span>
              <button
                onClick={() => removeMember(index)}
                className="px-3 py-1 bg-red-300 rounded hover:bg-red-200 font-semibold"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={generateTopic}
        className="w-full mb-4 px-4 py-2 bg-[#ffb6c1] rounded hover:bg-[#ffa07a] font-semibold"
      >
        トピック生成
      </button>
      <button
        onClick={selectParticipants}
        className="w-full mb-4 px-4 py-2 bg-[#98fb98] rounded hover:bg-[#90ee90] font-semibold"
      >
        参加者選出
      </button>

      {topic && (
        <div className="mb-4 p-4 border rounded shadow-md">
          <h2 className="font-semibold mb-2">今日のトピック</h2>
          <p>{topic}</p>
        </div>
      )}

      {speaker && commentator && (
        <div className="mb-4 p-4 border rounded shadow-md">
          <h2 className="font-semibold mb-2">選ばれた参加者</h2>
          <p>スピーカー: {speaker}</p>
          <p>コメンテーター: {commentator}</p>
        </div>
      )}

      <Confetti active={showConfetti} />
    </div>
  );
}

const Confetti = ({ active }) => {
  const [particles, setParticles] = React.useState([]);

  React.useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 50 }, () => ({
        x: Math.random() * 100,
        y: -10,
        size: Math.random() * 5 + 5,
        color: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"][
          Math.floor(Math.random() * 5)
        ],
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active]);

  React.useEffect(() => {
    if (particles.length > 0) {
      const interval = setInterval(() => {
        setParticles((prevParticles) =>
          prevParticles
            .map((p) => ({
              ...p,
              y: p.y + 5,
            }))
            .filter((p) => p.y < 100)
        );
      }, 50);
      return () => clearInterval(interval);
    }
  }, [particles]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};

export default MainComponent;