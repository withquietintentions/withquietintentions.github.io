(function(){
  const MAX_ENCOUNTERS = 5;
  const REFRESH_RATE = 10000; //milliseconds
  const TOTAL_SENTENCES = 3;

  document.addEventListener('DOMContentLoaded', function() {
    var displayer = new EncounterDisplayer(new Journey());
    displayer.startIntervals();
  });

  var EncounterDisplayer = function(journey) {
    this.journey = journey;
  };
  EncounterDisplayer.MAX_ENCOUNTERS = MAX_ENCOUNTERS;
  EncounterDisplayer.REFRESH_RATE = REFRESH_RATE;
  EncounterDisplayer.prototype = function() {
    var self = this;
    self.encounters = [];
    self.startIntervals = startIntervals;
    return self;

    function createDivWithId(id) {
      var el = document.createElement('div');
      el.id = id;
      return el;
    }

    function createTimestampEl(index) {
      var el = createDivWithId(timestampElId(index));
      el.className += 'timestamp';
      return el;
    }

    function createResultEl(index) {
      var el = createDivWithId(resultElId(index));
      el.className += 'result';
      return el;
    }

    function getEncountersEl() {
      return document.getElementById('encounters');
    }

    function encounterElId(index) {
      return 'encounter_' + index;
    }

    function timestampElId(index) {
      return 'timestamp_' + index;
    }

    function resultElId(index) {
      return 'result_' + index;
    }

    function createEncounterEl(index) {
      var encounterEl = createDivWithId(encounterElId(index));
      encounterEl.className = 'encounter';
      encounterEl.appendChild(createTimestampEl(index));
      encounterEl.appendChild(createResultEl(index));
      return encounterEl;
    }

    function createEncounterEls() {
      for(var i = 0; i < EncounterDisplayer.MAX_ENCOUNTERS; i++) {
        getEncountersEl().appendChild(createEncounterEl(i));
      }
    }

    function startIntervals() {
      createEncounterEls();
      var that = this;
      that.journey.getEncounter().then(displayEncounters);
      setInterval(function() {
        that.journey.getEncounter().then(displayEncounters);
      }, EncounterDisplayer.REFRESH_RATE);
    }

    function displayEncounters(myEncounter) {
      updateEncounters(myEncounter);
      refreshEncounters();
    }

    function refreshEncounters() {
      encounters.forEach(function(encounter, index) {
        document.getElementById(timestampElId(index)).textContent = encounter.timestamp;
        document.getElementById(resultElId(index)).textContent = encounter.result;
      });
    }

    function updateEncounters(myEncounter) {
      if (encounters.length >= EncounterDisplayer.MAX_ENCOUNTERS) {
        clearEncounters();
        encounters = [myEncounter];
      } else {
        encounters.push(myEncounter);
      }
    }

    function clearEncounters() {
      for(var i = 0; i < EncounterDisplayer.MAX_ENCOUNTERS; i++) {
        document.getElementById(timestampElId(i)).textContent = '';
        document.getElementById(resultElId(i)).textContent = '';
      }
    }
  }();

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
      return {
        timestamp: new Date,
        result: paragraph.reduce(function(a,b) { return a + ' ' + b }, '')
      };
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
}());
