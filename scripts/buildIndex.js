const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');

async function buildIndex() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    const docsDir = path.join(__dirname, '..', 'docs');
    const files = await fs.readdir(docsDir);
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));

    const documents = [];

    for (const file of pdfFiles) {
      console.log(`Processing ${file}...`);
      const dataBuffer = await fs.readFile(path.join(docsDir, file));
      
      try {
        const pdfData = await pdf(dataBuffer);
        documents.push({
          filename: file,
          title: file.replace('.pdf', '').replace(/[-_]/g, ' '),
          content: pdfData.text,
          info: pdfData.info
        });
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }

    const index = { documents };
    await fs.writeFile(
      path.join(dataDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );

    console.log(`Index built successfully with ${documents.length} documents`);
  } catch (err) {
    console.error('Error building index:', err);
    process.exit(1);
  }
}

buildIndex();