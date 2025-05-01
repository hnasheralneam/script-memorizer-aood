let savedScriptNames;
let activeScript = {
   id: window.crypto.randomUUID(),
   name: "New script"
};

const SaveManager = {
   saveScript(id, name, raw) {
      let data = {
         id: id,
         name: name,
         raw: raw,
         // lines: linesArray,
         // skipDistance: document.getElementById("skip-distance").value,
         // character: document.getElementById("character").value,
         // lastEdit: Date.now()
      }
      localStorage.setItem("scriptmemorizer-" + id, JSON.stringify(data));
      let script = {
         id: id,
         name: name
      };
      if (!savedScriptNames.find((obj) => obj.id == id)) {
         savedScriptNames.push(script);
         showSavedScripts();
      }
      localStorage.setItem("scriptmemorizer:scriptids", JSON.stringify(savedScriptNames));
   },
   getScript(id) {
      return JSON.parse(localStorage.getItem("scriptmemorizer-" + id));
   },
   async getScriptNames() {
      let a = JSON.parse(localStorage.getItem("scriptmemorizer:scriptids"));
      return a;
   },
   reset() {
      let confirmation = confirm("Are you sure you want to reset everything?");
      if (confirmation) {
         localStorage.clear();
         location.reload();
      }
   }
}

init();
async function init() {
   savedScriptNames = await SaveManager.getScriptNames();

   if (!savedScriptNames) {
      savedScriptNames = [];
      localStorage.setItem("scriptmemorizer:scriptids", JSON.stringify(savedScriptNames));
      addNewScript();
   }

   showSavedScripts();
}

function main(splitter) {
   let input = document.querySelector("#input").value;
   let string = input;
   if (string.length < 1) return;
   let words = string.split(splitter);

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
         htmlOutput += `<span class="hidden" onclick="toggleShow(this)">${word}</span>${endingPunctuation} `;
      }
      else {
         htmlOutput += word + " ";
      }
   }

   document.querySelector(".output").innerHTML = htmlOutput;
   hideScriptEditor();


   SaveManager.saveScript(activeScript.id, activeScript.name, document.getElementById("input").value);
}

function toggleShow(element) {
   if (element.classList.contains("shown")) {
      element.clas
   }
}

function parseText(raw) {
    let lines;
    let id = window.crypto.randomUUID();

    if(document.getElementById("input").value.split('\n') == ""){
        lines = document.getElementById("input").value.split('\n');
    } else{
        lines = SaveManager.getScript(id).raw.split('\n');
    }
    const characterLines = [];
    let currentCharacter = null;
    let currentLine = "";
      
    for (const line of lines) {
        const lineTrimmed = line.trim();
        if (lineTrimmed.endsWith(" ") && (lineTrimmed == lineTrimmed.toUpperCase()) && lineTrimmed.length > 2) {
            if (currentCharacter && currentLine) {
                characterLines.push(`${currentCharacter} ${currentLine.trim()}`);   
            }
            currentCharacter = lineTrimmed.slice(0, -1);
            currentLine = "";
        } else if (currentCharacter && lineTrimmed) {
              currentLine += " " + lineTrimmed;
          }
      
        if (currentCharacter && currentLine) {
            characterLines.push(`${currentCharacter} ${currentLine.trim()}`);
        }
    }
    document.querySelector(".output").innerHTML = characterLines;
}
 
/*
   let lines = document.querySelector("#input").value.split("\n");

   let parsedText = "";
   let parsedTextArray;
   let hideWordEvery = document.querySelector("#skip-distance").value || 2;

   for (let line of lines) {
      if (line.match(/\n/g)) continue;
      parsedText += `<span class="hidden">${line}</span> `;
   }

   parsedTextArray = parsedText.split(" ");
   for (let i = 0; i < parsedTextArray.length; i++) {
      if (parsedTextArray[i].match(/\n/g)) continue;
      if (i % hideWordEvery == 0) {
         parsedTextArray[i] = `<span class="hidden">${parsedTextArray[i]}</span>`;
      }
   }
   //document.querySelector(".output").innerHTML = parsedTextArray.join(" ");
   return parsedTextArray;
    */

// when called, function will take in the name of the script then display it in the output
function showOnPage(id, name, raw) {
   activeScript = { id, name };
   let lines = parseText(raw);
   let htmlOutput = "";
   for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/\n/g)) continue;
      htmlOutput += lines[i] + " ";
   }
   document.querySelector(".output").innerHTML = "";
   document.getElementById("input").value = raw;
   showScriptEditor();
}

//creates new sidebar with the new script
function showSavedScripts() {
   //clears the sidebar
   let list = document.querySelector(".saved-scripts");
   list.innerHTML = "";

   //adds the add new script button
   let addScriptButton = document.createElement("li");
   addScriptButton.classList.add("new-script");
   addScriptButton.addEventListener("click", addNewScript);
   addScriptButton.textContent = " + new script";
   list.appendChild(addScriptButton);
   //let newScript = document.createElement("li");

   savedScriptNames.forEach(({ id, name }) => {
      if (name === "+ new script") return;
      let newScript = document.createElement("li");
      newScript.textContent = name;
      if (id == activeScript.id) newScript.classList.add("active");
      newScript.addEventListener("click", () => {
         console.log("clicked ", name, id);
         showOnPage(id, name, SaveManager.getScript(id).raw);
         document.querySelector(".active")?.classList.remove("active");
         newScript.classList.add("active");
      });
      // ?
      // newScript.addEventListener("change", () => {
      //    SaveManager.saveScript(id, name, document.getElementById("input").value);
      // });
      list.appendChild(newScript);
   });
}

//adds another label on the side
function addNewScript() {
   let name = prompt("What would you like to name your chat");
   if (!name) return;

   let id = window.crypto.randomUUID();

   if (savedScriptNames.find((obj) => obj.name == name)) {
      // alert("This name already exists");

      let num = 1;
      let baseName = name;
      for (let i = 0; i < savedScriptNames.length; i++) {
         if (savedScriptNames[i] == name) { num++ };
      }
      name = baseName + "" + num;
   }
   showOnPage(id, name, "");
   // SaveManager.saveScript(id, name, ""); // document.getElementById("input").value

   //list of labels on the side
   SaveManager.saveScript(id, name, "");
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
function toggleScriptEditor() {
   if (document.querySelector("#input").style.height == "2rem") {
      showScriptEditor();
   }
   else hideScriptEditor();
}

function showScriptEditor() {
   document.querySelector("#input").style.height = "15rem";
   document.querySelector("#input").style.opacity = "1";
   document.querySelector("#input").style.pointerEvents = "auto";
}

function hideScriptEditor() {
   document.querySelector("#input").style.height = "2rem";
   document.querySelector("#input").style.opacity = "0";
   document.querySelector("#input").style.pointerEvents = "none";
}

function changeName(){
   let name = prompt("What would you like to rename your script to?");
   if (!name) return;

   let id = window.crypto.randomUUID();

   if (savedScriptNames.find((obj) => obj.name == name)) {
      // alert("This name already exists");

      let num = 1;
      let baseName = name;
      for (let i = 0; i < savedScriptNames.length; i++) {
         if (savedScriptNames[i] == name) { num++ };
      }
      name = baseName + "" + num;
   }
   SaveManager.saveScript(activeScript.id, name, document.getElementById("input").value);
}