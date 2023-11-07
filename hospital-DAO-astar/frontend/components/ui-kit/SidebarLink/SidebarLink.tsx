import { AnchorHTMLAttributes } from 'react';
import NextLink, { LinkProps as InternalLinkProps } from 'next/link';
import clsx from 'clsx';

import styles from './SidebarLink.module.scss';

export interface LinkProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof InternalLinkProps
  > {
  active?: boolean;
}

export function SidebarLink({
  active = false,
  children,
  className,
  ...props
}: LinkProps & InternalLinkProps) {
  return (
    <NextLink
      className={clsx(styles.root, { [styles.active]: active }, className)}
      {...props}
    >
      {children}
    </NextLink>
  );
}
