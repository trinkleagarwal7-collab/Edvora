import fs from 'fs';
import mammoth from 'mammoth';

/**
 * Extracts structured headings, paragraphs, and text from DOCX files.
 */
export async function parseDocx(filePath) {
  try {
    const buffer = await fs.promises.readFile(filePath);
    
    // Extract raw text
    const textResult = await mammoth.extractRawText({ buffer });
    // Extract HTML to preserve headings & tables
    const htmlResult = await mammoth.convertToHtml({ buffer });

    const rawText = textResult.value.trim();
    if (!rawText || rawText.length === 0) {
      throw new Error('DOCX file contains no readable text content.');
    }

    // Split text into sections by detecting headers or major paragraph breaks
    const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const sections = [];
    let currentHeading = 'Introduction';
    let currentParagraphs = [];

    for (const line of lines) {
      // If line is short and uppercase or title-case, treat as section heading
      const isHeading = (line.length < 80 && line.length > 3 && (line === line.toUpperCase() || /^[0-9]+[\.\)]\s/.test(line)));
      if (isHeading && currentParagraphs.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentParagraphs.join('\n')
        });
        currentHeading = line;
        currentParagraphs = [];
      } else {
        currentParagraphs.push(line);
      }
    }

    if (currentParagraphs.length > 0) {
      sections.push({
        heading: currentHeading,
        content: currentParagraphs.join('\n')
      });
    }

    return {
      success: true,
      rawText,
      sections: sections.length > 0 ? sections : [{ heading: 'Document Content', content: rawText }],
      messages: textResult.messages || []
    };
  } catch (error) {
    return {
      success: false,
      error: `DOCX parsing error: ${error.message}`
    };
  }
}
