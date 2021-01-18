import { IModerator } from './models.interface';
import { model, Schema, Model, Document } from 'mongoose';
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
    title: {
      type: String,
      trim: true,
      default: 'moderator',
    },
    isOwner: { type: Boolean, default: false },
  },
  { collection: 'moderators', timestamps: true }
);

export interface Moderator extends IModerator, Document {}
export interface ModeratorModel extends Model<Moderator> {
  findOneOrCreate(find: object, create: IModerator): Promise<Moderator>;
}

moderatorSchema.plugin(findOneOrCreate);

export default model<Moderator, ModeratorModel>('moderators', moderatorSchema);
