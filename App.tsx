
import React, { useState, useEffect, useCallback } from 'react';
import { CalculatorMode, CalculationHistory, Operation } from './types';
import { getSmartExplanation, solveWordProblem } from './services/geminiService';
import { 
  History, 
  Trash2, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  BrainCircuit, 
  MessageSquare,
  RefreshCw
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
      setDisplay(display === '0' ? num : display + num);
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
      case '%': return a % b;
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
      alert("Failed to solve word problem. Check your prompt or API key.");
    } finally {
      setIsSolving(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === CalculatorMode.STANDARD ? CalculatorMode.SMART : CalculatorMode.STANDARD);
    setSmartExplanation(null);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-950 p-4">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[400px] h-[85vh] bg-black rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Status Bar */}
        <div className="h-10 flex items-center justify-between px-8 pt-4 pb-2 bg-black/80 z-20">
          <span className="text-xs font-medium">9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-4 h-2 bg-white/40 rounded-full"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="w-5 h-3 border border-white/40 rounded-sm"></div>
          </div>
        </div>

        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 py-4 z-20">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {showHistory ? <ChevronLeft className="w-6 h-6" /> : <History className="w-6 h-6 text-slate-400" />}
          </button>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <Sparkles className={`w-4 h-4 ${mode === CalculatorMode.SMART ? 'text-blue-400' : 'text-slate-500'}`} />
            <span className="text-xs font-medium uppercase tracking-widest">
              {mode === CalculatorMode.SMART ? 'Smart AI' : 'Standard'}
            </span>
          </div>
          <button 
            onClick={toggleMode}
            className={`p-2 rounded-full transition-all ${mode === CalculatorMode.SMART ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 text-slate-400'}`}
          >
            <BrainCircuit className="w-6 h-6" />
          </button>
        </div>

        {/* Display Area */}
        <div className="flex-1 flex flex-col justify-end px-8 py-4 relative">
          {showHistory ? (
            <div className="absolute inset-0 bg-black/95 z-30 p-6 overflow-y-auto no-scrollbar animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">History</h2>
                <button 
                  onClick={() => setHistory([])}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-2/3 text-slate-600">
                  <History className="w-12 h-12 mb-2 opacity-20" />
                  <p>No recent calculations</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.map((item, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-4 last:border-0">
                      <p className="text-slate-500 text-sm mb-1">{item.expression}</p>
                      <p className="text-2xl font-semibold text-white mb-2">= {item.result}</p>
                      {item.explanation && (
                        <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                          <p className="text-xs text-blue-300 leading-relaxed italic">
                            AI: {item.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <div className="text-right mb-2">
             <span className="text-slate-500 text-lg h-8 block">{expression}</span>
          </div>
          <div className="text-right overflow-hidden">
            <span className={`block transition-all duration-200 ${display.length > 10 ? 'text-4xl' : display.length > 7 ? 'text-5xl' : 'text-7xl'} font-light whitespace-nowrap overflow-x-auto no-scrollbar`}>
              {display}
            </span>
          </div>

          {smartExplanation && mode === CalculatorMode.SMART && (
            <div className="mt-4 p-4 rounded-2xl glass border-blue-500/30 animate-in fade-in zoom-in duration-300">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-slate-300 leading-snug">
                  {smartExplanation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Interaction Area */}
        <div className="p-6 pb-10 bg-slate-900/50">
          {mode === CalculatorMode.STANDARD ? (
            <div className="grid grid-cols-4 gap-4">
              <CalcButton onClick={clearAll} label="AC" variant="secondary" />
              <CalcButton onClick={() => setDisplay(String(parseFloat(display) * -1))} label="+/-" variant="secondary" />
              <CalcButton onClick={() => handleOperation('%')} label="%" variant="secondary" />
              <CalcButton onClick={() => handleOperation('/')} label="÷" variant="action" active={currentOperation === '/'} />

              <CalcButton onClick={() => handleNumber('7')} label="7" />
              <CalcButton onClick={() => handleNumber('8')} label="8" />
              <CalcButton onClick={() => handleNumber('9')} label="9" />
              <CalcButton onClick={() => handleOperation('*')} label="×" variant="action" active={currentOperation === '*'} />

              <CalcButton onClick={() => handleNumber('4')} label="4" />
              <CalcButton onClick={() => handleNumber('5')} label="5" />
              <CalcButton onClick={() => handleNumber('6')} label="6" />
              <CalcButton onClick={() => handleOperation('-')} label="−" variant="action" active={currentOperation === '-'} />

              <CalcButton onClick={() => handleNumber('1')} label="1" />
              <CalcButton onClick={() => handleNumber('2')} label="2" />
              <CalcButton onClick={() => handleNumber('3')} label="3" />
              <CalcButton onClick={() => handleOperation('+')} label="+" variant="action" active={currentOperation === '+'} />

              <CalcButton onClick={() => handleNumber('0')} label="0" colSpan={2} />
              <CalcButton onClick={() => handleNumber('.')} label="." />
              <CalcButton onClick={handleEqual} label="=" variant="action" />
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
              <div className="relative">
                <textarea
                  value={smartPrompt}
                  onChange={(e) => setSmartPrompt(e.target.value)}
                  placeholder="Ask a math problem (e.g. 'If I have 20 apples and give 3 to each of my 5 friends, how many are left?')"
                  className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none text-sm"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button 
                    onClick={() => setSmartPrompt('')}
                    className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSmartSolve}
                disabled={isSolving || !smartPrompt.trim()}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all shadow-xl shadow-blue-900/10 ${
                  isSolving || !smartPrompt.trim() 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isSolving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Solve with AI</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Home Indicator */}
        <div className="h-1 w-32 bg-white/20 rounded-full mx-auto mb-2 mt-auto"></div>
      </div>
    </div>
  );
};

interface CalcButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'action';
  colSpan?: number;
  active?: boolean;
}

const CalcButton: React.FC<CalcButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary', 
  colSpan = 1,
  active = false
}) => {
  const baseStyles = "flex items-center justify-center rounded-full text-2xl font-medium transition-all duration-150 h-16 w-16 select-none active:scale-95";
  const variants = {
    primary: "bg-slate-800 text-white hover:bg-slate-700",
    secondary: "bg-slate-400 text-black hover:bg-slate-300",
    action: `text-white transition-colors duration-200 ${active ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400'}`
  };

  const spanStyles = colSpan > 1 ? `w-auto col-span-${colSpan}` : '';

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${spanStyles} ${colSpan > 1 ? 'aspect-auto px-6 rounded-[32px] w-full' : 'aspect-square'}`}
    >
      {label}
    </button>
  );
};

export default App;
