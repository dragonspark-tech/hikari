import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode } from 'react';
import { RiHomeOfficeFill } from 'react-icons/ri';
import { Link } from '@tanstack/react-router';
import { MdGradient } from 'react-icons/md';
import { BsGithub } from 'react-icons/bs';

export const SideNav = () => {
  return (
    <nav className="h-full w-fit bg-stone-950 p-4 flex flex-col items-center justify-between gap-2">
      <div className="w-full flex flex-col items-center gap-4">
        <img src="/hikarifire.png" width={40} alt="hikari" />
        <NavItem to="/">
          <RiHomeOfficeFill />
        </NavItem>
        <NavItem to="/morph-gradient">
          <MdGradient />
        </NavItem>
      </div>
      <div></div>
      <div className="w-full flex flex-col items-center gap-4">
        <NavItem to="https://github.com/dragonspark-tech/hikari">
          <BsGithub />
        </NavItem>
      </div>
    </nav>
  );
};

interface NavItemProps {
  children: ReactNode;
  to: string;
}

const NavItem = ({ to, children }: NavItemProps) => {
  return (
    <Link
      to={to}
      preload="intent"
      className="p-3 text-xl bg-stone-800 hover:bg-stone-700 hover:cursor-pointer hover:scale-[105%] active:scale-[95%] rounded-md transition-colors relative"
    >
      {({ isActive }) => (
        <>
          <span className="block relative z-10">{children}</span>
          <AnimatePresence>
            {isActive && (
              <motion.span
                className="absolute inset-0 rounded-md bg-cyan-600 z-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              ></motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </Link>
  );
};
