import { IChat, Chat } from './models.interface';
import { Schema, SchemaTypes, model, Model } from 'mongoose';
import findOneOrCreate from 'mongoose-findoneorcreate';

const chatSchema: Schema = new Schema(
  {
    chatId: {
      type: Number,
      unique: true,
      required: true,
    },
    currCandidate: {
      type: SchemaTypes.ObjectId,
      ref: 'Candidate Roles',
    },
    lastCandidates: {
      type: [Object],
      ref: 'Candidate Roles',
    },
  },
  { collection: 'Chats', timestamps: true }
);

interface ChatModel extends Model<IChat> {
  findOneOrCreate(find: object, create: Chat): Promise<IChat>;
}
chatSchema.plugin(findOneOrCreate);

export default model<IChat, ChatModel>('Chats', chatSchema);
