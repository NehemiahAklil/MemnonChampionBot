import { roles } from './defaults/roles';
import { candidateRoles } from './defaults/candidateRoles';
import database from '../database';
import config from 'config';
const devId = config.get('devId');
import { Document } from 'mongoose';

export default async (db: typeof database) => {
  try {
    const roleCount = await db.Role.countDocuments();
    const candRoleCount = await db.CandidateRoles.countDocuments();

    // Create Owner for bot
    const hasOwner = await db.Moderator.findOneOrCreate(
      {
        isOwner: true,
      },
      {
        name: 'βoγ Woηdεr',
        telegramId: <number>devId,
        title: 'Enthusiast Coder',
        isOwner: true,
      }
    );
    if (hasOwner) {
      console.log(`Bot's owner is ${hasOwner.name} the ${hasOwner.title}`);
    }

    // Create Default Roles
    if (roleCount !== roles.length) {
      await db.Role.deleteMany();
      let promise: Promise<Document<any>>[] = [];
      roles.forEach((role) => {
        promise.push(db.Role.create({ ...role }));
      });
      await Promise.all(promise);
      const roleCount = await db.Role.countDocuments();
      console.log(`Added ${roleCount} Roles to bot`);
    } else {
      console.log('Bot Already has all the roles');
    }

    // Create CandidateRoles
    if (candRoleCount !== candidateRoles.length) {
      // Remove Everthing inside candidate roels first
      await db.CandidateRoles.deleteMany();

      let promise: Promise<Document<any>>[] = [];
      for (let i = 0; i < candidateRoles.length; i++) {
        // Search for the Candidate roles id from Roles collection
        candidateRoles[i].candidates.forEach((candidate) => {
          promise.push(db.Role.findOne({ name: candidate }).select({ _id: 1 }));
        });
        let candidates = await (await Promise.all(promise)).filter(
          (candidate) => candidate !== null
        );
        promise = [];
        // Save the current's candidate role data to db
        const { name, winningType } = candidateRoles[i];
        await db.CandidateRoles.create({
          name,
          winningType,
          // Change _id from being properties of objects inside candidates array to array vaules
          candidates: candidates.map((candidate) => candidate._id),
        });
      }
      const candRoleCount = await db.CandidateRoles.countDocuments();
      console.log(`Added ${candRoleCount} Candidate Roles to bot`);
    } else {
      console.log('Bot Already has all the candidate roles');
    }
  } catch (err) {
    console.log(err);
  }
};
