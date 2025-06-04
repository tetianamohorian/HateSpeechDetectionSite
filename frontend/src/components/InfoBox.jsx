import React, { useState, useEffect } from 'react';
import ChatInput from './ChatInput.jsx';
import Historia from './Historia.jsx';
import { ChevronDown, ChevronUp } from 'lucide-react';

const InfoBox = () => {
  const [headerText, setHeaderText] = useState('Analyzujte text na nenávistný jazyk');
  const [paragraphText, setParagraphText] = useState('Tento nástroj využíva umelú inteligenciu na identifikáciu toxického obsahu v textoch. Stačí zadať text a zistiť, či obsahuje nenávistný jazyk.');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/history");
      const data = await response.json();
      setHistory(data.reverse());
    } catch (err) {
      console.error("Nepodarilo sa načítať históriu:", err);
    }
  };

  const handleSendMessage = async (userMessage) => {
    setHeaderText("Analyzujem text...");
    setParagraphText("Analyzujeme váš text, prosím čakajte...");
    setIsLoading(true); 
    const startTime = Date.now();
    
    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage }),
      });
      const data = await response.json();
      const elapsed = Date.now() - startTime;
      const minimumDelay = 5000;
      
      if (elapsed < minimumDelay) {
        await new Promise(resolve => setTimeout(resolve, minimumDelay - elapsed));
      }
      
      if (response.ok) {
        setHeaderText(data.prediction);
        setParagraphText(`Váš text bol: "${userMessage}"`);
        fetchHistory();
      } else {
        console.error("Server vrátil chybu:", data.error);
      }
    } catch (error) {
      console.error("Chyba pri odosielaní:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);


  return (
    <div className="info-container text-center w-full pb-16">
      <h2 className={isLoading ? "pulse" : ""}>{isLoading ? 'Analyzujem text...' : headerText}</h2>
      <p>{isLoading ? 'Prosím čakajte, prebieha analýza.' : paragraphText}</p>
      
      <div className="flex flex-col items-center w-full">
        <ChatInput onSubmit={handleSendMessage} />
        
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
          </div>
        )}
        
        <div className="relative w-full mt-8 max-w-3x">
          <button
  onClick={() => setShowHistory(!showHistory)}
  disabled={isLoading}
  className="button-historia w-full py-3 px-5 rounded-lg transition font-semibold text-white bg-gray-800/70 hover:bg-gray-800/90"
  style={{
    position: 'relative',
    display: 'block',
    width: '100%',
    textAlign: 'center',
    height: '48px',
    transition: 'all 0.3s ease'
  }}
>
  <div style={{
    position: 'relative',
    display: 'inline-block',
    width: '100%'
  }}>
    <span style={{
      position: 'absolute',
      left: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      paddingTop: '-7px',
      paddingBottom: '7px'
    }}>
      🕘 História analýz
    </span>
    <span style={{
      position: 'absolute',
      right: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      paddingTop: '7px',
      paddingBottom: '7px'
    }}>
      {showHistory ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
    </span>
  </div>
</button>
          
          {showHistory && (
            <div
              className={`w-full
                         mt-2 p-4 rounded-lg
                         bg-gray-900/80 backdrop-blur-md
                         overflow-y-auto max-h-40
                          transition-all duration-500 ease-in-out
                          mx-auto
                          ${showHistory ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} `}
                         
              style={{
                maxHeight: '80px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#4B5563 transparent'
              }}
            >
              <div className="history-container" style={{minHeight: '150px', minHeight: window.innerWidth <= 426 ? '20px' : '140px',}}>
                 <div className="flex justify-center">
                    <Historia history={history}/>
                   </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoBox; 
