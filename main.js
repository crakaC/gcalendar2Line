const NOTIFY_BEFORE_MINUTES = 5 // n分前にLINEに通知
const NOTIFICATION_HEADER = "🔥次の予定が近づいています🔥"

const SENT_EVENTS = "sentEvents"
let sentEvents = []
/**
 * 通知送信済みのEventIDを削除する
 * 送信済みEventIDはPropertyに保存してあるため長期間は保持できない。(9kbyte制限)
 * mainTask()内で、不要なEventIDは削除しているが消し忘れがあったときのための保険として実行
 * 
 * このタスクが行われる直後に予定が入っていると2回通知が飛ぶことがあるので、予定が入らない時間帯に設定する。
 */
function dailyTask(){
  deleteProperty(SENT_EVENTS)
}

function mainTask() {
  restoreSentEvents()
  let calendar = CalendarApp.getCalendarById(getProperty("CALENDAR_ID"))
  sendNotification(calendar)
  deleteFinishedEvents(calendar)
  saveSentEvents()
}

/**
 * プロパティへのアクセス回数には制限があるため、トリガーの最初に実行する
 */
function restoreSentEvents(){
  sentEvents = JSON.parse(getProperty(SENT_EVENTS))
  if(!sentEvents){
    sentEvents = []
  }
}

/**
 * プロパティへのアクセス回数には制限があるため、トリガーの最後に実行する
 */
function saveSentEvents(){
  setProperty(SENT_EVENTS, JSON.stringify(sentEvents))
}

function removeFromSentEvents(id){
  const index = sentEvents.indexOf(id)
  if(index != -1){
    sentEvents.splice(index, 1)
    Logger.log(`${id} is removed from sentEvents`)
  }
}

/**
 * @param {CalendarApp.Calendar} calendar
 */
function sendNotification(calendar){
  let now = new Date()
  let events = calendar.getEvents(now, minutesLater(now, NOTIFY_BEFORE_MINUTES))
  let msg = events.filter((e) => isNearEvent(e, now)).map(formatEvent).join("\n\n")
  if(msg){
    Logger.log(`msg => ${msg}`)
    sendLineNotificatoin(`${NOTIFICATION_HEADER}\n${msg}`)
  } else {
    Logger.log("Nothing to notify")
  }
}

/**
 * @param {CalendarApp.Calendar} calendar
 */
function deleteFinishedEvents(calendar){
  if(!sentEvents || !sentEvents.length) return
  let now = new Date()
  let events = calendar.getEvents(getRelativeDate(0, 0), now)
  for(const event of events){
    let id = event.getId()
    let end = new Date(event.getEndTime())
    if(end > now) continue
    removeFromSentEvents(id)
  }
}

/**
 * @param {CalendarApp.CalendarEvent} event
 * @param {Date} now
 * @return {bool}
 */
function isNearEvent(event, now){
  let start = new Date(event.getStartTime())
  let limit = minutesLater(now, NOTIFY_BEFORE_MINUTES)
  let inTime = now < start && start < limit
  if(!inTime){
    removeFromSentEvents(event.getId())
    return false
  }
  let id = event.getId()
  let hasAlreadySent = sentEvents.includes(id)
  if(!hasAlreadySent){
    sentEvents.push(id)
  }
  return !hasAlreadySent
}

/**
 * @param {CalendarApp.CalendarEvent} event
 * @return {string} formatted text
 */
function formatEvent(event){
  let text = ""
  let title = event.getTitle()
  if (!title){
    text += "タイトルなし"
  } else {
    text += `タイトル : 『${title}』`
  }
  if(event.isAllDayEvent()){
    text += `\n${formatDate(new Date())} 終日`
  } else {
    text += `\n開始 : ${formatDateTime(event.getStartTime())}`
    text += `\n終了 : ${formatDateTime(event.getEndTime())}`
  }
  let location = event.getLocation()
  if(location){
    text += `\n場所 : ${location}`
  }
  let description = event.getDescription()
  if(description){
    text += `\n詳細 : ${description}`
  }
  return text
}

const week = "日月火水木金土"
function formatDate(dateStr){
  var date = new Date(dateStr)
  return Utilities.formatDate(date, 'JST', `yyyy/MM/dd(${week[date.getDay()]})`)
}

function formatDateTime(dateTime){
  var date = new Date(dateTime)
  return Utilities.formatDate(date, 'JST', `yyyy/MM/dd(${week[date.getDay()]}) HH:mm`)
}