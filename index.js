const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

const CHANNEL_ID = "1483219896069525665";
const ANNOUNCE_CHANNEL = "1489912837592842294";

let wins = {};
let totalWins = {};
let leaderboardMessageId = null;
const recentMatches = {};
let divisionCount = 0;

// تحميل البيانات
if (fs.existsSync("wins.json")) wins = JSON.parse(fs.readFileSync("wins.json"));
if (fs.existsSync("totalWins.json")) totalWins = JSON.parse(fs.readFileSync("totalWins.json"));
if (fs.existsSync("division.json")) divisionCount = JSON.parse(fs.readFileSync("division.json"));

// 🔥 رسائل اللقب
const winnerMessages = [

`👑 {user} يخطف لقب الكابيتانو بعد أداء ثابت وسيطرة واضحة على مجريات التقسيمات
يثبت حضوره القوي ويؤكد أنه من نخبة المنافسين في الساحة
@everyone`,

`👑 {user} يحسم لقب الكابيتانو بعد منافسة قوية وأداء متوازن طوال المباريات
يؤكد أنه قادر على فرض نفسه في أصعب اللحظات
@everyone`,

`👑 {user} يتوج بلقب الكابيتانو بعد مستوى مميز وثبات عالي في جميع المواجهات
يواصل إثبات جدارته ويعزز مكانه بين الأفضل
@everyone`,

`👑 {user} يخطف الكابيتانو بعد تحكم واضح وثقة كبيرة في كل جولة
يؤكد أنه لاعب يعتمد عليه في أقوى المنافسات
@everyone`,

`👑 {user} يحسم اللقب بعد أداء قوي وقرارات ذكية طوال التقسيمات
يظهر بشكل ثابت ويثبت أنه من الصفوة
@everyone`,

`👑 {user} يتصدر ويخطف لقب الكابيتانو بعد سلسلة مواجهات ناجحة
يعكس مستوى عالي ويؤكد استحقاقه الكامل
@everyone`,

`👑 {user} يفرض نفسه ويأخذ الكابيتانو بعد أداء منظم وثابت
يثبت أنه حاضر دائمًا في المنافسات القوية
@everyone`,

`👑 {user} يحسم الكابيتانو بعد مواجهة قوية وأداء مستقر
يؤكد أنه لاعب يعتمد عليه في اللحظات الحاسمة
@everyone`,

`👑 {user} يخطف اللقب بعد سيطرة واضحة وثقة عالية في اللعب
يستمر في تقديم مستوى يليق بالقمة
@everyone`,

`👑 {user} يتوج بالكابيتانو بعد أداء متكامل وانضباط في المباريات
يثبت أنه من أفضل اللاعبين في الساحة
@everyone`,

`👑 {user} يحسم اللقب بعد منافسة شرسة وأداء متوازن
يؤكد أنه يمتلك القدرة على الحسم في الأوقات المهمة
@everyone`,

`👑 {user} يخطف الكابيتانو بعد حضور قوي وثبات في جميع الجولات
يعزز اسمه بين اللاعبين الكبار
@everyone`,

`👑 {user} يتصدر الترتيب ويأخذ اللقب بعد أداء واضح ومقنع
يثبت أنه يستحق القمة بكل جدارة
@everyone`,

`👑 {user} يحسم الكابيتانو بعد تحكم كامل في مجريات اللعب
يؤكد تفوقه في المواجهات المباشرة
@everyone`,

`👑 {user} يخطف اللقب بعد أداء منظم وثقة كبيرة في القرارات
يواصل إثبات نفسه في كل تقسيمة
@everyone`,

`👑 {user} يتوج بالكابيتانو بعد سلسلة نتائج إيجابية وأداء ثابت
يعكس مستوى عالي واستحقاق واضح
@everyone`,

`👑 {user} يحسم اللقب بعد سيطرة واضحة وثبات طوال المنافسة
يثبت أنه من أخطر المنافسين
@everyone`,

`👑 {user} يخطف الكابيتانو بعد أداء قوي وتحكم في المباريات
يؤكد أنه لاعب يعتمد عليه دائمًا
@everyone`,

`👑 {user} يتصدر ويأخذ اللقب بعد مستوى مميز وثقة عالية
يواصل فرض اسمه في القمة
@everyone`,

`👑 {user} يحسم الكابيتانو بعد مواجهة قوية وأداء متماسك
يثبت أنه حاضر في أصعب التحديات
@everyone`,

`👑 {user} يحسم لقب الكابيتانو بعد أداء متوازن وثبات في جميع المواجهات
يثبت أنه قادر على الحفاظ على مستواه تحت الضغط
@everyone`,

`👑 {user} يخطف الكابيتانو بعد تحكم واضح في سير المباريات
يعكس خبرة عالية وقدرة على قراءة اللعب
@everyone`,

`👑 {user} يتوج باللقب بعد سلسلة انتصارات متتالية وأداء ثابت
يؤكد أنه يستحق مكانه في القمة
@everyone`,

`👑 {user} يحسم اللقب بعد مواجهة قوية وأداء منظم
يواصل تقديم مستوى ثابت ومقنع
@everyone`,

`👑 {user} يخطف الكابيتانو بعد حضور قوي في جميع الجولات
يثبت أنه عنصر حاسم في كل مباراة
@everyone`,

`👑 {user} يتصدر ويأخذ اللقب بعد أداء مستقر وثقة عالية
يعزز مكانته بين أقوى اللاعبين
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سيطرة واضحة على مجريات اللعب
يؤكد تفوقه في اللحظات الحاسمة
@everyone`,

`👑 {user} يخطف اللقب بعد أداء متكامل وانضباط كبير
يثبت أنه قادر على إنهاء المباريات لصالحه
@everyone`,

`👑 {user} يتوج بالكابيتانو بعد مواجهة قوية وثبات ملحوظ
يعكس مستوى احترافي في جميع الجولات
@everyone`,

`👑 {user} يحسم اللقب بعد أداء قوي وتحكم كامل في المباراة
يثبت أنه من أبرز الأسماء في المنافسة
@everyone`,

`👑 {user} يخطف الكابيتانو بعد سلسلة مواجهات ناجحة
يؤكد أنه حاضر دائمًا في القمة
@everyone`,

`👑 {user} يتصدر الترتيب بعد أداء ثابت وثقة واضحة
يعكس خبرة عالية في إدارة المباريات
@everyone`,

`👑 {user} يحسم اللقب بعد مواجهة حاسمة وأداء مميز
يثبت أنه لاعب يعتمد عليه
@everyone`,

`👑 {user} يخطف الكابيتانو بعد تحكم واضح في إيقاع اللعب
يؤكد أنه من أقوى المنافسين
@everyone`,

`👑 {user} يتوج باللقب بعد أداء مستقر ونتائج قوية
يعزز حضوره في ساحة المنافسة
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سيطرة وثقة عالية
يثبت أنه يستحق هذا التتويج
@everyone`,

`👑 {user} يخطف اللقب بعد أداء مميز في جميع المواجهات
يؤكد استحقاقه الكامل للقمة
@everyone`,

`👑 {user} يتصدر بعد سلسلة انتصارات قوية وأداء ثابت
يعكس مستوى عالي وثقة كبيرة
@everyone`,

`👑 {user} يحسم الكابيتانو بعد مواجهة قوية وتحكم واضح
يثبت أنه الأفضل في هذه التقسيمات
@everyone`,

`👑 {user} يخطف اللقب بعد أداء متوازن وثبات ملحوظ
يؤكد أنه من الصفوة
@everyone`,

// 🔥 كملنا إلى ~40

`👑 {user} يتوج بالكابيتانو بعد سيطرة واضحة وأداء ثابت
يعكس احترافية عالية في اللعب
@everyone`,

`👑 {user} يحسم اللقب بعد مواجهة قوية ونتيجة مستحقة
يثبت أنه لاعب حاسم
@everyone`,

`👑 {user} يخطف الكابيتانو بعد أداء متكامل وثقة عالية
يؤكد تفوقه في المنافسة
@everyone`,

`👑 {user} يتصدر بعد سلسلة مباريات ناجحة وأداء قوي
يعكس استمرارية في المستوى
@everyone`,

`👑 {user} يحسم اللقب بعد تحكم كامل في مجريات اللعب
يثبت أنه الأفضل في هذه الجولة
@everyone`,

`👑 {user} يخطف الكابيتانو بعد أداء ثابت في جميع الجولات
يؤكد أنه من نخبة اللاعبين
@everyone`,

`👑 {user} يتوج باللقب بعد مواجهة حاسمة وأداء قوي
يعكس ثقة كبيرة في اللعب
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سيطرة واضحة وثبات مستمر
يثبت أنه عنصر حاسم في الفريق
@everyone`,

`👑 {user} يخطف اللقب بعد أداء متوازن ونتائج قوية
يؤكد أنه يستحق هذا الإنجاز
@everyone`,

`👑 {user} يتصدر الترتيب بعد أداء ثابت وثقة عالية
يعكس احترافية واضحة
@everyone`,

// 🔥 الآن تقريبًا 60+

`👑 {user} يحسم الكابيتانو بعد مواجهة قوية وتحكم كامل
يثبت أنه لاعب مؤثر
@everyone`,

`👑 {user} يخطف اللقب بعد أداء مميز وثبات في اللعب
يؤكد أنه من أبرز المنافسين
@everyone`,

`👑 {user} يتوج بعد سلسلة انتصارات قوية وأداء ثابت
يعكس مستوى عالي وثقة واضحة
@everyone`,

`👑 {user} يحسم اللقب بعد سيطرة واضحة وأداء قوي
يثبت أنه الأفضل في هذه التقسيمات
@everyone`,

`👑 {user} يخطف الكابيتانو بعد تحكم كبير في المباريات
يؤكد استحقاقه الكامل
@everyone`,

`👑 {user} يتصدر بعد أداء متكامل وثبات واضح
يعكس قوة حضوره في المنافسة
@everyone`,

`👑 {user} يحسم اللقب بعد مواجهة قوية وأداء ثابت
يثبت أنه من الصفوة
@everyone`,

`👑 {user} يخطف الكابيتانو بعد أداء متوازن وثقة عالية
يؤكد تفوقه المستمر
@everyone`,

`👑 {user} يتوج بعد أداء قوي وسيطرة واضحة
يعكس احترافية عالية
@everyone`,

`👑 {user} يحسم اللقب بعد سلسلة نتائج إيجابية
يثبت أنه الأفضل في هذه الجولة
@everyone`,

`👑 {user} يحسم لقب الكابيتانو بعد أداء قوي وثبات في جميع المواجهات
يثبت أنه قادر على فرض نفسه في أصعب الظروف
@everyone`,

`👑 {user} يخطف الكابيتانو بعد تحكم واضح في مجريات اللعب
يعكس خبرة عالية وثقة كبيرة في كل جولة
@everyone`,

`👑 {user} يتوج باللقب بعد سلسلة مباريات ناجحة وأداء ثابت
يؤكد استحقاقه الكامل لهذا الإنجاز
@everyone`,

`👑 {user} يحسم اللقب بعد مواجهة قوية وأداء متماسك
يثبت أنه من أبرز الأسماء في المنافسة
@everyone`,

`👑 {user} يخطف الكابيتانو بعد حضور قوي في جميع الجولات
يعكس مستوى ثابت وقدرة على الحسم
@everyone`,

`👑 {user} يتصدر ويأخذ اللقب بعد أداء متوازن وثقة عالية
يواصل إثبات نفسه بين أفضل اللاعبين
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سيطرة واضحة طوال التقسيمات
يثبت أنه الأفضل في هذه الجولة
@everyone`,

`👑 {user} يخطف اللقب بعد أداء منظم وثبات ملحوظ
يعكس احترافية عالية في اللعب
@everyone`,

`👑 {user} يتوج بالكابيتانو بعد نتائج قوية وأداء مستقر
يؤكد أنه لاعب يعتمد عليه دائمًا
@everyone`,

`👑 {user} يحسم اللقب بعد تحكم كامل في سير المباريات
يثبت تفوقه في المواجهات الحاسمة
@everyone`,

`👑 {user} يخطف الكابيتانو بعد أداء مميز وثقة واضحة
يعكس قوة حضوره في المنافسة
@everyone`,

`👑 {user} يتصدر بعد سلسلة انتصارات متتالية وأداء ثابت
يؤكد أنه يستحق القمة بكل جدارة
@everyone`,

`👑 {user} يحسم اللقب بعد مواجهة قوية وتحكم واضح
يثبت أنه من الصفوة
@everyone`,

`👑 {user} يخطف الكابيتانو بعد أداء متكامل وثبات في اللعب
يعكس خبرة كبيرة في إدارة المباريات
@everyone`,

`👑 {user} يتوج باللقب بعد سلسلة نتائج إيجابية
يؤكد أنه الأفضل في هذه التقسيمات
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سيطرة واضحة وثقة عالية
يثبت أنه لاعب حاسم في كل مواجهة
@everyone`,

`👑 {user} يخطف اللقب بعد أداء قوي وثبات مستمر
يعكس مستوى عالي واستحقاق واضح
@everyone`,

`👑 {user} يتصدر ويأخذ الكابيتانو بعد أداء متوازن
يؤكد أنه حاضر دائمًا في القمة
@everyone`,

`👑 {user} يحسم اللقب بعد مواجهة صعبة وأداء ثابت
يثبت قدرته على الحسم تحت الضغط
@everyone`,

`👑 {user} يخطف الكابيتانو بعد تحكم واضح وثقة كبيرة
يعكس احترافية عالية في جميع الجولات
@everyone`,

// 🔥 وصلنا الآن تقريبًا 80+

`👑 {user} يتوج باللقب بعد أداء قوي ونتائج مستحقة
يثبت أنه من أفضل اللاعبين في الساحة
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سيطرة واضحة وأداء ثابت
يعكس قوة مستواه في جميع المباريات
@everyone`,

`👑 {user} يخطف اللقب بعد مواجهة قوية وثقة عالية
يؤكد أنه يستحق هذا التتويج
@everyone`,

`👑 {user} يتصدر بعد سلسلة مباريات ناجحة
يعكس استمرارية في الأداء وثبات في المستوى
@everyone`,

`👑 {user} يحسم الكابيتانو بعد أداء متكامل وتحكم واضح
يثبت أنه من أبرز المنافسين
@everyone`,

`👑 {user} يخطف اللقب بعد أداء قوي وثبات ملحوظ
يعكس خبرة كبيرة في اللعب
@everyone`,

`👑 {user} يتوج بالكابيتانو بعد سلسلة نتائج إيجابية
يؤكد أنه الأفضل في هذه المرحلة
@everyone`,

`👑 {user} يحسم اللقب بعد سيطرة واضحة على مجريات اللعب
يثبت تفوقه في جميع الجولات
@everyone`,

`👑 {user} يخطف الكابيتانو بعد أداء ثابت وثقة كبيرة
يعكس قوة حضوره في المنافسة
@everyone`,

`👑 {user} يتصدر ويأخذ اللقب بعد أداء متوازن
يؤكد أنه من الصفوة
@everyone`,

// 🔥 آخر دفعة (نكمل 100)

`👑 {user} يحسم الكابيتانو بعد مواجهة قوية وأداء ثابت
يثبت أنه الأفضل في هذه الجولة
@everyone`,

`👑 {user} يخطف اللقب بعد أداء قوي وثقة واضحة
يعكس استحقاقه الكامل
@everyone`,

`👑 {user} يتوج بعد سلسلة انتصارات متتالية
يؤكد أنه حاضر دائمًا في القمة
@everyone`,

`👑 {user} يحسم الكابيتانو بعد أداء متوازن وثبات
يثبت أنه من أبرز اللاعبين
@everyone`,

`👑 {user} يخطف اللقب بعد تحكم واضح في المباريات
يعكس خبرة كبيرة وثقة عالية
@everyone`,

`👑 {user} يتصدر بعد أداء قوي ومستوى ثابت
يؤكد أنه يستحق هذا الإنجاز
@everyone`,

`👑 {user} يحسم الكابيتانو بعد سيطرة واضحة وأداء مميز
يثبت أنه الأفضل في هذه المنافسة
@everyone`,

`👑 {user} يخطف اللقب بعد مواجهة قوية وثبات في اللعب
يعكس احترافية عالية
@everyone`,

`👑 {user} يتوج بالكابيتانو بعد أداء متكامل
يؤكد أنه من نخبة اللاعبين
@everyone`,

`👑 {user} يحسم اللقب بعد سلسلة نتائج قوية
يثبت أنه الرقم الصعب في هذه التقسيمات
@everyone`,
  
];

// 🏆 لوحة الشرف
async function updateLeaderboard(channel) {
  const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);

  const text = sorted.length
    ? sorted.map((p, i) =>
        `${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}-`} <@${p[0]}> — ${p[1]} فوز`
      ).join("\n")
    : "لا يوجد بيانات";

  const embed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("🏆 لوحة الشرف")
    .setDescription(text.slice(0, 4000));

  if (!leaderboardMessageId) {
    const msg = await channel.send({ embeds: [embed] });
    leaderboardMessageId = msg.id;
  } else {
    const msg = await channel.messages.fetch(leaderboardMessageId);
    if (msg) await msg.edit({ embeds: [embed] });
  }
}

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const content = msg.content;

  // 🔥 تصفير كامل
  if (content === "!res") {

    if (!msg.member.permissions.has("Administrator")) {
      return msg.reply("❌ هذا الأمر للإدارة فقط");
    }

    wins = {};
    totalWins = {};
    divisionCount = 0;
    leaderboardMessageId = null;

    fs.writeFileSync("wins.json", "{}");
    fs.writeFileSync("totalWins.json", "{}");
    fs.writeFileSync("division.json", "0");

    return msg.reply("♻️ تم تصفير جميع الإحصائيات");
  }

  // 👇 باقي الأوامر فقط بروم النتائج
  if (msg.channel.id !== CHANNEL_ID) return;

  // 📊 لوحة الشرف
  if (content === "!board" || content === "!top") {
    leaderboardMessageId = null;
    await updateLeaderboard(msg.channel);
    return msg.reply("📊 تم عرض لوحة الشرف");
  }

  // 📈 إحصائيات الأسبوع
  if (content === "!all") {
    const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return msg.reply("❌ لا يوجد بيانات");

    const text = sorted.map((p, i) =>
      `${i+1}- <@${p[0]}> : ${p[1]} فوز`
    ).join("\n");

    return msg.channel.send({
      embeds: [new EmbedBuilder()
        .setColor("#5865f2")
        .setTitle("📊 إحصائيات الأسبوع")
        .setDescription(text)]
    });
  }

  // 🏆 إحصائيات دائمة
  if (content === "!total") {
    const sorted = Object.entries(totalWins).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return msg.reply("❌ لا يوجد بيانات");

    const text = sorted.map((p, i) =>
      `${i+1}- <@${p[0]}> : ${p[1]} فوز`
    ).join("\n");

    return msg.channel.send({
      embeds: [new EmbedBuilder()
        .setColor("#00ff99")
        .setTitle("🏆 الإحصائيات الكاملة")
        .setDescription(text)]
    });
  }

  // ➕ إضافة فوز
  if (content.startsWith("!addwin")) {
    const user = msg.mentions.users.first();
    const amount = parseInt(content.split(" ")[2]) || 1;

    if (!user) return msg.channel.send("حدد شخص");

    if (!wins[user.id]) wins[user.id] = 0;
    if (!totalWins[user.id]) totalWins[user.id] = 0;

    wins[user.id] += amount;
    totalWins[user.id] += amount;

    fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));
    fs.writeFileSync("totalWins.json", JSON.stringify(totalWins, null, 2));

    return msg.channel.send(`✅ تم إضافة ${amount} فوز لـ ${user}`);
  }

  // ➖ إزالة فوز
  if (content.startsWith("!removewin")) {
    const user = msg.mentions.users.first();
    const amount = parseInt(content.split(" ")[2]) || 1;

    if (!user) return msg.channel.send("حدد شخص");
    if (!wins[user.id]) return msg.channel.send("ما عنده فوز");

    wins[user.id] -= amount;
    if (wins[user.id] <= 0) delete wins[user.id];

    fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));

    return msg.channel.send(`❌ تم إزالة ${amount} فوز من ${user}`);
  }

  // 🎯 done
  if (content.startsWith("!done")) {

    const number = parseInt(content.split(" ")[1]);

    if (!isNaN(number)) divisionCount = number;
    else divisionCount++;

    fs.writeFileSync("division.json", JSON.stringify(divisionCount));

    msg.channel.send(`📊 تم تسجيل تقسيمة (${divisionCount}/10)`);

    if (divisionCount === 10) {
      const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);
      if (!sorted.length) return;

      const topId = sorted[0][0];
      const topWins = sorted[0][1];

      // 🏆 كارد فخم
      await msg.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#347235")
            .setTitle("🏆 TITANIUM")
            .setDescription(`🔥 بعد منافسة نارية، ينجح 👑 <@${topId}> في خطف اللقب!

🔥 عدد الفوز: ${topWins}
━━━━━━━━━━━━━━`)
            .setFooter({ text: "TITANIUM CAPTAIN" })
            .setTimestamp()
        ]
      });

      // إعلان
      const randomMsg = winnerMessages[Math.floor(Math.random() * winnerMessages.length)];
      const finalMsg = randomMsg.replace("{user}", `<@${topId}>`);

      const announceChannel = client.channels.cache.get(ANNOUNCE_CHANNEL);
      if (announceChannel) {
        announceChannel.send(`${finalMsg}\n\n@everyone`);
      }

      wins = {};
      divisionCount = 0;

      fs.writeFileSync("wins.json", "{}");
      fs.writeFileSync("division.json", "0");
    }

    return;
  }

  // 🔥 تسجيل الفوز
  let winnerId = null;
  const mentions = [...content.matchAll(/<@!?(\d+)>/g)];

  if (content.includes("الفائز") && mentions.length > 0) {
    winnerId = mentions[mentions.length - 1][1];
  }

  if (!winnerId) return;

  const winner = msg.guild.members.cache.get(winnerId)?.user;
  if (!winner) return;

  if (!wins[winner.id]) wins[winner.id] = 0;
  if (!totalWins[winner.id]) totalWins[winner.id] = 0;

  wins[winner.id]++;
  totalWins[winner.id]++;

  fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));
  fs.writeFileSync("totalWins.json", JSON.stringify(totalWins, null, 2));

  msg.reply(`🏆 ${winner} فاز!`);

  updateLeaderboard(msg.channel);
});

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.login(TOKEN);
