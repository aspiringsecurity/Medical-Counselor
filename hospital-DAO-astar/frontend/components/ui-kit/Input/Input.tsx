import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useId,
  useState
} from 'react';
import clsx from 'clsx';
import * as Label from '@radix-ui/react-label';

import styles from './Input.module.scss';

type InputVariant = 'standard' | 'outlined';
type InputPadding = 'md' | 'lg';
type InputHintPosition = 'start' | 'end';

type InputClassNames = {
  root?: string;
  input?: string;
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  label?: string;
  variant?: InputVariant;
  padding?: InputPadding;
  hint?: ReactNode;
  hintPosition?: InputHintPosition;
  classNames?: InputClassNames;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = 'standard',
    classNames,
    startAdornment,
    endAdornment,
    color,
    label,
    error,
    hint,
    padding = 'md',
    disabled,
    hintPosition = 'start',
    ...otherProps
  },
  ref
) {
  const [inputNode, setInputNode] = useState<HTMLInputElement>();
  const inputRef = useCallback(
    (node: HTMLInputElement) => {
      if (!node) {
        return;
      }
      setInputNode(node);

      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(node);
      } else {
        // eslint-disable-next-line no-param-reassign
        ref.current = node;
      }
    },
    [ref]
  );

  const id = useId();

  return (
    <div
      className={clsx(
        styles.root,
        styles[`root-${padding}`],
        styles[`root-${variant}`],
        {
          [styles.error]: error,
          [styles.disabled]: disabled
        },
        classNames?.root
      )}
    >
      {startAdornment}
      <input
        id={id}
        disabled={disabled}
        className={clsx(
          styles.input,
          styles[`input-${variant}`],
          styles[`input-${padding}`],
          {
            [styles['start-adornment']]: !!startAdornment,
            [styles['end-adornment']]: !!endAdornment,
            [styles.error]: error
          },
          classNames?.input
        )}
        {...otherProps}
        ref={inputRef}
      />
      {label && (
        <Label.Root
          className={clsx(styles.label, styles[`label-${variant}`], {
            [styles['start-adornment']]: !!startAdornment,
            [styles.error]: error,
            [styles.dirty]: !!inputNode?.value
          })}
          htmlFor={id}
        >
          {label}
        </Label.Root>
      )}
      {hint && (
        <span className={clsx(styles.hint, styles[`hint-${hintPosition}`])}>
          {hint}
        </span>
      )}
      {endAdornment}
    </div>
  );
});
