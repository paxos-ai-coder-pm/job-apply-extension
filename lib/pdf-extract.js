import * as pdfjsLib from './pdfjs/pdf.mjs';

const MAX_PAGES = 30;

export async function extractPdfText(fileOrBuffer) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdfjs/pdf.worker.mjs');

  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  if (pdf.numPages > MAX_PAGES) {
    throw new Error(`PDF has ${pdf.numPages} pages; maximum supported is ${MAX_PAGES}.`);
  }

  const pageCount = pdf.numPages;
  const pages = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    pages.push(text);
  }

  return { text: pages.join('\n\n'), pageCount };
}
