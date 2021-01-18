// const { sendError } = require('../helpers');
import { MyContext } from '../context.interface';

export default async (ctx: MyContext, next: () => Promise<void>) => {
  try {
    if (['supergroup', 'group'].includes(<string>ctx.chat?.type)) {
      if ((await ctx.getChatMember(ctx.botInfo.id)).can_pin_messages) {
        return next();
      } else {
        ctx.replyWithHTML(<string>ctx.i18n?.t('give_bot_pin_access'));
      }
    } else {
      return next();
    }
  } catch (err) {
    console.log(err);
    // return sendError(err, ctx);
  }
};
