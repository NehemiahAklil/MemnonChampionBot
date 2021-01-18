import ArgsParserInterface from './args-parser.interface';

export default class ArgsParser implements ArgsParserInterface {
  command: string = '';
  bot?: string = '';
  args?: string = '';
  splitArgs?: string[] = [];
  constructor(data: ArgsParserInterface) {
    this.command = data.command;
    this.bot = data.bot;
    this.args = data.args;
    this.splitArgs = !data.args
      ? []
      : data.args.split(/\s+/).filter((arg) => arg.length);
  }
}
