import {
  ICandidateRoles,
  noncandidates,
} from './../database/models/models.interface';
import { MyContext } from './../context.interface';
import { User } from 'typegram';
import { html, markdownv2 } from 'telegram-format';

export const getFullName = (user: User): string => {
  return 'last_name' in user
    ? `${user.first_name} ${user.last_name}`
    : <string>user.first_name;
};
export const mentionMarkdown = (label: string, userId: number) =>
  markdownv2.userMention(markdownv2.escape(label), userId);
export const mentionHTML = (label: string, userId: number) =>
  html.userMention(html.escape(label), userId);
export const getIconsForTopHowlers = (ranking: number): string => {
  switch (ranking) {
    case 1:
      return String.fromCodePoint(0x1f947);
    case 2:
      return String.fromCodePoint(0x1f948);
    case 3:
      return String.fromCodePoint(0x1f949);
    case 4:
      return String.fromCodePoint(0x1f3c5);
    case 5:
      return String.fromCodePoint(0x1f396, 0xfe0f);
    default:
      return ranking.toString();
  }
};
export const getUser = (ctx: MyContext): User | undefined => {
  if (ctx.message && 'reply_to_message' in ctx.message) {
    if (ctx.message.reply_to_message?.from?.is_bot) {
      if (ctx.message.reply_to_message?.from?.id === ctx.botInfo.id) {
        ctx.reply('Nice try 😜');
      } else {
        ctx.reply("I don't do bots champ");
      }
      return undefined;
    } else {
      return ctx.message.reply_to_message?.from;
    }
  } else {
    return ctx.from;
  }
};
export const countArrObjValue = (array: [], key: string) => {
  return array.reduce((r, a) => r + a[key], 0);
};

interface RandomNominee {
  (
    nonCandidates: (noncandidates | null)[],
    nominees: ICandidateRoles[],
    waitingInterval: number
  ): { nonCandidates: (noncandidates | null)[]; nominee: ICandidateRoles };
}
/* Takes in nominee roles and generates a random champion role
with possibility of appetence every **waitingInterval** */
export const randomNominee: RandomNominee = (
  nonCandidates: (noncandidates | null)[],
  nominees: ICandidateRoles[],
  waitingInterval: number
) => {
  let nominee: ICandidateRoles;
  let dif = waitingInterval - 1;

  if (!nonCandidates.length) {
    // console.log('first');
    nominee = nominees[Math.floor(Math.random() * nominees.length)];
    // console.log(nominee);
    nonCandidates.push({ nominee: nominee.name, interval: 0 });
    // console.log(nonCandidates);
  } else {
    // console.log('not first');
    nominees = nominees.filter((nominee) => {
      if (
        !nonCandidates.some(
          (nonCandidate) => nonCandidate?.nominee === nominee.name
        )
      ) {
        return nominees;
      }
    });
    nominee = nominees[Math.floor(Math.random() * nominees.length)];
    // console.log(nominee);
    let back = null;
    nonCandidates = nonCandidates
      .map((nonCand) => {
        if (nonCand && nonCand.interval < dif) {
          return { nominee: nonCand.nominee, interval: ++nonCand.interval };
        } else {
          back = nonCand?.nominee;
          return null;
        }
      })
      .filter((value) => value !== null);
    // console.log(nonCandidates);
    nominees = nominees.filter((value) => value !== nominee);
    if (back) nominees.push(back);
    // console.log(nominees);
    nonCandidates.push({ nominee: nominee.name, interval: 0 });
    // console.log(nonCandidates);
  }
  return { nonCandidates, nominee };
};

export const capitalize = (str: string): string => {
  let splStrs = str.split(' ');
  splStrs = splStrs.map((splStr) => splStr[0].toUpperCase() + splStr.slice(1));
  return splStrs.join(' ');
  // return str[0].toUpperCase() + str.slice(1);
};
