import type { IconNamesType } from 'components/ui-kit/Icon';
import type { ProposalKind } from 'types';

export enum ProposalEnum {
  TRANSFER = 'Transfer',
  TRANSFER_GOVERNANCE_TOKEN = 'Transfer Governance Token',
  ADD_MEMBER = 'Add Member',
  REMOVE_MEMBER = 'Remove Member'
}

type ProposalSettings = {
  proposalTitle: string;
  icon: IconNamesType;
};

export function getProposalSettings(
  proposalKind: ProposalKind
): ProposalSettings {
  switch (proposalKind.__typename) {
    case 'AddMember': {
      return {
        proposalTitle: ProposalEnum.ADD_MEMBER,
        icon: 'user-add'
      };
    }
    case 'RemoveMember': {
      return {
        proposalTitle: ProposalEnum.REMOVE_MEMBER,
        icon: 'user-delete'
      };
    }
    case 'Spend': {
      return {
        proposalTitle: ProposalEnum.TRANSFER,
        icon: 'transfer'
      };
    }
    case 'TransferToken': {
      return {
        proposalTitle: ProposalEnum.TRANSFER_GOVERNANCE_TOKEN,
        icon: 'token'
      };
    }
    default: {
      return {
        proposalTitle: ProposalEnum.TRANSFER,
        icon: 'transfer'
      };
    }
  }
}
