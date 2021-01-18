import { MyContext } from '../context.interface';
import config from 'config';
import { html as format } from 'telegram-format';
const chats: number[] = config.get('chats');

export const start = async (ctx: MyContext) => {
  try {
    //handle deep linking
    switch (ctx.startPayload) {
      case 'help':
        return help(ctx);
      default:
        if (ctx.chat?.type === 'private') {
          return ctx.reply(
            <string>ctx.i18n?.t('welcome', {
              firstName: format.escape(<string>ctx.from?.first_name),
            })
          );
        }
    }
  } catch (err) {
    console.log(err);
  }
};

export const help = async (ctx: MyContext) => {
  try {
    //send help message if in private if not send a redirect message using inline button
    if (ctx.chat?.type === 'private') {
      return ctx.replyWithHTML(<string>ctx.i18n?.t('help'), {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: <string>ctx.i18n?.t('add_to_group'),
                url: `https://t.me/${ctx.botInfo?.username}?startgroup=add`,
              },
            ],
          ],
        },
      });
    } else {
      return ctx.replyWithHTML(
        format.escape(<string>ctx.i18n?.t('redirect.helpMsg')),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: <string>ctx.i18n?.t('redirect.helpBtnMsg'),
                  url: `https://t.me/${ctx.botInfo.username}?start=help`,
                },
              ],
            ],
          },
        }
      );
    }
  } catch (err) {
    console.log(err);
    // return ctx.sendError(err, ctx);
  }
};

export const ping = async (ctx: MyContext) => {
  try {
    const time = process.hrtime(ctx.state.start)[1];
    const pongTime = (time / 1000).toFixed(0);
    ctx.replyWithHTML(
      <string>ctx.i18n?.t('pong', {
        time: pongTime,
      })
    );
  } catch (err) {
    console.log(err);
    // return ctx.sendError(err, ctx);
  }
};

export const greeting = async (ctx: MyContext) => {
  try {
    if (ctx.message && 'new_chat_members' in ctx.message) {
      if (ctx.message?.new_chat_members.some((e) => e.id === ctx.botInfo?.id))
        if (!chats.includes(<number>ctx.chat?.id)) {
          await ctx.reply(<string>ctx.i18n?.t('leave'));
          return ctx.leaveChat();
        }
      return ctx.reply(<string>ctx.i18n?.t('greeting'));
    }
    return;
  } catch (err) {
    console.log(err);
    // return ctx.sendError(err, ctx);
  }
};
