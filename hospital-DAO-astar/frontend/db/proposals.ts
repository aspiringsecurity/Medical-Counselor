import proposalData from './data/proposals.json';
import { saveData } from './utils';

export type Proposal = {
  id: number;
  projectId: number;
  title: string;
  description: string;
  proposer: string;
};

const getProjectProposal = (projectId: number, proposalId: number) => {
  const proposal = proposalData.find(
    (_proposal) =>
      _proposal.id === proposalId && _proposal.projectId === projectId
  );
  return proposal;
};

const listProjectProposals = (projectId: number) =>
  proposalData.filter((_proposal) => _proposal.projectId === projectId);

const createProposal = (
  id: number,
  title: string,
  description: string,
  projectId: number,
  proposer: string
) => {
  const proposal = {
    id,
    projectId,
    title,
    description,
    proposer
  } as Proposal;
  // @ts-ignore
  proposalData.push(proposal);
  saveData(proposalData, 'proposals.json');
  return proposal;
};

const doVote = (
  projectId: number,
  proposalId: number,
  vote: 'yes' | 'no' | 'abstain'
) => {
  const proposal = getProjectProposal(projectId, proposalId);
  if (!proposal) return;

  if (vote === 'yes') (proposal as Proposal).yesVotes += 1;
  if (vote === 'no') (proposal as Proposal).noVotes += 1;
  if (vote === 'abstain') (proposal as Proposal).abstainVotes += 1;
  saveData(proposalData, 'proposals.json');
};

export const proposalDB = {
  get: getProjectProposal,
  list: listProjectProposals,
  create: createProposal,
  doVote
};
