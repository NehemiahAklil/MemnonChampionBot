import { Document } from 'mongoose';
import { Star } from './star.class';
export enum roleType {
  al = 'Auto-Lose',
  vlg = 'Villager',
  chg = 'Shifting',
  ww = 'Wolf and Allie',
  ally = 'Allied Enemy',
  cult = 'Cultist',
  vamp = 'Vampire',
}
export interface IRole extends Document {
  name: string;
  type: roleType;
  emoji: string;
}
export interface Moderator {
  name: string;
  telegramId: number;
  chatIds?: number[];
  title?: string;
  isOwner?: boolean;
  isGlobal?: boolean;
}
export interface IModerator extends Moderator, Document {}
export interface CandRoles {
  name: string;
  candidates: IRole['_id'][];
  winningType: roleType[];
}
export interface ICandidateRoles extends Document, CandRoles {}
export type noncandidates = {
  nominee: ICandidateRoles['name'];
  interval: number;
};

export interface Chat {
  chatId: number;
  currCandidate: ICandidateRoles['_id'];
  lastCandidates: (noncandidates | null)[];
}
export interface IChat extends Document, Chat {}
export interface Champion {
  name: string;
  username?: string;
  telegramId: number;
  stars: Star[];
}
export interface IChampion extends Document, Champion {}
