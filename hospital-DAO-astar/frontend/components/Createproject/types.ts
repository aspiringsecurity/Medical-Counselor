export type MemberState = {
  address: string;
  role: string;
  voteWeight: string;
};
export type MembersState = {
  members: MemberState[];
};

export type GovernanceState = {
  approveOrigin: keyof typeof ApproveOrigin;
  proposalPeriod: string;
  proposalPeriodType: ProposalPeriod;
  votingPeriod: string;
  votingPeriodType: ProposalPeriod;
  enactmentPeriod: string;
  enactmentPeriodType: ProposalPeriod;
  voteLockingPeriod: string;
  voteLockingPeriodType: ProposalPeriod;
  launchPeriod: string;
  launchPeriodType: ProposalPeriod;
};

export type InfoState = {
  name: string;
  description: string;
};

export enum ApproveOrigin {
  '1/2' = '50%',
  '3/5' = '60%',
  '3/4' = '75%',
  '1/1' = '100%'
}

export enum ProposalPeriod {
  DAYS = 'Days',
  HOURS = 'Hours'
}

export type PeriodName =
  | 'proposalPeriod'
  | 'votingPeriod'
  | 'enactmentPeriod'
  | 'voteLockingPeriod'
  | 'launchPeriod';

export type PeriodTypeName =
  | 'proposalPeriodType'
  | 'votingPeriodType'
  | 'enactmentPeriodType'
  | 'voteLockingPeriodType'
  | 'launchPeriodType';

export type PeriodInputType = {
  title: string;
  subtitle: string;
  label: string;
  periodName: PeriodName;
  periodTypeName: PeriodTypeName;
};
