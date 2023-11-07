import { ChangeEventHandler, Dispatch, SetStateAction } from 'react';
import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import styles from './CreateProject.module.scss';

type ProjectAttributeProps = {
  state: any;
  setState: Dispatch<SetStateAction<string>>;
};

export function ProjectAttribute({ state, setState }: ProjectAttributeProps) {
  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetValue = target.value;

    setState(targetValue);
  };

  return (
    <div>
      <Typography variant="h3">Attribute Info</Typography>
      <Typography variant="body1">Choose a name for the attribute.</Typography>

      <div>
        <Input
          name="project-attribute"
          label="Attribute"
          value={state.name}
          onChange={onInputChange}
          required
        />
      </div>
    </div>
  );
}
