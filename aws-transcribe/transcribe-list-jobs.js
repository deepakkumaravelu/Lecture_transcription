const cors = require('cors');
const express = require('express');
const AWS = require('aws-sdk');
const PDFDocument = require('pdfkit');
const path = require('path');


// Enable CORS for all routes

// Configure AWS SDK
AWS.config.update({
  region: 'ap-southeast-2',
});

const s3 = new AWS.S3();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
// Function to check if PDF exists
const checkIfPdfExists = async (bucketName, fileName) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: `${path.basename(fileName, '.json')}.pdf`,
    };

    // Try to get the metadata of the file
    await s3.headObject(params).promise();
    return true; // If file exists, return true
  } catch (err) {
    if (err.code === 'NotFound') {
      return false; // If file doesn't exist, return false
    }
    throw err; // For other errors, throw them
  }
};

// Function to download JSON file, convert it to PDF, and upload to S3
const processJsonAndUploadPDF = async (bucketName, fileName) => {
  try {
    const pdfExists = await checkIfPdfExists('pdfbucketfortranscribe', fileName);
    
    if (pdfExists) {
      console.log(`PDF for ${fileName} already exists. Skipping upload.`);
      return; // Skip uploading if the PDF already exists
    }

    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    const data = await s3.getObject(params).promise();
    const jsonData = JSON.parse(data.Body.toString());
    const transcriptText = jsonData.results.transcripts[0].transcript;

    if (!transcriptText) {
      console.error('No transcript found in the JSON file.');
      return;
    }

    const pdfDoc = new PDFDocument();
    const pdfBuffer = [];

    pdfDoc.on('data', chunk => pdfBuffer.push(chunk)); // Collect PDF data in memory
    pdfDoc.on('end', () => {
      const pdfData = Buffer.concat(pdfBuffer);
      const uploadParams = {
        Bucket: 'pdfbucketfortranscribe',
        Key: `${path.basename(fileName, '.json')}.pdf`,
        Body: pdfData,
        ContentType: 'application/pdf',
      };

      s3.upload(uploadParams, (err, data) => {
        if (err) {
          console.error('Error uploading PDF to S3:', err);
        } else {
          console.log(`PDF uploaded successfully: ${data.Location}`);
        }
      });
    });

    pdfDoc.fontSize(12).text(transcriptText, { width: 410, align: 'left' });
    pdfDoc.end(); // End the PDF creation process

  } catch (err) {
    console.error('Error processing JSON file and uploading PDF:', err);
  }
};

// Endpoint to fetch all PDFs in the S3 bucket
app.get('/get-pdfs', async (req, res) => {
    try {
      // Trigger processing of new files
      await processNewFilesAutomatically('optranscriptionbucket');
  
      const params = {
        Bucket: 'pdfbucketfortranscribe',
      };
  
      const data = await s3.listObjectsV2(params).promise();
      const pdfFiles = data.Contents.filter(item => item.Key.endsWith('.pdf'));
      const pdfUrls = pdfFiles.map(file => {
        return `https://${params.Bucket}.s3.amazonaws.com/${file.Key}`;
      });
  
      res.json({ pdfUrls });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch PDF list', details: err.message });
    }
  });
  

// Function to process new files automatically when they are added to S3
const processNewFilesAutomatically = async (bucketName) => {
  try {
    const params = {
      Bucket: bucketName,
    };

    const data = await s3.listObjectsV2(params).promise();
    const currentFiles = data.Contents.map(item => item.Key);
    const jsonFiles = currentFiles.filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      jsonFiles.forEach(file => {
        processJsonAndUploadPDF(bucketName, file);
      });
    } else {
      console.log('No new JSON files to process.');
    }
  } catch (err) {
    console.error('Error checking for new files:', err);
  }
};

// Call this function to start the process
// processNewFilesAutomatically('optranscriptionbucket');

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
