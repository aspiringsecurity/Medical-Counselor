import Image from 'next/image';

import { Typography } from 'components/ui-kit/Typography';

import styles from './Hero.module.scss';

export function Hero() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Image src="/logo/toyota.svg" alt="toyota-symbol" fill />
      </div>

      <Typography className={styles.title} variant="paragraph1">
        Welcome to Toyota DAO
      </Typography>
    </div>
  );
}
