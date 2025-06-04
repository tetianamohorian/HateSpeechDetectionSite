import React from 'react';
import { FaTelegram, FaGooglePlay } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-container">
      <p>Created by Tetiana Mohorian</p>
      <div className="footer-icons">
        <a href="https://t.me/hate_speech_sk_bot" target="_blank" rel="noopener noreferrer">
          <FaTelegram size={32} />
        </a>
        <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
          <FaGooglePlay size={28} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
