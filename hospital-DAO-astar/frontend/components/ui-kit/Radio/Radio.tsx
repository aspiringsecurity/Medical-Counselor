import React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import clsx from 'clsx';

import styles from './Radio.module.scss';
import { Icon } from '../Icon';

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(function RadioGroup({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Root
      className={clsx(styles.root, className)}
      {...props}
      ref={ref}
    />
  );
});

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function RadioGroupItem({ className, children, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={clsx(styles.item, className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className={styles.indicator}>
        <Icon name="circle" className={styles.icon} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
