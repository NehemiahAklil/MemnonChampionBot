import { ICandidateRoles, IRole } from './../database/models/models.interface';
import { Star } from './../database/models/star.class';
import { getFullName } from './../utils/index';
import { User } from 'typegram';
import { MyContext } from './../context.interface';
type ChampInfo = {
  user: User | null;
  role: string;
  survival: string;
  isLover: boolean;
  emoji: string;
  status: string;
};
type ChampionResult = ChampInfo & {
  isChamp?: boolean;
  isAlly?: boolean;
  stars?: number;
};

export const parseGameMessage = async (
  ctx: MyContext
): Promise<{
  champions: ChampInfo[];
  users: (User | null)[];
  isCorrect: boolean;
}> => {
  try {
    const regex = /(.*): +[🙂|💀]+\s+(Alive|Dead)+\s+-\s+(?:the |a )?([A-Za-z ]{0,})+\s+(.*)+(Won|Lost)/i;
    let users: (User | null)[] = [],
      champions: ChampInfo[] = [];
    if (
      ctx.message &&
      'reply_to_message' in ctx.message &&
      ctx.message.reply_to_message
    ) {
      const replyMessage = ctx.message.reply_to_message;
      if ('entities' in replyMessage && replyMessage.entities) {
        users = replyMessage.entities
          .map((entity) =>
            entity.type == 'text_mention' ? <User | null>entity.user : null
          )
          .filter((user) => user !== null);
        let splitMsg =
          'text' in replyMessage ? replyMessage.text.split('\n') : null;
        if (!splitMsg) {
          ctx.reply(<string>ctx.i18n?.t('game_msg.wrong_message'));
          return { champions, users, isCorrect: false };
        }
        splitMsg = splitMsg.splice(1, splitMsg.length - 3);
        splitMsg.forEach((line, idx) => {
          let part = regex.exec(line.trim());
          if (!part) return;
          const lover = part[4].search(/\u2764/);
          const emoji = part[4].replace(/\u2764/, '').trim();
          console.log(lover);
          champions.push({
            user: users[idx],
            survival: part[2],
            role: part[3],
            isLover: lover !== -1 ? true : false,
            emoji,
            status: part[5],
          });
        });
      }
      return { champions, users, isCorrect: true };
    }
    return { champions, users, isCorrect: false };
  } catch (err) {
    console.log(err);
    return { champions: [], users: [], isCorrect: false };
  }
};

export const rewardChampions = async (
  ctx: MyContext,
  champions: ChampInfo[],
  champRole: ICandidateRoles
): Promise<ChampionResult[] | false> => {
  try {
    let candidRoles: IRole[] = [];
    champRole.candidates.forEach((candidate) =>
      candidRoles.push(ctx.db?.Role.findById(candidate))
    );
    candidRoles = await Promise.all(candidRoles);
    console.log(candidRoles);
    const champWasInGame = champions.some(({ role }) =>
      candidRoles.some(
        (candRole: IRole) => candRole.name.toUpperCase() === role.toUpperCase()
      )
    );
    if (!champWasInGame) {
      ctx.reply(<string>ctx.i18n?.t('game_msg.champ_absent'));
      return false;
    }
    const champWon = champions.some(
      ({ role, status }) =>
        status === 'Won' &&
        candidRoles.some(
          (candRole: IRole) =>
            candRole.name.toUpperCase() === role.toUpperCase()
        )
    );
    console.log(champWon);
    const candidatesInfo: ChampionResult[] = [];
    for (let i = 0; i < champions.length; i++) {
      const { user, isLover, survival, status, role, emoji } = champions[i];
      if (!champWon) {
        console.log('Champ Lost');
        if (status === 'Won' && user) {
          const stars = await giveChampionPoints(ctx, user, 1);
          candidatesInfo.push({
            user,
            emoji,
            isLover,
            survival,
            status,
            role,
            stars,
          });
        }
        continue;
      }
      console.log('Champ Won');
      if (
        candidRoles.some(
          (candRole: IRole) =>
            candRole.name.toUpperCase() === role.toUpperCase()
        )
      ) {
        console.log('Rewarding champ ', role);
        if (status === 'Won' && user) {
          const stars =
            survival === 'Alive'
              ? await giveChampionPoints(ctx, user, 5)
              : await giveChampionPoints(ctx, user, 4);
          candidatesInfo.push({
            user,
            isLover,
            emoji,
            isChamp: true,
            survival,
            status,
            role,
            stars,
          });
        }
      } else if (status === 'Won' && user) {
        console.log('Rewarding ally ', role);
        const stars = await giveChampionPoints(ctx, user, 3);
        candidatesInfo.push({
          user,
          isLover,
          emoji,
          isAlly: true,
          survival,
          status,
          role,
          stars,
        });
      }
    }
    return candidatesInfo;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const giveChampionPoints = async (
  ctx: MyContext,
  user: User,
  stars: number
) => {
  try {
    const star = new Star(stars, ctx);
    // Search for champion
    const champion = await ctx.db?.Champion.findOne({ telegramId: user.id });
    // create champion if not found
    if (!champion) {
      await ctx.db?.Champion.create({
        name: getFullName(<User>user),
        telegramId: <number>user?.id,
        username: user?.username ? user?.username : null,
        stars: [star],
      });
      return star.stars;
    }

    // check if champ has points in this gc
    const checkStars = champion.stars.find(
      (star: Star) => star.groupId === ctx.chat?.id
    );
    let newStars: Star[];

    if (checkStars) {
      newStars = champion.stars.map((stared: Star) => {
        if (stared.groupId === ctx.chat?.id) {
          console.log('found a match');
          return {
            stars: <number>stared.stars + <number>star.stars,
            groupId: stared.groupId,
          };
        }
        return stared;
      });
    } else {
      newStars = [...champion.stars, star];
    }
    console.log('New Stars', newStars);
    await ctx.db?.Champion.findOneAndUpdate(
      {
        telegramId: <number>user?.id,
      },
      {
        $set: {
          name: getFullName(<User>user),
          stars: newStars,
        },
      },
      { new: true }
    );
    return star.stars;
  } catch (err) {
    console.log(err);
  }
};
