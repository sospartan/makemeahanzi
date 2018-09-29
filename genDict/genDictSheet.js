const words = require("./xinhua-word.json");

const fs = require("fs");


const availableFiles = fs.readdirSync(`${__dirname}/../svgs/`);
let outputData = [];
let outputMap = {};
words.forEach(element => {
  const word = element.word;
  const charcode = word.charCodeAt(0);

  let file = `${charcode}.svg`;
  if (availableFiles.indexOf(file) < 0) return;

  // outputData.push(element)
  delete element.explanation
  delete element.more
  outputMap[`_${charcode}`] = element
});

console.log(JSON.stringify(outputMap))