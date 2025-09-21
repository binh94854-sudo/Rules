// ======= Discord.js & FS =======
import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, Partials } from "discord.js";
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

// ======= Thông tin bot =======
const TOKEN = process.env.TOKEN; // token Discord
const CHANNEL_ID = "1410980859028308074"; // ID kênh rules

// ======= Client Discord =======
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
});

// ======= Keep-alive server =======
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.sendStatus(200));
app.listen(PORT, () => console.log(`🌐 Keep-alive server running on port ${PORT}`));

// ======= Load locales =======
const locales = JSON.parse(fs.readFileSync("./locales.json", "utf8"));

// ======= File lưu trạng thái embed =======
const filePath = "./embedSent.json";

function hasSentEmbed(channelId) {
  if (!fs.existsSync(filePath)) return false;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return data[channelId] || false;
}

function markEmbedSent(channelId) {
  let data = {};
  if (fs.existsSync(filePath)) data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  data[channelId] = true;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ======= Ready event =======
client.once("ready", async () => {
  console.log(`✅ Bot đã đăng nhập: ${client.user.tag}`);
  const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
  if (!channel) return console.log("❌ Không tìm thấy kênh");

  if (!hasSentEmbed(CHANNEL_ID)) {
    // Chọn locale mặc định EN nếu không xác định
    const locale = "en";
    const lang = locales[locale];

    const mainEmbed = new EmbedBuilder()
      .setTitle(lang.mainEmbedTitle)
      .setDescription(lang.mainEmbedDescription)
      .setImage("https://media.discordapp.net/attachments/1411987904980586576/1412916875163209901/SOLS_RNG_COUMUNICATION.png")
      .setColor("Blue");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("rules_menu")
      .setPlaceholder(lang.menuPlaceholder)
      .addOptions([
        { label: "1 Warning Rules", value: "opt1", description: "Rule violations that will get you 1 warn.", emoji: "<:x1Warn:1416316742384357396>" },
        { label: "Channel Misuses", value: "opt2", description: "Channel Misuse rules that will get you 1 warn.", emoji: "<:channelmisuse:1416316766312857610>" },
        { label: "2 Warning Rules", value: "opt3", description: "Rule violations that will get you 2 warns.", emoji: "<:x2Warn:1416316781060161556>" },
        { label: "3 Warning Rules", value: "opt4", description: "Rule violations that will get you 3 warns.", emoji: "<:x3Warn:1416316796029374464>" },
        { label: "Instant Ban Rules", value: "opt5", description: "Rule violations that will get you a ban.", emoji: "<:instantban:1416316818297192510>" },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);
    await channel.send({ embeds: [mainEmbed], components: [row] });
    markEmbedSent(CHANNEL_ID);
    console.log("✅ Đã gửi embed lần đầu tiên.");
  } else {
    console.log("ℹ️ Embed đã gửi trước đó, không gửi lại.");
  }
});

// ======= Khi user chọn menu =======
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "rules_menu") return;

  // Chọn locale dựa theo interaction
  const locale = interaction.locale?.startsWith("vi") ? "vi" : "en";
  const lang = locales[locale];

  let embed;
  switch (interaction.values[0]) {
    case "opt1":
      embed = new EmbedBuilder().setTitle(lang.opt1Title).setDescription(lang.opt1Desc).setColor("ffffcc").setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860213138096199/IMG_2287.png");
      break;
    case "opt2":
      embed = new EmbedBuilder().setTitle(lang.opt2Title).setDescription(lang.opt2Desc).setColor("7fe390").setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1359923248946483382/Channel_Misuse.png");
      break;
    case "opt3":
      embed = new EmbedBuilder().setTitle(lang.opt3Title).setDescription(lang.opt3Desc).setColor("f0954b").setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860209686057240/IMG_2288.png");
      break;
    case "opt4":
      embed = new EmbedBuilder().setTitle(lang.opt4Title).setDescription(lang.opt4Desc).setColor("f4363f").setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860210349019246/IMG_2289.png");
      break;
    case "opt5":
      embed = new EmbedBuilder().setTitle(lang.opt5Title).setDescription(lang.opt5Desc).setColor("f13bfe").setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860210986287224/IMG_2290.png");
      break;
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
});

// ======= Login =======
client.login(TOKEN);
