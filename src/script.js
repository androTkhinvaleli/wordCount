async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        if (file.name.endsWith('.docx')) {
            processDocx(file);
        } else if (file.name.endsWith('.pages')) {
            await processPages(file);
        } else {
            alert("Unsupported file format. Please upload a .docx or .pages file.");
        }
    } else {
        alert("Please select a file first.");
    }
}

function processDocx(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        mammoth.extractRawText({ arrayBuffer: event.target.result })
            .then(result => {
                const text = result.value;
                const analysis = analyzeText(text);
                showResults(analysis);
            })
            .catch(err => console.error(err));
    };
    reader.readAsArrayBuffer(file);
}

async function processPages(file) {
    const reader = new FileReader();
    reader.onload = async function (event) {
        const zip = await JSZip.loadAsync(event.target.result);
        const documentXml = await zip.file("index.xml").async("string");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(documentXml, "application/xml");
        const textNodes = xmlDoc.getElementsByTagName("text");
        let text = '';
        for (const node of textNodes) {
            text += node.textContent + ' ';
        }
        const analysis = analyzeText(text);
        showResults(analysis);
    };
    reader.readAsArrayBuffer(file);
}

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
};}

function showResults(results) {
    const {
        sentenceCount,
        wordCount,
        averageWordCountPerSentence,
        totalVowelCount,
        averageVowelCountPerWord,
      } = results;
    document.querySelector('#sentence-count-result').innerText = sentenceCount;

    document.querySelector('#word-count-result').innerText = wordCount;
    document.querySelector('#avg-word-result').innerText = averageWordCountPerSentence;
    document.querySelector('#total-vowels-result').innerText = totalVowelCount;
    document.querySelector('#avg-vowel-result').innerText = averageVowelCountPerWord;
}

function exportToExcel(analysis) {
    const { letterCounts, wordCounts, wordVowelCounts, sentenceWordCounts } = analysis;
    const workbook = XLSX.utils.book_new();

    const lettersSheet = XLSX.utils.json_to_sheet(
        Object.entries(letterCounts).map(([letter, count]) => ({ Letter: letter, Count: count }))
    );
    XLSX.utils.book_append_sheet(workbook, lettersSheet, "Letters");

    const wordsSheet = XLSX.utils.json_to_sheet(
        Object.entries(wordCounts).map(([word, count]) => ({ Word: word, Count: count }))
    );
    XLSX.utils.book_append_sheet(workbook, wordsSheet, "Words");

    const wordVowelsSheet = XLSX.utils.json_to_sheet(wordVowelCounts.map(({ word, vowelCount }) => 
        ({ Word: word, VowelCount: vowelCount })));
    XLSX.utils.book_append_sheet(workbook, wordVowelsSheet, "Word Vowels");

    const sentenceWordsSheet = XLSX.utils.json_to_sheet(sentenceWordCounts.map(({ sentence, wordCount }) => 
        ({ Sentence: sentence, WordCount: wordCount })));
    XLSX.utils.book_append_sheet(workbook, sentenceWordsSheet, "Sentence Words");

    XLSX.writeFile(workbook, 'analysis.xlsx');
}