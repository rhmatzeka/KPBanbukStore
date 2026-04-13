import React from 'react';

function Loading() {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-dot"></div>
        </div>
        <p className="loading-text">Memuat...</p>
      </div>
    </div>
  );
}

export default Loading;
