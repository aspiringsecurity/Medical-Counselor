import { MouseEventHandler, HTMLAttributes } from 'react';
import clsx from 'clsx';

import icons from 'icons';

import styles from './Icon.module.scss';

export type IconNamesType = keyof typeof icons;

export interface IconProps extends HTMLAttributes<SVGElement> {
  className?: string;
  name: IconNamesType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: MouseEventHandler<SVGElement> | undefined;
}

export function Icon({
  className,
  name,
  onClick,
  size = 'md',
  ...other
}: IconProps) {
  const { viewBox, url } = icons[name] as never;

  return (
    <span className={clsx(styles.root, styles[size])}>
      <svg
        viewBox={viewBox}
        className={clsx(styles.icon, className)}
        onClick={onClick}
        {...other}
      >
        <use xlinkHref={`/${String(url)}`} />
      </svg>
    </span>
  );
}
