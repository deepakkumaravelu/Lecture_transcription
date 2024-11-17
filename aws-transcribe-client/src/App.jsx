import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [pdfUrls, setPdfUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPdfs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://lecture-transcription.onrender.com/get-pdfs');
      console.log(response);
      setPdfUrls(response.data.pdfUrls);
    } catch (err) {
      setError('Failed to fetch PDF files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>PDF Manager</h1>
      <button onClick={fetchPdfs} style={styles.button}>
        Fetch PDFs
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul style={styles.list}>
        {pdfUrls.map((url, index) => (
          <li key={index}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
  },
};

export default App;

