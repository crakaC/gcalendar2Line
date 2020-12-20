# About

Google Calendarの予定が近づいてきたらLINEに通知を送るやつ

# Set up

1. Google Apps Scriptで新しいプロジェクトを作成してmain.js, util.jsをコピー
2. 以前のエディタを使用して、ファイル＞プロジェクトのプロパティ＞スクリプトのプロパティから、プロパティを2つ設定
   1. `LINE_TOKEN` : 通知を受け取るためのLINEのトークン。[Line Notify](https://notify-bot.line.me/)からアクセストークンを発行する。
   2. `CALENDAR_ID` : 予定を取得するカレンダーのID(`hogehoge@google.com`)
   ![property](https://github.com/crakaC/gcalendar2line/blob/main/screenshot/property.png?raw=true "プロパティ")
3. AppsScriptで、トリガーを2つ追加
   1. mainTask　分ベースのタイマー、1分おき
   ![mainTask](https://github.com/crakaC/gcalendar2line/blob/main/screenshot/maintrigger.png?raw=true "トリガー1")
   1. dailyTask 日付ベースのタイマー、午前2時など予定が少ない時間帯
   ![dailyTask](https://github.com/crakaC/gcalendar2line/blob/main/screenshot/dailytrigger.png?raw=true "トリガー2")

多分動くと思います。

main.js一番上の`NOTIFY_BEFORE_MINUTES`, `NOTIFICATION_HEADER`を自由に設定してね。