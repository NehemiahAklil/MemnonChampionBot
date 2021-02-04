import { IRole, roleType } from './models.interface';
import { Schema, model } from 'mongoose';

const roleSchema: Schema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  type: {
    type: String,
    trim: true,
    enum: [...Object.values(roleType)],
    default: roleType.vlg,
    required: true,
  },
  emoji: {
    type: String,
    trim: true,
    required: true,
  },
});

export default model<IRole>('Roles', roleSchema);
