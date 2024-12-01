// frontend/src/App.js
import React, { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponse('An error occurred while fetching the response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>RAG Application</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          placeholder="Enter your question..."
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '300px' }}
        />
        <button type="submit">Ask</button>
      </form>
      {loading && <p>Loading...</p>}
      {response && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;