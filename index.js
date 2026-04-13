const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
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

// 🔥 حط هنا ايدي روم الإعلانات
const ANNOUNCE_CHANNEL = "حط_الايدي_هنا";

let wins = {};
let totalWins = {};
let leaderboardMessageId = null;
const recentMatches = {};
let divisionCount = 0;

// تحميل البيانات
if (fs.existsSync("wins.json")) wins = JSON.parse(fs.readFileSync("wins.json"));
if (fs.existsSync("totalWins.json")) totalWins = JSON.parse(fs.readFileSync("totalWins.json"));
if (fs.existsSync("division.json")) divisionCount = JSON.parse(fs.readFileSync("division.json"));

// 🔥 الرسائل
const winnerMessages = [
`🔥 بعد منافسة شرسة وملحمة كروية لا تُنسى في تقسيمات تيتانيوم، ينجح البطل {user} في فرض هيمنته الكاملة والسيطرة على مجريات اللعب بكل احترافية!

💪 لم يكن هذا الانتصار مجرد رقم يُضاف إلى سجله، بل كان عرضًا حقيقيًا للقوة والتركيز والمهارة، حيث أثبت أنه حاضر دائمًا في اللحظات الحاسمة ولا يخذل فريقه أبدًا.

👑 يواصل هذا النجم ترسيخ اسمه في القمة ويؤكد أنه أحد أعمدة التوب بلا منازع في هذه الساحة!`,

`🔥 ليلة استثنائية شهدتها تقسيمات تيتانيوم، حيث يسطع نجم {user} من جديد ويعتلي القمة بعد أداء مهيب لا يقبل الجدل!

💪 مباراة تلو الأخرى، كان حاضرًا بكل قوة، يفرض إيقاعه ويتحكم بالمجريات بثقة تامة وكأن الفوز كُتب باسمه.

👑 بهذا الأداء، يثبت أنه ليس مجرد لاعب عابر، بل اسم يُحسب له ألف حساب!`,

`🔥 بعد صراع طويل ومواجهات نارية بين أقوى اللاعبين، يتمكن {user} من حسم الأمور لصالحه والتتويج بلقب نجم التقسيمات بكل جدارة!

💪 لم يكن الطريق سهلًا، لكن بالإصرار والتركيز العالي، استطاع تجاوز الجميع وترك بصمة واضحة في كل مباراة.

👑 يواصل كتابة اسمه في القمة ويؤكد أن مكانه بين الكبار مستحق وليس صدفة!`,

`🔥 أجواء حماسية ومنافسة مشتعلة تنتهي أخيرًا بتربع {user} على عرش التقسيمات بعد أداء لا يُوصف!

💪 تحكم كامل، قرارات ذكية، وثقة عالية ظهرت في كل لحظة، جعلت منه اللاعب الأبرز بدون أي نقاش.

👑 يثبت مرة أخرى أنه الرقم الصعب الذي لا يمكن تجاهله في أي مواجهة!`,

`🔥 سيطرة مطلقة وعرض كروي مذهل يقدمه {user} خلال هذه التقسيمات، ليخطف النجومية ويؤكد أنه الأفضل بلا منافس!

💪 لم يترك أي فرصة لخصومه، بل فرض أسلوبه الخاص وقدم أداءً يعكس خبرة كبيرة وثبات نادر.

👑 لا ينافس فقط… بل يهيمن ويترك الجميع خلفه!`
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

  if (content.startsWith("!")) {
    try { await msg.delete(); } catch {}
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

  // ♻️ تصفير الأسبوع
  if (content === "!resetweek") {
    wins = {};
    leaderboardMessageId = null;
    fs.writeFileSync("wins.json", "{}");
    return msg.channel.send("♻️ تم تصفير لوحة الأسبوع فقط");
  }

  // ↩️ undo
  if (content.startsWith("!undo")) {
    const number = parseInt(content.split(" ")[1]);

    if (isNaN(number)) return msg.channel.send("❌ حط رقم صحيح");

    divisionCount = number;
    fs.writeFileSync("division.json", JSON.stringify(divisionCount));

    return msg.channel.send(`↩️ تم تعديل التقسيمات إلى (${divisionCount}/10)`);
  }

  // 🎯 done
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
      const topWins = sorted[0][1];

      await msg.channel.send({
        embeds: [new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle("🏆 كابتن التقسيمة")
          .setDescription(`👑 <@${topId}> هو الأكثر فوز!\n🔥 عدد الفوز: ${topWins}`)]
      });

      const randomMsg = winnerMessages[Math.floor(Math.random() * winnerMessages.length)];
      const finalMsg = randomMsg.replace("{user}", `<@${topId}>`);

      const announceChannel = client.channels.cache.get(ANNOUNCE_CHANNEL);

      if (announceChannel) {
        announceChannel.send(`${finalMsg}\n\n@everyone`);
      }

      wins = {};
      divisionCount = 0;
      leaderboardMessageId = null;

      fs.writeFileSync("wins.json", "{}");
      fs.writeFileSync("division.json", JSON.stringify(divisionCount));
    }

    return;
  }

  // تسجيل الفوز (نفس نظامك)
  let winnerId = null;
  const mentions = [...content.matchAll(/<@!?(\d+)>/g)];

  if (content.includes("الفائز") && mentions.length > 0) {
    winnerId = mentions[mentions.length - 1][1];
  }

  if (!winnerId) return;

  const winner = msg.guild.members.cache.get(winnerId)?.user;
  if (!winner) return;

  const players = Array.from(msg.mentions.users.values());
  if (players.length < 2) return;

  const ids = [players[0].id, players[1].id].sort();
  const key = `${ids[0]}-${ids[1]}`;

  if (recentMatches[key] && Date.now() - recentMatches[key] < 60000) {
    return msg.reply("❌ لا تسجل نفس المباراة مرتين خلال دقيقة");
  }

  recentMatches[key] = Date.now();

  if (!wins[winner.id]) wins[winner.id] = 0;
  if (!totalWins[winner.id]) totalWins[winner.id] = 0;

  wins[winner.id]++;
  totalWins[winner.id]++;

  fs.writeFileSync("wins.json", JSON.stringify(wins, null, 2));
  fs.writeFileSync("totalWins.json", JSON.stringify(totalWins, null, 2));

  msg.reply(`🏆 ${winner} فاز!\n🔥 مجموع فوزه: ${wins[winner.id]}`);

  updateLeaderboard(msg.channel);
});

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

client.login(TOKEN);
