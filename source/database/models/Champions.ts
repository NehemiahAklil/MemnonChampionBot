import { IChampion, Champion } from './models.interface';
import { Schema, model, Model } from 'mongoose';
import findOneOrCreate from 'mongoose-findoneorcreate';
interface ChampionModel extends Model<IChampion> {
  findOneOrCreate(find: object, create: Champion): Promise<IChampion>;
}
const championSchema = new Schema<IChampion, ChampionModel>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    username: {
      type: String,
      trim: true,
    },
    telegramId: {
      type: Number,
      unique: true,
      required: true,
    },
    stars: {
      type: [Object],
      required: true,
      default: 0,
    },
  },
  { collection: 'champions', timestamps: true }
);

championSchema.plugin(findOneOrCreate);

export default model<IChampion, ChampionModel>('champions', championSchema);
