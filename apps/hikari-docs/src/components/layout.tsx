import type { ReactNode } from 'react';
import { SideNav } from './navbar';
import { CopyrightBadge } from './copyright-badge';

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
    <div className="bg-stone-950 text-stone-100 flex h-screen w-screen">
      <SideNav />
      <div className="p-6 pl-0 pr-10 w-full h-full">
        <div className="bg-stone-900 w-full h-full rounded-2xl overflow-hidden">
          {/*<div className="h-[35px] m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800"></div>*/}
          {/*<div className="h-[400px] m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800"></div>*/}
          {children}
        </div>
      </div>
    </div>
    <CopyrightBadge />
    </>
  );
};