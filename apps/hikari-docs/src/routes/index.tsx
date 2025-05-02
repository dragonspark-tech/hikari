import { createFileRoute, Link } from '@tanstack/react-router';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { type MouseEventHandler, useEffect, useState } from 'react';

export const Route = createFileRoute('/')({
  component: App
});

function App() {
  useEffect(() => {
    document.title = "Hikari GL - Home";
  }, []);

  const [scope, animate] = useAnimate();
  const [size, setSize] = useState({ columns: 0, rows: 0 });

  useEffect(() => {
    generateGridCount();
    window.addEventListener('resize', generateGridCount);
    return () => window.removeEventListener('resize', generateGridCount);
  }, []);

  const generateGridCount = () => {
    const columns = Math.floor(document.body.clientWidth / 75);
    const rows = Math.floor(document.body.clientHeight / 75);

    setSize({
      columns,
      rows
    });
  };

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (e) => {
    // @ts-expect-error The default event is missing an ID.
    const id = `#${e.target.id}`;
    animate(id, { background: '#00b8db00' }, { duration: 1.5 });
  };

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> = (e) => {
    // @ts-expect-error The default event is missing an ID.
    const id = `#${e.target.id}`;
    animate(id, { background: '#00b8dbff' }, { duration: 0.15 });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="text-gray-900 antialiased max-h-full overflow-hidden"
        key="main-index"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
      >
        <div className="bg-neutral-950 overflow-hidden w-full h-full">
          <div
            ref={scope}
            className="grid h-screen w-full grid-cols-[repeat(auto-fit,_minmax(75px,_1fr))] grid-rows-[repeat(auto-fit,_minmax(75px,_1fr))] overflow-hidden"
          >
            {[...Array(size.rows * size.columns)].map((_, i) => (
              <div
                key={i}
                id={`square-${i}`}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                className="h-full w-full border-[1px] border-neutral-900"
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-8">
            <img src='/hikarifire.png' width={250} alt="Hikari" />
            <h1 className="text-center text-7xl font-black uppercase text-white sm:text-8xl md:text-9xl">
              Hikari GL
            </h1>

            <p className="mb-6 mt-4 max-w-3xl text-center text-lg font-light text-neutral-400 md:text-xl font-semibold">
              Bring stunning 2D and 3D graphics to your browser apps in minutes.<br/>
              Hikari is a modular collection of JavaScript libraries that makes WebGL approachable.
            </p>

            <Link to="/morph-gradient" className="transition-all pointer-events-auto bg-cyan-500 rounded-lg px-4 py-2 text-xl font-bold uppercase text-neutral-950 mix-blend-difference z-[500] cursor-pointer hover:scale-[105%]">
              Let's get started
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
