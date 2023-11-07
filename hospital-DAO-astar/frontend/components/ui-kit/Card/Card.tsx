import { ReactNode } from 'react';
import clsx from 'clsx';

import styles from './Card.module.scss';

export interface CardProps {
  children?: ReactNode;
  dropdown?: boolean;
  className?: string;
}

export function Card({
  children,
  className,
  dropdown,
  ...otherProps
}: CardProps) {
  return (
    <div
      className={clsx(styles.root, { [styles.dropdown]: dropdown }, className)}
      {...otherProps}
    >
      {children}
    </div>
  );
}
