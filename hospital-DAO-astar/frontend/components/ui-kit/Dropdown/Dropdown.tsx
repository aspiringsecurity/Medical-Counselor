import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactElement,
  ReactNode,
  Children,
  cloneElement,
  HTMLProps
} from 'react';
import { Modifier, usePopper } from 'react-popper';
import clsx from 'clsx';

import { useIsomorphicLayoutEffect } from 'hooks/useIsomorphicLayoutEffect';
import { handleEnterKeyPress, handleEscKeyPress } from 'utils/keyHandler';

import styles from './Dropdown.module.scss';

export interface DropdownProps {
  dropdownItems: ReactNode;
  children: ReactElement;
  className?: string;
  fullWidth?: boolean;
}

export function Dropdown({
  children,
  className,
  dropdownItems,
  fullWidth = false
}: DropdownProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false);

  const modifiers = useMemo(() => {
    const _modifiers: Modifier<string, Record<string, unknown>>[] = [
      {
        name: 'offset',
        options: { offset: [0, 7] }
      },
      {
        name: 'preventOverflow',
        options: { altAxis: true, padding: 20 }
      }
    ];

    if (fullWidth) {
      _modifiers.push({
        name: 'sameWidth',
        enabled: true,
        phase: 'beforeWrite',
        requires: ['computeStyles'],
        fn({ state }) {
          // eslint-disable-next-line no-param-reassign
          state.styles.popper.minWidth = `${state.rects.reference.width}px`;
        },
        effect({ state }) {
          // @ts-ignore
          // eslint-disable-next-line no-param-reassign
          state.elements.popper.style.minWidth = `${state.elements.reference.offsetWidth}px`;
        }
      });
    }
    return _modifiers;
  }, [fullWidth]);

  const {
    styles: popperStyles,
    attributes,
    update
  } = usePopper(referenceElement, popperElement, {
    modifiers,
    placement: 'bottom'
  });

  const child = Children.only(children);

  useIsomorphicLayoutEffect(() => {
    if (show && update) {
      update();
    }
  }, [show]);

  const toggleDropdown = useCallback(() => {
    const { onClick } = child.props;

    setShow((state) => !state);
    if (onClick) {
      onClick();
    }
  }, [child.props]);

  const hideDropdown = useCallback(() => {
    setShow(false);
  }, []);

  useEffect(() => {
    if (!show) return undefined;

    const handleClick = (e: Event) => {
      if (
        popperElement &&
        referenceElement &&
        !referenceElement.contains(e.target as Node)
      ) {
        setTimeout(() => {
          hideDropdown();
        }, 0);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      handleEnterKeyPress(handleClick.bind(null, e))(e);
      handleEscKeyPress(hideDropdown)(e);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [popperElement, referenceElement, show, hideDropdown]);

  return (
    <>
      {cloneElement<HTMLProps<HTMLElement>>(child, {
        ref: setReferenceElement,
        onClick: toggleDropdown,
        onKeyDown: handleEnterKeyPress(toggleDropdown)
      })}
      {show && (
        <div
          ref={setPopperElement}
          style={popperStyles.popper}
          className={clsx(styles.root, { [styles.show]: show }, className)}
          {...attributes.popper}
        >
          {dropdownItems}
        </div>
      )}
    </>
  );
}
