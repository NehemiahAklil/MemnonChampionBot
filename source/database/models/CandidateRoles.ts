import { Schema, SchemaTypes, model } from 'mongoose';
import { ICandidateRoles, roleType } from './models.interface';

const candidateRolesSchema: Schema = new Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  candidates: {
    type: [SchemaTypes.ObjectId],
    ref: 'Roles',
    required: true,
  },
  winningType: {
    type: [String],
    enum: [...Object.values(roleType)],
    trim: true,
    ref: 'Roles',
  },
});

export default model<ICandidateRoles>('Candidate Roles', candidateRolesSchema);
