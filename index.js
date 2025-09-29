// ====== Discord Bot ======
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Partials,
} = require("discord.js");
require("dotenv").config();
const express = require("express");

// ==== CONFIG ====
const TOKEN = process.env.TOKEN;
const CATEGORY_ID = "1411034825699233943"; // ID danh mục cần rename channel
const RULES_CHANNEL_ID = process.env.CHANNEL_ID; // kênh gửi menu rules

// ==== CLIENT ====
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
});

// ==== Hàm đổi tên channel ====
async function renameChannel(channel) {
  if (channel.parentId !== CATEGORY_ID) return;
  if (!channel.name.endsWith("-webhook")) return;

  const username = channel.name.replace("-webhook", "");
  const newName = `🛠★】${username}-macro`;

  if (channel.name !== newName) {
    try {
      await channel.setName(newName);
      console.log(`✅ Đã đổi tên: ${channel.name} → ${newName}`);
    } catch (err) {
      console.error(`❌ Lỗi đổi tên ${channel.id}:`, err);
    }
  }
}

// ==== READY ====
client.once("ready", async () => {
  console.log(`✅ Bot đã đăng nhập: ${client.user.tag}`);

  // Quét toàn bộ channel trong category khi bot bật
  client.channels.cache
    .filter((ch) => ch.parentId === CATEGORY_ID)
    .forEach((ch) => renameChannel(ch));

  // Gửi menu rules nếu chưa có
  const channel = await client.channels.fetch(RULES_CHANNEL_ID);
  if (!channel) return console.log("❌ Không tìm thấy kênh rules");

  const messages = await channel.messages.fetch({ limit: 50 });
  const alreadySent = messages.find(
    (m) =>
      m.author.id === client.user.id &&
      m.components.length > 0 &&
      m.components[0].components[0].customId === "rules_menu"
  );

  if (alreadySent) {
    console.log("ℹ️ Menu rules đã tồn tại, không gửi lại.");
    return;
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("rules_menu")
    .setPlaceholder("Select rules you would like to see")
    .addOptions([
      { label: "1 Warning Rules", value: "opt1", description: "Rule violations that will get you 1 warn.", emoji: "<:x1Warn:1416316742384357396>" },
      { label: "Channel Misuses", value: "opt2", description: "Channel Misuse rules that will get you 1 warn.", emoji: "<:channelmisuse:1416316766312857610>" },
      { label: "2 Warning Rules", value: "opt3", description: "Rule violations that will get you 2 warns.", emoji: "<:x2Warn:1416316781060161556>" },
      { label: "3 Warning Rules", value: "opt4", description: "Rule violations that will get you 3 warns.", emoji: "<:x3Warn:1416316796029374464>" },
      { label: "Instant Ban Rules", value: "opt5", description: "Rule violations that will get you a ban.", emoji: "<:instantban:1416316818297192510>" },
    ]);

  const row = new ActionRowBuilder().addComponents(menu);

  await channel.send({
    content: "📜 **Server Rules are pinned here:**\n<https://discord.com/channels/1410980858583715970/1410980859028308074/1420064482427801640>",
    components: [row],
  });

  console.log("✅ Đã gửi menu rules mới.");
});

// ==== Khi có channel mới tạo ====
client.on("channelCreate", async (channel) => {
  if (channel.parentId === CATEGORY_ID) {
    renameChannel(channel);
  }
});

// ==== Interaction chọn menu ====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "rules_menu") return;

  let embed;
  switch (interaction.values[0]) {
    case "opt1":
      embed = new EmbedBuilder()
        .setTitle(" **1 Warning Rules**")
        .setDescription(
          `*Flooding/Spamming*\nDescription: Messages that occupy a large portion of the screen or involve excessive posting of irrelevant content.\n*Exceptions:* Informative messages\n(Additional 1 Hour mute)\n\n
*Excessive Begging*\nDescription: Repeatedly asking for favors, items, roles, or other benefits disruptively.\n*Exceptions:* Jokingly begging\n\n
*XP Farming*\nDescription: Sending messages solely to gain XP (Arcane bot).\nPunishments:\n1st Offense = reminder\n2nd Offense = Reduce XP\n3rd Offense = Level Reset`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860213138096199/IMG_2287.png")
        .setColor("#ffffcc");
      break;

    case "opt2":
      embed = new EmbedBuilder()
        .setTitle(" **Channel Misuses**")
        .setDescription(
          `Channel misuses fall under the 1 Warning Rules category.\n\n
**Chatting Channel Misuse**\nUsing chat channels for non-chat purposes (e.g. bot commands outside Bots channel).\n\n
**Macro Channels Misuse**\nUsing macro category channels incorrectly.\nPunishments:\n1 Warn = Reminder\n2 Warn = 1 Day Blacklist\n3 Warn = 1 Week Blacklist\n\n
**Community Channels Misuse**\nUsing community section for inappropriate purposes.\nPunishments similar to above.\n\n
**Voice Channel Misuse**\nImproperly using voice channels (Additional 1h Mute)`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1359923248946483382/Channel_Misuse.png")
        .setColor("#7fe390");
      break;

    case "opt3":
      embed = new EmbedBuilder()
        .setTitle(" **2 Warning Rules**")
        .setDescription(
          `*Mod Bait*\nSending messages that appear punishable to provoke mods.\n\n
*Accusation w/o Evidence*\nMaking wrongful claims without proof.\n\n
*DM Harassment*\nHarassing members in DMs due to mutual server.\n\n
*Discrimination*\nHarmful stereotyping (race, gender, religion...). Severe cases → Hate Speech.\n\n
*Inappropriate/Suggestive Language*\nImplying sexual/offensive content.\n\n
*Toxicity*\nDisruptive behavior without exceptions.\n\n
*Advertising/Self Promotion*\nPromoting media for self-gain without permission.`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860209686057240/IMG_2288.png")
        .setColor("#f0954b");
      break;

    case "opt4":
      embed = new EmbedBuilder()
        .setTitle(" **3 Warning Rules**")
        .setDescription(
          `**Mod Bait**\nTrying to trick mods with borderline messages.\n\n
**Accusation w/o Evidence**\nWrongful claims without evidence (severe = ban).\n\n
**DM Harassment**\nHarassing users via DMs from mutual server.\n\n
**Discrimination**\nExtreme harmful stereotyping (severe = Hate Speech).`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860210349019246/IMG_2289.png")
        .setColor("#f4363f");
      break;

    case "opt5":
      embed = new EmbedBuilder()
        .setTitle(" **Instant Ban Rules**")
        .setDescription(
          `*Punishment Evading*\nLeaving to avoid punishment.\n\n
*NSFW*\nPosting inappropriate sexual/explicit content.\n\n
*Hate Speech/Racism*\nPromoting extreme discrimination.\n\n
*Child Endangerment*\nAny act harming minors.\n\n
*Cybercrimes*\nIllegal activity online.\n\n
*Inappropriate Profile*\nOffensive/suggestive profile. Punishment = Kick → Ban if unchanged.`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860210986287224/IMG_2290.png")
        .setColor("#f13bfe");
      break;
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
});

// ==== Express server (keep alive) ====
const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ Bot is running!"));
app.listen(port, () => console.log(`🌐 Web server online at port ${port}`));

// ==== LOGIN ====
client.login(TOKEN);
