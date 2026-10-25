# ElNaaR Discord Bot (Node.js)

بوت ترحيب لأعضاء سيرفر ElNaaR الخاص بلعبة Wolf Team.

## تشغيله
1. استخدم Node.js 20 أو أحدث.
2. ثبّت المكتبات:
   `npm install`
3. أضف متغير البيئة `DISCORD_TOKEN` بقيمة توكن البوت.
4. اختياريًا، أضف `WELCOME_CHANNEL_ID` برقم قناة الترحيب.
5. شغّل:
   `npm start`

## إعداد Discord
- من Discord Developer Portal > تطبيقك > Bot، فعّل **Server Members Intent** واحفظ.
- تأكد أن البوت مضاف إلى السيرفر.
- أعطه في قناة الترحيب صلاحيات View Channel وSend Messages وEmbed Links.
- إذا لم تضبط `WELCOME_CHANNEL_ID`، سيحاول استخدام قناة النظام في السيرفر.

## الأمان
لا تضع توكن البوت في ملفات GitHub ولا ترسله لأي شخص. خزّنه في Environment Variables لدى الاستضافة.
رفع المشروع على GitHub وحده لا يشغّل البوت؛ تحتاج استضافة تدعم Node.js وتشغيل عملية البوت.
