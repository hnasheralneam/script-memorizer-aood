let savedScriptNames = [];
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
      try {
         localStorage.setItem("scriptmemorizer-" + id, JSON.stringify(data));
      } catch (e) {
         console.error("LocalStorage error:", e);
      }
      let script = {
         id: id,
         name: name
      };
      if (!savedScriptNames.find((obj) => obj.id == id)) {
         savedScriptNames.push(script);
         showSavedScripts();
      }
      try {
         localStorage.setItem("scriptmemorizer:scriptids", JSON.stringify(savedScriptNames));
      } catch (e) {
         console.error("LocalStorage error:", e);
      }

      if (!savedScriptNames.find((obj) => obj.id == id)) {
         script.pinned = false;
         savedScriptNames.push(script);
         showSavedScripts();
      }
      localStorage.setItem("scriptmemorizer:scriptids", JSON.stringify(savedScriptNames));
   },
   getScript(id) {
      return JSON.parse(localStorage.getItem("scriptmemorizer-" + id));
   },
   async getScriptNames() {
      return JSON.parse(localStorage.getItem("scriptmemorizer:scriptids"));
   },
   reset() {
      let confirmation = confirm("Are you sure you want to reset everything?");
      if (confirmation) {
         try {
            localStorage.clear();
         } catch (e) {
            console.error("LocalStorage error:", e);
         }
         location.reload();
      }
   }
}

init();
async function init() {
   savedScriptNames = await SaveManager.getScriptNames();

   if (!savedScriptNames) {
      savedScriptNames = [];
      try {
         localStorage.setItem("scriptmemorizer:scriptids", JSON.stringify(savedScriptNames));
      } catch (e) {
         console.error("LocalStorage error:", e);
      }
      addNewScript();
   }

   console.log("Saved scripts:", savedScriptNames);
   showSavedScripts();
    document.getElementById('input').addEventListener("change", () => {
        SaveManager.saveScript(activeScript.id, activeScript.name, document.getElementById("input").value);
    });
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

function parseText(raw) {
    // Split on newlines (preserves empty lines)
    const lines = raw.split('\n');
    let characters = [];
    const characterLines = [];
    let currentCharacter = null;
    let currentLine = "";

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;  // skip blank lines

        // Detect a line that's ALL UPPERCASE (with optional trailing colon)
        const cueMatch = line.match(/^([A-Z][A-Z0-9\s]*):?$/);
        if (cueMatch) {
            // flush previous block
            if (currentCharacter && currentLine) {
                characterLines.push(`${currentCharacter}: ${currentLine.trim()}`);
            }
            // start new character
            currentCharacter = cueMatch[1];
            currentLine = "";
            if (!characters.includes(currentCharacter)) {
               characters.push(currentCharacter);
            }
        }else if (currentCharacter) {
            currentLine += line + " ";
         }  
        
        
    }

    // final flush
    if (currentCharacter && currentLine) {
        characterLines.push(`${currentCharacter}: ${currentLine.trim()}`);
    }
    // join however you like; here we use <br> for HTML display

    console.log(characters);
   //  let regex = new RegExp("\\b" + "ACT " + "\\b");
   //  for(let i = 0; i < character.length; i++){
   //    if(characters[i].contains("ACT ")){
   //       let index = characters.search(regex);
   //       if(index > -1){
   //          characters.splice(index, 1);
   //       }
   //    }
   //  }
    addDropdownCharacters([...characters]);
    showOnPage2(characterLines.join("<br>"));
    return characterLines;
}



// when called, function will take in the name of the script then display it in the output
function showOnPage(id, name, raw) {
    activeScript = { id, name };
   let htmlOutput = "";
   document.querySelector(".output").innerHTML = "";
   document.getElementById("input").value = raw;
   showScriptEditor();
}

function showOnPage2(script) {
   document.querySelector(".output").innerHTML = script;
   hideScriptEditor();
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

   const sortedScripts = [...savedScriptNames].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.name.localeCompare(b.name);
   });
   
   sortedScripts.forEach(({ id, name, pinned }) => {  
      if (name === "+ new script") return;
      let newScript = document.createElement("li");
      let label = document.createElement("span");
      label.textContent = name;
      label.classList.add("script-label");

      let renameBtn = document.createElement("button");
      renameBtn.textContent = "Rename";
      renameBtn.title = "Rename script";
      renameBtn.addEventListener("click", (e) => {
         e.stopPropagation();
         activeScript = { id, name };
         changeName();
      });

      let deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.title = "Delete script";
      deleteBtn.addEventListener("click", (e) => {
         e.stopPropagation();
         activeScript = { id, name };
         removeScript();
      });

      let pinBtn = document.createElement("button");
      pinBtn.textContent = pinned ? "❤️" : "🤍";
      pinBtn.title = pinned ? "Unpin script" : "Pin script";
      pinBtn.addEventListener("click", (e) => {
         e.stopPropagation();
         togglePin(id);
      });

      newScript.appendChild(pinBtn);
      newScript.appendChild(label);
      newScript.appendChild(renameBtn);
      newScript.appendChild(deleteBtn);

      if (id == activeScript.id) newScript.classList.add("active");
      newScript.addEventListener("click", () => {
         console.log("clicked ", name, id);
         showOnPage(id, name, SaveManager.getScript(id).raw);
         document.querySelector(".active")?.classList.remove("active");
         newScript.classList.add("active");
      });
      list.appendChild(newScript);
   });
}

//adds another label on the side
function addNewScript() {
   let name = prompt("What would you like to name your chat");
   if (!name) return;

   let id = window.crypto.randomUUID();

   if (savedScriptNames.find((obj) => obj.name === name)) {
      let num = 1;
      let baseName = name;
      while (savedScriptNames.find((obj) => obj.name === name)) {
         name = `${baseName} ${num++}`;
      }
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

function showScriptEditor() 
{
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

   //let id = window.crypto.randomUUID();

   if (savedScriptNames.find((obj) => obj.name === name)) {
      let num = 1;
      let baseName = name;
      while (savedScriptNames.find((obj) => obj.name === name)) {
         name = `${baseName} ${num++}`;
      }
   }

   const script = savedScriptNames.find(s => s.id === activeScript.id);
   if (script) script.name = name;
   
   SaveManager.saveScript(activeScript.id, name, document.getElementById("input").value);
   showSavedScripts();
}

function removeScript() {
   if (!confirm("Are you sure you want to delete this script?")) return;

   savedScriptNames = savedScriptNames.filter(script => script.id !== activeScript.id);
   try {
      localStorage.removeItem("scriptmemorizer-" + activeScript.id);
   } catch (e) {
      console.error("LocalStorage error:", e);
   }
   try {
      localStorage.setItem("scriptmemorizer:scriptids", JSON.stringify(savedScriptNames));
   } catch (e) {
      console.error("LocalStorage error:", e);
   }

   if (savedScriptNames.length > 0) {
      let first = savedScriptNames[0];
      showOnPage(first.id, first.name, SaveManager.getScript(first.id).raw);
   } else {
      addNewScript(); 
   }
   showSavedScripts();
}

function addDropdownCharacters(characters){
   const dropdown = document.getElementById("character-dropdown");
    dropdown.innerHTML = '<option value="">Select a character</option>';

    characters.forEach(character => {
        const option = document.createElement("option");
        option.value = character;
        option.textContent = character;
        dropdown.appendChild(option);
    });
}

function togglePin(scriptId) {
   const script = savedScriptNames.find(s => s.id === scriptId);
   if (script) {
      script.pinned = !script.pinned;
      localStorage.setItem("scriptmemorizer:scriptids", JSON.stringify(savedScriptNames));
      showSavedScripts();
   }
}
