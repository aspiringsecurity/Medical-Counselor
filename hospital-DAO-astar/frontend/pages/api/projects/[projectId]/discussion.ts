import type { NextApiRequest, NextApiResponse } from 'next';
import { discussionsDB } from 'db/discussions';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  const discussion = discussionsDB.get(parseInt(projectId as string, 10));
  switch (req.method) {
    case 'GET':
      res
        .status(200)
        .json(
          discussion
            ? discussion
            : discussionsDB.createDiscussion(parseInt(projectId as string, 10))
        );
      break;
    case 'POST':
      // eslint-disable-next-line no-case-declarations
      const { message, userId } = req.body;
      res
        .status(201)
        .json(
          discussionsDB.addMessage(
            parseInt(projectId as string, 10),
            message,
            userId
          )
        );
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
