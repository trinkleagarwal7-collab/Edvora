import fs from 'fs';

/**
 * Parses TXT and Markdown files, preserving headings and sections.
 */
export async function parseText(filePath) {
  try {
    const rawContent = await fs.promises.readFile(filePath, 'utf-8');
    const cleanContent = rawContent.trim();

    if (!cleanContent) {
      throw new Error('Text file is empty.');
    }

    const lines = cleanContent.split('\n');
    const sections = [];
    let currentHeading = 'Overview';
    let currentLines = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const isMdHeading = line.startsWith('#');
      
      if (isMdHeading && currentLines.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentLines.join('\n')
        });
        currentHeading = line.replace(/^#+\s*/, '');
        currentLines = [];
      } else {
        currentLines.push(rawLine);
      }
    }

    if (currentLines.length > 0) {
      sections.push({
        heading: currentHeading,
        content: currentLines.join('\n')
      });
    }

    return {
      success: true,
      rawText: cleanContent,
      sections
    };
  } catch (error) {
    return {
      success: false,
      error: `Text parsing error: ${error.message}`
    };
  }
}
