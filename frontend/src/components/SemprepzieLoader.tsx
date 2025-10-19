import React from "react";
import "../styles/SemprepzieLoader.css";

const SemprepzieLoader: React.FC = () => {
  return (
    <div className="semprepzie-loader-container">
      <svg
        viewBox="0 0 1200 300"
        className="semprepzie-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c6ff" />
            <stop offset="100%" stopColor="#0072ff" />
          </linearGradient>

          
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          className="semprepzie-text"
        >
          semprepzie
        </text>

        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          className="semprepzie-beam"
        >
          semprepzie
        </text>
      </svg>
    </div>
  );
};

export default SemprepzieLoader;
