import { AnchorHTMLAttributes } from 'react';
import NextLink, { LinkProps as InternalLinkProps } from 'next/link';
import clsx from 'clsx';

import { Icon, IconNamesType } from 'components/ui-kit/Icon';
import { Typography, TypographyVariants } from 'components/ui-kit/Typography';

import styles from './NavLink.module.scss';

export interface NavLinkProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof InternalLinkProps
  > {
  icon?: IconNamesType;
  active?: boolean;
  title: string;
  titleVariant?: TypographyVariants;
}

export function NavLink({
  children,
  className,
  icon,
  title,
  active = false,
  titleVariant = 'title8',
  ...props
}: NavLinkProps & InternalLinkProps) {
  return (
    <NextLink
      className={clsx(
        styles.root,
        {
          [styles['active-button']]: active,
          [styles['with-icon']]: !!icon
        },
        className
      )}
      {...props}
    >
      {icon && (
        <Icon
          className={clsx(styles.icon, { [styles['active-icon']]: active })}
          name={icon}
        />
      )}
      <Typography variant={titleVariant}>{title}</Typography>
    </NextLink>
  );
}
