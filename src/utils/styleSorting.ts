/**
 * Custom sorting function for beer styles that prioritizes styles 1-9 at the top
 * @param a - First style object
 * @param b - Second style object
 * @returns Sort comparison result
 */
export const sortStyles = (a: { value: string; label: string; category: string }, b: { value: string; label: string; category: string }) => {
  // Extract style codes from labels (e.g., "10A. Weissbier" -> "10A")
  const getStyleCode = (label: string) => {
    const match = label.match(/^(\d+[A-Z]?)\./);
    return match ? match[1] : '';
  };
  
  const codeA = getStyleCode(a.label);
  const codeB = getStyleCode(b.label);
  
  // Extract just the numeric part for comparison
  const getNumericPart = (code: string) => {
    const numericMatch = code.match(/^(\d+)/);
    return numericMatch ? parseInt(numericMatch[1], 10) : Infinity;
  };
  
  const numericA = getNumericPart(codeA);
  const numericB = getNumericPart(codeB);
  
  // If both are 1-9, sort numerically, then by letter suffix
  if (numericA <= 9 && numericB <= 9) {
    if (numericA !== numericB) {
      return numericA - numericB;
    }
    // If same number, sort by letter suffix
    return codeA.localeCompare(codeB);
  }
  
  // If only A is 1-9, A comes first
  if (numericA <= 9 && numericB > 9) {
    return -1;
  }
  
  // If only B is 1-9, B comes first
  if (numericA > 9 && numericB <= 9) {
    return 1;
  }
  
  // If neither is 1-9, sort by full code (numeric then letter)
  if (numericA !== numericB) {
    return numericA - numericB;
  }
  return codeA.localeCompare(codeB);
};
