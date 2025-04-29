import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [pdfData, setPdfData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const classSchedule = [
    { start: 9, end: 10, subject: 'Math' },
    { start: 10, end: 11, subject: 'Physics' },
    { start: 11, end: 12, subject: 'Chemistry' },
    { start: 12, end: 13, subject: 'English' },
    { start: 13, end: 14, subject: 'Environmental Science' },
    { start: 14, end: 15, subject: 'Computer Science' },
  ];

  const fetchPdfs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://lecture-transcription.onrender.com/get-pdfs');
      const pdfUrls = response.data.pdfUrls;

      const categorizedData = {};

      pdfUrls.forEach(url => {
        const fileName = getFileNameFromUrl(url);
        const lectureHour = extractHourFromFileName(fileName);
        const subject = getSubjectByHour(lectureHour);

        if (!categorizedData[subject]) {
          categorizedData[subject] = [];
        }
        categorizedData[subject].push({ url, fileName });
      });

      setPdfData(categorizedData);
    } catch (err) {
      setError('Failed to fetch lecture transcripts. Please try again.');
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

  const extractHourFromFileName = (fileName) => {
    try {
      const timestampPart = fileName.split('_')[1]?.split('.')[0];
      const timestamp = parseInt(timestampPart);
      if (isNaN(timestamp)) return null;

      const date = new Date(timestamp);
      const hour = date.getHours();
      return hour;
    } catch {
      return null;
    }
  };

  const getSubjectByHour = (hour) => {
    if (hour === null) return 'Uncategorized';
    const matched = classSchedule.find(slot => hour >= slot.start && hour < slot.end);
    return matched ? matched.subject : 'Uncategorized';
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  return (
    <div style={styles.pageWrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>Lecture Transcriptions</h1>
      </header>

      <main style={styles.mainContent}>
        <button onClick={fetchPdfs} style={styles.fetchButton}>Load Lecture Transcripts</button>

        {loading && <p style={styles.statusText}>Loading lecture transcripts...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        <div style={styles.sectionSelection}>
          <label htmlFor="subjectSelect" style={styles.selectLabel}>Select Subject:</label>
          <select 
            id="subjectSelect" 
            style={styles.selectInput}
            value={selectedSubject}
            onChange={handleSubjectChange}
          >
            <option value="">All Subjects</option>
            {classSchedule.map((slot, index) => (
              <option key={index} value={slot.subject}>{slot.subject}</option>
            ))}
          </select>
        </div>

        <div style={styles.pdfGrid}>
          {Object.keys(pdfData).map(subject => {
            if (selectedSubject && subject !== selectedSubject) return null;

            return (
              <div key={subject} style={styles.subjectSection}>
                <h2 style={styles.subjectTitle}>{subject}</h2>
                {pdfData[subject].map((pdf, index) => (
                  <div key={index} style={styles.transcriptCard}>
                    <h3 style={styles.transcriptTitle}>{pdf.fileName}</h3>
                    <div style={styles.buttonGroup}>
                      <a href={pdf.url} target="_blank" rel="noopener noreferrer" style={styles.viewButton}>View Transcript</a>
                      <a href={pdf.url} download style={styles.downloadButton}>Download Transcript</a>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>&copy; 2025 Lecture Transcription Service.</p>
      </footer>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#40739e',
    padding: '20px',
    textAlign: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: '32px',
    margin: 0,
  },
  mainContent: {
    flex: 1,
    padding: '30px 20px',
    textAlign: 'center',
  },
  fetchButton: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#3498db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  statusText: {
    marginTop: '10px',
    fontSize: '18px',
  },
  errorText: {
    color: 'red',
    fontSize: '18px',
    marginTop: '10px',
  },
  sectionSelection: {
    marginBottom: '20px',
  },
  selectLabel: {
    fontSize: '18px',
    marginRight: '10px',
  },
  selectInput: {
    padding: '8px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  pdfGrid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    marginTop: '20px',
  },
  subjectSection: {
    width: '100%',
    textAlign: 'center',
  },
  subjectTitle: {
    fontSize: '24px',
    color: '#2d3436',
    marginBottom: '20px',
    borderBottom: '2px solid #3498db',
    display: 'inline-block',
    paddingBottom: '5px',
  },
  transcriptCard: {
    width: '300px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    margin: '10px auto',
  },
  transcriptTitle: {
    fontSize: '18px',
    color: '#2d3436',
    marginBottom: '15px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  viewButton: {
    backgroundColor: '#6c5ce7',
    color: '#ffffff',
    padding: '10px',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '16px',
  },
  downloadButton: {
    backgroundColor: '#00cec9',
    color: '#ffffff',
    padding: '10px',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '16px',
  },
  footer: {
    backgroundColor: '#2d3436',
    padding: '10px',
    textAlign: 'center',
  },
  footerText: {
    color: '#ffffff',
    fontSize: '14px',
    margin: 0,
  },
  
};

export default App;
