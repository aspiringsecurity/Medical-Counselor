import { ChangeEventHandler, Dispatch, SetStateAction } from 'react';

import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import type { InfoState } from './types';
import styles from './CreateProject.module.scss';

const PURPOSE_INPUT_MAX_LENGTH = 500;

enum InputName {
  NAME = 'name',
  DESCRIPTION = 'description'
}

enum InputLabel {
  NAME = '* Project Name',
  DESCRIPTION = '* description'
}

type ProjectInfoProps = {
  state: InfoState;
  setState: Dispatch<SetStateAction<InfoState>>;
};

export function ProjectInfo({ state, setState }: ProjectInfoProps) {
  const onChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      [targetName]: targetValue
    }));
  };

  return (
    <div className={styles.info}>
      <Typography variant="h3">Project Info</Typography>
      <Input
        name={InputName.NAME}
        label={InputLabel.NAME}
        value={state.name}
        onChange={onChange}
        required
      />
      <Input
        name={InputName.DESCRIPTION}
        label={InputLabel.DESCRIPTION}
        onChange={onChange}
        value={state.description}
        maxLength={PURPOSE_INPUT_MAX_LENGTH}
        hint={
          <Typography variant="caption3">
            {state.description.length}/500
          </Typography>
        }
        hintPosition="end"
        required
      />
    </div>
  );
}
