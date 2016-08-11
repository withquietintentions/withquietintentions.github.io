const MAX_ENCOUNTERS = 5;
const REFRESH_RATE = 30000; //milliseconds
const TOTAL_SENTENCES = 4;
const FADE_TIME = 2000;

var EncounterDisplayer = function(journey) {
  this.journey = journey;
};
EncounterDisplayer.MAX_ENCOUNTERS = MAX_ENCOUNTERS;
EncounterDisplayer.REFRESH_RATE = REFRESH_RATE;
EncounterDisplayer.prototype = function() {
  var self = this;
  self.startIntervals = startIntervals;
  return self;

  function startIntervals() {
    var that = this;
    that.journey.getEncounter().then(displayEncounters);
    setInterval(function() {
      that.journey.getEncounter().then(displayEncounters);
    }, EncounterDisplayer.REFRESH_RATE);
  }

  function displayEncounters(myEncounter) {
    var tmpl = document.getElementById('encounter-template').content.cloneNode(true);
    tmpl.querySelector('.timestamp').innerText = myEncounter.timestamp;
    tmpl.querySelector('.result').innerText = myEncounter.result;
    if (encountersEl().children.length == EncounterDisplayer.MAX_ENCOUNTERS) {
      removeEncounterEls(EncounterDisplayer.MAX_ENCOUNTERS).then(function() {
        encountersEl().appendChild(tmpl);
      });
    } else {
      encountersEl().appendChild(tmpl);
    }
  }

  function encountersEl() {
    return document.getElementById('encounters')
  }

  function removeEncounterEls(number) {
    var promises = [];
    for (var i = 0; i < number; i++) {
      var p = new Promise(function(resolve) {
        encountersEl().children[i].className += ' fade-out';
        setTimeout(function() {
          encountersEl().children[0].remove();
          resolve();
        }, FADE_TIME);
      });
      promises.push(p);
    }
    return Promise.all(promises);
  }
}();

var Encounter = function(timestamp, result) {
  this.timestamp = timestamp;
  this.result = result;
};

var Journey = function() {};
Journey.TOTAL_SENTENCES = TOTAL_SENTENCES;
Journey.prototype = function() {
  var self = this;
  self.getEncounter = getEncounter;
  return self;

  function getEncounter() {
    return new Promise(function(resolve) {
      var xmlhttp = new XMLHttpRequest();
      var url = './all_encounters.json';
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          resolve(processEncounter(JSON.parse(xmlhttp.responseText)));
        }
      };
      xmlhttp.open('GET', url, true);
      xmlhttp.send();
    });
  }

  function processEncounter(allEncounters) {
    var paragraph = [];
    Object.keys(allEncounters.categories).popRandom(Journey.TOTAL_SENTENCES).forEach(function(category) {
      var sentences = allEncounters.categories[category];
      paragraph.push(sentences[Math.floor(Math.random() * sentences.length)]);
    });
    return new Encounter(new Date(), paragraph.reduce(function(a,b) { return a + ' ' + b }, ''));
  }
}();

Array.prototype.popRandom = function(total) {
  if (this.length < total) return [];
  if (total <= 0) return [];
  var x = Math.floor(Math.random()*this.length);
  var value = this[x];
  this.splice(x,1);
  return [value].concat(this.popRandom(total-1));
}
