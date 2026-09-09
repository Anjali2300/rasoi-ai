function StepIndicator({ currentStep = 1 }) {
  const steps = [
    ["1", "Snap your", "fridge"],
    ["2", "Verify", "ingredients"],
    ["3", "Discover", "recipes"],
  ];

  return (
    <div className="steps">
      {steps.map(([number, firstLine, secondLine], index) => (
        <div className="step-group" key={number}>
          <div
            className={`step ${
              index + 1 <= currentStep ? "active" : ""
            }`}
          >
            <span>{number}</span>

            <p>
              {firstLine}
              <br />
              {secondLine}
            </p>
          </div>

          {index < steps.length - 1 && (
            <div className="step-line"></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default StepIndicator;