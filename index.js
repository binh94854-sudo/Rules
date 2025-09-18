// ======= Discord.js & FS =======
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, Partials } = require("discord.js");
const fs = require("fs");
require("dotenv").config(); // nạp biến môi trường từ .env hoặc Render

// ======= Thông tin bot =======
const TOKEN = process.env.TOKEN; // lấy token từ Environment Variables
const CHANNEL_ID = "1410980859028308074"; // Thay bằng kênh rules của bạn

// ======= Client Discord =======
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
});

// ======= Keep-alive server =======
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.sendStatus(200));
app.listen(PORT, () => console.log(`🌐 Keep-alive server running on port ${PORT}`));

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
    // === Embed chính ===
    const mainEmbed = new EmbedBuilder()
      .setTitle("📜 **Welcome to the Sol's RNG Comunication rules channel!**")
      .setDescription(
        `**This is where all the rules enforced on our Discord server are listed. Please read and follow them to ensure a pleasant experience for everyone!**\n
If there is anything confusing, you can go to the channel <#1411590263033561128> to contact the server administrators and ask questions.\n
**⚠️ Warning Point & Punishment System:**\n\`\`\`
• 1 Warning Point  = no punishment 
• 2 Warning Points = 1h Mute
• 3 Warning Points = 12h Mute
• 4 warning Points = 1d Mute
• 5 warning Points = A ban
• Warning Points expire after 30 days
\`\`\`
-# Thank you for reading and following! We always strive to develop the most civilized and prosperous Sol's RNG community in Southeast Asia!`
      )
      .setImage("https://media.discordapp.net/attachments/1411987904980586576/1412916875163209901/SOLS_RNG_COUMUNICATION.png")
      .setColor("Blue");

    // === Menu chọn lựa ===
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

  let embed;

  switch (interaction.values[0]) {
    case "opt1":
      embed = new EmbedBuilder()
        .setTitle(" **1 Warning Rules**")
        .setDescription(
          `*Flooding/Spamming*\nDescription: Messages that occupy a large portion of the screen or involve the excessive posting of irrelevant content.\n*Exceptions:* Informative messages\n(Additional 1 Hour mute)\n\n` +
          `*Excessive Begging*\nDescription: Repeatedly asking for favors, items, roles, privileges, or other benefits in an annoying or disruptive manner.\n*Exceptions:* Jokingly begging\n\n` +
          `*XP Farming*\nDescription: Sending messages solely to gain XP in the Arcane bot and disrupting the chat, while also being unfair to the legitimate users.\n(Additional 1 Hour mute)\n1st Offense = reminder\n2nd Offense = Reduce XP\n3rd Offense = Level Reset`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860213138096199/IMG_2287.png")
        .setColor("ffffcc");
      break;

    case "opt2":
      embed = new EmbedBuilder()
        .setTitle(" **Channel Misuses**")
        .setDescription(
          `Channel misuses fall under the 1 Warning Rules category, meaning any kind of misuse will result in 1 warning. And possibly a blacklist.\n\n` +
          `**Chatting Channel Misuse**\nDescription: Using the chatting channels for purposes other than chatting\nIncludes: Bot commands outside of the Bots channel.\n\n` +
          `**Macro Channels Misuse**\nDescription: using channels in the macro category incorrectly.\n*1x Warn:* Reminder\n*2x Warn:* 1 Day Macro Channels Blacklist\n*3x Warn:* 1 Week Macro Channels Blacklist\n\n` +
          `**Community Channels Misuse**\nDescription: Using the channels in the Community section for inappropriate purposes.\n*1x Warn:* Reminder\n*2x Warn:* 1 Day Misuse Channel Blacklist\n*3x Warn:* 1 Week Misuse Channel Blacklist\n\n` +
          `**Voice Channel Misuse**\nDescription: Misusing / improperly utilizing the voice channels\n(Additional 1h Mute)`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1359923248946483382/Channel_Misuse.png")
        .setColor("7fe390");
      break;

    case "opt3":
      embed = new EmbedBuilder()
        .setTitle(" **2 Warning Rules**")
        .setDescription(
          `**Inappropriate/Suggestive Language**\nDescriptions: Implying/Referencing something inappropriate, offensive, or sexual.\nDepending on the severity, this can go up to 3 Warnings or fall into NSFW.\n\n` +
          `**Toxicity**\nDescription: Engaging in disruptive behavior that can be seen as disrespectful or toxic in any way.\nExceptions: Harmless arguments, Disagreement about Sol’s RNG related topic, discussions, constructive criticism, debates, joking with consent\n\n` +
          `**Advertising/Self Promotion**\nDescription: Promoting/Spreading one's media for self gain.\nExceptions: With permission`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860209686057240/IMG_2288.png")
        .setColor("f0954b");
      break;

    case "opt4":
      embed = new EmbedBuilder()
        .setTitle(" **3 Warning Rules**")
        .setDescription(
          `**Mod Bait**\nDescription: Sending messages that appear punishable to provoke a reaction, even though they do not violate rules.\n\n` +
          `**Accusation w/o Evidence**\nDescription: Making statements or claims about an individual wrongfully and without evidence to put them in a compromised situation\nDepending on the severity, this can lead to a ban.\n\n` +
          `**DM Harassment**\nDescription: Harassing members via DM's due to having mutual access to the Sol's RNG Communication server\n\n` +
          `**Discrimination**\nDescription: Harmful stereotyping based on someone’s race, gender, sexuality, religion, or any other personal characteristics.\nDepending on the severity of the discrimination, extreme/severe cases can fall under “Hate Speech.”`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860210349019246/IMG_2289.png")
        .setColor("f4363f");
      break;

    case "opt5":
      embed = new EmbedBuilder()
        .setTitle(" **Instant Ban Rules**")
        .setDescription(
          `*Punishment Evading*\nDescription: Leaving to avoid any punishment of any kind.\n\n` +
          `*NSFW*\nDescription: Content that is inappropriate for any professional or public place, usually including nudity or suggestiveness of any kind.\n\n` +
          `*Hate Speech/Racism*\nDescription: Any form of imagery / discussions that promotes extreme discrimination and hatred against individuals or groups based on their characteristics\n\n` +
          `*Child Endangerment*\nDescription: Any act that puts minors at harm or inappropriate exposure.\n\n` +
          `*Cybercrimes*\nDescription: Any form of illegal activity online\n\n` +
          `*Inappropriate Profile*\nDescription: Using an inappropriate Discord profile picture, Discord display name, or Roblox username that contains offensive, suggestive, or explicit content.\n*Punishments:* Kick. If rejoined and unchanged, Ban`
        )
        .setImage("https://cdn.discordapp.com/attachments/1358092861303947485/1358860210986287224/IMG_2290.png")
        .setColor("f13bfe");
      break;
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
});

// ======= Login =======
client.login(TOKEN);
