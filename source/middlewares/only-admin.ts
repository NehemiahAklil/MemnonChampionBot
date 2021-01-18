import { MyContext } from '../context.interface';

export default async (ctx: MyContext, next: () => Promise<void>) => {
  try {
    if (['supergroup', 'group'].includes(<string>ctx?.chat?.type)) {
      const chatMember = await ctx.getChatMember(<number>ctx?.from?.id);
      if (
        chatMember &&
        ['creator', 'administrator'].includes(chatMember.status)
      ) {
        return next();
      } else {
        ctx.replyWithHTML(<string>ctx?.i18n?.t('only_admin'), {
          reply_to_message_id: ctx?.message?.message_id,
        });
      }
    } else {
      return next();
    }
  } catch (err) {
    console.log(err);
    // return ctx.sendError(err, ctx);
  }
};
