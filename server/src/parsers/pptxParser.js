import AdmZip from 'adm-zip';

function decodeXmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Robust, high-accuracy PPTX extractor that parses clean human-readable text
 * preserving slide numbers, titles, bullet points, and speaker notes.
 */
export async function parsePptx(filePath) {
  try {
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    const slideEntries = zipEntries
      .filter((entry) => entry.entryName.match(/^ppt\/slides\/slide(\d+)\.xml$/i))
      .sort((a, b) => {
        const numA = parseInt(a.entryName.match(/\d+/)[0], 10);
        const numB = parseInt(b.entryName.match(/\d+/)[0], 10);
        return numA - numB;
      });

    if (slideEntries.length === 0) {
      throw new Error('No slide XML entries found in presentation.');
    }

    const slides = [];

    for (const entry of slideEntries) {
      const slideNumber = parseInt(entry.entryName.match(/\d+/)[0], 10);
      const xmlContent = entry.getData().toString('utf8');

      // Extract paragraphs <a:p>...</a:p>
      const paragraphMatches = [...xmlContent.matchAll(/<a:p(?:\s[^>]*)?>([\s\S]*?)<\/a:p>/gi)];
      const paragraphs = [];

      for (const p of paragraphMatches) {
        const textRuns = [...p[1].matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/gi)].map((m) =>
          decodeXmlEntities(m[1])
        );
        const cleanParagraph = textRuns.join('').replace(/\s+/g, ' ').trim();
        if (cleanParagraph && !paragraphs.includes(cleanParagraph)) {
          paragraphs.push(cleanParagraph);
        }
      }

      // Check for speaker notes
      let notesText = '';
      const notesEntry = zipEntries.find(
        (e) => e.entryName.toLowerCase() === `ppt/notesslides/notesslide${slideNumber}.xml`
      );
      if (notesEntry) {
        const notesXml = notesEntry.getData().toString('utf8');
        const notesMatches = [...notesXml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/gi)].map((m) =>
          decodeXmlEntities(m[1])
        );
        notesText = notesMatches.join(' ').replace(/\s+/g, ' ').trim();
      }

      // Determine a clean title
      let title = `Slide ${slideNumber}`;
      if (paragraphs.length > 0) {
        const firstLine = paragraphs[0];
        if (firstLine.length < 90) {
          title = firstLine;
        } else {
          title = firstLine.substring(0, 80).trim() + '...';
        }
      }

      const bodyText = paragraphs.join('\n');

      if (bodyText.length > 0 || notesText.length > 0) {
        slides.push({
          slideNumber,
          title,
          text: bodyText,
          notes: notesText,
          combinedContent: `${title}\n${bodyText}${notesText ? `\n[Notes: ${notesText}]` : ''}`
        });
      }
    }

    if (slides.length === 0) {
      throw new Error('PPTX presentation contains slides, but no readable text shapes could be extracted.');
    }

    return {
      success: true,
      totalSlides: slides.length,
      slides
    };
  } catch (error) {
    return {
      success: false,
      error: `PPTX parsing error: ${error.message}`
    };
  }
}
