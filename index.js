const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Partials,
} = require("discord.js");
require("dotenv").config();

// ==== TOKEN BOT ====
// Token KHÔNG để trong code, chỉ lấy từ biến môi trường
const TOKEN = process.env.TOKEN;

// ==== ID CHANNEL REPORT ====
const REPORT_CHANNEL_ID = "1416857935249936456"; // thay bằng ID kênh report của bạn

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.once("ready", () => {
  console.log(`✅ Bot đã đăng nhập thành công dưới tên ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("?report")) {
    const args = message.content.split(" ").slice(1);
    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("❌ Bạn phải tag người cần report!");
    }

    const reason = args.slice(1).join(" ") || "Không có lý do.";

    // Tạo embed đẹp
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🚨 Báo cáo vi phạm")
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1411987904980586576/1417747803228340324/ChatGPT_Image_Sep_17_2025_12_43_06_PM.png"
      )
      .addFields(
        { name: "👤 Người bị report", value: `${user.tag}`, inline: true },
        { name: "📝 Lý do", value: reason, inline: true },
        { name: "📢 Người báo cáo", value: `${message.author.tag}`, inline: false }
      )
      .setFooter({ text: "Hãy xử lý sớm nhất có thể 🚔" })
      .setTimestamp();

    // Tạo nút jump link
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("🔗 Jump to Message")
        .setStyle(ButtonStyle.Link)
        .setURL(message.url)
    );

    const reportChannel = client.channels.cache.get(REPORT_CHANNEL_ID);
    if (reportChannel) {
      await reportChannel.send({ embeds: [embed], components: [row] });
      await message.reply("✅ Báo cáo của bạn đã được gửi!");
    } else {
      await message.reply("❌ Không tìm thấy kênh report!");
    }
  }
});

// ===== KEEP ALIVE (cho Render) =====
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Ping để bot sống
app.get("/", (req, res) => res.send("Bot vẫn online! ✅"));
app.listen(PORT, () => console.log(`🌐 Keep-alive server chạy trên cổng ${PORT}`));

client.login(TOKEN);
