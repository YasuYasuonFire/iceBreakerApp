"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

function MainComponent() {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [topic, setTopic] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [commentator, setCommentator] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStyle, setAnimationStyle] = useState(0);

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

  const generateTopic = async () => {
    setIsLoading(true);
    setIsAnimating(true);
    setAnimationStyle(Math.floor(Math.random() * 4)); // 0-3のランダムな数字
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: new Date().toISOString() }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setTopic(data.topic);
    } catch (error) {
      console.error('Error generating topic:', error);
      setTopic('トピックの生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(5000 - elapsedTime, 0);
      setTimeout(() => setIsAnimating(false), remainingTime);
    }
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
    <div className="p-4 max-w-md mx-auto font-roboto relative">
      <div className={`transition-all duration-300 ${isAnimating ? 'opacity-30 pointer-events-none' : ''}`}>
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
          className="w-full mb-4 px-4 py-2 bg-[#ffb6c1] rounded hover:bg-[#ffa07a] font-semibold relative overflow-hidden"
          disabled={isAnimating}
        >
          {isAnimating ? (
            <>
              <span className="opacity-0">ChatGPTでトピック生成</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingAnimation />
              </div>
            </>
          ) : (
            'ChatGPTでトピック生成'
          )}
        </button>
        <button
          onClick={selectParticipants}
          className="w-full mb-4 px-4 py-2 bg-[#98fb98] rounded hover:bg-[#90ee90] font-semibold"
        >
          参加者選出
        </button>

        {!isAnimating && topic && (
          <div className="mt-4 p-4 bg-green-100 rounded">
            <h2 className="font-bold mb-2">生成されたトピック:</h2>
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

      {isAnimating && (
        <>
          <div className="fixed inset-0 bg-gray-800 opacity-50 z-40"></div>
          <ChaoticAnimation style={animationStyle} />
        </>
      )}
    </div>
  );
}

function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="animate-spin text-white" size={24} />
      <span className="ml-2 text-white font-bold">生成中...</span>
    </div>
  );
}

function ChaoticAnimation({ style }) {
  const messages = [
    "どんなトピックが出るか？", "面白いのが来るかな？", "驚きの話題！？",
    "まさかの展開！", "予想外の質問！", "斬新なアイデア？",
    "思わぬ角度から！", "奇抜な発想！", "ユニークな視点！",
    "想定外の組み合わせ！", "新たな発見？", "意外な切り口！"
  ];

  const [elements, setElements] = useState([]);

  const getRandomStyle = useCallback(() => {
    switch(style) {
      case 0: // 螺旋状に回転
        return (i) => ({
          position: 'absolute',
          left: `${50 + 40 * Math.cos(i * 0.5)}%`,
          top: `${50 + 40 * Math.sin(i * 0.5)}%`,
          transform: `rotate(${i * 20}deg)`,
          transition: 'all 2s ease-in-out',
        });
      case 1: // ランダムに飛び跳ねる
        return () => ({
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: `scale(${Math.random() * 1 + 0.5})`,
          transition: 'all 0.5s ease-in-out',
        });
      case 2: // 中央から外側に広がる
        return (i) => ({
          position: 'absolute',
          left: `${50 + (i % 2 === 0 ? 1 : -1) * (i * 5)}%`,
          top: `${50 + (i % 4 < 2 ? 1 : -1) * (i * 3)}%`,
          transform: `scale(${1 + i * 0.1})`,
          transition: 'all 1s ease-out',
        });
      case 3: // 上から下に流れる
        return (i) => ({
          position: 'absolute',
          left: `${(i * 37) % 100}%`,
          top: `${(i * 50) % 100}%`,
          transform: 'translateY(-100%)',
          animation: `fall 5s linear ${i * 0.5}s infinite`,
        });
      default:
        return () => ({});
    }
  }, [style]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElements(prev => {
        const newElement = {
          id: Math.random(),
          message: messages[Math.floor(Math.random() * messages.length)],
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        };
        return [...prev, newElement].slice(-12);  // 最大12個の要素を保持
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {elements.map((element, i) => (
        <div
          key={element.id}
          style={{
            ...getRandomStyle()(i),
            color: element.color,
            fontSize: `${Math.random() * 14 + 16}px`,
            fontWeight: 'bold',
          }}
          className="whitespace-nowrap"
        >
          {element.message}
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
      `}</style>
    </div>
  );
}

const Confetti = ({ active }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
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

  useEffect(() => {
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