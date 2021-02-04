import { rewardChampions } from './../helpers';
import { html } from 'telegram-format';
import { randomNominee, capitalize, mentionHTML } from './../utils/index';
import { parseGameMessage } from '../helpers';
import {
  ICandidateRoles,
  IChat,
  IRole,
} from './../database/models/models.interface';
import { MyContext } from './../context.interface';

export const nominateChampion = async (ctx: MyContext) => {
  const candidateRoles: ICandidateRoles[] = await ctx.db?.CandidateRoles.find();
  const chat: IChat | undefined = await ctx.db?.Chat.findOneOrCreate(
    { chatId: ctx.chat?.id },
    {
      chatId: <number>ctx.chat?.id,
      currCandidate: candidateRoles[0]._id,
      lastCandidates: [],
    }
  );
  const lastOfCand = chat?.lastCandidates ? chat.lastCandidates : [];
  const { nonCandidates, nominee } = randomNominee(
    lastOfCand,
    candidateRoles,
    4
  );
  await ctx.db?.Chat.findOneAndUpdate(
    { chatId: ctx.chat?.id },
    { lastCandidates: nonCandidates, currCandidate: nominee._id }
  );

  let candidRoles: any[] = [];

  nominee.candidates.forEach((candidate) =>
    candidRoles.push(ctx.db?.Role.findById(candidate))
  );

  candidRoles = await await Promise.all(candidRoles);
  console.log(candidRoles);
  candidRoles = candidRoles.map((candid) => `${candid.name} ${candid.emoji}`);
  ctx.reply(
    <string>ctx.i18n?.t('candidate.nominate_from', {
      candidCount: candidateRoles.length,
    })
  );
  return ctx.replyWithHTML(
    <string>ctx.i18n?.t('candidate.nominate', {
      candidate: html.bold(capitalize(nominee.name)),
      roles: html.italic(candidRoles.join(', ')),
    })
  );
};

// export const gainStars = async (ctx: MyContext) => {
//   const { champions, users, isCorrect } = await parseGameMessage(ctx);
//   if (!isCorrect) return '';
//   console.log(champions);

//   const chat: IChat = await ctx.db?.Chat.findOne({ chatId: ctx.chat?.id });
//   if (!chat) return ctx.reply(<string>ctx.i18n?.t('candidate.not_nominated'));
//   console.log(chat.currCandidate);
//   const champRole: ICandidateRoles = await ctx.db?.CandidateRoles.findById(
//     chat.currCandidate
//   );
//   console.log(champRole);
//   if (!champRole || !('candidates' in champRole))
//     return ctx.reply(<string>ctx.i18n?.t('candidate.not_found'));
//   let candidRoles: IRole[] = [];
//   // await ctx.db?.Role.find({ type: champRole.winningType });
//   champRole.candidates.forEach((candidate) =>
//     candidRoles.push(ctx.db?.Role.findById(candidate))
//   );
//   candidRoles = await Promise.all(candidRoles);
//   let text = ctx.i18n?.t('game_msg.list_title');
//   if (!users) return ctx.reply('No Users');
//   users?.forEach((user, idx) => {
//     if (!user) return ctx.reply("User Couldn't be found");
//     const mention = mentionHTML(<string>user?.first_name, <number>user?.id);
//     const { survival, status, role } = champions[idx];
//     if (
//       candidRoles.some(
//         (candRole: IRole) => candRole.name.toUpperCase() === role.toUpperCase()
//       )
//     ) {
//       if (status === 'Won') {
//         // promise.push(giveChampionPoints(ctx, user, 5));
//         return (text += `${mention}: ${survival} Champion - ${role} ${status} +5\n`);
//       }
//       return (text += `${mention}: ${survival} Champion - ${role} ${status} +0\n`);
//     } else if (status === 'Won') {
//       // promise.push(giveChampionPoints(ctx, user, 3));
//       return (text += `${mention}: ${survival} Ally - ${role} ${status} +3\n`);
//     }
//     // return (text += `${mention} was ${survival} and ${status} the game as ${role}\n`);
//   });
//   // await Promise.all(promise);
//   ctx.replyWithHTML(text);
// };
export const gainFavour = async (ctx: MyContext) => {
  const { champions, users, isCorrect } = await parseGameMessage(ctx);
  if (!isCorrect) return '';
  console.log(champions);

  const chat: IChat = await ctx.db?.Chat.findOne({ chatId: ctx.chat?.id });
  if (!chat) return ctx.reply(<string>ctx.i18n?.t('candidate.not_nominated'));
  console.log(chat.currCandidate);

  const champRole: ICandidateRoles = await ctx.db?.CandidateRoles.findById(
    chat.currCandidate
  );
  console.log(champRole);
  if (!champRole || !('candidates' in champRole))
    return ctx.reply(<string>ctx.i18n?.t('candidate.not_found'));

  const champWon = await rewardChampions(ctx, champions, champRole);
  if (!champWon) return;
  let text: string = <string>ctx.i18n?.t('gain_merit.merit_title');
  champWon.forEach((candidate) => {
    const {
      user,
      isChamp,
      isAlly,
      survival,
      status,
      role,
      stars,
      emoji,
    } = candidate;
    const mention = mentionHTML(<string>user?.first_name, <number>user?.id);
    if (isChamp && status === 'Won') {
      if (survival === 'Alive')
        text += ctx.i18n?.t('gain_merit.alive_champ', {
          mention,
          role,
          emoji,
          status,
          stars: <number>stars - 1,
          survival,
        });
      else
        text += ctx.i18n?.t('gain_merit.dead_champ', {
          mention,
          role,
          emoji,
          status,
          stars,
        });
    } else if (isAlly && status === 'Won') {
      text += ctx.i18n?.t('gain_merit.ally', {
        mention,
        role,
        emoji,
        status,
        stars,
      });
    } else if (status === 'Won') {
      text += ctx.i18n?.t('gain_merit.ally', {
        mention,
        role,
        emoji,
        status,
        stars,
      });
    }
  });
  ctx.replyWithHTML(text);
};
export const getNominee = async (ctx: MyContext) => {
  const chat = await ctx.db?.Chat.findOne({ chatId: ctx.chat?.id });
  console.log(chat);
  if (!chat && !chat.currCandidate)
    return ctx.reply('No Nominee Champion roles selected');
  const nominee = await ctx.db?.CandidateRoles.findById(chat.currCandidate);
  console.log(nominee);
  ctx.replyWithHTML(
    `Nominee Champion role selected is <i>${capitalize(nominee.name)}</i>`
  );
};
