import { Composer } from 'telegraf';
import ArgsParser from './args-parser.class';
import ArgsParserInterface from './args-parser.interface';

const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;

export default Composer.on(
  'text',
  (ctx, next): Promise<void> => {
    const parts = regex.exec(ctx.message.text.trim());
    if (!parts) return next();
    const command_info: ArgsParserInterface = {
      command: parts[1],
      bot: parts[2],
      args: parts[3],
    };
    ctx.state.opts = new ArgsParser(command_info);
    // console.log('args parsed', command_info);
    return next();
  }
);
