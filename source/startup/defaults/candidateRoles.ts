import { roleType, CandRoles } from '../../database/models/models.interface';

export const candidateRoles: CandRoles[] = [
  {
    name: 'unique wolves',
    candidates: [
      'Alpha Wolf',
      'Howling Wolf',
      'Hungry Wolf',
      'Rabid Wolf',
      'Snooper Wolf',
      'Snow Wolf',
      'Speed Wolf',
      'Trickster',
      'Wolf Cub',
      'Lycan',
    ],
    winningType: [roleType.ww],
  },
  {
    name: 'saving roles',
    candidates: ['Guardian Angel', 'Martyr', 'Fire Fighter', 'Guard'],
    winningType: [roleType.vlg, roleType.ww],
  },
  {
    name: 'revealing roles',
    candidates: ['Blacksmith', 'Storm Bringer', 'Sandman', 'Monarch', 'Mayor'],
    winningType: [roleType.vlg],
  },
  {
    name: 'allied enemies',
    candidates: ['Arsonist', 'Serial Killer', 'Puppet Master'],
    winningType: [roleType.ally],
  },
  {
    name: 'converting roles',
    candidates: ['Cultist', 'Vampire'],
    winningType: [roleType.cult, roleType.vamp],
  },
  {
    name: 'hunting roles',
    candidates: ['Cultist Hunter', 'Hunter', 'Night Hunter', 'Gunner'],
    winningType: [roleType.vlg],
  },
  {
    name: 'vision roles',
    candidates: ['Seer', 'Apprentice Seer', 'Oracle', 'Detective'],
    winningType: [roleType.vlg],
  },
];
