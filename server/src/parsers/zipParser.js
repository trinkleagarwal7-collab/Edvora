import path from 'path';
import AdmZip from 'adm-zip';

const SUPPORTED_EXTENSIONS = ['.pdf', '.pptx', '.docx', '.txt', '.md', '.ppt', '.doc'];

/**
 * Safely extracts supported academic documents from a ZIP archive.
 * Guards against ZipSlip / directory traversal vulnerabilities.
 */
export async function extractAcademicZip(zipFilePath, destinationDir) {
  try {
    const zip = new AdmZip(zipFilePath);
    const zipEntries = zip.getEntries();

    const results = {
      extractedFiles: [],
      skippedFiles: [],
      errorCount: 0
    };

    const resolvedDestDir = path.resolve(destinationDir);

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;

      const entryName = entry.entryName;
      // Security check: Guard against path traversal / ZipSlip
      const normalizedPath = path.normalize(entryName).replace(/^(\.\.[\/\\])+/, '');
      const fullPath = path.resolve(resolvedDestDir, normalizedPath);

      if (!fullPath.startsWith(resolvedDestDir)) {
        results.skippedFiles.push({
          name: entryName,
          reason: 'Security violation: Path traversal detected'
        });
        results.errorCount++;
        continue;
      }

      const ext = path.extname(entryName).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        results.skippedFiles.push({
          name: entryName,
          reason: `Unsupported format: ${ext || 'none'}`
        });
        continue;
      }

      // Check for file size safety (e.g. max 50MB per uncompressed entry)
      if (entry.header.size > 50 * 1024 * 1024) {
        results.skippedFiles.push({
          name: entryName,
          reason: 'File size exceeds maximum permitted single file size in archive (50MB)'
        });
        continue;
      }

      try {
        const fileData = entry.getData();
        const baseName = path.basename(entryName);
        const uniqueDiskName = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${baseName}`;
        const targetFilePath = path.join(resolvedDestDir, uniqueDiskName);

        await AdmZip.prototype.extractEntryTo.call(
          zip,
          entry,
          path.dirname(targetFilePath),
          false,
          true,
          false,
          path.basename(targetFilePath)
        );

        results.extractedFiles.push({
          originalName: baseName,
          entryPath: entryName,
          savedPath: targetFilePath,
          size: entry.header.size,
          extension: ext
        });
      } catch (err) {
        results.skippedFiles.push({
          name: entryName,
          reason: `Extraction error: ${err.message}`
        });
        results.errorCount++;
      }
    }

    return {
      success: true,
      totalEntries: zipEntries.length,
      ...results
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read ZIP archive: ${error.message}`
    };
  }
}
