import type { NextApiRequest, NextApiResponse } from 'next';
import { projectsDB } from 'db/projects';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json(projectsDB.list);
      break;
    case 'POST':
      // eslint-disable-next-line no-case-declarations
      const { name, description, attribute, members } = req.body;
      res
        .status(201)
        .json(projectsDB.create(name, description, attribute, members));
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
