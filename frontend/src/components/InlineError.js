import React from 'react';

const styles = {
  background: '#fef2f2',
  color: '#b91c1c',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '12px 0',
  fontSize: '14px'
};

const InlineError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="inline-error" role="alert" style={styles}>
      {message}
    </div>
  );
};

export default InlineError;
