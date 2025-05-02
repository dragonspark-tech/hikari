export const CopyrightBadge = () => {
  return (
    <div
      className="
        fixed
        bottom-0
        right-0
        mb-4
        mr-4
        bg-stone-800
        text-white
        text-xs
        md:text-sm
        py-1
        px-2
        rounded
        shadow-lg
        z-50
      "
    >
      © {new Date().getFullYear()} DragonSpark | Hikari is licensed under the <a href="https://github.com/dragonspark-tech/hikari/blob/main/LICENSE.md" className="text-cyan-500">MIT license</a>.
    </div>
  );
};
