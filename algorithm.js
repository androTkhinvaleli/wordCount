// Helper functions
/**
 * Counts the total number of words in the given text, treating compound words (e.g., "და-ძმა") as one word.
 * @param {string} text - The text to analyze.
 * @returns {number} - Total number of words.
 */
function countWords(text) {
    const words = text.match(/\b[ა-ჰ]+(?:-[ა-ჰ]+)*\b/g) || [];
    return words.length;
  }
  
  /**
   * Counts the number of unique words (case-insensitive), treating compound words as one.
   * @param {string} text - The text to analyze.
   * @returns {number} - Total number of unique words.
   */
  function uniqueWords(text) {
    const words = (text.match(/\b[ა-ჰ]+(?:-[ა-ჰ]+)*\b/g) || []).map(word => word.toLowerCase());
    return new Set(words).size;
  }
  
  /**
   * Calculates the average length of words by their number of letters.
   * Treats compound words as one.
   * @param {string} text - The text to analyze.
   * @returns {number} - Average word length in letters.
   */
  function averageWordLengthByLetters(text) {
    const words = text.match(/\b[ა-ჰ]+(?:-[ა-ჰ]+)*\b/g) || [];
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return words.length ? totalLength / words.length : 0;
  }
  
  /**
   * Counts the number of syllables in a single word.
   * Treats compound words as one.
   * Georgian syllables are identified by vowels (ა, ე, ი, ო, უ).
   * @param {string} word - The word to analyze.
   * @returns {number} - Number of syllables in the word.
   */
  function countSyllables(word) {
    return (word.match(/[აეიოუ]/g) || []).length;
  }
  
  /**
   * Calculates the average length of words by their number of syllables.
   * Treats compound words as one.
   * @param {string} text - The text to analyze.
   * @returns {number} - Average word length in syllables.
   */
  function averageWordLengthBySyllables(text) {
    const words = text.match(/\b[ა-ჰ]+(?:-[ა-ჰ]+)*\b/g) || [];
    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
    return words.length ? totalSyllables / words.length : 0;
  }
  
  /**
   * Counts the total number of sentences in the text.
   * @param {string} text - The text to analyze.
   * @returns {number} - Total number of sentences.
   */
  function countSentences(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.length;
  }

  /**
   * Finds words with long consonant clusters.
   * Treats compound words as one.
   * @param {string} text - The text to analyze.
   * @param {number} [threshold=3] - Minimum number of consecutive consonants to qualify.
   * @returns {string[]} - Array of words with long consonant clusters.
   */
  function longConsonantClusters(text, threshold = 3) {
    const words = text.match(/\b[ა-ჰ]+(?:-[ა-ჰ]+)*\b/g) || [];
    const clusterRegex = new RegExp(`[ბგდვზთკლმნპჟრშტღყჰჩცძწჭხ]{${threshold},}`, 'gi');
    return words.filter(word => clusterRegex.test(word));
  }
  
  /**
   * Finds words that exceed a specified length.
   * Treats compound words as one.
   * @param {string} text - The text to analyze.
   * @param {number} length - Minimum word length to qualify.
   * @returns {string[]} - Array of long words.
   */
  function longWords(text, length) {
    const words = text.match(/\b[ა-ჰ]+(?:-[ა-ჰ]+)*\b/g) || [];
    return words.filter(word => word.length >= length);
  }
  
  /**
   * Analyzes a text and calculates various metrics.
   * Treats compound words as one.
   * @param {string} text - The text to analyze.
   * @returns {Object} - Analysis results containing various metrics.
   */
  function analyzeText(text) {
    const totalWords = countWords(text);
    const totalUniqueWords = uniqueWords(text);
    const avgWordLengthByLetters = averageWordLengthByLetters(text);
    const avgWordLengthBySyllables = averageWordLengthBySyllables(text);
    const totalSentences = countSentences(text);
  
    const longClusters = longConsonantClusters(text);
    const longWords7 = longWords(text, 7);
    const longWords9 = longWords(text, 9);
  
    return {
      totalWords,
      totalUniqueWords,
      avgWordLengthByLetters,
      avgWordLengthBySyllables,
    //   totalSentencesByLetters: totalSentences,
      totalSentencesBySyllables: totalSentences, // Assumption: letters and syllables align
      totalSentencesByWords: totalSentences,
      longConsonantClusterWords: longClusters.length,
      longConsonantClusterWordsPercentage: ((longClusters.length / totalWords) * 100).toFixed(2),
      longWords7: longWords7.length,
      longWords7Percentage: ((longWords7.length / totalWords) * 100).toFixed(2),
      longWords9: longWords9.length,
      longWords9Percentage: ((longWords9.length / totalWords) * 100).toFixed(2),
    };
  }
  
  // Example usage
  const georgianText = "ეს არის ქართული ტექსტი, და-ძმა რთული სიტყვაა და საჭირო ანალიზისთვის.";
  console.log(analyzeText(georgianText));
  