import { useState, useEffect } from 'react';

export default function StatusBadge() {
  const [status, setStatus] = useState<string>('Connecting...');

  useEffect(() => {
    fetch('http://localhost:5000/api/ping')
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('Backend offline'));
  }, []);

  return (
    <div className="status-badge" style={{ fontSize: '12px', color: '#666' }}>
      Server Status: <strong>{status}</strong>
    </div>
  );
}