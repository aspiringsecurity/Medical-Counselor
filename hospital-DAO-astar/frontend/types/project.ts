export enum ProposalType {
  AddMember = 'AddMember',
  RemoveMember = 'RemoveMember',
  Spend = 'Spend',
  TransferToken = 'TransferToken'
}

export type AddMemberProposal = {
  __typename: ProposalType.AddMember;
  who: string;
};

export type RemoveMemberProposal = {
  __typename: ProposalType.RemoveMember;
  who: string;
};

export type SpendProposal = {
  __typename: ProposalType.Spend;
  beneficiary: string;
  amount: bigint;
};

export type TransferProposal = {
  __typename: ProposalType.TransferToken;
  amount: bigint;
  beneficiary: string;
};

export type ProposalKind =
  | AddMemberProposal
  | RemoveMemberProposal
  | SpendProposal
  | TransferProposal;
