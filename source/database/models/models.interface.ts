import { Document } from 'mongoose';
export enum roleType {
  al = 'Auto-Lose',
  vlg = 'Villager',
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
export interface IModerator {
  name: string;
  telegramId: number;
  title: string;
  isOwner: boolean;
}
export interface CandRoles {
  name: string;
  candidates: IRole['_id'][];
  winningType: roleType[];
}
export interface ICandidateRoles extends Document {
  name: string;
  candidates: IRole['_id'][];
  winningType: roleType[];
}
export interface IChat extends Document {
  chatId: number;
  currCandidate: ICandidateRoles['_id'];
  lastCandidates: ICandidateRoles['_id'][];
}
export interface IChampion extends Document {
  name: string;
  telegramId: number;
  points: number;
}
