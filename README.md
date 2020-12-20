# About

Google Calendarの予定が近づいてきたらLINEに通知を送るやつ

# Set up

1. Google Apps Scriptで新しいプロジェクトを作成してmain.js, util.jsをコピー
2. 以前のエディタを使用して、ファイル＞プロジェクトのプロパティ＞スクリプトのプロパティから、プロパティを2つ設定
   1. `LINE_TOKEN` : 通知を受け取るためのLINEのトークン
   2. `CALENDAR_ID` : 予定を取得するカレンダーのID(`hogehoge@google.com`)
3. AppsScriptで、トリガーを2つ追加
   1. mainTask　分ベースのタイマー、1分おき
   2. dailyTask 日付ベースのタイマー、午前2時など予定が少ない時間帯