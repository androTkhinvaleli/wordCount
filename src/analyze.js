function analyzeText(text) {
    // Helper function to count vowels in a word
    function countVowels(word) {
        return word.match(/[აეიოუ]/gi)?.length || 0;
    }

    // Split the text into sentences using regex to capture various sentence endings.
    const sentences = text.match(/[^.!?]*[.!?]/g) || [];
    const sentenceCount = sentences.length;

    let wordCount = 0;
    let totalWordLength = 0;
    let totalVowelCount = 0;

    sentences.forEach(sentence => {
        // Split the sentence into words, considering punctuation and spaces.
        const words = sentence.trim().split(/\s+/);
        wordCount += words.length;

        words.forEach(word => {
            totalWordLength += word.length;
            totalVowelCount += countVowels(word);
        });
    });

    const averageWordCountPerSentence = sentenceCount ? wordCount / sentenceCount : 0;
    const averageVowelCountPerWord = wordCount ? totalVowelCount / wordCount : 0;

    return {
        sentenceCount,
        wordCount,
        averageWordCountPerSentence,
        totalVowelCount,
        averageVowelCountPerWord
    };
}

module.exports = {analyzeText}
// Example usage: