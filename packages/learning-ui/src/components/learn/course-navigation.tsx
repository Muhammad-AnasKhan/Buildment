"use client";

import { createContext, useContext, type ComponentType, type ComponentPropsWithRef, type ReactNode } from 'react';

type LinkProps = ComponentPropsWithRef<'a'> & { href: string };
const Navigation = createContext<{ Link?: ComponentType<LinkProps>; onNavigate?: (href: string) => void; assetBase?: string }>({});

/** Hosts supply routing and asset origins; course presentation stays shared. */
export function CourseNavigationProvider({ children, ...value }: {
  children: ReactNode;
  Link?: ComponentType<LinkProps>;
  onNavigate?: (href: string) => void;
  assetBase?: string;
}) {
  return <Navigation.Provider value={value}>{children}</Navigation.Provider>;
}
export function CourseLink({ href, onClick, ...props }: LinkProps) {
  const host = useContext(Navigation);
  if (host.Link) return <host.Link href={href} onClick={onClick} {...props} />;
  return <a {...props} href={href} onClick={(event) => {
    onClick?.(event);
    if (!event.defaultPrevented && host.onNavigate) {
      event.preventDefault();
      host.onNavigate(href);
    }
  }} />;
}
export function useCourseAssets() {
  const { assetBase = '' } = useContext(Navigation);
  return (path: string) => assetBase + path;
}
