import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSubmit }) => {
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulár bol odoslaný!", input); // Добавили лог
    if (input.trim()) {
      try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await response.json();
      //alert(`Výsledok analýzy: ${data.prediction}`);
      
      if (onSubmit) 
      {
        onSubmit(input, data.prediction);
      }
      setInput('');
    }  catch (error) {
      console.error("Ошибка запроса:", error);
      alert("Chyba pri analýze textu!");
    }
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
        <button type="submit" className="submit-button">
          <Send size={24} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
