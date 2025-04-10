function main() {
  let input = document.querySelector("#input").value;
  let string = input == "" ? "here is a piece of example text." : input;
  let words = string.split(" ");

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