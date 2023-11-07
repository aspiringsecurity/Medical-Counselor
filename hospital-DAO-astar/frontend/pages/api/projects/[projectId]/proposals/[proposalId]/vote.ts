import type { NextApiRequest, NextApiResponse } from 'next';
import { proposalDB } from 'db/proposals';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = parseInt(req.query.projectId as string, 10);
  const proposalId = parseInt(req.query.proposalId as string, 10);

  switch (req.method) {
    case 'POST':
      // eslint-disable-next-line no-case-declarations
      const { vote } = req.body;
      res.status(201).json(proposalDB.doVote(projectId, proposalId, vote));
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
