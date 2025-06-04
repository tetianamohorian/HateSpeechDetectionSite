import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSubmit }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // reset chyby

    if (input.trim()) {
      try {
        const response = await fetch("http://localhost:5000/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Chyba pri analýze textu.");
          return;
        }

        if (onSubmit) {
          onSubmit(input, data.prediction);
        }

        setInput('');
      } catch (error) {
        console.error("Chyba požiadavky:", error);
        setError("Nepodarilo sa spojiť so serverom.");
      }
    } else {
      setError("Text nesmie byť prázdny.");
    }
  };

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit} className="input-wrapper">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Zadajte text na analýzu"
          className="text-input"
        />
        <button type="submit" className="submit-button" title="Spustiť analýzu">
          <Send size={24} />
        </button>
      </form>

      {error && (
        <div className="mt-8 text-red-500 font-semibold text-center">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default ChatInput;


