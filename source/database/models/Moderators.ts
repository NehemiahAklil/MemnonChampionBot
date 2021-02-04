import { IModerator, Moderator } from './models.interface';
import { model, Schema, Model } from 'mongoose';
import findOneOrCreate from 'mongoose-findoneorcreate';

const moderatorSchema: Schema = new Schema(
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
    chatIds: {
      type: [Number],
    },
    title: {
      type: String,
      trim: true,
      default: 'moderator',
    },
    isOwner: { type: Boolean, default: false },
    isGlobal: { type: Boolean, default: false },
  },
  { collection: 'Moderators', timestamps: true }
);

interface ModeratorModel extends Model<IModerator> {
  findOneOrCreate(find: object, create: Moderator): Promise<IModerator>;
}

moderatorSchema.plugin(findOneOrCreate);

export default model<IModerator, ModeratorModel>('Moderators', moderatorSchema);
