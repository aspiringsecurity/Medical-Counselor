import type { NextApiRequest, NextApiResponse } from 'next';
import { projectsDB } from 'db/projects';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  switch (req.method) {
    case 'GET':
      res.status(200).json(projectsDB.get(parseInt(projectId as string, 10)));
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
