// const { sendError } = require('../helpers');
import { Message } from 'typegram';
import { MyContext } from '../context.interface';
import { deunionize } from '../types';

export default async (ctx: MyContext, next: () => Promise<void>) => {
  try {
    if (['supergroup', 'group'].includes(<string>ctx.chat?.type)) {
      if (ctx.message && deunionize(ctx.message)?.reply_to_message) {
        return next();
      }
      return ctx.replyWithHTML(<string>ctx.i18n?.t('needs_reply'));
    } else {
      return next();
    }
  } catch (err) {
    console.log(err);
    // return sendError(err, ctx);
  }
};
