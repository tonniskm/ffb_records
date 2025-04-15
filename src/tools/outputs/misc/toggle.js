import { useState } from "react";

export default function ToggleButton({ choiceA = "Choice A", choiceB = "Choice B", onToggle }) {
  const [selected, setSelected] = useState(choiceA);

  const handleClick = () => {
    const newChoice = selected === choiceA ? choiceB : choiceA;
    setSelected(newChoice);
    if (onToggle) onToggle(newChoice);
  };

  const nextChoice = selected === choiceA ? choiceB : choiceA;

  return (
    <button onClick={handleClick} style={{ padding: '8px 16px', fontSize: '16px' }}>
      Switch Colors to {nextChoice}
    </button>
  );
}
