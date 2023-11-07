import type { NextApiRequest, NextApiResponse } from 'next';
import { proposalDB } from 'db/proposals';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, proposalId } = req.query;
  switch (req.method) {
    case 'GET':
      res
        .status(200)
        .json(
          proposalDB.get(
            parseInt(projectId as string, 10),
            parseInt(proposalId as string, 10)
          )
        );
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
