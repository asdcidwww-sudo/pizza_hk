
import React, { useState, useEffect } from 'react';
import { GameLevel } from './types';
import { ORDERS, BADGES, CUT_OPTIONS } from './constants';
import PizzaCanvas from './components/PizzaCanvas';
import NumberLine from './components/NumberLine';

// Error Modal Component
const ErrorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-[bounce_0.5s_ease-out]">
        <div className="text-6xl mb-4">🙀</div>
        <h3 className="text-2xl font-bold text-red-500 mb-2">哎呀！整錯咗啊！</h3>
        <p className="text-gray-600 mb-6">個披薩好似怪怪地... 檢查下你整嘅披薩同你設定嘅分數係咪一樣？</p>
        <button 
          onClick={onClose}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg w-full transition-transform active:scale-95"
        >
          再試一次 💪
        </button>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal: React.FC<{ isOpen: boolean; message: string; onNext: () => void }> = ({ isOpen, message, onNext }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-[bounce_0.5s_ease-out]">
        <div className="text-6xl mb-4">😋</div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">好味！做啱咗喇！</h3>
        <p className="text-gray-600 mb-6 text-lg leading-relaxed">{message}</p>
        <button 
          onClick={onNext}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg w-full transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          {onNext.name === 'handleNextOrder' ? '下一單 ➡️' : '繼續練習 ✨'}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<'start' | 'playing' | 'levelSummary' | 'win' | 'custom'>('start');
  const [level, setLevel] = useState<GameLevel>(GameLevel.BASIC);
  const [orderIndex, setOrderIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  
  // Custom Mode State
  const [customTargetA, setCustomTargetA] = useState({ n: 1, d: 2 });
  const [customTargetB, setCustomTargetB] = useState({ n: 2, d: 3 });

  // Interaction State
  // Left Pizza (Primary / Pizza A)
  const [leftCuts, setLeftCuts] = useState(4);
  const [leftSelected, setLeftSelected] = useState<number[]>([]);
  
  // Right Pizza (Secondary / Pizza B)
  const [rightCuts, setRightCuts] = useState(4);
  const [rightSelected, setRightSelected] = useState<number[]>([]);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Stats
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const currentOrder = ORDERS[orderIndex];

  // Level Logic
  const handleNextOrder = () => {
    setShowSuccess(false); // Close modal
    const nextIdx = orderIndex + 1;
    if (nextIdx < ORDERS.length) {
      const nextOrder = ORDERS[nextIdx];
      if (nextOrder.level !== level) {
        setGameState('levelSummary');
      } else {
        setOrderIndex(nextIdx);
        resetInteraction(nextOrder);
      }
    } else {
      setGameState('win');
    }
  };

  const resetInteraction = (order?: typeof currentOrder) => {
    setLeftSelected([]);
    setRightSelected([]);
    // Auto-set convenient cuts
    if (gameState === 'custom') {
        // In custom mode, maybe default to what they entered or just 4
        setLeftCuts(customTargetA.d <= 12 ? customTargetA.d : 4);
        setRightCuts(customTargetB.d <= 12 ? customTargetB.d : 4);
    } else if (order) {
        if (order.level === GameLevel.COMPARISON) {
            setLeftCuts(order.target.denominator);
            if (order.comparisonTarget) {
                setRightCuts(order.comparisonTarget.denominator);
            }
        } else {
            setLeftCuts(4);
        }
    }
    setShowError(false);
    setShowSuccess(false);
  };

  // When custom targets change, we might want to reset the view slightly or just let user adjust
  // but let's not auto-reset cuts aggressively to allow exploration
  
  const playSuccessSound = () => {
    if (audioEnabled) {
      // Simple beep sequence mock
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 523.25; // C5
      osc.type = 'sine';
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 659.25; // E5
        gain2.gain.value = 0.1;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.1);
      }, 150);
    }
  };

  const checkOrder = () => {
    let isCorrect = false;
    let summary = '';

    if (gameState === 'custom') {
        if (leftSelected.length === 0 || rightSelected.length === 0) {
            alert("請完成兩個披薩先啦！");
            return;
        }

        const leftVal = leftSelected.length / leftCuts;
        const targetAVal = customTargetA.n / customTargetA.d;
        
        const rightVal = rightSelected.length / rightCuts;
        const targetBVal = customTargetB.n / customTargetB.d;

        const leftOk = Math.abs(leftVal - targetAVal) < 0.001;
        const rightOk = Math.abs(rightVal - targetBVal) < 0.001;

        if (leftOk && rightOk) {
            isCorrect = true;
            if (Math.abs(leftVal - rightVal) < 0.001) {
                summary = `勁呀！你成功整咗 ${customTargetA.n}/${customTargetA.d} 同 ${customTargetB.n}/${customTargetB.d}。原來佢哋係等值分數嚟架！`;
            } else if (leftVal > rightVal) {
                summary = `成功！${customTargetA.n}/${customTargetA.d} 係大過 ${customTargetB.n}/${customTargetB.d} 架！`;
            } else {
                summary = `成功！${customTargetA.n}/${customTargetA.d} 係細過 ${customTargetB.n}/${customTargetB.d} 架！`;
            }
        }
    } else if (level === GameLevel.COMPARISON && currentOrder.comparisonTarget) {
        // Dual Pizza Check (Game Mode)
        if (leftSelected.length === 0 || rightSelected.length === 0) {
            alert("你需要整好晒兩個披薩先可以比較架！");
            return;
        }

        const leftVal = leftSelected.length / leftCuts;
        const targetVal = currentOrder.target.numerator / currentOrder.target.denominator;
        const rightVal = rightSelected.length / rightCuts;
        const compTargetVal = currentOrder.comparisonTarget.numerator / currentOrder.comparisonTarget.denominator;

        const leftOk = Math.abs(leftVal - targetVal) < 0.001;
        const rightOk = Math.abs(rightVal - compTargetVal) < 0.001;

        if (leftOk && rightOk) {
            isCorrect = true;
            summary = `你成功比較咗 ${currentOrder.target.numerator}/${currentOrder.target.denominator} 同 ${currentOrder.comparisonTarget.numerator}/${currentOrder.comparisonTarget.denominator}。睇圖就知邊個大啲啦！`;
        }
    } else {
        // Single Pizza Check (Game Mode)
        if (leftSelected.length === 0) {
            alert("你仲未揀披薩份量喎？");
            return;
        }

        const currentVal = leftSelected.length / leftCuts;
        const targetVal = currentOrder.target.numerator / currentOrder.target.denominator;

        // Accuracy Check (Tolerance for float)
        if (Math.abs(currentVal - targetVal) < 0.001) {
            isCorrect = true;
            summary = `你用咗 ${leftSelected.length}/${leftCuts} 嚟表達 ${currentOrder.target.numerator}/${currentOrder.target.denominator}。完全正確！`;
        }
    }

    if (isCorrect) {
      if (gameState !== 'custom') {
          setCorrectCount(prev => prev + 1);
          setStats(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
      }
      setSuccessMessage(summary);
      setShowSuccess(true);
      playSuccessSound();
    } else {
      if (gameState !== 'custom') {
          setStats(prev => ({ ...prev, total: prev.total + 1 }));
      }
      setShowError(true);
    }
  };

  const startLevel = (nextLevel: GameLevel) => {
    setLevel(nextLevel);
    const idx = ORDERS.findIndex(o => o.level === nextLevel);
    setOrderIndex(idx);
    resetInteraction(ORDERS[idx]);
    setGameState('playing');
    
    if (nextLevel === GameLevel.EQUIVALENT) setUnlockedBadges(prev => Array.from(new Set([...prev, 'b1'])));
    if (nextLevel === GameLevel.COMPARISON) setUnlockedBadges(prev => Array.from(new Set([...prev, 'b2'])));
  };

  const startCustomMode = () => {
    setGameState('custom');
    resetInteraction();
    // Default helpful start
    setLeftCuts(customTargetA.d);
    setRightCuts(customTargetB.d);
  };

  // Helper to render Pizza Controls
  const renderPizzaBuilder = (
    label: string, 
    fraction: { n: number, d: number }, 
    currentCuts: number, 
    setCuts: (n: number) => void,
    selected: number[],
    setSelected: React.Dispatch<React.SetStateAction<number[]>>,
    colorClass: string
  ) => (
    <div className="flex flex-col space-y-3 bg-white/50 p-4 rounded-2xl border border-white shadow-sm">
        <div className="flex justify-between items-center">
            <h4 className={`font-bold ${colorClass} text-lg`}>{label} ({fraction.n}/{fraction.d})</h4>
            <div className="flex items-center gap-2">
                <select 
                    value={currentCuts}
                    onChange={(e) => {
                        setCuts(Number(e.target.value));
                        setSelected([]);
                    }}
                    className="p-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm outline-none focus:ring-2 ring-orange-400 text-sm font-medium"
                >
                {CUT_OPTIONS.map(opt => (
                    <option key={opt} value={opt} className="text-gray-900">切 {opt} 份</option>
                ))}
                </select>
                <button 
                    onClick={() => setSelected([])}
                    className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                >
                    重置
                </button>
            </div>
        </div>
        <div className="scale-90 origin-top">
            <PizzaCanvas 
                slices={currentCuts} 
                selectedSlices={selected} 
                onToggleSlice={(idx) => {
                    setSelected(prev => 
                        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                    );
                }}
            />
        </div>
        <div className={`text-center font-bold text-lg ${colorClass} bg-white p-2 rounded-xl border border-gray-100 shadow-sm`}>
            已選：{selected.length} / {currentCuts}
        </div>
    </div>
  );

  if (gameState === 'start') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-orange-50 text-orange-900 p-4">
        <h1 className="text-5xl font-bold mb-6">🍕 分數披薩店</h1>
        <p className="text-xl mb-8 text-center max-w-md">歡迎嚟到披薩店！學習分數其實好簡單，我哋一齊動手做披薩啦！</p>
        <button 
          onClick={() => startLevel(GameLevel.BASIC)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-full text-2xl shadow-lg transition-transform hover:scale-105"
        >
          開始營業
        </button>
      </div>
    );
  }

  if (gameState === 'levelSummary') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-orange-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold text-orange-600 mb-4">恭喜你完成咗呢關！</h2>
          <div className="text-left bg-orange-50 p-4 rounded-xl mb-6">
            <h3 className="font-bold mb-2 text-gray-800">你掌握咗：</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {level === GameLevel.BASIC && (
                <>
                  <li>分數由分子同分母組成</li>
                  <li>分母代表切咗幾多份（整體）</li>
                  <li>分子代表你拎走咗幾多份（部分）</li>
                </>
              )}
              {level === GameLevel.EQUIVALENT && (
                <>
                  <li>唔同嘅切法都可以得出一樣嘅面積</li>
                  <li>等值分數：1/2 = 2/4 = 4/8</li>
                </>
              )}
            </ul>
          </div>
          <button 
            onClick={() => startLevel(level + 1)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl text-xl shadow-md w-full"
          >
            挑戰下一關
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'win') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-yellow-50 p-6">
        <div className="text-8xl mb-4">🏆</div>
        <h1 className="text-4xl font-bold text-orange-600 mb-2">分數店長！</h1>
        <p className="text-lg text-gray-600 mb-8">你已經成功掌握咗分數嘅所有秘密！</p>
        <div className="flex gap-4 mb-8">
          {BADGES.map(b => (
            <div key={b.id} className="flex flex-col items-center p-4 bg-white rounded-2xl shadow">
              <span className="text-4xl mb-2">{b.icon}</span>
              <span className="font-bold text-sm text-gray-800">{b.name}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-xl font-bold text-lg"
        >
          重新開始
        </button>
      </div>
    );
  }

  const isComparison = (level === GameLevel.COMPARISON && currentOrder.comparisonTarget) || gameState === 'custom';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-orange-50 overflow-hidden text-gray-800">
      <ErrorModal isOpen={showError} onClose={() => setShowError(false)} />
      <SuccessModal isOpen={showSuccess} message={successMessage} onNext={() => gameState === 'custom' ? setShowSuccess(false) : handleNextOrder()} />
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-orange-200 p-4 flex flex-col z-10 shadow-sm shrink-0">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2">
            <span>🍕</span> 分數披薩店
          </h2>
          <div className="mt-2 text-xs font-medium text-gray-500 bg-gray-100 py-1 px-2 rounded w-fit">
            模式: {gameState === 'custom' ? '自定義練習' : (level === 1 ? '認識分數' : level === 2 ? '等值分數' : '大細比較')}
          </div>
        </div>

        <div className="space-y-4">
           {gameState !== 'custom' && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
              <div className="text-xs text-orange-700 uppercase font-bold tracking-wider">今日戰績</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-2xl font-bold text-orange-900">{stats.correct}/{stats.total}</span>
                <span className="text-xs text-gray-600">正確率</span>
              </div>
            </div>
           )}
          
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold mb-2">已獲得徽章</div>
            <div className="flex flex-wrap gap-2">
              {BADGES.map(b => (
                <div 
                  key={b.id} 
                  title={b.description}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-xl shadow-sm border transition-all ${unlockedBadges.includes(b.id) ? 'bg-orange-100 border-orange-300 scale-100' : 'bg-gray-100 border-gray-200 grayscale opacity-40 scale-90'}`}
                >
                  {b.icon}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />
          
          <button 
            onClick={() => setGameState('start')}
            className="w-full p-2 text-sm flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm"
          >
            🏠 返去主頁
          </button>
          
          <button 
            onClick={startCustomMode}
            className={`w-full p-2 text-sm flex items-center justify-center gap-2 border rounded-lg font-bold transition-colors shadow-sm ${gameState === 'custom' ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}
          >
            ⚙️ 自定義模式
          </button>
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="w-full p-2 text-sm flex items-center justify-center gap-2 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium transition-colors"
          >
            {audioEnabled ? '🔊 音效開' : '🔇 音效關'}
          </button>
        </div>
      </div>

      {/* Main Gameplay Area */}
      <div className="flex-1 p-4 md:p-6 flex flex-col overflow-y-auto items-center">
        <div className="max-w-3xl w-full flex flex-col gap-6">
          
          {/* Header Card: Order OR Custom Config */}
          {gameState === 'custom' ? (
            <div className="bg-white p-5 rounded-3xl shadow-lg border-2 border-purple-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-200 px-3 py-1 rounded-bl-xl text-xs font-bold text-purple-900 uppercase tracking-wide">
                    自定義練習
                </div>
                <h2 className="text-lg font-bold mb-3 text-gray-700">設定你想練習嘅分數：</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Input A */}
                    <div className="flex items-center gap-3 bg-orange-50 p-3 rounded-xl border border-orange-100">
                        <span className="font-bold text-orange-600">分數 A</span>
                        <div className="flex flex-col items-center gap-1">
                            <input 
                                type="number" min="1" max="12"
                                value={customTargetA.n}
                                onChange={(e) => setCustomTargetA(p => ({...p, n: parseInt(e.target.value) || 1}))}
                                className="w-12 text-center border-b-2 border-orange-300 bg-transparent text-xl font-bold outline-none"
                            />
                            <div className="w-10 h-0.5 bg-gray-300"></div>
                            <input 
                                type="number" min="1" max="12"
                                value={customTargetA.d}
                                onChange={(e) => setCustomTargetA(p => ({...p, d: parseInt(e.target.value) || 1}))}
                                className="w-12 text-center bg-transparent text-xl font-bold outline-none"
                            />
                        </div>
                    </div>
                    {/* Input B */}
                    <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <span className="font-bold text-blue-600">分數 B</span>
                        <div className="flex flex-col items-center gap-1">
                            <input 
                                type="number" min="1" max="12"
                                value={customTargetB.n}
                                onChange={(e) => setCustomTargetB(p => ({...p, n: parseInt(e.target.value) || 1}))}
                                className="w-12 text-center border-b-2 border-blue-300 bg-transparent text-xl font-bold outline-none"
                            />
                            <div className="w-10 h-0.5 bg-gray-300"></div>
                            <input 
                                type="number" min="1" max="12"
                                value={customTargetB.d}
                                onChange={(e) => setCustomTargetB(p => ({...p, d: parseInt(e.target.value) || 1}))}
                                className="w-12 text-center bg-transparent text-xl font-bold outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            // Standard Order Card
            <div className="bg-white p-5 rounded-3xl shadow-lg border-2 border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-200 px-3 py-1 rounded-bl-xl text-xs font-bold text-orange-900 uppercase tracking-wide">
                訂單 #{currentOrder.id}
                </div>
                <h2 className="text-lg font-bold mb-3 text-gray-700">客人想要：</h2>
                <div className="flex flex-wrap items-center gap-4">
                <div className="bg-orange-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-md min-w-[80px]">
                    <span className="text-3xl font-bold border-b-2 border-white/50 leading-tight px-2 w-full text-center">{currentOrder.target.numerator}</span>
                    <span className="text-3xl font-bold leading-tight px-2 w-full text-center">{currentOrder.target.denominator}</span>
                </div>
                {currentOrder.comparisonTarget && (
                    <>
                    <span className="text-2xl font-bold text-gray-400">vs</span>
                    <div className="bg-blue-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-md min-w-[80px]">
                        <span className="text-3xl font-bold border-b-2 border-white/50 leading-tight px-2 w-full text-center">{currentOrder.comparisonTarget.numerator}</span>
                        <span className="text-3xl font-bold leading-tight px-2 w-full text-center">{currentOrder.comparisonTarget.denominator}</span>
                    </div>
                    </>
                )}
                <div className="flex-1 min-w-[200px] text-gray-600 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {isComparison 
                    ? "請製作這兩個分數披薩，然後比較下邊個大啲？" 
                    : "請切開披薩，然後揀出對應份量。"}
                </div>
                </div>
            </div>
          )}

          {/* Preparation Area */}
          <div className="space-y-4">
            <h3 className="font-bold text-orange-900 text-lg flex items-center gap-2">
              🍳 製作區
            </h3>

            <div className={`grid gap-4 ${isComparison ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Primary Pizza */}
              {renderPizzaBuilder(
                  isComparison ? "披薩 A" : "你的披薩",
                  gameState === 'custom' ? customTargetA : { n: currentOrder.target.numerator, d: currentOrder.target.denominator },
                  leftCuts,
                  setLeftCuts,
                  leftSelected,
                  setLeftSelected,
                  "text-orange-600"
              )}

              {/* Secondary Pizza (For comparison or custom mode) */}
              {isComparison && renderPizzaBuilder(
                  "披薩 B",
                  gameState === 'custom' ? customTargetB : { n: currentOrder.comparisonTarget!.numerator, d: currentOrder.comparisonTarget!.denominator },
                  rightCuts,
                  setRightCuts,
                  rightSelected,
                  setRightSelected,
                  "text-blue-600"
              )}
            </div>
          </div>

          {(level === GameLevel.COMPARISON || gameState === 'custom') && (
            <NumberLine 
              markers={[
                { 
                    label: gameState === 'custom' ? `${customTargetA.n}/${customTargetA.d}` : `${currentOrder.target.numerator}/${currentOrder.target.denominator}`, 
                    value: gameState === 'custom' ? customTargetA.n/customTargetA.d : currentOrder.target.numerator/currentOrder.target.denominator, 
                    color: '#f97316' 
                },
                { 
                    label: gameState === 'custom' ? `${customTargetB.n}/${customTargetB.d}` : `${currentOrder.comparisonTarget!.numerator}/${currentOrder.comparisonTarget!.denominator}`, 
                    value: gameState === 'custom' ? customTargetB.n/customTargetB.d : currentOrder.comparisonTarget!.numerator/currentOrder.comparisonTarget!.denominator, 
                    color: '#3b82f6' 
                }
              ]}
            />
          )}

          <button 
            onClick={checkOrder}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-2xl text-xl shadow-lg transition-transform active:scale-[0.98] border-b-4 border-orange-800"
          >
            {gameState === 'custom' ? '核對答案 🔍' : '出餐！ 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
