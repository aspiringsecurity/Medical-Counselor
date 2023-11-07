import { useAtomValue } from 'jotai';
import { currentProjectAtom } from 'store/db';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';

import styles from './About.module.scss';

export function About() {
  const currentProject = useAtomValue(currentProjectAtom);

  if (!currentProject) {
    return null;
  }

  const { description } = currentProject;

  return (
    <Card className={styles.card}>
      <div className={styles.info}>
        <Typography variant="title4">About Project</Typography>
        <Typography variant="body2">{description}</Typography>
      </div>
    </Card>
  );
}
