export type State = {
  title: string;
  description: string;
  internal: boolean;
};

export enum InputName {
  DESCRIPTION = 'description',
  TITLE = 'title'
}

export enum InputLabel {
  DESCRIPTION = 'Description',
  TITLE = 'Title',
  PROPOSAL_VOTING_ACCESS = 'Proposal Voting Access'
}

export enum ProposalVotingAccessEnum {
  MEMBER = 'Member Only Proposal',
  EVERYONE = 'Public Proposal'
}
