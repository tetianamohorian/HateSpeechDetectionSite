import React from 'react';
import Header from './components/Header';
import InfoBox from './components/InfoBox';
import Footer from './components/Footer';

import './App.css';

const App = () => {
  const handleSendMessage = (message) => {
    console.log('Отправлено сообщение:', message);
  };

  return (
    <div className="app-container">
      <Header />
      <InfoBox /> 
      <Footer />

    </div>
  );
};

export default App;
