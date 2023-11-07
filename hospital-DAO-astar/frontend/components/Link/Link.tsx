import { AnchorHTMLAttributes } from 'react';
import NextLink, { LinkProps as InternalLinkProps } from 'next/link';
import clsx from 'clsx';

import styles from './Link.module.scss';

type LinkVariant = 'icon' | 'text' | 'nav' | 'outlined' | 'filled';

export interface LinkProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof InternalLinkProps
  > {
  variant?: LinkVariant;
  active?: boolean;
}

export function Link({
  variant = 'text',
  active = false,
  children,
  className,
  ...props
}: LinkProps & InternalLinkProps) {
  return (
    <NextLink
      className={clsx(
        styles.root,
        styles[variant],
        { [styles.active]: active },
        className
      )}
      {...props}
    >
      {children}
    </NextLink>
  );
}
