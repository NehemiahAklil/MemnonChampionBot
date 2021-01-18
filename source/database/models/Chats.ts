import { IChat } from './models.interface';
import { Schema, SchemaTypes, model } from 'mongoose';

const chatSchema: Schema = new Schema({
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
    type: [SchemaTypes.ObjectId],
    ref: 'Candidate Roles',
  },
});

export default model<IChat>('Chats', chatSchema);
