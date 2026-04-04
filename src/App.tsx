import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [currentValue, setCurrentValue] = useState('0')
  const [previousValue, setPreviousValue] = useState<string | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  // Draggable state
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const clearAll = useCallback(() => {
    setCurrentValue('0')
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }, [])

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return
    setCurrentValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0')
  }, [waitingForOperand])

  const handleNumber = useCallback((digit: string) => {
    if (waitingForOperand) {
      setCurrentValue(digit)
      setWaitingForOperand(false)
    } else {
      setCurrentValue(prev => (prev === '0' ? digit : prev + digit))
    }
  }, [waitingForOperand])

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setCurrentValue('0.')
      setWaitingForOperand(false)
    } else if (!currentValue.includes('.')) {
      setCurrentValue(prev => prev + '.')
    }
  }, [waitingForOperand, currentValue])

  const performCalculation = useCallback(() => {
    if (operator === null || previousValue === null) return

    const prev = parseFloat(previousValue)
    const current = parseFloat(currentValue)
    let result = 0

    switch (operator) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/': 
        if (current === 0) {
          alert("Cannot divide by zero")
          clearAll()
          return
        }
        result = prev / current; 
        break;
      case '^': result = Math.pow(prev, current); break;
      default: return
    }

    setCurrentValue(String(Number(result.toFixed(8))))
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }, [operator, previousValue, currentValue, clearAll])

  const handleOperator = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(currentValue)

    // Unary functions
    const unaryOps = ['sqrt', 'sin', 'cos', 'tan', 'csc', 'cot', 'log', 'ln']
    if (unaryOps.includes(nextOperator)) {
      let result = 0
      switch (nextOperator) {
        case 'sqrt':
          if (inputValue < 0) { alert("Invalid input for square root"); return }
          result = Math.sqrt(inputValue); break
        case 'sin': result = Math.sin(inputValue); break
        case 'cos': result = Math.cos(inputValue); break
        case 'tan': result = Math.tan(inputValue); break
        case 'csc':
          if (Math.sin(inputValue) === 0) { alert("Invalid input for csc"); return }
          result = 1 / Math.sin(inputValue); break
        case 'cot':
          if (Math.tan(inputValue) === 0) { alert("Invalid input for cot"); return }
          result = 1 / Math.tan(inputValue); break
        case 'log':
          if (inputValue <= 0) { alert("Invalid input for log"); return }
          result = Math.log10(inputValue); break
        case 'ln':
          if (inputValue <= 0) { alert("Invalid input for ln"); return }
          result = Math.log(inputValue); break
      }
      setCurrentValue(String(Number(result.toFixed(8))))
      setWaitingForOperand(true)
      return
    }

    // Pi is a special constant button
    if (nextOperator === 'pi') {
      if (!waitingForOperand && currentValue !== '0') {
        // Implicit multiplication (e.g., "5π")
        const result = parseFloat(currentValue) * Math.PI
        setCurrentValue(String(Number(result.toFixed(8))))
      } else {
        setCurrentValue(String(Math.PI))
      }
      setWaitingForOperand(true)
      return
    }

    // Binary functions
    if (operator && !waitingForOperand) {
      performCalculation()
    } else {
      setPreviousValue(String(inputValue))
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }, [currentValue, operator, waitingForOperand, performCalculation])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key } = event
    if (/[0-9]/.test(key)) handleNumber(key)
    else if (key === '.') handleDecimal()
    else if (key === '+') handleOperator('+')
    else if (key === '-') handleOperator('-')
    else if (key === '*') handleOperator('*')
    else if (key === '/') handleOperator('/')
    else if (key === '^') handleOperator('^')
    else if (key === 'Enter' || key === '=') performCalculation()
    else if (key === 'Escape' || key === 'c' || key === 'C') clearAll()
    else if (key === 'Backspace') handleBackspace()
    else if (key === 's' || key === 'S') handleOperator('sin')
  }, [handleNumber, handleDecimal, handleOperator, performCalculation, clearAll, handleBackspace])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div 
      className="calculator-ti84"
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="case">
        <div className="drag-handle">
          <div className="ti-logo">TEXAS INSTRUMENTS</div>
          <div className="model-name">TI-84 Plus CE</div>
        </div>
        
        <div className="screen-container">
          <div className="status-bar">
            <span>NORMAL FLOAT AUTO REAL RADIAN MP</span>
          </div>
          <div className="display-area">
            <div className="history">
              {previousValue && `${previousValue} ${operator === '*' ? '×' : operator === '/' ? '÷' : operator === '^' ? '^' : operator}`}
            </div>
            <div className="current-line">
              {currentValue}
              <span className="cursor"></span>
            </div>
          </div>
        </div>

        <div className="button-layout-scientific">
          {/* Top Row: Trig & Core Utility */}
          <div className="row-5">
            <button className="btn btn-ti-sci" onClick={() => handleOperator('sin')}>sin</button>
            <button className="btn btn-ti-sci" onClick={() => handleOperator('cos')}>cos</button>
            <button className="btn btn-ti-sci" onClick={() => handleOperator('tan')}>tan</button>
            <button className="btn btn-ti-del" onClick={handleBackspace}>DEL</button>
            <button className="btn btn-ti-clear" onClick={clearAll}>clear</button>
          </div>

          {/* Second Row: Scientific & Exponent */}
          <div className="row-5">
            <button className="btn btn-ti-sci" onClick={() => handleOperator('csc')}>csc</button>
            <button className="btn btn-ti-sci" onClick={() => handleOperator('cot')}>cot</button>
            <button className="btn btn-ti-sci" onClick={() => handleOperator('log')}>log</button>
            <button className="btn btn-ti-sci" onClick={() => handleOperator('ln')}>ln</button>
            <button className="btn btn-ti-op btn-blue" onClick={() => handleOperator('^')}>^</button>
          </div>

          {/* Basic Rows (Numbers & Operators) */}
          <div className="row-5">
            <button className="btn btn-ti-num" onClick={() => handleNumber('7')}>7</button>
            <button className="btn btn-ti-num" onClick={() => handleNumber('8')}>8</button>
            <button className="btn btn-ti-num" onClick={() => handleNumber('9')}>9</button>
            <button className="btn btn-ti-op btn-blue" onClick={() => handleOperator('/')}>÷</button>
            <button className="btn btn-ti-op btn-blue" onClick={() => handleOperator('sqrt')}>√</button>
          </div>

          <div className="row-5">
            <button className="btn btn-ti-num" onClick={() => handleNumber('4')}>4</button>
            <button className="btn btn-ti-num" onClick={() => handleNumber('5')}>5</button>
            <button className="btn btn-ti-num" onClick={() => handleNumber('6')}>6</button>
            <button className="btn btn-ti-op btn-blue" onClick={() => handleOperator('*')}>×</button>
            <button className="btn btn-ti-sci btn-cyan" onClick={() => handleOperator('pi')}>π</button>
          </div>

          <div className="row-5">
            <button className="btn btn-ti-num" onClick={() => handleNumber('1')}>1</button>
            <button className="btn btn-ti-num" onClick={() => handleNumber('2')}>2</button>
            <button className="btn btn-ti-num" onClick={() => handleNumber('3')}>3</button>
            <button className="btn btn-ti-op btn-dark" onClick={() => handleOperator('-')}>−</button>
            <button className="btn btn-ti-op btn-dark" onClick={() => handleOperator('+')}>+</button>
          </div>

          <div className="row-5">
            <button className="btn btn-ti-num btn-zero-ti" onClick={() => handleNumber('0')}>0</button>
            <button className="btn btn-ti-num" onClick={handleDecimal}>.</button>
            <button className="btn btn-ti-enter-sci" onClick={performCalculation}>enter</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
