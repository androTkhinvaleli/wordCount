class GeorgianTextAnalyzer {
    constructor() {
        // Georgian vowels
        this.vowels = ['ა', 'ე', 'ი', 'ო', 'უ'];
        
        // Georgian sentence terminators
        this.sentenceTerminators = ['.', '!', '?', '։'];
        
        // Punctuation to remove when counting letters
        this.punctuation = /[.,!?։\s–—\-\"\'\"]/g;
    }

    analyze(text) {
        // Normalize the text first
        const normalizedText = this.normalizeText(text);
        
        // Get sentences first as they affect word counting
        const sentences = this.getSentences(normalizedText);
        
        // Get clean words (removing punctuation properly)
        const words = this.getWords(normalizedText);
        
        // Get unique words (after cleaning)
        const uniqueWords = [...new Set(words)];
        
        // Calculate word lengths
        const wordLengthsByLetters = words.map(word => this.getLetterCount(word));
        const wordLengthsBySyllables = words.map(word => this.countSyllables(word));
        
        // Find special word categories
        const consonantClusterWords = words.filter(word => this.hasLongConsonantCluster(word));
        const longWords7Plus = words.filter(word => this.getLetterCount(word) >= 7);
        const longWords9Plus = words.filter(word => this.getLetterCount(word) >= 9);

        // Analyze sentences
        const sentenceAnalysis = sentences
            .filter(sentence => sentence.trim().length > 0) // Remove empty sentences
            .map((sentence, index) => {
                const sentenceWords = this.getWords(sentence);
                return {
                    sentenceNumber: index + 1,
                    sentence: sentence.trim(),
                    letterCount: this.getLetterCount(sentence),
                    syllableCount: this.countSyllables(sentence),
                    wordCount: sentenceWords.length
                };
            });
        
        // Calculate totals
        const totalLetters = sentenceAnalysis.reduce((sum, s) => sum + s.letterCount, 0);
        const totalSyllables = sentenceAnalysis.reduce((sum, s) => sum + s.syllableCount, 0);
        const totalSentenceWords = sentenceAnalysis.reduce((sum, s) => sum + s.wordCount, 0);
        
        return {
            totalWords: words.length,
            uniqueWords: uniqueWords.length,
            averageWordLengthLetters: this.average(wordLengthsByLetters),
            averageWordLengthSyllables: this.average(wordLengthsBySyllables),
            
            sentences: {
                count: sentenceAnalysis.length,
                totalLetters: totalLetters,
                totalSyllables: totalSyllables,
                totalWords: totalSentenceWords,
                averageLettersPerSentence: totalLetters / sentenceAnalysis.length,
                averageSyllablesPerSentence: totalSyllables / sentenceAnalysis.length,
                averageWordsPerSentence: totalSentenceWords / sentenceAnalysis.length,
                detailed: sentenceAnalysis
            },
            
            longConsonantClusterWords: {
                count: consonantClusterWords.length,
                percentage: (consonantClusterWords.length / words.length) * 100,
                words: consonantClusterWords
            },
            
            longWords7Plus: {
                count: longWords7Plus.length,
                percentage: (longWords7Plus.length / words.length) * 100,
                words: longWords7Plus
            },
            
            longWords9Plus: {
                count: longWords9Plus.length,
                percentage: (longWords9Plus.length / words.length) * 100,
                words: longWords9Plus
            }
        };
    }

    normalizeText(text) {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\s+/g, ' ')
            .trim();
    }

    getSentences(text) {
        const sentences = [];
        let currentSentence = '';
        let i = 0;

        while (i < text.length) {
            let char = text[i];
            
            // Add current character to sentence
            currentSentence += char;
            
            // Check for sentence end conditions
            if (i + 1 < text.length) {
                let nextChar = text[i + 1];
                
                // Case 1: Ellipsis
                if (char === '.' && text.slice(i, i + 3) === '...') {
                    // Check if it's a true sentence end or just a pause
                    let afterEllipsis = text.slice(i + 3).trim();
                    if (afterEllipsis.startsWith('–') || 
                        afterEllipsis.startsWith('-') || 
                        !afterEllipsis.length) {
                        sentences.push(currentSentence.trim());
                        currentSentence = '';
                        i += 2; // Skip the other two dots
                    } else {
                        i += 2; // Skip the other two dots but keep in same sentence
                    }
                }
                // Case 2: Regular sentence terminators
                else if (this.sentenceTerminators.includes(char)) {
                    // Check for special cases
                    if (nextChar === ' ' || nextChar === '\n' || nextChar === '–' || !nextChar) {
                        sentences.push(currentSentence.trim());
                        currentSentence = '';
                    }
                }
                // Case 3: Dialog marker followed by sentence terminator
                else if (char === '–' && this.sentenceTerminators.includes(nextChar)) {
                    sentences.push(currentSentence.trim() + nextChar);
                    currentSentence = '';
                    i++; // Skip the terminator
                }
            }
            // End of text
            else if (i === text.length - 1) {
                if (currentSentence.trim()) {
                    sentences.push(currentSentence.trim());
                }
            }
            
            i++;
        }
        
        // Clean up sentences
        return sentences
            .filter(s => s.trim().length > 0)
            .map(s => s.trim())
            .flatMap(s => {
                // Split on dialogue markers if they start new sentences
                if (s.includes('–')) {
                    const parts = s.split('–').map(p => p.trim()).filter(p => p.length > 0);
                    return parts.map((p, idx) => idx === 0 ? p : '–' + p);
                }
                return [s];
            });
    }

    getWords(text) {
        return text
            .split(/\s+/)
            .map(word => word.trim())
            .filter(word => {
                const cleanWord = word.replace(this.punctuation, '');
                return cleanWord.length > 0;
            })
            .map(word => word.replace(/^–\s*/, '').replace(/\s*–$/, ''));
    }

    getLetterCount(text) {
        return text.replace(this.punctuation, '').length;
    }

    countSyllables(word) {
        const cleanWord = word.replace(this.punctuation, '');
        let count = 0;
        
        for (let char of cleanWord) {
            if (this.vowels.includes(char)) {
                count++;
            }
        }
        
        return count || 1;
    }

    hasLongConsonantCluster(word) {
        const cleanWord = word.replace(this.punctuation, '');
        let consecutiveConsonants = 0;
        
        for (let char of cleanWord) {
            if (!this.vowels.includes(char)) {
                consecutiveConsonants++;
                if (consecutiveConsonants >= 3) {
                    return true;
                }
            } else {
                consecutiveConsonants = 0;
            }
        }
        
        return false;
    }

    average(numbers) {
        return numbers.length ? 
            numbers.reduce((a, b) => a + b) / numbers.length : 
            0;
    }
}