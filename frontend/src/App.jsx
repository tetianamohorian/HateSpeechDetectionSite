import React from 'react';
import Header from './components/Header';
import InfoBox from './components/InfoBox';
import Footer from './components/Footer';

import './App.css';

const App = () => {
  return (
    <div className="app-container flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-start mt-8 px-4">
        <InfoBox />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
