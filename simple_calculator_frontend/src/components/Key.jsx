import React from "react";

// PUBLIC_INTERFACE
function Key({ label, variant = "default", span = 1, onPress, ariaLabel, testId }) {
  return (
    <button
      type="button"
      className={`key key--${variant} ${span === 2 ? "key--span2" : ""}`}
      onClick={() => onPress(label)}
      aria-label={ariaLabel || `Key ${label}`}
      data-testid={testId}
    >
      {label}
    </button>
  );
}

export default Key;
