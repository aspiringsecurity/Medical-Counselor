import React, { forwardRef } from 'react';
import clsx from 'clsx';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Icon } from 'components/ui-kit/Icon';

import styles from './Checkbox.module.scss';

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={clsx(styles.root, className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator asChild>
        <Icon name="tick" size="xs" color="white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
