import React, { useState } from 'react';
import ChatInput from './ChatInput.jsx';

const InfoBox = () => {
  


  const [headerText, setHeaderText] = useState('Analyzujte text na nenávistný jazyk');
  const [paragraphText, setParagraphText] = useState('Tento nástroj využíva umelú inteligenciu na identifikáciu toxického obsahu v textoch. Stačí zadať text a zistiť, či obsahuje nenávistný jazyk.');

  const handleSendMessage = (userMessage, serverResponse) => {
    console.log('Отправлено сообщение:', userMessage);
    console.log('Ответ от сервера:', serverResponse);

    setHeaderText(serverResponse); // В заголовок пишем ответ от сервера
    setParagraphText(`Váš text bol: "${userMessage}"`);// В параграф пишем сообщение пользователя
  };


 return  (

  

  <div className="info-container">
    <h2>{headerText}</h2>
    <p>{paragraphText}</p>

    <ChatInput onSubmit={handleSendMessage} /> {}

  </div>
);
}

export default InfoBox;
