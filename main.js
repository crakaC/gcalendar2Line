const NOTIFY_BEFORE_MINUTES = 5 // n分前にLINEに通知
const NOTIFICATION_HEADER = "🔥次の予定が近づいています🔥"

const SENT_EVENTS = "sentEvents"

/**
 * 通知送信済みのEventIDを削除する
 * 送信済みEventIDはPropertyに保存してあるため長期間は保持できない。(9kbyte制限)
 * mainTask()内で、終了したEventIDは削除しているが消し忘れがあったときのための保険として実行
 * 
 * このタスクが行われる直後に予定が入っていると2回通知が飛ぶことがあるので、予定が入らない深夜帯に設定する。
 */
function dailyTask(){
  deleteProperty(SENT_EVENTS)
}

function mainTask() {
  let calendar = CalendarApp.getCalendarById(getProperty("CALENDAR_ID"))
  sendNotification(calendar)
  deleteFinishedEvents(calendar)
}

/**
 * @param {CalendarApp.Calendar} calendar
 */
function sendNotification(calendar){
  let events = calendar.getEvents(new Date(), getRelativeDate(1, 0))
  let msg = events.filter(isNearEvent).map(formatEvent).join("\n\n")
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
  let sentEvents = JSON.parse(getProperty(SENT_EVENTS))
  if(!sentEvents || !sentEvents.length) return

  let now = new Date()
  let events = calendar.getEvents(getRelativeDate(0, 0), now)
  let deleted = false
  for(const event of events){
      let id = event.getId()
      let end = new Date(event.getEndTime())
      if(end > now) continue
      const index = sentEvents.indexOf(id)
      if(index != -1){
        sentEvents.splice(index, 1)
        Logger.log(`${id} is removed from sentEvents`)
        deleted = true
      }
  }
  if(deleted){
    setProperty(SENT_EVENTS, JSON.stringify(sentEvents))
  }
}

/**
 * @param {CalendarApp.CalendarEvent} event
 * @return {bool}
 */
function isNearEvent(event){
  let start = new Date(event.getStartTime())
  let now = new Date()
  let limit = minutesLater(now, NOTIFY_BEFORE_MINUTES)
  let inTime = now < start && start < limit
  if(!inTime){
    return false
  }
  let sentEvents = JSON.parse(getProperty(SENT_EVENTS))
  if(!sentEvents){
    sentEvents = []
    setProperty(SENT_EVENTS, JSON.stringify(sentEvents))
  }
  let id = event.getId()
  let hasAlreadySent = sentEvents.includes(id)
  if(!hasAlreadySent){
    sentEvents.push(id)
    setProperty(SENT_EVENTS, JSON.stringify(sentEvents))
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