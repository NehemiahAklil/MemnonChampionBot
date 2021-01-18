import { Context } from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';
import database from './database';
export interface MyContext extends Context {
  i18n?: TelegrafI18n;
  db?: typeof database;
  startPayload: string;
  // ... more props go here
}
