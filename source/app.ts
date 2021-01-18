import { Telegraf } from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';
import config from 'config';
import { connection } from 'mongoose';

// Import Database and sensitive information
import db from './database';
import startup from './startup';
//Import Commands and Scenes
import commands from './commands';

// Import middleware modules and start using other middleware
import {
  onlyAdmin,
  argsParser,
  makeBotAdmin,
  onlyGroup,
  onlyManager,
  onlyOwner,
} from './middlewares';

// Set TelegrafI18n Settings to english default
const i18n = new TelegrafI18n({
  directory: 'locales',
  // directory: path.resolve('./', 'locales'),
  defaultLanguage: 'en',
  defaultLanguageOnMissing: true,
  allowMissing: false,
});

import { MyContext } from './context.interface';
const TOKEN: string = config.get('botToken');
const BOT_DOMAIN: string = config.get('botDomain');
const bot = new Telegraf<MyContext>(TOKEN);

bot.catch((error: any) => {
  console.error('telegraf error occured', error);
});

// Use interneraliztion support and other middlewares
bot.use(i18n.middleware());
bot.use(argsParser);
bot.use(async (ctx, next) => {
  if (ctx?.callbackQuery) {
    console.log(new Date(), 'CallbackQuery happened', ctx.callbackQuery);
    return next();
  }
  const start = new Date();
  ctx.state.start = process.hrtime();
  await next();
  const ms = new Date().getTime() - start.getTime();
  console.log('Response time: %sms', ms);
});

// Extend context to include database and error logging
bot.context.db = db;
// bot.context.sendError = sendError;

//* Handle On Group Join
bot.on('new_chat_members', async (ctx) => commands.greeting(ctx));

//* Handle Commands

// Common Commands
bot.start((ctx) => commands.start(ctx));
bot.help((ctx) => commands.help(ctx));
bot.command('salute', (ctx) => commands.ping(ctx));

bot.command('claim', async (ctx) => {
  try {
    let achieve = await ctx.db?.Moderator.find();
    console.log(achieve);
    console.log(ctx.state.opts);
    ctx.reply('hey');
  } catch (err) {
    console.log(err);
  }
});

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', async () => {
  try {
    await startup(db);
    // The commands you set here will be shown as /commands like /start or /magic in your telegram client.
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'open the menu' },
      {
        command: 'salute',
        description: 'salute to memnon for him to respond',
      },
      { command: 'help', description: 'show the help' },
      {
        command: 'gain_favours',
        description: 'reply to game end to gain my favour',
      },
      { command: 'nominate_champ', description: 'get random champion roles' },
      {
        command: 'add_stars',
        description: 'add stars to champions who earn my favor',
      },
      {
        command: 'remove_stars',
        description: 'remove stars to champions who are unworthy',
      },
    ]);

    if (!process.env.BOT_DOMAIN) {
      await bot.launch();
      console.log(new Date(), 'Bot started as', bot.botInfo?.first_name);
      return '';
    }
    const PORT: number = parseInt(<string>process.env.PORT) || 3000;
    await bot.launch({
      webhook: {
        hookPath: `${BOT_DOMAIN}/bot${TOKEN}`,
        domain: BOT_DOMAIN,
        port: PORT,
      },
    });
    console.log(new Date(), bot.botInfo?.first_name, ' Bot Started on Webhook');
  } catch (err) {
    console.log(err);
  }
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
