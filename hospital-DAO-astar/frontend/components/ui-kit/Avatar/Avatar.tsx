import { HTMLAttributes } from 'react';
import clsx from 'clsx';
import { stringAvatar } from 'utils/stringAvatar';

import styles from './Avatar.module.scss';

type RadiusType = 'rounded' | 'standard';

export interface AvatarProps extends HTMLAttributes<HTMLInputElement> {
  value: string;
  radius?: RadiusType;
}

export function Avatar({ value, className, radius = 'standard' }: AvatarProps) {
  const { color, backgroundColor, children } = stringAvatar(value);
  return (
    <span
      style={{ backgroundColor, color }}
      className={clsx(styles.root, styles[radius], className)}
    >
      {children}
    </span>
  );
}
