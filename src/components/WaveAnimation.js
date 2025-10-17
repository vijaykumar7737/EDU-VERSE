import React from 'react';
import './WaveAnimation.css';

const WaveAnimation = () => {
  return (
    <>
      {/* Bottom waves */}
      <div className="wave-container">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      {/* Top waves */}
      <div className="wave-container">
        <div className="wave-top"></div>
        <div className="wave-top"></div>
      </div>

      {/* Floating shapes */}
      <div className="floating-shapes">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>

      {/* Pulse background */}
      <div className="pulse-bg"></div>
    </>
  );
};

export default WaveAnimation;