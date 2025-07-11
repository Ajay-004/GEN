import React from 'react';
import '../style/LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-spinner-container">
      <div className="spinner"></div>
      <span>Thinking...</span>
    </div>
  );
}

export default LoadingSpinner;