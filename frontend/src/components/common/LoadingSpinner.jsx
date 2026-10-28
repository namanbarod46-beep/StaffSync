import React from 'react';

const LoadingSpinner = ({ text = 'Loading StaffSync...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '80vh', width: '100%' }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: '3rem', height: '3rem', borderWidth: '0.25rem' }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">{text}</p>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center py-4">
      <div className="spinner-border text-primary spinner-border-sm me-2" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="text-muted small">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
