import { sendError } from './helpers';
// Import Telegraf and helper modules
import { Telegraf } from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';
import { connection } from 'mongoose';

// Import Database and startup code
import db from './database';
import startup from './startup';

//Import Commands, Scenes and Middlewares
import * as commands from './commands';
import {
  onlyAdmin,
  argsParser,
  makeBotAdmin,
  onlyGroup,
  onlyManager,
  onlyOwner,
  needsReply,
} from './middlewares';

// Import Custom Context and Configure bot
import { MyContext } from './context.interface';
import config from 'config';
const TOKEN: string = config.get('botToken');
const BOT_DOMAIN: string = config.get('botDomain');
const bot = new Telegraf<MyContext>(TOKEN);

/*
 * Use middlewares and configure internalization support
 */

// Set TelegrafI18n Settings to english default
export const i18n = new TelegrafI18n({
  directory: 'locales',
  // directory: path.resolve('./', 'locales'),
  defaultLanguage: 'en',
  defaultLanguageOnMissing: true,
  allowMissing: false,
});
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
bot.context.sendError = sendError;

//* Handle On Group Join
bot.on('new_chat_members', async (ctx) => commands.greeting(ctx));

/* 
  Handle Commands
*/
// Common Commands
bot.start((ctx) => commands.start(ctx));
bot.help((ctx) => commands.help(ctx));
// bot.command('salute', (ctx) => commands.salute(ctx));
bot.hears(/^(?:\/|\.|\!)salute/, (ctx: MyContext) => commands.salute(ctx));

// Merit Commands
bot.command(['add_stars', 'addstr'], onlyGroup, onlyManager, (ctx) =>
  commands.addStar(ctx)
);
bot.command('curr_nominee', (ctx) => commands.getNominee(ctx));
bot.command(['remove_stars', 'rmstr'], onlyGroup, onlyManager, (ctx) =>
  commands.removeStar(ctx)
);
bot.command('tpchamps', (ctx) => commands.topGroupChampions(ctx, true));
bot.command('grpchamps', onlyManager, (ctx) => commands.topGroupChampions(ctx));
bot.command('champstat', (ctx) => commands.checkStar(ctx));

// Candidate Champion Commands
bot.command('nominate_champ', onlyManager, (ctx) =>
  commands.nominateChampion(ctx)
);
bot.command('gain_favours', onlyGroup, onlyManager, needsReply, (ctx) =>
  commands.gainFavour(ctx)
);

// Dev
bot.command('dev', (ctx) => commands.contactDev(ctx));

// Mods

bot.command('addmod', onlyAdmin, (ctx) => commands.makeChatMod(ctx));
bot.command('rmmod', onlyAdmin, (ctx) => commands.removeChatMod(ctx));
bot.command('addgmod', onlyOwner, (ctx) => commands.makeGlobalMod(ctx));
bot.command('rmgmod', onlyOwner, (ctx) => commands.removeGlobalMod(ctx));
bot.command('listgmods', onlyOwner, (ctx) => commands.listGlobalMod(ctx));
bot.command('listmods', onlyOwner, (ctx) => commands.listChatMod(ctx));

// Handle Connection to database errors and launch bot
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', async () => {
  try {
    await startup(db);
    // template commands for users
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
        command: 'curr_nominee',
        description: 'get the currently selected champion roles',
      },
      {
        command: 'addstr',
        description: 'add stars to champions who earn my favor',
      },
      {
        command: 'rmstr',
        description: 'remove stars to champions who are unworthy',
      },
      {
        command: 'tpchamps',
        description: 'sends the top champions with most stars in gc',
      },
      {
        command: 'champstat',
        description: 'sends the champions current status in gc',
      },
    ]);

    if (!process.env.BOT_DOMAIN) {
      await bot.launch();
      console.log(new Date(), 'Bot started as', bot.botInfo?.first_name);
      return '';
    }
    await bot.launch({
      webhook: {
        domain: BOT_DOMAIN,
        port: Number(process.env.PORT),
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
