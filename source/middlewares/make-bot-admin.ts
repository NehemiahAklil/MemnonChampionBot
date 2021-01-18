// const { sendError } = require('../helpers');
import { MyContext } from '../context.interface';

export default async (ctx: MyContext, next: () => Promise<void>) => {
  try {
    if (['supergroup', 'group'].includes(<string>ctx.chat?.type)) {
      const botMember = await ctx.getChatMember(<number>ctx.botInfo.id);
      if (
        botMember &&
        ['creator', 'administrator'].includes(botMember.status)
      ) {
        return next();
      } else {
        ctx.replyWithHTML(<string>ctx.i18n?.t('make_bot_admin'));
      }
    } else {
      return next();
    }
  } catch (err) {
    console.log(err);
    // return sendError(err, ctx);
  }
};
