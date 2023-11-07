import { ChangeEventHandler, Dispatch, SetStateAction } from 'react';

import { Input } from 'components/ui-kit/Input';
import { Typography } from 'components/ui-kit/Typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';

import {
  InputLabel,
  InputName,
  ProposalVotingAccessEnum,
  State
} from './types';
import styles from './CreateProposal.module.scss';

const MAX_INPUT_LENGTH = 500;

type ProposalInputsProps = {
  state: State;
  setState: Dispatch<SetStateAction<State>>;
};

export function ProposalInputs({ state, setState }: ProposalInputsProps) {
  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      [targetName]: targetValue
    }));
  };

  const onProposalTypeValueChange = (value: ProposalVotingAccessEnum) => {
    setState((prevState) => ({
      ...prevState,
      internal: value === ProposalVotingAccessEnum.MEMBER
    }));
  };

  return (
    <div className={styles['proposal-input-container']}>
      <Input
        name={InputName.TITLE}
        label={InputLabel.TITLE}
        value={state.title}
        onChange={onInputChange}
        maxLength={MAX_INPUT_LENGTH}
        hint={
          <Typography variant="caption3">{state.title.length}/500</Typography>
        }
        required
      />

      <Input
        name={InputName.DESCRIPTION}
        label={InputLabel.DESCRIPTION}
        value={state.description}
        onChange={onInputChange}
        maxLength={MAX_INPUT_LENGTH}
        hint={
          <Typography variant="caption3">
            {state.description.length}/500
          </Typography>
        }
        required
      />
      <div className={styles['proposal-input-vote-access']}>
        <Select onValueChange={onProposalTypeValueChange}>
          <SelectTrigger className={styles.trigger}>
            <SelectValue>{ProposalVotingAccessEnum.MEMBER}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ProposalVotingAccessEnum).map(
              ([_proposalKey, _proposalValue]) => (
                <SelectItem value={_proposalValue} key={_proposalKey}>
                  <Typography variant="button1">{_proposalValue}</Typography>
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
