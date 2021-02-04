import { MyContext } from '../context.interface';
import { Star } from '../database/models/star.class';
import { User } from 'typegram';
import {
  getFullName,
  mentionHTML,
  getIconsForTopHowlers,
  getUser,
  countArrObjValue,
} from '../utils';
import { IChampion } from '../database/models/models.interface';

export const addStar = async (ctx: MyContext) => {
  try {
    console.log('Add star');
    let stars: Star[] = [];
    if (ctx.state.opts?.args) {
      if (/[0-9]/.test(ctx.state.opts?.args)) {
        stars.push(new Star(<number>parseInt(ctx.state.opts.args.trim()), ctx));
      } else {
        return ctx.reply(<string>ctx.i18n?.t('numeric_char_only'));
      }
    } else {
      console.log('No args so adding 3');
      stars.push(new Star(3, ctx));
    }
    console.log('Adding point');
    let user = getUser(ctx);
    if (!user) {
      return;
    }
    // await ctx.db?.Champion.deleteMany();
    const champ = await ctx.db?.Champion.findOne({
      telegramId: <number>user?.id,
    });
    // Handle new champion
    if (!champ) {
      const newChamp = await ctx.db?.Champion.create({
        name: getFullName(<User>user),
        telegramId: <number>user?.id,
        username: user?.username ? user?.username : null,
        stars,
      });
      return ctx.replyWithHTML(
        <string>ctx.i18n?.t('champion.first_merit', {
          mention: mentionHTML(<string>newChamp?.name, <number>user?.id),
          starPoint: newChamp?.stars[0].stars,
        })
      );
    } else {
      // Handle a champion
      const checkStars = champ.stars.find(
        (star: Star) => star.groupId === ctx.chat?.id
      );
      let newStars: Star[];
      if (checkStars) {
        newStars = champ.stars.map((stared: Star) => {
          if (stared.groupId === ctx.chat?.id) {
            console.log('found a match');
            return {
              stars: <number>stared.stars + <number>stars[0].stars,
              groupId: stared.groupId,
            };
          }
          return stared;
        });
      } else {
        newStars = [...champ.stars, ...stars];
      }
      console.log('New Stars', newStars);
      const updatedChamp = await ctx.db?.Champion.findOneAndUpdate(
        {
          telegramId: <number>user?.id,
        },
        {
          name: getFullName(<User>user),
          username: user?.username,
          stars: newStars,
        },
        { new: true }
      );
      console.log(updatedChamp);
      return ctx.replyWithHTML(
        <string>ctx.i18n?.t('champion.merit', {
          mention: mentionHTML(<string>updatedChamp?.name, <number>user?.id),
          rewardStars: stars[0].stars,
          totalStars: updatedChamp?.stars.find(
            (star: Star) => star.groupId === ctx.chat?.id
          ).stars,
        })
      );
    }
  } catch (err) {
    console.log(err);
  }
};
export const removeStar = async (ctx: MyContext) => {
  try {
    let stars: Star[] = [];
    if (ctx.state.opts?.args) {
      if (/[0-9]/.test(ctx.state.opts?.args)) {
        stars.push(new Star(<number>parseInt(ctx.state.opts.args.trim()), ctx));
      } else {
        return ctx.reply(<string>ctx.i18n?.t('numeric_char_only'));
      }
    } else {
      console.log('No args so removing 3');
      stars.push(new Star(3, ctx));
    }

    let user = getUser(ctx);
    if (!user) {
      return;
    }
    // await ctx.db?.Champion.deleteMany();
    const champ = await ctx.db?.Champion.findOne({
      telegramId: <number>user?.id,
    });

    // Handle new champion
    if (!champ) {
      return ctx.replyWithHTML(<string>ctx.i18n?.t('champion.not_found'));
    } else {
      // Handle a champion
      const checkStars = champ.stars.find(
        (star: Star) => star.groupId === ctx.chat?.id
      );
      let newStars: Star[];
      let isZero: boolean = false;
      if (checkStars) {
        newStars = champ.stars.map((stared: Star) => {
          if (stared.groupId === ctx.chat?.id) {
            if (<number>stared.stars - <number>stars[0].stars < 0) {
              isZero = true;
              return stared;
            }
            return {
              stars: <number>stared.stars - <number>stars[0].stars,
              groupId: stared.groupId,
            };
          }
          return stared;
        });
      } else {
        return ctx.replyWithHTML(<string>ctx.i18n?.t('champion.no_star'));
      }
      if (isZero) {
        return ctx.replyWithHTML(<string>ctx.i18n?.t('champion.no_star'));
      }
      console.log('New Stars', newStars);
      const updatedChamp = await ctx.db?.Champion.findOneAndUpdate(
        {
          telegramId: <number>user?.id,
        },
        {
          $set: {
            name: getFullName(<User>user),
            username: user.username,
            stars: newStars,
          },
        },
        { new: true }
      );
      console.log(updatedChamp);
      return ctx.replyWithHTML(
        <string>ctx.i18n?.t('champion.lost_merit', {
          mention: mentionHTML(<string>updatedChamp?.name, <number>user?.id),
          rewardStars: stars[0].stars,
          totalStars: updatedChamp?.stars.find(
            (star: Star) => star.groupId === ctx.chat?.id
          ).stars,
        })
      );
    }
  } catch (err) {
    console.log(err);
  }
};
export const topGroupChampions = async (ctx: MyContext) => {
  try {
    let totalChamps = await ctx.db?.Champion.find({
      'stars.groupId': ctx.chat?.id,
    })
      .sort({ 'stars.stars': -1 })
      .limit(10);
    console.log(totalChamps);
    totalChamps = totalChamps.map((champ: IChampion) => {
      const { name, telegramId } = champ;
      const Stars = champ.stars.find(
        (star: Star) => star.groupId === ctx.chat?.id
      );
      return { name, telegramId, stars: [Stars] };
    });
    totalChamps = totalChamps.sort(
      (a: IChampion, b: IChampion) => b.stars[0].stars - a.stars[0].stars
    );
    let text: string = `The Top Champions for this ${ctx.chat?.type} are: \n`;
    totalChamps.forEach((champ: IChampion, idx: number) => {
      console.log(champ.stars);
      const ranking = getIconsForTopHowlers(idx + 1);
      if (idx >= 5) {
        text += `  ${ranking.trim()}   ${mentionHTML(
          champ.name,
          champ.telegramId
        )} with ${champ.stars[0].stars} 💫\n`;
      } else {
        text += `${ranking.trim()} ${mentionHTML(
          champ.name,
          champ.telegramId
        )} with ${champ.stars[0].stars} 💫\n`;
      }
    });
    ctx.replyWithHTML(text);
  } catch (err) {
    console.log(err);
  }
};
export const checkStar = async (ctx: MyContext) => {
  try {
    let user = getUser(ctx);
    if (!user) {
      return;
    }
    const champ = await ctx.db?.Champion.findOne({
      telegramId: <number>user?.id,
    });
    // Handle new champion
    if (!champ) {
      return ctx.replyWithHTML(<string>ctx.i18n?.t('champion.not_found'));
    }
    const { name } = champ;
    const currStars = champ.stars.find(
      (star: Star) => star.groupId === ctx.chat?.id
    );
    if (!currStars) {
      return ctx.reply(<string>ctx.i18n?.t('champion.no_star'));
    }
    const totalStars = countArrObjValue(champ.stars, 'stars');
    return ctx.replyWithHTML(
      <string>ctx.i18n?.t('champion.rank', {
        name,
        currStars: currStars.stars,
        totalStars,
      })
    );
  } catch (err) {
    console.log(err);
  }
};
