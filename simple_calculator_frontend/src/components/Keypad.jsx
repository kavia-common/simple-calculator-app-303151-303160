import React, { useMemo } from "react";
import Key from "./Key";

/**
 * Layout: 4-column grid (mobile-friendly).
 * Rows:
 *  AC   C   +/-  %
 *  7    8   9    ÷
 *  4    5   6    ×
 *  1    2   3    −
 *  0(2) .   =    +
 */

// PUBLIC_INTERFACE
function Keypad({ onKeyPress }) {
  const keys = useMemo(
    () => [
      { label: "AC", variant: "utility", aria: "All clear", testId: "key-ac" },
      { label: "C", variant: "utility", aria: "Clear entry", testId: "key-c" },
      { label: "+/-", variant: "utility", aria: "Toggle sign", testId: "key-sign" },
      { label: "%", variant: "utility", aria: "Percent", testId: "key-percent" },

      { label: "7", variant: "digit", testId: "key-7" },
      { label: "8", variant: "digit", testId: "key-8" },
      { label: "9", variant: "digit", testId: "key-9" },
      { label: "÷", variant: "op", aria: "Divide", testId: "key-divide" },

      { label: "4", variant: "digit", testId: "key-4" },
      { label: "5", variant: "digit", testId: "key-5" },
      { label: "6", variant: "digit", testId: "key-6" },
      { label: "×", variant: "op", aria: "Multiply", testId: "key-multiply" },

      { label: "1", variant: "digit", testId: "key-1" },
      { label: "2", variant: "digit", testId: "key-2" },
      { label: "3", variant: "digit", testId: "key-3" },
      { label: "−", variant: "op", aria: "Subtract", testId: "key-subtract" },

      { label: "0", variant: "digit", span: 2, testId: "key-0" },
      { label: ".", variant: "digit", aria: "Decimal point", testId: "key-decimal" },
      { label: "=", variant: "equals", aria: "Equals", testId: "key-equals" },
      { label: "+", variant: "op", aria: "Add", testId: "key-add" }
    ],
    []
  );

  return (
    <div className="keypad" aria-label="Calculator keypad">
      {keys.map((k) => (
        <Key
          key={k.testId || k.label}
          label={k.label}
          variant={k.variant}
          span={k.span}
          onPress={onKeyPress}
          ariaLabel={k.aria}
          testId={k.testId}
        />
      ))}
    </div>
  );
}

export default Keypad;
