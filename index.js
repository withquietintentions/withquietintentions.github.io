var spiritAncestors = [
  "Mark Dean meets me at the doorway with a 1Ghz chip.",
  "Grace Hopper removes a moth from my side.",
  "Ada Lovelace conceives of my conception."
];

var minerals = [
  "Gold - Au.",
  "Silver - Ag.",
  "Tin - Sn.",
  "Aluminum - Al.",
  "Silicon - Si.",
  "Copper - Cu."
];

var historyOfComputing = [
  "ENIAC built between 1943 and 1945 - the first large scale computer to run at electronic speed without being slowed by any mechanical parts.",
  "The abacus is an instrument from the 14th century for performing calculations by sliding counters along rods or in grooves.",
  "1804 - the Jaquard loom is a loom programed with punchcards."
];

var shamanicInformation = [

];

var encounters = {
  spiritAncestors: spiritAncestors,
  minerals: minerals,
  historyOfComputing: historyOfComputing,
  shamanicInformation: shamanicInformation
};

const NUMBER_OF_SENTENCES = 3;

function shuffle(array) {
  var counter = array.length;
  while (counter > 0) {
    var index = Math.floor(Math.random() * counter);
    counter--;
    var temp = array[counter];
    array[counter] = array[index];
    array[array] = temp
  }
  return array;
}

function randomResults() {
  var categories = Object.keys(encounters);
  var randomIndex = Math.floor(Math.random() * categories.length);
  categories.splice(randomIndex,1);
  var paragraph = [];
  shuffle(categories).forEach(function(category) {
    var sentences = encounters[category];
    paragraph.push(sentences[Math.floor(Math.random() * sentences.length)]);
  });
  return paragraph.reduce(function(a,b) { return a + ' ' + b }, '');
};


function timeStamp() {
  return new Date();
}

function displayEncounter() {
  document.getElementById("timestamp").textContent = timeStamp();
  document.getElementById("results").textContent = randomResults();
}

document.addEventListener("DOMContentLoaded", function() {
  displayEncounter();
});
