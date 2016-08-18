const MAX_ENCOUNTERS = 3;
const REFRESH_RATE = 3000; //milliseconds
const TOTAL_SENTENCES = 4;
const FADE_TIME = 3000;

function EncounterDisplayer(journey) {
  this.journey = journey;
};
EncounterDisplayer.MAX_ENCOUNTERS = MAX_ENCOUNTERS;
EncounterDisplayer.REFRESH_RATE = REFRESH_RATE;
EncounterDisplayer.FADE_TIME = FADE_TIME;
EncounterDisplayer.prototype.startIntervals = function() {
  var self = this;
  self.journey.start().then(loop);

  function loop() {
    cycle().then(loop);
  }

  function cycle() {
    return new Promise(function(resolve) {
      self.journey.setActiveEncounters().then(function() {
        Promise.all(buildEncounterPromises()).then(function() {
          fadeoutEncounterEls().then(function() {
            removeEncounterEls();
            resolve();
          });
        });
      });
    });
  }

  function encounterPromise(refreshRate) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        displayEncounter(self.journey.getEncounter());
        setTimeout(resolve, EncounterDisplayer.FADE_TIME)
      }, refreshRate);
    });
  }

  function buildEncounterPromises() {
    var promises = [];
    for (var i = 0; i < EncounterDisplayer.MAX_ENCOUNTERS; i++) {
      var refreshRate = EncounterDisplayer.REFRESH_RATE * i;
      promises.push(encounterPromise(refreshRate));
    }
    var delayBeforeRefresh = new Promise(function(resolve) {
      setTimeout(resolve, EncounterDisplayer.REFRESH_RATE * EncounterDisplayer.MAX_ENCOUNTERS);
    })
    promises.push(delayBeforeRefresh);
    return promises;
  }

  function displayEncounter(myEncounter) {
    var template = document.getElementById('encounter-template').content.cloneNode(true);
    template.querySelector('.timestamp').innerText = myEncounter.timestamp;
    template.querySelector('.result').innerText = myEncounter.result;
    getEncountersEl().appendChild(template);
  }

  function getEncountersEl() {
    return document.getElementById('encounters')
  }

  function removeEncounterEls() {
    var total = getEncountersEl().children.length;
    for (var i = 0; i < total; i++) {
      getEncountersEl().children[0].remove();
    }
  }

  function fadeoutEncounterEls() {
    for (var i = 0; i < getEncountersEl().children.length; i++) {
      getEncountersEl().children[i].className += ' fade-out';
    };
    return new Promise(function(resolve) {
      setTimeout(resolve, EncounterDisplayer.FADE_TIME);
    });
  }
}

function Encounter(timestamp, result) {
  this.timestamp = timestamp;
  this.result = result;
};

function Journey() {
  this.encounters = {};
  this.activeEncounters = {};
};
Journey.TOTAL_SENTENCES = TOTAL_SENTENCES;
Journey.prototype.setActiveEncounters = function () {
  var self = this;
  return new Promise(function(resolve) {
    self.activeEncounters = JSON.parse(JSON.stringify(self.encounters));
    resolve();
  });
}
Journey.prototype.getEncounter = function () {
  var self = this;
  var paragraph = [];
  Object.keys(self.activeEncounters.categories).popRandom(Journey.TOTAL_SENTENCES).forEach(function(category) {
    var sentences = self.activeEncounters.categories[category];
    paragraph.push(sentences.popRandom(1));
  });
  return new Encounter(new Date(), paragraph.reduce(function(a,b) { return a + ' ' + b }, ''));
}
Journey.prototype.start = function() {
  var self = this;
  return setEncounters();

  function setEncounters() {
    return getEncounters().then(function(encounters) {
      self.encounters = encounters;
    });
  }

  function getEncounters() {
    return new Promise(function(resolve) {
      var xmlhttp = new XMLHttpRequest();
      var url = './all_encounters.json';
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          resolve(JSON.parse(xmlhttp.responseText));
        }
      };
      xmlhttp.open('GET', url, true);
      xmlhttp.send();
    });
  }
}

Array.prototype.popRandom = function(total) {
  if (this.length < total) return [];
  if (total <= 0) return [];
  var x = Math.floor(Math.random()*this.length);
  var value = this[x];
  this.splice(x,1);
  return [value].concat(this.popRandom(total-1));
}
