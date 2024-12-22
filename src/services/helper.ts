export function cleanHtmlString(htmlString: string): string {
    return htmlString
      // Convert escaped quotes back to regular quotes
      .replace(/\\"/g, '"')
      // Remove all whitespace control characters
      .replace(/\\[ntrfbv]/g, '')
      // Remove extra whitespace between tags
      .replace(/>\s+</g, '><')
      // Remove leading/trailing whitespace
      .trim();
}





export function isValidQuickSkimResponse(html: string): boolean {
    const outputSections = html.match(/<div class="output-section">(.*?)<\/div>/gs);

    if (!outputSections || outputSections.length !== 2) return false;
    
    const hasSummary = outputSections[0].includes('<p>');
    
    const bulletPointsCount = (outputSections[1].match(/<li>/g) || []).length;
    
    return hasSummary && bulletPointsCount >= 1 && !html.includes('undefined') && !html.includes('null');
}


export function isArticleLengthValid(articleText: string): boolean {
    const minArticleLength = 700
    const maxArticleLength = 80000
    return articleText.length > minArticleLength && articleText.length < maxArticleLength
}




export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return String(error);
}