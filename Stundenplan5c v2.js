// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: calendar-alt;
const TEST_MODE = true

// CALENDAR/REMINDERS SETUP: calendar and reminder names should match what's shown in the Calendar and Reminder apps
const VISIBLE_CALENDARS = ["Stundenplan 5c", "bla", "blub"]

const CALENDAR_URL = "calendars://open" // For Calendars 5
//const CALENDAR_URL = "googlecalendar://open" // For Calendars 5
const NUM_ITEMS_TO_SHOW = 5
const NO_ITEMS_MESSAGE = "Heute ist frei!" // what's displayed when you have no items for the day

// COLOR SETUP:
const BACKGROUND_COLOR = new Color("#111111")
const imageName = 'bg_gross2.png'


const DATE_COLOR = Color.blue()
const ITEM_NAME_COLOR = Color.orange()
const ITEM_TIME_COLOR = new Color("#eeeeee")
// NOTE: All calendars must have a color mapping, or else they'll show up white
const CALENDAR_COLORS = {
//    "Stundenplan 5c": Color.white(),
    "Stundenplan 5c": new Color("666666"),
    "bla": new Color("#3f51b5"), // blueberry
    "blub": new Color("#e67c73") // flamingo
}

// FONT SETUP
const DATE_SIZE = 22
const ITEM_NAME_SIZE = 18
const ITEM_TIME_SIZE = 14

// INTERNAL CONSTS
const DATE_FORMATTER = new DateFormatter()
const currentDate1 = new Date();
const NOW = new Date(currentDate1.getFullYear(), currentDate1.getMonth(), currentDate1.getDate(), 01, 00, 0); 

// If we're running the script normally, go to the set calendar app
if (!config.runsInWidget && !TEST_MODE) {
    const appleDate = new Date('2001/01/01')
    const timestamp = (NOW.getTime() - appleDate.getTime()) / 1000
    const callback = new CallbackURL(CALENDAR_URL + timestamp)
    callback.open()
    Script.complete()
} else { // Otherwise, work on the widget
    
    // Collect events and reminders to show 
    // Store custom objects here with the fields: id, name, startDate, endDate, dateIncludesTime, isReminder, calendarTitle
    let itemsToShow = []

    // Find future events that aren't all day, aren't canceled, and are part of the calendar list
    const events = await CalendarEvent.today([])
    const currentDate = new Date();
    const mydate =  new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 01, 00, 0); 
//    console.log("mydate: "+mydate);
	
    for (const event of events) {
        if (event.endDate.getTime() > mydate
            && VISIBLE_CALENDARS.includes(event.calendar.title)
            && !event.isAllDay && !event.title.startsWith("Canceled:")) {
            itemsToShow.push({
                id: event.identifier,
                name: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                dateIncludesTime: true,
                isReminder: false,
                calendarTitle: event.calendar.title
            })
        }
    }

    // Sort and truncate them: events / timed reminders, in order, then all-day reminders
    itemsToShow = itemsToShow.sort(sortItems).slice(0, NUM_ITEMS_TO_SHOW)
    
    // Lay out the widget!
    let widget = new ListWidget()
    widget.backgroundColor = BACKGROUND_COLOR
//     console.log("imageName: "+imageName);

    setWidgetBackground(widget, imageName);

    // Add the top date
    DATE_FORMATTER.dateFormat = "EEEE dd.MMM"
    let topDate = widget.addText("" + DATE_FORMATTER.string(NOW))
    topDate.textColor = DATE_COLOR
    topDate.font = Font.semiboldSystemFont(DATE_SIZE)
    
    // Put all of the event items on the bottom
    widget.addSpacer(20)

    // If there is at least one item today
    if (itemsToShow.length > 0) {
        
        for (i = 0; i < itemsToShow.length; i++) {
            // Add space between events
            if (i != 0) {
                widget.addSpacer(12)
            }
            
            // TODO: create a widgetStack and add the URL
            
            let itemName = widget.addText("" + formatItemName(itemsToShow[i]))
            itemName.lineLimit = 1
            itemName.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)
            itemName.textColor = ITEM_NAME_COLOR
            widget.addSpacer(5)
            
            let itemDate = widget.addText("" + formatItemDate(itemsToShow[i]))
            itemDate.font = Font.mediumSystemFont(ITEM_TIME_SIZE)
            itemDate.textColor = getItemColor(itemsToShow[i])
        }
        for (y = NUM_ITEMS_TO_SHOW; y > itemsToShow.length; y--) {
            //add Leerzeilen
            widget.addSpacer(12)
            let itemName = widget.addText(" ")
            itemName.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)
            itemName.textColor = ITEM_NAME_COLOR
            widget.addSpacer(5)
            let itemDate = widget.addText(" ")
            itemDate.font = Font.mediumSystemFont(ITEM_TIME_SIZE)

      }
    } else { // If there are no more items today
        
        // Simple message to show you're done
        let message = widget.addText(NO_ITEMS_MESSAGE)
        message.textColor = ITEM_NAME_COLOR
        message.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)  
    }

    // Finalize widget settings
    widget.setPadding(56, 24, 16, 16)
    widget.spacing = -3

    Script.setWidget(widget)
//     widget.presentSmall()
    widget.presentLarge()
    Script.complete()
}

// WIDGET TEXT HELPERS

function sortItems(first, second) {
    if (first.dateIncludesTime === false && second.dateIncludesTime === false) {
        return 0
    } else if (first.dateIncludesTime === false) {
        return 1
    } else if (second.dateIncludesTime === false) {
        return -1
    } else {
        return first.startDate - second.startDate
    }
}

function formatItemDate(item) {
    if (item.dateIncludesTime === true) {
            DATE_FORMATTER.dateFormat = "hh:mm"
            let startDate = DATE_FORMATTER.string(item.startDate)
            DATE_FORMATTER.dateFormat = "HH:mm"
            let endDate = DATE_FORMATTER.string(item.endDate)
//             return "▐ " + startDate + " - " + endDate
            return "" + startDate + " - " + endDate
    } else {
        return "□ TO-DO" // Not a TODO in the code, literally return that
    }
}

function getItemColor(item) {
    return CALENDAR_COLORS[item.calendarTitle]
}

function formatItemName(item) {
//  return "▐ " + item.name
     return item.name
}

function getItemUrl(item) {
    if (item.isReminder === false) {
        return CALENDAR_URL + item.id
    } else {
        return REMINDERS_URL + item.id
    }
}

// Determines if two dates occur on the same hour
function sameHour(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate() &&
        d1.getHours() === d2.getHours()
}

function getImageUrl(name) {
  let fm = FileManager.iCloud();
  let dir = fm.documentsDirectory()+'/images';
//    console.log("dir: "+dir);

  return fm.joinPath(dir, `${name}`);
}


function setWidgetBackground(widget, imageName) {
  const imageUrl = getImageUrl(imageName);
  widget.backgroundImage = Image.fromFile(imageUrl);
}