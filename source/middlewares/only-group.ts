// const { sendError } = require('../helpers');
import { MyContext } from '../context.interface';

export default async (ctx: MyContext, next: () => Promise<void>) => {
  try {
    if (['supergroup', 'group'].includes(<string>ctx.chat?.type)) {
      return next();
    } else {
      ctx.replyWithHTML(<string>ctx.i18n?.t('only_group'));
    }
  } catch (err) {
    console.log(err);
    // return sendError(err, ctx);
  }
};
