
import React, { useState } from 'react';
import { CalculatorMode, CalculationHistory, Operation } from './types';
import { solveWordProblem } from './services/geminiService';
import { 
  History, 
  Trash2, 
  Sparkles, 
  ChevronLeft, 
  BrainCircuit, 
  MessageSquare,
  RefreshCw,
  Battery,
  Wifi,
  Signal
} from 'lucide-react';

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [currentOperation, setCurrentOperation] = useState<Operation>(null);
  const [isNewNumber, setIsNewNumber] = useState(true);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [mode, setMode] = useState<CalculatorMode>(CalculatorMode.STANDARD);
  const [smartPrompt, setSmartPrompt] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [smartExplanation, setSmartExplanation] = useState<string | null>(null);

  const clearAll = () => {
    setDisplay('0');
    setExpression('');
    setPrevValue(null);
    setCurrentOperation(null);
    setIsNewNumber(true);
    setSmartExplanation(null);
  };

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      if (display === '0' && num !== '.') {
        setDisplay(num);
      } else {
        setDisplay(display + num);
      }
    }
  };

  const handleOperation = (op: Operation) => {
    const current = parseFloat(display);
    if (prevValue === null) {
      setPrevValue(current);
    } else if (currentOperation) {
      const result = calculate(prevValue, current, currentOperation);
      setPrevValue(result);
      setDisplay(String(result));
    }
    setCurrentOperation(op);
    setIsNewNumber(true);
    setExpression(`${display} ${op}`);
  };

  const calculate = (a: number, b: number, op: Operation): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      case '%': return (a / 100) * b;
      default: return b;
    }
  };

  const handleEqual = async () => {
    if (prevValue === null || !currentOperation) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, current, currentOperation);
    const fullExpr = `${prevValue} ${currentOperation} ${current}`;
    
    setDisplay(String(result));
    setExpression('');
    setPrevValue(null);
    setCurrentOperation(null);
    setIsNewNumber(true);

    const newHistory: CalculationHistory = {
      expression: fullExpr,
      result: String(result),
      timestamp: Date.now()
    };

    setHistory(prev => [newHistory, ...prev].slice(0, 50));
  };

  const handleSmartSolve = async () => {
    if (!smartPrompt.trim()) return;
    setIsSolving(true);
    try {
      const solution = await solveWordProblem(smartPrompt);
      setDisplay(solution.result);
      setSmartExplanation(solution.explanation);
      
      const newHistory: CalculationHistory = {
        expression: smartPrompt,
        result: solution.result,
        timestamp: Date.now(),
        explanation: solution.explanation
      };
      setHistory(prev => [newHistory, ...prev].slice(0, 50));
    } catch (error) {
      alert("Failed to solve word problem. Check your API key.");
    } finally {
      setIsSolving(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === CalculatorMode.STANDARD ? CalculatorMode.SMART : CalculatorMode.STANDARD);
    setSmartExplanation(null);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-mesh p-4 transition-all duration-700">
      {/* iPhone Frame */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-black rounded-[55px] border-[12px] border-[#1a1a1a] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col ring-2 ring-white/5">
        
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-9 bg-black rounded-full z-50 flex items-center justify-center overflow-hidden">
          <div className="w-4 h-4 rounded-full bg-blue-500/20 blur-sm"></div>
        </div>

        {/* Status Bar */}
        <div className="h-14 flex items-end justify-between px-10 pb-2 bg-transparent z-20">
          <span className="text-[15px] font-semibold text-white tracking-tight">9:41</span>
          <div className="flex gap-1.5 items-center text-white">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-5 h-5" />
          </div>
        </div>

        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 py-2 z-20">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            {showHistory ? <ChevronLeft className="w-6 h-6" /> : <History className="w-5 h-5 text-slate-300" />}
          </button>
          
          <button 
            onClick={toggleMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${mode === CalculatorMode.SMART ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/10 text-slate-300'}`}
          >
            {mode === CalculatorMode.SMART ? <Sparkles className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-wider">
              {mode === CalculatorMode.SMART ? 'AI Mode' : 'Standard'}
            </span>
          </button>
        </div>

        {/* Display Area */}
        <div className="flex-1 flex flex-col justify-end px-8 py-6 relative">
          {showHistory && (
            <div className="absolute inset-0 bg-black/95 z-30 p-8 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-left duration-300 rounded-[43px]">
              <div className="flex items-center justify-between mb-8 mt-4">
                <h2 className="text-2xl font-bold">History</h2>
                <button 
                  onClick={() => setHistory([])}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-2/3 text-slate-700">
                  <History className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-lg">No history yet</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {history.map((item, idx) => (
                    <div key={idx} className="group border-b border-white/5 pb-6 last:border-0">
                      <p className="text-slate-500 text-sm mb-2">{item.expression}</p>
                      <p className="text-3xl font-medium text-white mb-3">= {item.result}</p>
                      {item.explanation && (
                        <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                          <p className="text-xs text-indigo-300 leading-relaxed font-medium">
                            <Sparkles className="inline-block w-3 h-3 mr-1" />
                            {item.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-right mb-1">
             <span className="text-slate-500 text-xl font-medium h-8 block tracking-tight">{expression}</span>
          </div>
          <div className="text-right overflow-hidden select-all">
            <span className={`block transition-all duration-300 ${display.length > 9 ? 'text-5xl' : display.length > 6 ? 'text-6xl' : 'text-[92px]'} font-light whitespace-nowrap overflow-x-auto no-scrollbar tracking-tighter text-white leading-none`}>
              {display}
            </span>
          </div>

          {smartExplanation && mode === CalculatorMode.SMART && (
            <div className="mt-6 p-5 rounded-[28px] glass border-indigo-500/20 animate-in fade-in zoom-in duration-500 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-500 rounded-full p-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-[14px] text-slate-200 leading-snug font-medium">
                  {smartExplanation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Interaction Area (Keyboard) */}
        <div className="px-6 pt-4 pb-12 bg-black">
          {mode === CalculatorMode.STANDARD ? (
            <div className="grid grid-cols-4 gap-[14px]">
              <CalcButton onClick={clearAll} label={display === '0' ? 'AC' : 'C'} variant="modifier" />
              <CalcButton onClick={() => setDisplay(String(parseFloat(display) * -1))} label="+/-" variant="modifier" />
              <CalcButton onClick={() => handleOperation('%')} label="%" variant="modifier" />
              <CalcButton onClick={() => handleOperation('/')} label="÷" variant="operator" active={currentOperation === '/'} />

              <CalcButton onClick={() => handleNumber('7')} label="7" />
              <CalcButton onClick={() => handleNumber('8')} label="8" />
              <CalcButton onClick={() => handleNumber('9')} label="9" />
              <CalcButton onClick={() => handleOperation('*')} label="×" variant="operator" active={currentOperation === '*'} />

              <CalcButton onClick={() => handleNumber('4')} label="4" />
              <CalcButton onClick={() => handleNumber('5')} label="5" />
              <CalcButton onClick={() => handleNumber('6')} label="6" />
              <CalcButton onClick={() => handleOperation('-')} label="−" variant="operator" active={currentOperation === '-'} />

              <CalcButton onClick={() => handleNumber('1')} label="1" />
              <CalcButton onClick={() => handleNumber('2')} label="2" />
              <CalcButton onClick={() => handleNumber('3')} label="3" />
              <CalcButton onClick={() => handleOperation('+')} label="+" variant="operator" active={currentOperation === '+'} />

              <CalcButton onClick={() => handleNumber('0')} label="0" colSpan={2} />
              <CalcButton onClick={() => handleNumber('.')} label="." />
              <CalcButton onClick={handleEqual} label="=" variant="operator" />
            </div>
          ) : (
            <div className="space-y-5 animate-in slide-in-from-bottom-6 duration-500">
              <div className="relative group">
                <textarea
                  value={smartPrompt}
                  onChange={(e) => setSmartPrompt(e.target.value)}
                  placeholder="How can I help you with math?"
                  className="w-full h-44 bg-[#1c1c1e] border border-white/5 rounded-[30px] p-6 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-lg tracking-tight font-medium"
                />
                <button 
                  onClick={() => setSmartPrompt('')}
                  className="absolute bottom-5 right-5 p-2.5 bg-zinc-800 text-zinc-400 rounded-full hover:text-white transition-all active:scale-90"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleSmartSolve}
                disabled={isSolving || !smartPrompt.trim()}
                className={`w-full py-5 rounded-[28px] flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-2xl ${
                  isSolving || !smartPrompt.trim() 
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white active:scale-95 btn-active'
                }`}
              >
                {isSolving ? (
                  <>
                    <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span className="tracking-tight">Analyzing Problem...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span className="tracking-tight">Solve with AI</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[140px] h-1.5 bg-white/40 rounded-full"></div>
      </div>
    </div>
  );
};

interface CalcButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'number' | 'modifier' | 'operator';
  colSpan?: number;
  active?: boolean;
}

const CalcButton: React.FC<CalcButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'number', 
  colSpan = 1,
  active = false
}) => {
  const baseStyles = "flex items-center justify-center rounded-full text-[32px] font-medium transition-all duration-100 h-[76px] w-[76px] select-none btn-active";
  
  const variants = {
    number: "bg-[#333333] text-white hover:bg-[#4d4d4d]",
    modifier: "bg-[#a5a5a5] text-black hover:bg-[#d4d4d4]",
    operator: `${active ? 'bg-white text-[#ff9f0a]' : 'bg-[#ff9f0a] text-white hover:bg-[#ffb347]'} transition-colors duration-200`
  };

  const spanStyles = colSpan > 1 ? `w-auto col-span-${colSpan} px-8 !justify-start` : '';

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${spanStyles} ${colSpan > 1 ? 'rounded-[40px] w-full' : ''}`}
    >
      {label}
    </button>
  );
};

export default App;
