const a = require('./analyze');
const analyzeText = a.analyzeText;
const t = require('./example');
const text = t.text;

let ans= analyzeText(text)
console.log(ans)
