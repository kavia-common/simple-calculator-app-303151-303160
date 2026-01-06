# Simple Calculator (Rainbow Burst)

A simple, responsive React calculator that supports basic arithmetic operations: addition, subtraction, multiplication, and division — styled with the **Rainbow Burst** theme.

## Run locally

From `simple_calculator_frontend/`:

```bash
npm install
npm start
```

Then open http://localhost:3000

## Features

- Centered calculator layout with display + keypad grid
- Buttons: digits `0–9`, decimal `.`, `AC`, `C`, `+/-`, `%`, `÷`, `×`, `−`, `+`, `=`
- Handles edge cases:
  - Division by zero shows `Error`
  - Consecutive operators replace the pending operator
  - Multiple decimals are prevented
- Keyboard support:
  - Digits: `0–9`
  - Decimal: `.`
  - Operators: `+` `-` `*` `/`
  - Equals: `Enter` or `=`
  - Delete: `Backspace`
  - Clear all: `Escape`

## Testing hooks

The UI includes `data-testid` attributes:
- Display: `display`
- Keys: `key-0` ... `key-9`, `key-add`, `key-subtract`, `key-multiply`, `key-divide`, `key-equals`, `key-ac`, `key-c`, `key-decimal`, `key-sign`, `key-percent`
