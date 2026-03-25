
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import clsx from 'clsx';
import { useNavigate } from '@tanstack/react-router';
import { MoveLeft } from 'lucide-react';

export type HeaderHandle = {
  getHeight: () => number;
  el?: HTMLDivElement | null;
};

export type CustomComponentDef = {
  id?: string | number;
  render: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  position?: number;
  hiddenOnMobile?: boolean;
};

export type HeaderProps = {
  title?: string;
  showBorder?: boolean;
  /** array of left components; if not provided → default back button shown */
  leftComponents?: CustomComponentDef[];
  /** array of right components */
  rightComponents?: CustomComponentDef[];
  /** hide default back button completely */
  hideBackButton?: boolean;
  /** custom back handler (replaces default history logic) */
  backIconCustomHandler?: () => void;
  /** fallback route if there’s no browser history */
  backTo?: string;
  /** optional right text button */
  showRightText?: string;
  rightTextOnClick?: () => void;
  /** optional inline progress bar */
  progressBar?: { show?: boolean; percent?: number };
  /** optional custom element instead of title (search, filter, etc.) */
  centerComponent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const sortByPosition = (arr?: CustomComponentDef[]) =>
  (arr ?? [])
    .slice()
    .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));

const Header = forwardRef<HeaderHandle, HeaderProps>(
  (
    {
      title = '',
      showBorder = true,
      leftComponents,
      rightComponents,
      hideBackButton = false,
      backIconCustomHandler,
      backTo = '/',
      showRightText,
      rightTextOnClick,
      progressBar,
      centerComponent,
      className,
      style,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const elRef = useRef<HTMLDivElement | null>(null);

    // expose header height
    useImperativeHandle(
      ref,
      () => ({
        getHeight: () => elRef.current?.getBoundingClientRect().height ?? 0,
        el: elRef.current ?? null,
      }),
      []
    );

    

const handleDefaultBack = () => {
  if (backIconCustomHandler) {
    backIconCustomHandler();
    return;
  }

  // Browser history back
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigate({ to: backTo });
  }
};


    const leftSorted = sortByPosition(leftComponents);
    const rightSorted = sortByPosition(rightComponents);

    return (
      <div
        ref={elRef}
        className={clsx(
          'sticky top-0 z-40 bg-white',
          showBorder && 'border-b border-[#E6E8EC]',
          className
        )}
        style={{
          WebkitBackdropFilter: 'saturate(110%) blur(6px)',
          backdropFilter: 'saturate(110%) blur(6px)',
          ...style,
        }}
      >
        <div className="w-full mx-auto px-3">
          <div className="flex items-center justify-between py-4 w-full">
            {/* LEFT SIDE: Back + Title */}
            <div className="flex items-center gap-1 min-w-[56px]">
              {/* Left Components */}
              {leftSorted.length > 0 ? (
                leftSorted.map((c, i) => (
                  <button
                    key={c.id ?? i}
                    aria-label={c.ariaLabel ?? `left-${i}`}
                    onClick={c.onClick}
                    className={clsx(
                      'w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-100 transition',
                      c.hiddenOnMobile && 'hidden sm:flex'
                    )}
                  >
                    {c.render}
                  </button>
                ))
              ) : !hideBackButton ? ( // Default Back Button
                <button
                  aria-label="Back"
                  onClick={handleDefaultBack}
                  className="w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 rounded-md flex items-center justify-center hover:bg-gray-100 transition flex-shrink-0"
                >
                  <MoveLeft />
                </button>
              ) : null}

              {/* Title or Custom Center Component */}
              {centerComponent ? (
                <div className="flex items-center">{centerComponent}</div>
              ) : (
                <h1
                  className="
                    font-inter 
                    font-medium 
                    text-lg sm:text-xl xl:text-[24px]
                    leading-tight sm:leading-7 xl:leading-[36px]
                    text-black
                    truncate
                    flex-1
                  "
                  title={title}
                >
                  {title}
                </h1>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 min-w-[56px] ml-auto ">
              {showRightText && (
                <button
                  onClick={rightTextOnClick}
                  className="text-sm font-medium text-[#6c47ff] px-3 py-2 rounded-md hover:bg-gray-50"
                >
                  {showRightText}
                </button>
              )}
              {rightSorted.map((c, i) => (
                <button
                  key={c.id ?? i}
                  aria-label={c.ariaLabel ?? `right-${i}`}
                  onClick={c.onClick}
                  className={clsx(
                    'flex items-center justify-center hover:bg-gray-100 transition',
                    c.hiddenOnMobile && 'hidden sm:flex'
                  )}
                >
                  {c.render}
                </button>
              ))}
            </div>
          </div>

          {/* optional thin progress bar */}
          {progressBar?.show && (
            <div className="h-1 bg-[#F3F4F6] rounded-b-xl overflow-hidden">
              <div
                className="h-full bg-[#6c47ff] transition-all"
                style={{
                  width: `${Math.max(0, Math.min(100, progressBar.percent ?? 0))}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

Header.displayName = 'Header';
export default Header;
