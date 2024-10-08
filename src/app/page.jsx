"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, MessageSquare, User, MessageCircle, Send, X } from 'lucide-react';

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
  const [highlightTopic, setHighlightTopic] = useState(false);
  const [commentatorSelectionStage, setCommentatorSelectionStage] = useState(0);
  const [socket, setSocket] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [showGenreDialog, setShowGenreDialog] = useState(false);
  const genres = ['SF/ファンタジー', '歴史', '日常', 'ビジネス', 'テクノロジー', 'アート'];

  useEffect(() => {
    const savedNewMember = typeof window !== 'undefined' ? localStorage.getItem('lastNewMemberInput') : null;
    if (savedNewMember) {
      setNewMember(savedNewMember);
    }
  }, []);

  useEffect(() => {
    if (commentatorSelectionStage === 1) {
      const timer = setTimeout(() => setCommentatorSelectionStage(2), 3000);
      return () => clearTimeout(timer);
    } else if (commentatorSelectionStage === 2) {
      const timer = setTimeout(() => setCommentatorSelectionStage(3), 2000);
      return () => clearTimeout(timer);
    }
  }, [commentatorSelectionStage]);
  
  const addMember = () => {
    if (newMember.trim() !== "") {
      const newMembers = newMember
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name !== "");
      setMembers((prevMembers) => [...prevMembers, ...newMembers]);
      localStorage.setItem('lastNewMemberInput', newMember);
      setNewMember("");
    }
  };

  const removeMember = (index) => {
    setMembers((prevMembers) => prevMembers.filter((_, i) => i !== index));
  };

  const openGenreDialog = () => {
    setShowGenreDialog(true);
  };

  const closeGenreDialog = () => {
    setShowGenreDialog(false);
  };

  const selectGenreAndGenerateTopic = async (genre) => {
    setSelectedGenre(genre);
    closeGenreDialog();
    await generateTopic(genre);
  };

  const generateTopic = async (genre) => {
    setIsLoading(true);
    setIsAnimating(true);
    setAnimationStyle(Math.floor(Math.random() * 5));
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          date: new Date().toISOString(),
          genre: genre 
        }),
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
      setTimeout(() => {
        setIsAnimating(false);
        setHighlightTopic(true);
        setTimeout(() => setHighlightTopic(false), 3000);
      }, remainingTime);
    }
  };
  const selectSpeaker = () => {
    if (members.length === 0) {
      alert("メンバーを追加してください。");
      return;
    }
    const selectedSpeaker = members[Math.floor(Math.random() * members.length)];
    setSpeaker(selectedSpeaker);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const selectCommentator = () => {
    if (members.length < 2) {
      alert("コメンテーターを選出するには、少なくとも2人のメンバーが必要です。");
      return;
    }
    let availableMembers = members.filter(member => member !== speaker);
    const selectRandomCommentator = () => {
      const selectedCommentator = availableMembers[Math.floor(Math.random() * availableMembers.length)];
      setCommentator(selectedCommentator);
    };
    selectRandomCommentator();
    setCommentatorSelectionStage(1); // アニメーション開始
  };

  useEffect(() => {
    const ws = new WebSocket('wss://tbu7v0qm9e.execute-api.ap-northeast-1.amazonaws.com/production/');
    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // メッセージを受信したときの処理
      console.log('Received:', data);
      if (data.action === 'speakUp') {
        // アニメーションを表示
        showBigAnimation();
      }
    };
    ws.onclose = () => console.log('WebSocket disconnected');
    setSocket(ws);

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'speakUp'}));
    }
  };

  const showBigAnimation = () => {
    const animationContainer = document.createElement('div');
    animationContainer.style.position = 'fixed';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.width = '100%';
    animationContainer.style.height = '100%';
    animationContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    animationContainer.style.zIndex = '1000';
    animationContainer.style.display = 'flex';
    animationContainer.style.alignItems = 'center';
    animationContainer.style.justifyContent = 'center';
    animationContainer.style.color = 'white';
    animationContainer.style.fontSize = '3rem';
    animationContainer.style.fontWeight = 'bold';
    animationContainer.style.animation = 'fadeIn 1s ease-in-out';

    const message = document.createElement('div');
    message.innerText = '私にも言わせてくれ！';
    animationContainer.appendChild(message);

    document.body.appendChild(animationContainer);

    setTimeout(() => {
      animationContainer.style.animation = 'fadeOut 1s ease-in-out';
      animationContainer.addEventListener('animationend', () => {
        document.body.removeChild(animationContainer);
      });
    }, 3000);
  };

  return (
    <div className="p-4 max-w-md mx-auto font-roboto relative">
      <div className={`transition-all duration-300 ${isAnimating ? 'opacity-30 pointer-events-none' : ''}`}>
        <h1 className="text-2xl font-bold mb-4">アイスブレイクアプリ</h1>

        <div className="mb-4 p-4 border rounded shadow-md">
          <h2 className="font-semibold mb-2">メンバ追加</h2>
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
          <h2 className="font-semibold mb-2">メンバ</h2>
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

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={openGenreDialog}
            className="p-4 bg-[#ffb6c1] rounded hover:bg-[#ffa07a] font-semibold flex flex-col items-center justify-center relative overflow-hidden"
            disabled={isAnimating}
          >
            <MessageSquare size={24} />
            <span>トピック</span>
          </button>
          <button
            onClick={selectSpeaker}
            className="p-4 bg-[#98fb98] rounded hover:bg-[#90ee90] font-semibold flex flex-col items-center justify-center"
          >
            <User size={24} />
            <span>スピーカー</span>
          </button>
          <button
            onClick={selectCommentator}
            className="p-4 bg-[#87cefa] rounded hover:bg-[#4169e1] font-semibold flex flex-col items-center justify-center"
          >
            <MessageCircle size={24} />
            <span>コメンテーター</span>
          </button>
          <button
            onClick={() => sendMessage()}
            className="p-4 bg-[#ffb6c1] rounded hover:bg-[#ffa07a] font-semibold flex flex-col items-center justify-center"
          >
            <Send size={24} />
            <span>言わせて</span>
          </button>
        </div>

        {/* ジャンル選択ダイアログ */}
        {showGenreDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">ジャンルを選択</h2>
                <button onClick={closeGenreDialog} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => selectGenreAndGenerateTopic(genre)}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isAnimating && topic && (
          <div className={`mt-4 p-4 rounded transition-all duration-300 ${
            highlightTopic ? 'bg-yellow-200 animate-highlight' : 'bg-green-100'
          }`}>
            <h2 className="font-bold mb-2">生成されたトピック:</h2>
            <p>{topic}</p>
          </div>
        )}

      {(speaker || commentator) && commentatorSelectionStage !== 1 && commentatorSelectionStage !== 2 && (
        <div className="mb-4 p-4 border rounded shadow-md">
          <h2 className="font-semibold mb-2">選ばれた参加者</h2>
          {speaker && <p>スピーカー: {speaker}</p>}
          {commentator && <p>コメンテーター: {commentator}</p>}
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

      {commentatorSelectionStage === 1 && <ExpectationAnimation />}
      {commentatorSelectionStage === 2 && <BigCommentatorReveal name={commentator} />}

      <style jsx>{`
        @keyframes highlight {
          0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
        }
        .animate-highlight {
          animation: highlight 0.5s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
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
      case 4: // スターウォーズの宇宙船が奥に進んでいく
        return (i) => ({
          position: 'absolute',
          left: '50%',
          top: `${i * 10}%`,
          transform: `translate(-50%, -50%) scale(${1 - i * 0.1})`,
          opacity: `${1 - i * 0.1}`,
          transition: 'all 2s linear',
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

function ExpectationAnimation() {
  const messages = ["誰がコメンテーターに？", "ドキドキ...", "期待高まる！", "まもなく発表！"];
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 750);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="text-4xl font-bold text-white animate-pulse">
        {messages[currentMessage]}
      </div>
    </div>
  );
}

function BigCommentatorReveal({ name }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="text-6xl font-bold text-white animate-scale">
        {name}
      </div>
    </div>
  );
}

export default MainComponent;