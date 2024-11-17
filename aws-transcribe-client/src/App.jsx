import React, { useState ,useEffect} from 'react';
import axios from 'axios';

function App() {
  const [pdfUrls, setPdfUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPdfs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/get-pdfs');
      setPdfUrls(response.data.pdfUrls);
    } catch (err) {
      setError('Failed to fetch PDF files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();  
  }, []); 

  const getFileNameFromUrl = (url) => {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1]; 
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>PDF Manager</h1>
      </header>

      <main style={styles.main}>
        <button onClick={fetchPdfs} style={styles.button}>Fetch PDFs</button>

        {loading && <p>Loading...</p>}
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.container}>
          {pdfUrls.map((url, index) => {
            const fileName = getFileNameFromUrl(url); 
            return (
              <div key={index} style={styles.card}>
                <div style={styles.preview}>
                  <img 
                    src={`https://api.thumbnail.ws/api/thumbnail/get?url=${url}&width=200`} 
                    alt={`Preview ${index + 1}`} 
                    onError={(e) => {
                      console.error('Failed to load thumbnail', e.target.src); 
                      e.target.src = 'https://via.placeholder.com/200'; 
                    }} 
                    style={styles.image} 
                  />
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{fileName}</h3>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={styles.link}>View PDF</a><br />
                  <a href={url} download style={styles.downloadButton}>Download</a><br />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2024 PDF Manager. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f4f4f9',
  },
  header: {
    backgroundColor: '#6c5ce7',
    color: 'white',
    padding: '20px 0',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  main: {
    padding: '20px',
    textAlign: 'center',
    flex: '1',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#fd79a8',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  error: {
    color: 'red',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
  },
  card: {
    width: '300px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '15px',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    backgroundColor: '#fff', 
  },
  
  cardContent: {
    marginTop: '10px',
  },
  preview: {
    maxHeight: '150px',
    overflow: 'hidden',
    borderRadius: '10px',
  },
  image: {
    width: '100%',
    objectFit: 'cover',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '10px 0',
    color: '#2d3436',
  },
  link: {
    color: '#0984e3',
    textDecoration: 'none',
    fontSize: '16px',
  },
  downloadButton: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 15px',
    backgroundColor: '#00b894',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '16px',
  },
  footer: {
    backgroundColor: '#2d3436',
    color: 'white',
    padding: '10px 0',
    textAlign: 'center',
    marginTop: '20px',
  },
};

export default App;
