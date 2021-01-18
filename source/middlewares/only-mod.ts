import { MyContext } from '../context.interface';

export default async (ctx: MyContext, next: () => Promise<void>) => {
  try {
    const Mods = await ctx.db?.Moderator.findOne({
      telegramId: ctx.message?.from.id,
    });
    if (Mods) return next();
    return ctx.replyWithHTML(<string>ctx.i18n?.t('only_mod'), {
      reply_to_message_id: ctx.message?.message_id,
    });
  } catch (err) {
    console.log(err);
    // return ctx.sendError(err, ctx);
  }
};
