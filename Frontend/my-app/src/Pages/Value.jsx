import React from 'react';
import { useLocation } from 'react-router-dom';

const Value = () => {
  const location = useLocation();
  const state = location?.state;

  if (!state || typeof state !== 'object') {
    return
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Submitted Lead Data:</h2>
      {Object.entries(state).map(([key, value]) => (
        <p key={key}><strong>{key}:</strong> {value}</p>
      ))}
    </div>
  );
};

export default Value;
