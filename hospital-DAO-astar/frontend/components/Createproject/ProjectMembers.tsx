import {
  ChangeEventHandler,
  Dispatch,
  MouseEventHandler,
  SetStateAction
} from 'react';

import { useAtomValue } from 'jotai';
import { accountsAtom } from 'store/substrateAccount';

import { MembersDropdown } from 'components/MembersDropdown';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';

import styles from './CreateProject.module.scss';
import type { MembersState } from './types';

enum InputName {
  ADDRESS = 'address',
  ROLE = 'role',
  VOTE_WEIGHT = 'voteWeight'
}

enum InputLabel {
  ADDRESS = 'New Member',
  ROLE = 'Role',
  VOTE_WEIGHT = 'Vote Weight'
}

const ACCOUNT_MAP = {
  alice: 'Aiko',
  bob: 'Bob',
  charlie: 'Carol',
  dave: 'Dave',
  eve: 'Eve',
  ferdie: 'Hassan'
};
type ProjectMembersProps = {
  state: MembersState;
  setState: Dispatch<SetStateAction<MembersState>>;
};

export function ProjectMembers({ state, setState }: ProjectMembersProps) {
  const accounts = useAtomValue(accountsAtom);

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    const dataMemberIndex = target.getAttribute('data-member-index');
    setState((prevState) => {
      const members = prevState.members.map((member, idx) =>
        dataMemberIndex && parseInt(dataMemberIndex, 10) === idx
          ? { ...member, [targetName]: targetValue }
          : member
      );
      return { ...prevState, members };
    });
  };

  const onMemberValueChange = (address: string, index?: string | null) => {
    if (typeof index !== 'string') {
      return;
    }
    const memberIndex = parseInt(index, 10);

    setState((prevState) => {
      const members = prevState.members.map((member, idx) =>
        idx === memberIndex ? { ...member, address } : member
      );
      return { ...prevState, members };
    });
  };

  const handleAddMemberClick: MouseEventHandler = () =>
    setState((prevState) => ({
      ...prevState,
      members: [
        ...prevState.members,
        { address: '', role: '', voteWeight: '1' }
      ]
    }));

  const handleRemoveMemberClick: MouseEventHandler = (e) => {
    const target = e.target as HTMLButtonElement;
    const dataAddressIndex = target.getAttribute('data-member-index');
    if (typeof dataAddressIndex !== 'string') {
      return;
    }

    const addressIndex = parseInt(dataAddressIndex, 10);

    setState((prevState) => {
      const members = prevState.members.filter(
        (_member, idx) => idx !== addressIndex
      );
      return { members };
    });
  };

  return (
    <div className={styles.members}>
      <Typography variant="h3">Members</Typography>
      <Typography variant="body1">
        Select the members of your Project and their roles.
      </Typography>
      <div className={styles['members-inputs']}>
        <div className={styles['members-addresses']}>
          {state.members.map((member, index) => {
            const lastItem =
              index === state.members.length - 1 &&
              accounts?.length !== state.members.length;
            const key = `member-${index}`;

            return (
              <MembersDropdown
                accounts={accounts?.filter((_account) => {
                  const foundMember = state.members.find(
                    (_member) => _member.address === _account.address
                  );
                  return !foundMember;
                })}
                key={key}
                onValueChange={onMemberValueChange}
                index={index}
              >
                <Input
                  name={InputName.ADDRESS}
                  label={InputLabel.ADDRESS}
                  onChange={onInputChange}
                  data-member-index={index}
                  value={
                    ACCOUNT_MAP[
                      accounts?.find(
                        (_account) => _account.address === member.address
                      )?.meta.name as string
                    ] || member.address
                  }
                  autoComplete="off"
                  required
                  endAdornment={
                    <span className={styles['members-button-group']}>
                      {(index !== 0 ||
                        (state.members[index].address && !lastItem)) && (
                        <Button
                          data-member-index={index}
                          variant="ghost"
                          className={styles['members-add-button']}
                          onClick={handleRemoveMemberClick}
                          size="sm"
                        >
                          <Icon name="close" size="sm" />
                        </Button>
                      )}
                      {lastItem && (
                        <Button
                          data-member-index={index}
                          variant="ghost"
                          className={styles['members-add-button']}
                          onClick={handleAddMemberClick}
                          size="sm"
                        >
                          <Icon name="add" size="sm" />
                        </Button>
                      )}
                    </span>
                  }
                />
              </MembersDropdown>
            );
          })}
        </div>

        <div className={styles['members-roles']}>
          {state.members.map((member, index) => {
            const key = `member-role-${index}`;
            return (
              <Input
                key={key}
                name={InputName.ROLE}
                label={InputLabel.ROLE}
                value={member.role}
                onChange={onInputChange}
                data-member-index={index}
                required
                disabled={!member.address}
              />
            );
          })}
        </div>
        <div className={styles['members-roles']}>
          {state.members.map((member, index) => {
            const key = `member-voteweight-${index}`;
            return (
              <Input
                key={key}
                type="number"
                name={InputName.VOTE_WEIGHT}
                label={InputLabel.VOTE_WEIGHT}
                value={member.voteWeight}
                onChange={onInputChange}
                data-member-index={index}
                required
                disabled={!member.address}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
