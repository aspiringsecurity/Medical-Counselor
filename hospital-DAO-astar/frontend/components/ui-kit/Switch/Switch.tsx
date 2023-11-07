import React from 'react';
import clsx from 'clsx';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import styles from './Switch.module.scss';

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitives.Root
      className={clsx(styles.root, className)}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb className={clsx(styles.thumb)} />
    </SwitchPrimitives.Root>
  );
});
