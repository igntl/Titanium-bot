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
`🔥 بعد منافسة قوية، ينجح {user} في خطف اللقب بعد أداء استثنائي!
💪 لم يترك فرصة للخصوم وفرض سيطرته.
👑 يستحق التتويج بكل جدارة.`,

`🔥 في ليلة نارية، يظهر {user} ليحسم اللقب بعد أداء مذهل!
💪 سيطرة وثقة عالية.
👑 بطل التقسيمات بلا منازع.`,

`🔥 ختام حماسي للتقسيمات، و{user} هو من يخطف اللقب!
💪 لعب بثبات واحترافية عالية.
👑 يستحق القمة.`
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

💪 أداء ثابت وثقة عالية طوال التقسيمات.

👑 اليوم يثبت أنه من نخبة الكباتن في السيرفر.

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
