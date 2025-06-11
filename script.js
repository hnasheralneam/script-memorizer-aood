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

   showSavedScripts();
   document.getElementById('input').addEventListener("change", () => {
      SaveManager.saveScript(activeScript.id, activeScript.name, document.getElementById("input").value);
   });

   buttonInfo(document.getElementById("runButton"), "Run Script");
   buttonInfo(document.getElementById("settings"), "More Settings");
   buttonInfo(document.getElementById("scriptButton"), "Show/Hide Script Editor");
   buttonInfo(document.getElementById("addFile"), "Add script file (TO BE IMPLEMENTED)");



}

// provides information on different buttons when hovered over
function buttonInfo(element, message) {
   element.addEventListener("mouseover", (event) => {
      event.stopPropagation();
      document.querySelector(".infoBox")?.remove();

      const info = document.createElement("div");
      info.classList.add("infoBox");
      info.textContent = message;
      document.body.appendChild(info);

      const rect = element.getBoundingClientRect();
      const infoRect = info.getBoundingClientRect(); 

      info.style.position = "absolute";
      info.style.top = `${rect.bottom + window.scrollY + 6}px`;
      info.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (info.offsetWidth / 2)}px`;

      function removeTooltip() {
         info.remove();
         element.removeEventListener("mouseleave", removeTooltip);
         info.removeEventListener("mouseleave", removeTooltip);
      }

      element.addEventListener("mouseleave", removeTooltip);
      info.addEventListener("mouseleave", removeTooltip);
   });
}



function main(arg, splitter) {
   hideScriptEditor();
   document.getElementById("scriptButton").innerHTML = "Show Script Editor";
   
   let input = arg;
   let string = input;
   if (string.length < 1) return;

   let words = string.split(splitter);
   let pos = 0;
   let hideWordEvery = document.querySelector("#skip-distance").value || 2;
   let htmlOutput = "";

   for (let word of words) {
      // skip if just whitespace
      if (word.trim() === "") continue;

      // check if word is inside parentheses
      const isParenthetical = word.trim().startsWith("(") && word.trim().endsWith(")");

      // always show parentheticals
      if (isParenthetical) {
         htmlOutput += word + " ";
         continue; 
      }

      pos++;

      if (pos % hideWordEvery == 0) {
         let endingPunctuation = "";
         if (word.at(-1) == "." || word.at(-1) == ",") {
            endingPunctuation = word.at(-1);
            word = word.substring(0, word.length - 1);
         }
         htmlOutput += `<span class="hidden" onclick="hiddenWords(this)">${word}</span>${endingPunctuation} `;
      } else {
         htmlOutput += word + " ";
      }
   }
   document.querySelector(".output").innerHTML = htmlOutput;
   SaveManager.saveScript(activeScript.id, activeScript.name, document.getElementById("input").value);
   return htmlOutput;
}

function hiddenWords(element) {
   if (element.classList.contains("shown")) {
      element.classList.remove("shown");
      element.classList.add("hidden");
   } else if (element.classList.contains("hidden")) {
      element.classList.remove("hidden");
      element.classList.add("shown");
   }
}


function parseText(raw) {
   let dropdown = document.getElementById("character-dropdown");
   console.log(dropdown.value);
   let option = true;
   if(document.getElementById("character-dropdown").value==="All Characters"){
      option = false;
   }

   console.log("option: " + option);
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
      } else if (currentCharacter) {
         currentLine += line + " ";
      }


   }

   // final flush
   if (currentCharacter && currentLine) {
      characterLines.push(`${currentCharacter}: ${currentLine.trim()}`);
   }

   let htmlOutput = "";
   if(option){
      console.log("option is true");
      let mainCharacter = document.getElementById("character-dropdown").value;
      htmlOutput = "";

      for (let i = 0; i < characterLines.length; i++) {
         if (characterLines[i].includes(mainCharacter)) {
            let str = characterLines[i].slice(mainCharacter.length + 1, characterLines[i].length);
            htmlOutput += mainCharacter + ": " + main(str, " ") + `<br>`;
         } else {
            htmlOutput += characterLines[i] + `<br>`;
         }
      }
   } else {
      htmlOutput = "";
      for (let i = 0; i < characterLines.length; i++) {
         let str = characterLines[i].slice(characterLines[i].indexOf(":") + 1, characterLines[i].length);
         htmlOutput += characterLines[i].slice(0, characterLines[i].indexOf(":") + 1) + main(str, " ") + `<br>`;
      }
   }
   showOnPage2(htmlOutput);
   document.getElementById("scriptButton").innerHTML = "Show Script Editor";
}

//populates the dropdown with characters
function parseForCharacter() {
   let text = document.querySelector("#input").value;
   let words = text.split("\n");
   let characters = [];
   let isNew = true;
   let regex = /^([A-Z][A-Z0-9\s]*?):?$/;
   for (let word of words) {
      if (regex.test(word)) {
         for (let character of characters) {
            if (word === character) {
               isNew = false;
            }
         }
         if (isNew) {
            characters.push(word);
         }
         isNew = true;
      }
   }

   removeOptions(document.getElementById("character-dropdown"));
   for (let character of characters) {
      document.getElementById("character-dropdown").add(new Option(character, character))
   }
   let allOption = document.createElement("option");
   allOption.value = "All Characters";
   allOption.textContent = "ALL CHARACTERS";
   document.getElementById("character-dropdown").add(allOption);
}

//removes all options from the dropdown
function removeOptions(selectElement) {
   let i, L = selectElement.options.length - 1;
   for (i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}


// when called, function will take in the name of the script then display it in the output
function showOnPage(id, name, raw) {
   activeScript = { id, name };
   let htmlOutput = "";
   document.querySelector(".output").innerHTML = "";
   document.getElementById("input").value = raw;
   showScriptEditor();
   parseForCharacter();
   document.getElementById("scriptName").textContent = name;
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
   addScriptButton.textContent = " + New Script";
   list.appendChild(addScriptButton);
   //let newScript = document.createElement("li");
   
   //checks for pinned scripts and adds them to the top
   const sortedScripts = [...savedScriptNames].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.name.localeCompare(b.name);
   });

   let pinned = document.createElement("h2")
   pinned.textContent = "Pinned Scripts";
   list.appendChild(document.createElement("br"));
   list.appendChild(pinned);
   list.appendChild(document.createElement("hr"));
   let pinnedScripts = sortedScripts.filter(script => script.pinned);
   let unpinnedScripts = sortedScripts.filter(script => !script.pinned);

   newScript(pinnedScripts, list);

   list.appendChild(document.createElement("br"));
   let unpinned = document.createElement("h2")
   unpinned.textContent = "Unpinned Scripts";
   list.appendChild(unpinned);
   list.appendChild(document.createElement("hr"));
   
   newScript(unpinnedScripts, list);

}

function newScript(array, list){
   console.log("please work")
   array.forEach(({ id, name, pinned }) => {
      let newScript = document.createElement("li");
      let label = document.createElement("span");
      //creates the settings button
      let settingsBtn = document.createElement("div");
      settingsBtn.classList.add("btn-settings");
      settingsBtn.textContent = "⚙️";
      settingsBtn.title = "Script settings";

      settingsBtn.addEventListener("mouseover", (e) => {
         console.log("Mouse over settings button");
         e.stopPropagation();
         document.querySelector(".settings-menu")?.remove();

         let menu = document.createElement("div");
         menu.classList.add("settings-menu");

         let renameBtn = document.createElement("button");
         renameBtn.textContent = "Rename";
         renameBtn.title = "Rename script";
         renameBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            activeScript = { id, name };
            changeName();
            menu.remove();
         });

         let deleteBtn = document.createElement("button");
         deleteBtn.textContent = "🗑️";
         deleteBtn.title = "Delete script";
         deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            activeScript = { id, name };
            removeScript();
            menu.remove();
         });

         let pinBtn = document.createElement("button");
         pinBtn.textContent = pinned ? "❤️" : "🤍";
         pinBtn.title = pinned ? "Unpin script" : "Pin script";
         pinBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            togglePin(id);
            menu.remove();
         });

         menu.appendChild(renameBtn);
         menu.appendChild(deleteBtn);
         menu.appendChild(pinBtn);
         document.body.appendChild(menu);

         const rect = e.target.getBoundingClientRect();
         menu.style.top = `${rect.top + window.scrollY}px`;
         menu.style.left = `${rect.right + 6 + window.scrollX}px`;

         menu.addEventListener("mouseleave", () => {
            menu.remove();
         });

         
      });
     

      if (name === "+ new script") return;
      label.textContent = name;
      label.classList.add("script-label");
      let scriptItemContent = document.createElement("div");
      scriptItemContent.classList.add("script-item-content");
      scriptItemContent.appendChild(label);
      scriptItemContent.appendChild(settingsBtn);
      newScript.appendChild(scriptItemContent);

      /*
      newScript.appendChild(pinBtn);
      newScript.appendChild(label);
      newScript.appendChild(deleteBtn);
      newScript.appendChild(renameBtn);
      */



      if (id == activeScript.id) newScript.classList.add("active");
      newScript.addEventListener("click", () => {
         showOnPage(id, name, SaveManager.getScript(id).raw);
         document.querySelector(".active")?.classList.remove("active");
         newScript.classList.add("active");
      });
      list.appendChild(newScript);
   });
}

//adds another label on the side
function addNewScript() {
   let name = prompt("What would you like to name your script");
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

// Shows all the hidden words in the script
function showAll() {
   let hiddenWords = document.querySelectorAll(".hidden");
   for (let element of hiddenWords) {
      element.classList.add("shown");
   }
}

// Hides all the shown words in the script
function hideAll() {
   let shownWords = document.querySelectorAll(".shown");
   for (let element of shownWords) {
      element.classList.remove("shown");
   }
}
//Shows the script editor after it has disappeared
function toggleScriptEditor() {
   let scriptButton = document.getElementById("imageButton");
   if (scriptButton.title === "Show Script Editor") {
      showScriptEditor();
      scriptButton.title = "Hide Script Editor";
      scriptButton.innerHTML = "Hide Script Editor";
      scriptButton.src = "images/eyeOpen.png";
   } else {
      hideScriptEditor();
      scriptButton.title = "Show Script Editor";
      scriptButton.innerHTML = "Show Script Editor";
      scriptButton.src = "images/eyeClose.png";
   }
}

// Shows the script editor when the button is clicked
function showScriptEditor() {
   document.querySelector(".inputContainer").style.height = "15rem";
   document.querySelector(".inputContainer").style.opacity = "1";
   document.querySelector(".inputContainer").style.pointerEvents = "auto";
}


// Hides the script editor when the button is clicked
function hideScriptEditor() {
   document.querySelector(".inputContainer").style.height = "2rem";
   document.querySelector(".inputContainer").style.opacity = "0";
   document.querySelector(".inputContainer").style.pointerEvents = "none";
}

// Toggles the visibility of all hidden words in the script
function toggle(){
   buttonName = document.getElementById("hideButton");
   console.log(buttonName.innerHTML);
   if(buttonName.innerHTML === "Hide All Hidden Words") {
      buttonName.innerHTML = "Show All Hidden Words";
      hideAll();
   } else if(buttonName.innerHTML === "Show All Hidden Words") {
      showAll();
      buttonName.innerHTML = "Hide All Hidden Words";
   }
}

// Changes the name of the script when the button is clicked
function changeName() {
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


// Removes the script from the sidebar and local storage
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


// //NOT USED ??
// function addDropdownCharacters(characters) {
//    console.log("RAN");
//    const dropdown = document.getElementById("character-dropdown");
//    dropdown.innerHTML = '<option value="">Select a character</option>';
//    let allOption = document.createElement("option");
//    allOption.value = "All Characters";
//    allOption.textContent = "ALL CHARACTERS";
//    dropdown.appendChild(allOption)
//    characters.forEach(character => {
//       const option = document.createElement("option");
//       option.value = character;
//       option.textContent = character;
//       dropdown.appendChild(option);
//    });

//    console.log("options in dropdown:");
//    for(let i = 0; i < dropdown.options.length; i++) {
//       console.log(dropdown.options[i].value);
//    }
// }


// Toggles pinning of a script in the sidebar
function togglePin(scriptId) {
   const script = savedScriptNames.find(s => s.id === scriptId);
   if (script) {
      script.pinned = !script.pinned;
      localStorage.setItem("scriptmemorizer:scriptids", JSON.stringify(savedScriptNames));
      showSavedScripts();
   }
}

document.querySelector("#input").addEventListener("input", () => {
   parseForCharacter();
});


// Opens the settings panel
function openSettings() {
   document.querySelector(".settingsPanel").style.display = "flex";
   document.querySelector(".settingsPanel").style.opacity = "1";
   document.querySelector(".settingsPanel").style.pointerEvents = "auto";
   document.querySelector(".settingsPanel").style.height = "5vh";
}


// Closes the settings panel
function closeSettings() {
   document.querySelector(".settingsPanel").style.display = "none";
   document.querySelector(".settingsPanel").style.opacity = "0";
   document.querySelector(".settingsPanel").style.pointerEvents = "none";
}

function toggleSettingsPanel(){
   let settingsPanel = document.querySelector(".settingsPanel");
   if (settingsPanel.style.display === "none" || settingsPanel.style.display === "") {
      openSettings();
   } else {
      closeSettings();
   }
}