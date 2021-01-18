import { Schema, model } from 'mongoose';
import { IChampion } from './models.interface';

const chapmpionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    telegramId: {
      type: Number,
      unique: true,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { collection: 'moderators', timestamps: true }
);

export default model<IChampion>('Chapmpion', chapmpionSchema);
