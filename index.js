// =========================
// 1. BOT GỬI RULES MENU (chạy 1 lần)
// =========================
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
require("dotenv").config();

const BOT_TOKEN = process.env.TOKEN; // Bot token
const CHANNEL_ID = process.env.CHANNEL_ID; // ID kênh muốn gửi menu

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

bot.once("ready", async () => {
  console.log(`✅ Bot đã đăng nhập: ${bot.user.tag}`);

  const channel = await bot.channels.fetch(CHANNEL_ID);
  if (!channel) return console.log("❌ Không tìm thấy kênh");

  // Kiểm tra nếu menu đã gửi rồi thì thôi
  const messages = await channel.messages.fetch({ limit: 50 });
  const alreadySent = messages.find(
    (m) =>
      m.author.id === bot.user.id &&
      m.components.length > 0 &&
      m.components[0].components[0].customId === "rules_menu"
  );
  if (alreadySent) {
    console.log("ℹ️ Menu đã tồn tại, không gửi lại.");
    process.exit(0);
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("rules_menu")
    .setPlaceholder("📜 Select rules you would like to see")
    .addOptions([
      { label: "1 Warning Rules", value: "opt1", description: "Rule violations that will get you 1 warn." },
      { label: "Channel Misuses", value: "opt2", description: "Misusing channels → 1 warn." },
      { label: "2 Warning Rules", value: "opt3", description: "Rule violations that will get you 2 warns." },
      { label: "3 Warning Rules", value: "opt4", description: "Rule violations that will get you 3 warns." },
      { label: "Instant Ban Rules", value: "opt5", description: "Violations that get instant ban." },
    ]);

  const row = new ActionRowBuilder().addComponents(menu);

  await channel.send({
    content:
      "📌 **Server Rules are pinned here:**\n<https://discord.com/channels/1410980858583715970/1410980859028308074/1420064482427801640>",
    components: [row],
  });

  console.log("✅ Đã gửi menu. Tắt bot đi được rồi.");
  process.exit(0);
});

bot.login(BOT_TOKEN);

// =========================
// 2. EXPRESS SERVER (Render)
// =========================
const express = require("express");
const { verifyKey } = require("discord-interactions");

const app = express();

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.post("/interactions", (req, res) => {
  const signature = req.get("X-Signature-Ed25519");
  const timestamp = req.get("X-Signature-Timestamp");

  const isValid = verifyKey(
    req.rawBody,
    signature,
    timestamp,
    process.env.PUBLIC_KEY
  );

  if (!isValid) return res.status(401).send("Bad request signature");

  const interaction = req.body;

  // Ping check
  if (interaction.type === 1) {
    return res.json({ type: 1 });
  }

  // User chọn menu
  if (interaction.type === 3 && interaction.data.custom_id === "rules_menu") {
    let embed;

    switch (interaction.data.values[0]) {
      case "opt1":
        embed = {
          title: "1 Warning Rules",
          description: `*Flooding/Spamming*\nDescription: Messages that occupy a large portion of the screen or involve the excessive posting of irrelevant content.\n*Exceptions:* Informative messages\n(Additional 1 Hour mute)\n\n
+ *Excessive Begging*\nDescription: Repeatedly asking for favors, items, roles, privileges, or other benefits in an annoying or disruptive manner.\n*Exceptions:* Jokingly begging\n\n
+ *XP Farming*\nDescription: Sending messages solely to gain XP in the Arcane bot and disrupting the chat, while also being unfair to the legitimate users.\n(Additional 1 Hour mute)\n1st Offense = reminder\n2nd Offense = Reduce XP\n3rd Offense = Level Reset`,
          color: 0xffffcc,
          image: {
            url: "https://cdn.discordapp.com/attachments/1358092861303947485/1358860213138096199/IMG_2287.png",
          },
        };
        break;

      case "opt2":
        embed = {
          title: "Channel Misuses",
          description: `Channel misuses fall under the 1 Warning Rules category, meaning any kind of misuse will result in 1 warning. And possibly a blacklist.\n\n
+ **Chatting Channel Misuse**\nDescription: Using the chatting channels for purposes other than chatting\nIncludes: Bot commands outside of the Bots channel.\n\n
+ **Macro Channels Misuse**\nDescription: using channels in the macro category incorrectly.\n*1x Warn:* Reminder\n*2x Warn:* 1 Day Macro Channels Blacklist\n*3x Warn:* 1 Week Macro Channels Blacklist\n\n
+ **Community Channels Misuse**\nDescription: Using the channels in the Community section for inappropriate purposes.\n*1x Warn:* Reminder\n*2x Warn:* 1 Day Misuse Channel Blacklist\n*3x Warn:* 1 Week Misuse Channel Blacklist\n\n
+ **Voice Channel Misuse**\nDescription: Misusing / improperly utilizing the voice channels\n(Additional 1h Mute)`,
          color: 0x7fe390,
          image: {
            url: "https://cdn.discordapp.com/attachments/1358092861303947485/1359923248946483382/Channel_Misuse.png",
          },
        };
        break;

      case "opt3":
        embed = {
          title: "2 Warning Rules",
          description: `*Mod Bait*\nDescription: Sending messages that appear punishable to provoke a reaction, even though they do not violate rules.\n\n
+ *Accusation w/o Evidence*\nDescription: Making statements or claims about an individual wrongfully and without evidence to put them in a compromised situation\nDepending on the severity, this can lead to a ban.\n\n
+ *DM Harassment*\nDescription: Harassing members via DM's due to having mutual access to the Sol's RNG Communication server\n\n
+ *Discrimination*\nDescription: Harmful stereotyping based on someone’s race, gender, sexuality, religion, or any other personal characteristics.\nDepending on the severity, extreme/severe cases can fall under “Hate Speech.”\n\n
+ **Inappropriate/Suggestive Language**\nDescriptions: Implying/Referencing something inappropriate, offensive, or sexual.\nDepending on the severity, this can go up to 3 Warnings or fall into NSFW.\n\n
+ **Toxicity**\nDescription: Engaging in disruptive behavior that can be seen as disrespectful or toxic in any way.\nExceptions: Harmless arguments, Disagreement about Sol’s RNG related topic, discussions, constructive criticism, debates, joking with consent\n\n
+ **Advertising/Self Promotion**\nDescription: Promoting/Spreading one's media for self gain.\nExceptions: With permission`,
          color: 0xf0954b,
          image: {
            url: "https://cdn.discordapp.com/attachments/1358092861303947485/1358860209686057240/IMG_2288.png",
          },
        };
        break;

      case "opt4":
        embed = {
          title: "3 Warning Rules",
          description: `**Mod Bait**\nDescription: Sending messages that appear punishable to provoke a reaction, even though they do not violate rules.\n\n
+ **Accusation w/o Evidence**\nDescription: Making statements or claims about an individual wrongfully and without evidence to put them in a compromised situation\nDepending on the severity, this can lead to a ban.\n\n
+ **DM Harassment**\nDescription: Harassing members via DM's due to having mutual access to the Sol's RNG Communication server\n\n
+ **Discrimination**\nDescription: Harmful stereotyping based on someone’s race, gender, sexuality, religion, or any other personal characteristics.\nDepending on the severity of the discrimination, extreme/severe cases can fall under “Hate Speech.”`,
          color: 0xf4363f,
          image: {
            url: "https://cdn.discordapp.com/attachments/1358092861303947485/1358860210349019246/IMG_2289.png",
          },
        };
        break;

      case "opt5":
        embed = {
          title: "Instant Ban Rules",
          description: `*Punishment Evading*\nDescription: Leaving to avoid any punishment of any kind.\n\n
+ *NSFW*\nDescription: Content that is inappropriate for any professional or public place, usually including nudity or suggestiveness of any kind.\n\n
+ *Hate Speech/Racism*\nDescription: Any form of imagery / discussions that promotes extreme discrimination and hatred against individuals or groups based on their characteristics\n\n
+ *Child Endangerment*\nDescription: Any act that puts minors at harm or inappropriate exposure.\n\n
+ *Cybercrimes*\nDescription: Any form of illegal activity online\n\n
+ *Inappropriate Profile*\nDescription: Using an inappropriate Discord profile picture, Discord display name, or Roblox username that contains offensive, suggestive, or explicit content.\n*Punishments:* Kick. If rejoined and unchanged, Ban`,
          color: 0xf13bfe,
          image: {
            url: "https://cdn.discordapp.com/attachments/1358092861303947485/1358860210986287224/IMG_2290.png",
          },
        };
        break;
    }

    return res.json({
      type: 4,
      data: {
        embeds: [embed],
        flags: 64, // ephemeral
      },
    });
  }

  res.sendStatus(400);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server running (Render)");
});
