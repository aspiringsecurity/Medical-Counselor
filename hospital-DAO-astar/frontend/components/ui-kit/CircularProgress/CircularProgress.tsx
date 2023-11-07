import { Typography } from 'components/ui-kit/Typography';

import styles from './CircularProgress.module.scss';

type CircularProgressProps = {
  value: number;
};

export function CircularProgress({ value }: CircularProgressProps) {
  return (
    <div className={styles.box}>
      <div className={styles.percent}>
        <svg className={styles.svg}>
          <circle className={styles.circle} cx="30" cy="30" r="30" />
          <circle
            className={styles.circle}
            cx="30"
            cy="30"
            r="30"
            style={{
              strokeDashoffset: `calc(188 - (188 * ${value}) / 100)`
            }}
          />
        </svg>
        <div className={styles.number}>
          <Typography variant="body1">{value}%</Typography>
        </div>
      </div>
    </div>
  );
}
