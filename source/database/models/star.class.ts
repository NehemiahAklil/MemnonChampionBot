import { MyContext } from '../../context.interface';

export class Star {
  public stars: number = 0;
  public groupId: number = 0;
  constructor(stars: number, ctx: MyContext) {
    if (ctx.chat?.id) {
      this.groupId = ctx.chat?.id;
    }
    console.log(`Adding ${stars} stars`);
    if (stars > 5) {
      if (ctx.state.isMod) {
        this.stars = stars;
      } else {
        this.stars = 5;
        ctx.reply('The max amount of stars given per command is 5');
      }
    } else {
      this.stars = stars;
    }
  }
}
