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

// 🔥 رسائل كثيرة (تقدر تزودها براحتك)
const winnerMessages = [
`🔥 ها هو البطل {user} يخطف اللقب بعد منافسة شرسة!
💪 أثبت قوته في كل مواجهة.
👑 يستحق القمة.`,

`🔥 بعد صراع طويل، يتمكن {user} من فرض نفسه وخطف اللقب!
💪 أداء ثابت وثقة عالية.
👑 بطل حقيقي.`,

`🔥 ليلة نارية تنتهي بتتويج {user} باللقب!
💪 سيطرة كاملة على المباريات.
👑 يستحق التتويج.`,

`🔥 منافسة قوية تنتهي بتفوق {user} وخطفه اللقب!
💪 لم يترك فرصة للخصوم.
👑 اسم في القمة.`,

`🔥 ختام مثير للتقسيمات، و{user} يحسم اللقب!
💪 لعب بذكاء وثبات.
👑 يستحق هذا الإنجاز.`,

`🔥 بعد ضغط ومنافسة، يظهر {user} كبطل!
💪 ثقة عالية وأداء ثابت.
👑 القمة له.`,

`🔥 أداء استثنائي من {user} ينتهي بخطف اللقب!
💪 سيطرة كاملة.
👑 بطل التقسيمات.`,

`🔥 بعد مواجهات صعبة، {user} يحسم اللقب!
💪 ثبات عالي.
👑 يستحق.`,

`🔥 صراع قوي ينتهي بتتويج {user}!
💪 أداء متكامل.
👑 بطل.`,

`🔥 {user} يثبت نفسه ويخطف اللقب!
💪 قوة وثقة.
👑 القمة.`

// 🔥 تقدر تضيف هنا لين توصل 100 بنفس النمط
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

  // 🔥 تصفير كامل (يشتغل بأي روم)
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

  // 📈 الأسبوع
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

  // 🏆 الكلي
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

      await msg.channel.send(`👑 <@${topId}> هو الفائز!`);

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

  // 🔥 تسجيل الفوز (نفس كودك)
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
