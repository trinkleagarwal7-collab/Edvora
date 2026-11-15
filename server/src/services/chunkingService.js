import { v4 as uuidv4 } from 'uuid';

/**
 * Structure-aware chunking service.
 * Creates granular, contextual chunks preserving document hierarchy and references.
 */
export function createChunksFromFileData(fileRecord, parsedData) {
  const chunks = [];
  const { id: fileId, subjectId, originalName, mimeType } = fileRecord;

  // 1. PPTX presentation: Slide-level chunking
  if (parsedData.slides) {
    for (const slide of parsedData.slides) {
      const text = (slide.text || '').trim();
      const notes = (slide.notes || '').trim();
      if (!text && !notes) continue;

      const chunkContent = notes ? `${slide.title}\n${text}\n[Speaker Notes: ${notes}]` : `${slide.title}\n${text}`;
      
      chunks.push({
        id: `chk_${uuidv4()}`,
        fileId,
        subjectId,
        fileName: originalName,
        slideNumber: slide.slideNumber,
        pageNumber: null,
        heading: slide.title || `Slide ${slide.slideNumber}`,
        content: chunkContent,
        tokenCount: Math.ceil(chunkContent.length / 4),
        createdAt: new Date().toISOString()
      });
    }
    return chunks;
  }

  // 2. PDF: Page-level chunking, splitting long pages (>1500 chars) gracefully by paragraph
  if (parsedData.pages) {
    for (const page of parsedData.pages) {
      const pageText = (page.text || '').trim();
      if (!pageText) continue;

      if (pageText.length <= 1500) {
        chunks.push({
          id: `chk_${uuidv4()}`,
          fileId,
          subjectId,
          fileName: originalName,
          slideNumber: null,
          pageNumber: page.pageNumber,
          heading: page.heading || `Page ${page.pageNumber}`,
          content: pageText,
          tokenCount: Math.ceil(pageText.length / 4),
          createdAt: new Date().toISOString()
        });
      } else {
        // Break long pages into sub-chunks by paragraphs
        const paragraphs = pageText.split('\n\n').filter((p) => p.trim().length > 0);
        let currentChunkText = '';
        let subIndex = 1;

        for (const para of paragraphs) {
          if ((currentChunkText + '\n\n' + para).length > 1200 && currentChunkText.length > 0) {
            chunks.push({
              id: `chk_${uuidv4()}`,
              fileId,
              subjectId,
              fileName: originalName,
              slideNumber: null,
              pageNumber: page.pageNumber,
              heading: `${page.heading || `Page ${page.pageNumber}`} (Part ${subIndex})`,
              content: currentChunkText.trim(),
              tokenCount: Math.ceil(currentChunkText.length / 4),
              createdAt: new Date().toISOString()
            });
            subIndex++;
            currentChunkText = para;
          } else {
            currentChunkText = currentChunkText ? `${currentChunkText}\n\n${para}` : para;
          }
        }

        if (currentChunkText.trim().length > 0) {
          chunks.push({
            id: `chk_${uuidv4()}`,
            fileId,
            subjectId,
            fileName: originalName,
            slideNumber: null,
            pageNumber: page.pageNumber,
            heading: `${page.heading || `Page ${page.pageNumber}`} (Part ${subIndex})`,
            content: currentChunkText.trim(),
            tokenCount: Math.ceil(currentChunkText.length / 4),
            createdAt: new Date().toISOString()
          });
        }
      }
    }
    return chunks;
  }

  // 3. DOCX and Text/Markdown: Section-based chunking
  if (parsedData.sections) {
    for (let i = 0; i < parsedData.sections.length; i++) {
      const sec = parsedData.sections[i];
      const content = (sec.content || '').trim();
      if (!content) continue;

      chunks.push({
        id: `chk_${uuidv4()}`,
        fileId,
        subjectId,
        fileName: originalName,
        slideNumber: null,
        pageNumber: null,
        heading: sec.heading || `Section ${i + 1}`,
        content: `${sec.heading ? `### ${sec.heading}\n` : ''}${content}`,
        tokenCount: Math.ceil(content.length / 4),
        createdAt: new Date().toISOString()
      });
    }
    return chunks;
  }

  // Fallback for simple raw text
  if (parsedData.rawText) {
    const raw = parsedData.rawText.trim();
    chunks.push({
      id: `chk_${uuidv4()}`,
      fileId,
      subjectId,
      fileName: originalName,
      slideNumber: null,
      pageNumber: null,
      heading: 'Document Content',
      content: raw,
      tokenCount: Math.ceil(raw.length / 4),
      createdAt: new Date().toISOString()
    });
  }

  return chunks;
}
