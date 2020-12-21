function sendLineNotificatoin(msg){
  let token = getProperty('LINE_TOKEN')
  let options = {    
    method: 'post',
    payload: 'message=' + msg,
    headers: {'Authorization' : 'Bearer '+ token},
    muteHttpExceptions: true
  }
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify', options)
}

let properties = PropertiesService.getScriptProperties()
function getProperty(key){
  return properties.getProperty(key)
}

function setProperty(key, value){
  properties.setProperty(key, value)
}

function printProperties(){
  Logger.log(properties.getProperties())
}

function deleteProperty(key){
  properties.deleteProperty(key)
}

/**
 * Helper function to get a new Date object relative to the current date.
 * @param {number} daysOffset The number of days in the future for the new date.
 * @param {number} hour The hour of the day for the new date, in the time zone
 *     of the script.
 * @return {Date} The new date.
 */
function getRelativeDate(daysOffset, hour) {
  let date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

function minutesLater(date, minutes){
  date = new Date(date)
  let later = new Date(date)
  later.setMinutes(date.getMinutes() + minutes)
  return later
}