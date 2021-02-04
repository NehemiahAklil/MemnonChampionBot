import { TelegramError } from 'telegraf';
import config from 'config';
const LogChannelHandler: string = config.get('LogChannel');
import { html as format } from 'telegram-format';
import { MyContext } from '../context.interface';
import { i18n } from '../app';

export const sendError = async (
  err: TelegramError,
  ctx: MyContext
): Promise<any> => {
  try {
    const preText = ctx
      ? format.userMention(
          format.escape(<string>ctx.from?.first_name),
          <number>ctx.from?.id
        )
      : i18n.t('error.normal_pretext');
    let response = i18n?.t('error.description', {
      preText,
      message: err.toString(),
      err: err.stack,
    });
    response = format.escape(response);
    return ctx.telegram.sendMessage(LogChannelHandler, response, {
      parse_mode: 'HTML',
    });
  } catch (err) {
    console.log(err);
  }
};
