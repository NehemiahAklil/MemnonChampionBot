import { CandRoles } from '../../database/models/models.interface';

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
    description: 'Type of wolves that have their own special ability',
  },
  {
    name: 'saving roles',
    candidates: [
      'Guardian Angel',
      'Martyr',
      'Fire Fighter',
      'Guard',
      'Pacifist',
      'Fallen Angel',
      'Healer',
    ],
    description:
      'Type of roles that save other roles from death or revives them',
  },
  {
    name: 'revealing roles',
    candidates: [
      'Blacksmith',
      'Storm Bringer',
      'Sandman',
      'Monarch',
      'Mayor',
      'Gunner',
      'Pacifist',
      'Prince',
      'Troublemaker',
      'Trickster',
      'Howling Wolf',
    ],
    description: 'Type of roles that reveal their Identity by doing their job',
  },
  {
    name: 'allied enemies',
    candidates: ['Arsonist', 'Serial Killer', 'Puppet Master'],
    description: 'adsfsdf',
  },
  {
    name: 'converting roles',
    candidates: [
      'Cultist',
      'Vampire',
      'Alchemist',
      'Alpha Wolf',
      'Mystic',
      'Rabid Wolf',
    ],
    description:
      'Type of roles that convert other roles from their original one',
  },
  {
    name: 'hunting roles',
    candidates: ['Cultist Hunter', 'Hunter', 'Night Hunter', 'Gunner'],
    description: 'Type of villager that hunts or kills other baddie roles',
  },
  {
    name: 'vision roles',
    candidates: [
      'Seer',
      'Apprentice Seer',
      'Oracle',
      'Lookout',
      'Detective',
      'Snooper Wolf',
      'Sorcerer',
      'Prowler',
    ],
    description:
      'Type of roles that can some how predict or tell someones role',
  },
  {
    name: 'two-faced roles',
    candidates: [
      'Lycan',
      'Wolf Man',
      'Trickster',
      'Fool',
      'Imposter',
      'Wild Child',
      'Traitor',
      'Cursed',
      'Fool',
      'Doppelgänger',
      'Necromancer',
    ],
    description: "Type of roles who's role type is hard to figure out",
  },
  {
    name: 'legacy roles',
    candidates: ['Drunk', 'Hunter', 'Martyr', 'Baker', 'Phantom', 'Wolf Cub'],
    description: "Type of roles who's legacy will live on after death",
  },
  {
    name: 'annoying roles',
    candidates: [
      'Baker',
      'Clumsy Guy',
      'Fool',
      'Villager',
      'Cupid',
      'Thief',
      'Tanner',
      'Prowler',
    ],
    description:
      'Type of roles that are annoying for player or other players in game',
  },
];
