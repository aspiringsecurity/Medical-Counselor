import { ElementType, forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Typography.module.scss';

export type TypographyVariants =
  | 'display1'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'title4'
  | 'title5'
  | 'title6'
  | 'title7'
  | 'title8'
  | 'paragraph1'
  | 'paragraph2'
  | 'body1'
  | 'body2'
  | 'label1'
  | 'label2'
  | 'label3'
  | 'caption1'
  | 'caption2'
  | 'caption3'
  | 'value1'
  | 'value2'
  | 'value3'
  | 'value4'
  | 'value5'
  | 'value6'
  | 'value7'
  | 'value8'
  | 'button1'
  | 'button2';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant: TypographyVariants;
  as?: ElementType;
}

const elementsByVariants: Record<TypographyVariants, ElementType> = {
  display1: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  title1: 'p',
  title2: 'p',
  title3: 'p',
  title4: 'p',
  title5: 'p',
  title6: 'p',
  title7: 'p',
  title8: 'p',
  paragraph1: 'p',
  paragraph2: 'p',
  body1: 'p',
  body2: 'p',
  label1: 'span',
  label2: 'span',
  label3: 'span',
  caption1: 'span',
  caption2: 'span',
  caption3: 'span',
  value1: 'p',
  value2: 'p',
  value3: 'p',
  value4: 'p',
  value5: 'p',
  value6: 'p',
  value7: 'p',
  value8: 'p',
  button1: 'p',
  button2: 'p'
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  function BaseTypography(
    { as = 'p', children, variant, className, ...restProps },
    ref
  ) {
    const Tag = as || elementsByVariants[variant];

    return (
      <Tag
        className={clsx(styles.root, styles[variant], className)}
        ref={ref}
        {...restProps}
      >
        {children}
      </Tag>
    );
  }
);
