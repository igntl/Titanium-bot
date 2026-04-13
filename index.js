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

// ✅ روم النتائج
const CHANNEL_ID = "1483219896069525665";

// ✅ روم الإعلان
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

// 🔥 رسائل احترافية (خطف اللقب)
const winnerMessages = [

`🔥 ها هو {user} يخطف اللقب بكل قوة بعد سلسلة مواجهات شرسة لم تخلُ من التحديات!

💪 لم يكن الطريق سهلًا، لكن بالإصرار والتركيز العالي، استطاع فرض سيطرته والتفوق على الجميع بثقة وثبات.

👑 {user} لا يحقق الفوز فقط… بل ينتزع اللقب ويثبت أنه أحد أقوى الكباتن في الساحة!`,

`🔥 أخيرًا وبعد منافسة محتدمة، يتمكن {user} من خطف اللقب وسط أجواء مليئة بالحماس والإثارة!

💪 أداء ثابت، قرارات ذكية، وسيطرة واضحة جعلت منه اللاعب الأكثر تأثيرًا خلال التقسيمات.

👑 {user} يكتب اسمه في القمة من جديد ويؤكد أن مكانه بين الكبار ليس صدفة!`,

`🔥 لحظة حاسمة تنتهي بتتويج {user} بعد أن نجح في خطف اللقب من بين أقوى المنافسين!

💪 قدم أداءً استثنائيًا يعكس خبرته وثباته تحت الضغط في أصعب اللحظات.

👑 {user} يثبت أنه الرقم الصعب الذي لا يمكن تجاوزه بسهولة!`,

`🔥 بعد معارك طويلة داخل الميدان، يظهر {user} ليخطف اللقب بكل جدارة واستحقاق!

💪 لم يترك مجالًا للخصوم، بل فرض أسلوبه وسيطر على مجريات اللعب بالكامل.

👑 {user} يواصل الهيمنة ويؤكد أنه حاضر دائمًا في القمة!`,

`🔥 عرض كروي مذهل ينتهي بخطف {user} للقب بعد أداء لا يُنسى!

💪 تحكم كامل، تركيز عالي، وروح قتالية جعلته يتفوق على الجميع.

👑 {user} لا ينافس فقط… بل يهيمن ويصنع الفارق!`,

`🔥 من بين كل المنافسين، ينجح {user} في خطف اللقب بعد أداء قوي وثبات طوال التقسيمات!

💪 كل مباراة كانت إثباتًا جديدًا على قدراته العالية.

👑 {user} يرسّخ اسمه في القمة ويؤكد أنه من النخبة!`,

`🔥 نهاية مثيرة لتقسيمات نارية، و{user} هو من يخطف اللقب ويكتب اسمه في الصدارة!

💪 أداء مميز وتحكم كامل بالمباريات جعله الأفضل دون منازع.

👑 {user} يواصل التألق ويؤكد أنه حاضر دائمًا عندما تُحسم الأمور!`,

`🔥 بعد منافسة لا تُرحم، يتمكن {user} من انتزاع اللقب وإثبات تفوقه على الجميع!

💪 لم يكن مجرد فوز، بل عرض للقوة والثقة والخبرة.

👑 {user} يثبت أنه أحد أعمدة القمة في هذه الساحة!`,

`🔥 ها هو {user} يعود من جديد ويخطف اللقب بعد أداء أسطوري بكل المقاييس!

💪 سيطرة واضحة وثبات في المستوى طوال التقسيمات.

👑 {user} يثبت أنه لا يسقط… بل يعود أقوى!`,

`🔥 ختام ناري لتقسيمات مليئة بالحماس، و{user} هو من يحسمها ويخطف اللقب!

💪 لم يترك أي فرصة، بل فرض نفسه كأفضل لاعب في هذه الجولة.

👑 {user} يواصل كتابة التاريخ داخل هذه الساحة!`

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
  if (msg.channel.id !== CHANNEL_ID) return;

  const content = msg.content;

  // أوامر العرض
  if (content === "!board" || content === "!top") {
    leaderboardMessageId = null;
    await updateLeaderboard(msg.channel);
    return msg.channel.send("📊 تم عرض لوحة الشرف");
  }

  if (content === "!all") {
    const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return msg.channel.send("❌ لا يوجد بيانات");

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

  if (content === "!total") {
    const sorted = Object.entries(totalWins).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return msg.channel.send("❌ لا يوجد بيانات");

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

  // حذف الأوامر
  if (content.startsWith("!")) {
    try { await msg.delete(); } catch {}
  }

  // done
  if (content.startsWith("!done")) {

    const number = parseInt(content.split(" ")[1]);

    if (!isNaN(number)) {
      divisionCount = number;
    } else {
      divisionCount++;
    }

    fs.writeFileSync("division.json", JSON.stringify(divisionCount));

    msg.channel.send(`📊 تم تسجيل تقسيمة (${divisionCount}/10)`);

    if (divisionCount === 10) {
      const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);
      if (!sorted.length) return;

      const topId = sorted[0][0];

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
  }
});

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.login(TOKEN);
