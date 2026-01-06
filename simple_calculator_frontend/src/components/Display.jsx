import React from "react";

// PUBLIC_INTERFACE
function Display({ value, operator, dataTestId }) {
  /**
   * `operator` is displayed subtly to indicate the current pending operator.
   * `value` is already formatted for display by the parent.
   */
  return (
    <div className="displayWrap" aria-label="Calculator display">
      <div className="displayTopRow">
        <div className="displayOperator" aria-label="Pending operator">
          {operator || ""}
        </div>
      </div>
      <div className="display" data-testid={dataTestId} aria-live="polite" aria-atomic="true">
        {value}
      </div>
    </div>
  );
}

export default Display;
