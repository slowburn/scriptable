// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;
let widget = new ListWidget()
widget.setPadding(14,10,10,10)

await loadTexte()
Script.setWidget(widget)
Script.complete()

// show a preview of the widget when run in the app, useful for testing
if(config.runsInApp) {
  widget.presentSmall()
}

async function loadTexte() {
  var param = "";
  let dayone = new Date("2020-03-12");
  
  
  var today = new Date();
  var day_delta = Math.floor( (today.getTime() - dayone.getTime()) / (1000 * 3600 * 24) );
  let day = day_delta + " Tage";
  let kw = "KW " + getKW(today);

  let myText1 = widget.addText("Aktuell:")
    myText1.textColor = Color.red()
    myText1.font = Font.boldSystemFont(14)
    
  let kwText = widget.addText(kw)
//     kwText.textOpacity = 0.5
    kwText.font = Font.boldSystemFont(30)
//     widget.addSpacer(8)    

  let myText2 = widget.addText("und")
    myText2.textColor = Color.red()
    myText2.font = Font.boldSystemFont(14)
  
  let dayText = widget.addText(day) 
    dayText.font = Font.semiboldSystemFont(30)
  
  let timeText = widget.addText("Im Covid Homeoffice")
    timeText.textColor = Color.white()
    timeText.font = Font.boldSystemFont(12)
  
  widget.addSpacer()
}

function ordinal_suffix_of(n) {
  var s = ["th", "st", "nd", "rd"],
      v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getWeekday(date) {
  var weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  return weekday[date.getDay()];
}

function getKW(date) {
// von hier: http://die-aktuelle-kalenderwoche.de/kalenderwochen-in-javascript
 
  var currentThursday = new Date(date.getTime() +(3-((date.getDay()+6) % 7)) * 86400000);
  var yearOfThursday = currentThursday.getFullYear();
  var firstThursday = new Date(new Date(yearOfThursday,0,4).getTime() +(3-((new Date(yearOfThursday,0,4).getDay()+6) % 7)) * 86400000);
  var weekNumber = Math.floor(1 + 0.5 + (currentThursday.getTime() - firstThursday.getTime()) / 86400000/7);
  return(weekNumber);
  
}
