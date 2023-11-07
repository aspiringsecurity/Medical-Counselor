import React from 'react';
import clsx from 'clsx';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Icon } from 'components/ui-kit/Icon';

import styles from './Select.module.scss';

export const Select = SelectPrimitive.Root;

export const SelectGroup = SelectPrimitive.Group;

export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ asChild, className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={clsx(styles.trigger, className)}
      asChild={asChild}
      {...props}
    >
      {children}
      <Icon name="arrow-down" />
    </SelectPrimitive.Trigger>
  );
});

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={clsx(styles.content, className)}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className={styles['scroll-button']}>
          <Icon name="arrow-up" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className={clsx(styles.viewport)}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton
          className={clsx(styles['scroll-button'])}
        >
          <Icon name="arrow-down" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={clsx(styles.label, className)}
      {...props}
    />
  );
});

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={clsx(styles.item, className)}
      {...props}
    >
      <span className={styles['item-content']}>
        <SelectPrimitive.ItemIndicator className={clsx(styles.indicator)}>
          <Icon name="tick" size="xs" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
});
