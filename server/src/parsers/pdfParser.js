import fs from 'fs';
import pdf from 'pdf-parse';

/**
 * Extracts text and page structure from a PDF file.
 * Returns array of { pageNumber, text, heading }
 */
export async function parsePdf(filePath) {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);
    
    // Custom page render to capture page-by-page text
    const pages = [];
    let currentPage = 1;

    const renderPage = (pageData) => {
      return pageData.getTextContent().then((textContent) => {
        let lastY, text = '';
        for (const item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str + ' ';
          } else {
            text += '\n' + item.str + ' ';
          }
          lastY = item.transform[5];
        }
        
        const cleanText = text.replace(/\s+/g, ' ').trim();
        if (cleanText.length > 0) {
          // Attempt to extract title/heading from first non-empty line
          const firstLine = cleanText.split('\n')[0].substring(0, 100).trim();
          pages.push({
            pageNumber: currentPage,
            text: cleanText,
            heading: firstLine || `Page ${currentPage}`
          });
        }
        currentPage++;
        return text;
      });
    };

    const parsed = await pdf(dataBuffer, { pagerender: renderPage });

    // Fallback if custom renderPage did not collect pages
    if (pages.length === 0 && parsed.text && parsed.text.trim().length > 0) {
      const fullText = parsed.text.trim();
      pages.push({
        pageNumber: 1,
        text: fullText,
        heading: `Page 1`
      });
    }

    if (pages.length === 0) {
      throw new Error('No readable text found in PDF. It might be scanned, image-only, or password-protected.');
    }

    return {
      success: true,
      totalPages: parsed.numpages || pages.length,
      pages,
      rawText: parsed.text || ''
    };
  } catch (error) {
    return {
      success: false,
      error: `PDF parsing error: ${error.message}`
    };
  }
}
