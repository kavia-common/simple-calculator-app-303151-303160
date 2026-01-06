import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import Display from "./components/Display";
import Keypad from "./components/Keypad";

/**
 * Calculator behavior notes:
 * - Uses "immediate execution" chaining (typical handheld calculators):
 *   entering `2 + 3 × 4 =` yields 20 because it evaluates (2+3)=5, then 5×4=20.
 * - Operator precedence is not applied during chaining; evaluation occurs on "="
 *   or when an operator is pressed after completing an operand.
 * - Supports repeating "=" (e.g., 2 + 3 = = => 8).
 */

const MAX_DISPLAY_LEN = 16;

function formatNumberForDisplay(value) {
  if (value === "Error") return "Error";
  if (value === "" || value == null) return "0";

  // Keep raw entry as-is if it ends with '.' or is just '-' etc.
  if (typeof value === "string") {
    if (value === "-") return "-";
    if (value.endsWith(".")) return value;
    // Normalize "-0" to "0" unless user is typing "-0."
    if (value === "-0") return "0";
  }

  const num = Number(value);
  if (!Number.isFinite(num)) return "Error";

  // Use a compact representation but avoid scientific for small numbers where possible.
  // For large/small values, scientific is acceptable.
  const abs = Math.abs(num);
  let out;
  if ((abs !== 0 && abs < 1e-6) || abs >= 1e10) {
    out = num.toExponential(6);
  } else {
    // Trim to 10 fractional digits, then remove trailing zeros.
    out = num.toFixed(10).replace(/\.?0+$/, "");
  }

  // Hard cap length (prefer showing the end for exponent; otherwise truncate)
  if (out.length > MAX_DISPLAY_LEN) {
    if (out.includes("e")) return out; // already compact
    out = out.slice(0, MAX_DISPLAY_LEN);
  }
  return out;
}

function isDigitKey(k) {
  return k.length === 1 && k >= "0" && k <= "9";
}

function opSymbolToInternal(op) {
  // UI uses ÷ × −
  if (op === "÷") return "/";
  if (op === "×") return "*";
  if (op === "−") return "-";
  return op;
}

function internalToOpSymbol(op) {
  if (op === "/") return "÷";
  if (op === "*") return "×";
  if (op === "-") return "−";
  return op;
}

function compute(a, op, b) {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return "Error";

  switch (op) {
    case "+":
      return x + y;
    case "-":
      return x - y;
    case "*":
      return x * y;
    case "/":
      if (y === 0) return "Error";
      return x / y;
    default:
      return "Error";
  }
}

// PUBLIC_INTERFACE
function App() {
  /**
   * `display` is a string so we can preserve user typing (e.g. "0.", "-").
   * `accumulator` and `pendingValue` are stored as strings to avoid float drift
   * until compute time.
   */
  const [display, setDisplay] = useState("0");
  const [accumulator, setAccumulator] = useState(null); // string | null
  const [operator, setOperator] = useState(null); // "+", "-", "*", "/" | null
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [lastOp, setLastOp] = useState(null); // for repeating "="
  const [lastOperand, setLastOperand] = useState(null); // for repeating "="

  const displayValue = useMemo(() => formatNumberForDisplay(display), [display]);

  const clearAll = () => {
    setDisplay("0");
    setAccumulator(null);
    setOperator(null);
    setAwaitingNext(false);
    setLastOp(null);
    setLastOperand(null);
  };

  const clearEntry = () => {
    setDisplay("0");
    setAwaitingNext(false);
  };

  const backspace = () => {
    if (awaitingNext) {
      // If we were waiting for a new number, treat backspace as clearing entry.
      setDisplay("0");
      setAwaitingNext(false);
      return;
    }
    setDisplay((prev) => {
      if (prev === "Error") return "0";
      if (prev.length <= 1) return "0";
      const next = prev.slice(0, -1);
      // keep lone "-" as "0"
      return next === "-" ? "0" : next;
    });
  };

  const inputDigit = (d) => {
    setDisplay((prev) => {
      if (prev === "Error") return d;

      if (awaitingNext) {
        setAwaitingNext(false);
        return d === "." ? "0." : d;
      }

      if (d === ".") {
        if (prev.includes(".")) return prev;
        return prev + ".";
      }

      if (prev === "0") return d;
      if (prev === "-0") return "-" + d;
      return prev + d;
    });
  };

  const toggleSign = () => {
    setDisplay((prev) => {
      if (prev === "Error") return prev;
      if (awaitingNext) {
        setAwaitingNext(false);
        return "-0";
      }
      if (prev.startsWith("-")) return prev.slice(1) || "0";
      if (prev === "0") return "-0";
      return "-" + prev;
    });
  };

  const percent = () => {
    setDisplay((prev) => {
      if (prev === "Error") return prev;
      const num = Number(prev);
      if (!Number.isFinite(num)) return "Error";
      const out = num / 100;
      return String(out);
    });
    setAwaitingNext(false);
  };

  const applyOperator = (nextOpSymbol) => {
    const nextOp = opSymbolToInternal(nextOpSymbol);

    setDisplay((prevDisplay) => {
      // If error, ignore operators except allow clearing via AC/C.
      if (prevDisplay === "Error") return prevDisplay;

      // Consecutive operator presses should replace the operator (no computation).
      if (awaitingNext) {
        setOperator(nextOp);
        return prevDisplay;
      }

      const currentValue = prevDisplay;

      if (accumulator == null) {
        setAccumulator(currentValue);
        setOperator(nextOp);
        setAwaitingNext(true);
        setLastOp(null);
        setLastOperand(null);
        return prevDisplay;
      }

      if (operator == null) {
        // Shouldn't happen often; treat like first op
        setAccumulator(currentValue);
        setOperator(nextOp);
        setAwaitingNext(true);
        setLastOp(null);
        setLastOperand(null);
        return prevDisplay;
      }

      const result = compute(accumulator, operator, currentValue);
      if (result === "Error") {
        setDisplay("Error");
        setAccumulator(null);
        setOperator(null);
        setAwaitingNext(false);
        setLastOp(null);
        setLastOperand(null);
        return "Error";
      }

      const resultStr = String(result);
      setAccumulator(resultStr);
      setOperator(nextOp);
      setAwaitingNext(true);

      // Chaining resets repeat "=" memory until "=" is actually pressed.
      setLastOp(null);
      setLastOperand(null);

      return resultStr;
    });
  };

  const equals = () => {
    setDisplay((prevDisplay) => {
      if (prevDisplay === "Error") return "Error";

      const currentValue = prevDisplay;

      // Repeat "=": use lastOp/lastOperand if operator is not active or we are awaiting next.
      if ((operator == null || awaitingNext) && lastOp != null && lastOperand != null) {
        const base = accumulator != null ? accumulator : currentValue;
        const result = compute(base, lastOp, lastOperand);
        if (result === "Error") {
          setAccumulator(null);
          setOperator(null);
          setAwaitingNext(false);
          return "Error";
        }
        const resultStr = String(result);
        setAccumulator(resultStr);
        setAwaitingNext(true);
        return resultStr;
      }

      if (accumulator == null || operator == null) {
        // Nothing to evaluate
        return prevDisplay;
      }

      const result = compute(accumulator, operator, currentValue);
      if (result === "Error") {
        setAccumulator(null);
        setOperator(null);
        setAwaitingNext(false);
        setLastOp(null);
        setLastOperand(null);
        return "Error";
      }

      const resultStr = String(result);

      // Store for repeated "=" behavior.
      setLastOp(operator);
      setLastOperand(currentValue);

      setAccumulator(resultStr);
      setOperator(null);
      setAwaitingNext(true);

      return resultStr;
    });
  };

  const handleKey = (key) => {
    if (key === "AC") return clearAll();
    if (key === "C") return clearEntry();
    if (key === "⌫") return backspace();
    if (key === "=") return equals();
    if (key === "+/-") return toggleSign();
    if (key === "%") return percent();

    if (isDigitKey(key) || key === ".") return inputDigit(key);

    // Operators
    if (key === "+" || key === "−" || key === "×" || key === "÷") return applyOperator(key);

    return null;
  };

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e) => {
      const { key } = e;

      // Prevent page scrolling on Space, etc. (though we don't use Space)
      if (isDigitKey(key) || ["+", "-", "*", "/", "Enter", "=", "Backspace", "Escape", ".", "%"].includes(key)) {
        e.preventDefault();
      }

      if (isDigitKey(key)) return handleKey(key);
      if (key === ".") return handleKey(".");
      if (key === "+") return handleKey("+");
      if (key === "-") return handleKey("−");
      if (key === "*") return handleKey("×");
      if (key === "/") return handleKey("÷");
      if (key === "Enter" || key === "=") return handleKey("=");
      if (key === "Backspace") return handleKey("⌫");
      if (key === "Escape") return handleKey("AC");
      if (key === "%") return handleKey("%");

      return null;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accumulator, operator, awaitingNext, lastOp, lastOperand]);

  const showOperator = operator ? internalToOpSymbol(operator) : null;

  return (
    <div className="App">
      <main className="calcPage">
        <section className="calcCard" aria-label="Calculator">
          <header className="calcHeader">
            <div className="brand">
              <div className="brandDot" aria-hidden="true" />
              <div className="brandText">
                <div className="brandTitle">Rainbow Burst</div>
                <div className="brandSub">Simple Calculator</div>
              </div>
            </div>
            <div className="hint" aria-label="Keyboard shortcuts hint">
              <span className="hintKey">Esc</span> AC <span className="hintSep">•</span>
              <span className="hintKey">⌫</span> Del <span className="hintSep">•</span>
              <span className="hintKey">Enter</span> =
            </div>
          </header>

          <Display value={displayValue} operator={showOperator} dataTestId="display" />

          <Keypad onKeyPress={handleKey} />

          <footer className="calcFooter">
            <span className="footerNote">
              Keyboard: <code>0-9</code> <code>.</code> <code>+</code> <code>-</code> <code>*</code> <code>/</code>{" "}
              <code>Enter</code> <code>Backspace</code> <code>Esc</code>
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
