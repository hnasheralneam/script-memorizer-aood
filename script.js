let savedScriptNames;
const SaveManager = {
  saveScript(name, linesArray) {
    let data = {
      name: name,
      lines: linesArray,
      lastEdit: Date.now()
    }
    localStorage.setItem("scriptmemorizer-" + name, JSON.stringify(data));
    console.log(savedScriptNames);
    savedScriptNames.push(name);
    localStorage.setItem("scriptmemorizer:scriptnames", JSON.stringify(savedScriptNames));
  },
  getScript(name) {
    return JSON.parse(localStorage.getItem("scriptmemorizer-" + name));
  },
  async getScriptNames() {
    let a = JSON.parse(localStorage.getItem("scriptmemorizer:scriptnames"));
    console.log(a);
    return a;
  }
}

init();


async function init() {
  savedScriptNames = await SaveManager.getScriptNames();

  if (!savedScriptNames) {
    savedScriptNames = [];
    localStorage.setItem("scriptmemorizer:scriptnames", JSON.stringify(savedScriptNames));
  }

  let list = document.querySelector(".saved-scripts");
  console.log(savedScriptNames);
  savedScriptNames.forEach(name => {
    let label = document.createElement("li");
    label.addEventListener("click", showOnPage, name);
    label.textContent = name;
    list.appendChild(label);
  });
}





function main(splitter) {
  let input = document.querySelector("#input").value;
  let string = input == "" ? "here is a piece of example text." : input;
  let words = string.split(splitter);
  

  alert(typeof words);


  let pos = 0;
  let hideWordEvery = document.querySelector("#skip-distance").value || 2;
  let htmlOutput = "";
  for (let word of words) {
    pos++;
    // skips if just whitespace
    if (word.trim() === "") continue;
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
  document.getElementById("input").style.visibility = "visible";

}



function parseText(text) {
  let lines = text.split("\n");
  let parsedText = "";
  let parsedTextArray;
  let hideWordEvery = document.querySelector("#skip-distance").value || 2;
  for (let line of lines) {
    if (line.match(/\n/g)) continue;
    parsedText += `<span class="hidden">${word}</span> `;
  }

  parsedTextArray = parsedText.split(" ");
  for (let i = 0; i < parsedTextArray.length; i++) {
    if (parsedTextArray[i].match(/\n/g)) continue;
    if (i % hideWordEvery == 0) {
      parsedTextArray[i] = `<span class="hidden">${parsedTextArray[i]}</span>`;
    }
  }

  return parsedTextArray;

}

// when called, function will take in the name of the script then display it in the output
function showOnPage(name) {
  console.log("I never wanna give up, I never let you down");
  let script = SaveManager.getScript(name);
  let lines = script.lines;
  let htmlOutput = "";
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/\n/g)) continue;
    htmlOutput += lines[i] + " ";
  }
  document.querySelector(".output").innerHTML = htmlOutput;
}

//adds another label on the side
function addNewScript() {
  let name = prompt("What would you like to name your chat");
  if (!name) return;

  if (savedScriptNames.includes(name)) {
    alert("This name already exists");

    let num = 1;
    let baseName = name;
    for (let i = 0; i < savedScriptNames.length; i++) {
      if (savedScriptNames[i] == name) { num++ };
    }
    name = baseName + "" + num;
    SaveManager.saveScript(name, document.getElementById("input").value);
  } else {
    //adds the new script as an object
    SaveManager.saveScript(name, document.getElementById("input").value);
  }


  //list of labels on the side
  let list = document.querySelector(".saved-scripts");
  let newScript = document.createElement("li");
  newScript.textContent = name;
  list.appendChild(newScript);
}
