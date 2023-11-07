export interface ProjectProposal {
  id: number;
  status: 'Active' | 'Pending' | 'Completed' | 'Cancelled' | 'Defeated';
  cancelled: boolean;
  hasVoted: string[];
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  voteStart: number;
  voteEnd: number;
  internal: boolean;
  title: string;
  description: string;
  proposer: string;
}
