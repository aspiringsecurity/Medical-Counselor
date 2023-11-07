import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

import styles from './Chip.module.scss';

type ChipVariant = 'filter' | 'group' | 'status' | 'task' | 'proposal';

type ChipColor =
  | 'default'
  | 'active'
  | 'green'
  | 'blue'
  | 'red'
  | 'orange'
  | 'dark-blue'
  | 'dark-green';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  children: ReactNode;
  color?: ChipColor;
}

export function Chip({
  className,
  children,
  variant = 'filter',
  color = 'default',
  ...otherProps
}: ChipProps) {
  return (
    <div
      className={clsx(
        styles.root,
        styles[variant],
        styles[`color-${color}`],
        className
      )}
      {...otherProps}
    >
      {children}
    </div>
  );
}
