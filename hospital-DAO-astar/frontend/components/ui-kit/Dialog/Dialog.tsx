import React from 'react';
import clsx from 'clsx';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { Icon } from 'components/ui-kit/Icon';
import { Button } from 'components/ui-kit/Button';

import styles from './Dialog.module.scss';

export const Dialog = DialogPrimitive.Root;

export const DialogTrigger = DialogPrimitive.Trigger;

function DialogPortal({
  className,
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) {
  return (
    <DialogPrimitive.Portal className={className} {...props}>
      {children}
    </DialogPrimitive.Portal>
  );
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, children, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      className={clsx(styles['dialog-overlay'], className)}
      {...props}
      ref={ref}
    />
  );
});

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    closeIcon?: boolean;
  }
>(function DialogContent(
  { closeIcon = false, className, children, ...props },
  ref
) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={clsx(styles.content, className)}
        {...props}
      >
        {children}
        {closeIcon && (
          <DialogPrimitive.Close className={styles['close-button']} asChild>
            <Button
              variant="icon"
              className={styles['close-button']}
              aria-label="Close"
            >
              <Icon name="close" size="sm" />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={clsx(styles.title, className)}
      {...props}
    />
  );
});

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description ref={ref} className={className} {...props} />
  );
});
