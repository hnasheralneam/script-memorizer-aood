let savedScriptNames;
const SaveManager = {
  saveScript(name, linesArray) {
    let data = {
      name: name,
      lines: linesArray,
      lastEdit: Date.now()
    }
    localStorage.setItem("scriptmemorizer-" + name, JSON.stringify(data));
    savedScriptNames.push(name);
    localStorage.setItem("scriptmemorizer:scriptnames", JSON.stringify(savedScriptNames));
  },
  getScript(name) {
    return JSON.parse(localStorage.getItem("scriptmemorizer-" + name));
  },
  getScriptNames() {
    return JSON.parse(localStorage.getItem("scriptmemorizer:scriptnames"));
  }
}

init();


function init() {
  savedScriptNames = SaveManager.getScriptNames();

}





function main() {
  let input = document.querySelector("#input").value;
  let string = input == "" ? "here is a piece of example text." : input;
  let words = string.split(" ");

  //saves current script to local storage
  saveToLocalStorage(string);

  let pos = 1;
  let hideWordEvery = document.querySelector("#skip-distance").value || 2;
  let htmlOutput = "";
  for (let word of words) {
    pos++;
    // skips if just whitespace
    if (word.match(/\n/g)) continue;
    if (pos % hideWordEvery == 0) {
      let endingPunctuation = "";
      if (word.at(-1) == "." || word.at(-1) == ",") {
        endingPunctuation = word.at(-1);
        word = word.substring(0, word.length - 1);
      }
      htmlOutput += `<span class="hidden">${word}</span>${endingPunctuation} `;
    }
    else {
      htmlOutput += word + " ";
    }
  }

  document.querySelector(".output").innerHTML = htmlOutput;
  document.getElementById("input").style.visibility = "hidden";
}

function showAll() {
  let hiddenWords = document.querySelectorAll(".hidden");
  for (let element of hiddenWords) {
    element.classList.add("shown");
  }
}

function hideAll() {
  let shownWords = document.querySelectorAll(".shown");
  for (let element of shownWords) {
    element.classList.remove("shown");
  }

}
//Shows the script editor after it has disappeared
function showScriptEditor() {
  alert("showing script");
  document.getElementById("input").style.visibility = "visible";

}


function saveToLocalStorage(text) {
  let parsedText = parseText(input);
  localStorage.setItem(a, paresdTextArray);
}


function parseText(text) {
  let words = text.split("\\n");
  let parsedText = "";
  let parsedTextArray;
  for (let word of words) {
    if (word.match(/\n/g)) continue;
    parsedText `<span class="hidden">${word}</span> `;
  }

  paresdTextArray = parsedText.split(" ");
  for (let i = 0; i < parsedTextArray.length; i++) {
    if (parsedTextArray[i].match(/\n/g)) continue;
    if (i % hideWordEvery == 0) {
      parsedTextArray[i] = `<span class="hidden">${parsedTextArray[i]}</span>`;
    }
  }

  return parsedTextArray;

}

// takes in input from parseText, or saved fiels
function showOnPage() {

}
