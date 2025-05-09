import 'react-color-palette/css';

import 'github-markdown-css/github-markdown-dark.css';
import { createFileRoute } from '@tanstack/react-router';
import { type DockItem, FloatingDock } from '../components/floating-dock';
import { BalatroGradientCanvas, type BalatroGradientInitCallback } from '@dragonspark/hikari-react';
import { IoColorFilterSharp } from 'react-icons/io5';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HiMiniPlay, HiMiniStop } from 'react-icons/hi2';
import { ModalBody, ModalContent, ModalContext } from '../components/animated-modal';
import { ColorPicker, ColorService, type IColor, useColor } from 'react-color-palette';
import { cn } from '../lib/utils';
import { BalatroGradient } from '@dragonspark/hikari-effects';
import { LabelInputContainer } from '../components/label-input-container';
import { Label } from '../components/label';
import { Input } from '../components/input';
import { RiColorFilterFill, RiColorFilterLine } from 'react-icons/ri';
import { AnimatePresence, motion } from 'motion/react';
import { LuBlocks, LuScale3D } from 'react-icons/lu';
import { BiReset } from 'react-icons/bi';
import { RangePicker } from '../components/range-picker';
import { CgColorPicker } from 'react-icons/cg';
import { BsSpeedometer } from 'react-icons/bs';
import { MdOutlineInvertColors, MdOutlineRotateRight, MdOutlineSettings } from 'react-icons/md';
import { TbRotate360 } from 'react-icons/tb';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { AiOutlineBlock } from 'react-icons/ai';

export const Route = createFileRoute('/balatro-gradient')({
  component: RouteComponent
});

const DEFAULTS = {
  SPIN_ROTATION: -2.0,
  SPIN_SPEED: 7.0,
  OFFSET: [0.0, 0.0] as [number, number],
  COLOR1: '#408A79',
  COLOR2: '#57B7EA',
  COLOR3: '#09235C',
  CONTRAST: 3.5,
  LIGHTING: 0.4,
  SPIN_AMOUNT: 0.25,
  PIXEL_FILTER: 2000.0,
  SPIN_EASE: 1.0,
  IS_ROTATE: false,
  MOUSE_INTERACTION: false,
  WIREFRAME: false
};

function RouteComponent() {
  useEffect(() => {
    document.title = 'Hikari GL - Balatro Gradient';
  }, []);

  // Gradient ref
  const gradientRef = useRef<BalatroGradient>(null);
  const onInitGradient: BalatroGradientInitCallback = (gradient) =>
    (gradientRef.current = gradient);

  // Color properties
  const [colorOpen, setColorOpen] = useState<boolean>(false);
  const [color1, setColor1] = useColor(DEFAULTS.COLOR1);
  const [color2, setColor2] = useColor(DEFAULTS.COLOR2);
  const [color3, setColor3] = useColor(DEFAULTS.COLOR3);

  // Spin properties
  const [spinOpen, setSpinOpen] = useState<boolean>(false);
  const [spinRotation, setSpinRotation] = useState<number>(DEFAULTS.SPIN_ROTATION);
  const [spinSpeed, setSpinSpeed] = useState<number>(DEFAULTS.SPIN_SPEED);
  const [spinAmount, setSpinAmount] = useState<number>(DEFAULTS.SPIN_AMOUNT);
  const [spinEase, setSpinEase] = useState<number>(DEFAULTS.SPIN_EASE);
  const [isRotate, setIsRotate] = useState<boolean>(DEFAULTS.IS_ROTATE);

  // Visual properties
  const [visualOpen, setVisualOpen] = useState<boolean>(false);
  const [contrast, setContrast] = useState<number>(DEFAULTS.CONTRAST);
  const [lighting, setLighting] = useState<number>(DEFAULTS.LIGHTING);
  const [pixelFilter, setPixelFilter] = useState<number>(DEFAULTS.PIXEL_FILTER);
  const [offset, setOffset] = useState<[number, number]>(DEFAULTS.OFFSET);

  // Misc properties
  const [playGradient, setPlayGradient] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(DEFAULTS.WIREFRAME);
  const [mouseInteraction, setMouseInteraction] = useState<boolean>(DEFAULTS.MOUSE_INTERACTION);

  // Viewport
  const [snippetOpen, setSnippetOpen] = useState<boolean>(false);

  const resetDefaults = () => {
    setColor1(ColorService.convert('hex', DEFAULTS.COLOR1));
    setColor2(ColorService.convert('hex', DEFAULTS.COLOR2));
    setColor3(ColorService.convert('hex', DEFAULTS.COLOR3));
    setSpinRotation(DEFAULTS.SPIN_ROTATION);
    setSpinSpeed(DEFAULTS.SPIN_SPEED);
    setSpinAmount(DEFAULTS.SPIN_AMOUNT);
    setSpinEase(DEFAULTS.SPIN_EASE);
    setIsRotate(DEFAULTS.IS_ROTATE);
    setContrast(DEFAULTS.CONTRAST);
    setLighting(DEFAULTS.LIGHTING);
    setPixelFilter(DEFAULTS.PIXEL_FILTER);
    setOffset(DEFAULTS.OFFSET);
    setShowWireframe(DEFAULTS.WIREFRAME);
    setMouseInteraction(DEFAULTS.MOUSE_INTERACTION);
    setPlayGradient(true);
    setSnippetOpen(false);
  };

  const dockItems: DockItem[] = [
    {
      title: 'Colors',
      icon: <IoColorFilterSharp className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => setColorOpen(true)
    },
    {
      title: 'Spin Parameters',
      icon: <TbRotate360 className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => setSpinOpen(true)
    },
    {
      title: 'Visual Parameters',
      icon: <MdOutlineSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => setVisualOpen(true)
    },
    {
      title: 'Toggle Mouse Interaction',
      icon: mouseInteraction ? (
        <RiColorFilterFill className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ) : (
        <RiColorFilterLine className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => setMouseInteraction((prev) => !prev)
    },
    {
      title: playGradient ? 'Stop' : 'Play',
      icon: playGradient ? (
        <HiMiniStop className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ) : (
        <HiMiniPlay className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => setPlayGradient((p) => !p)
    },
    {
      title: 'Toggle Wireframe',
      icon: <LuScale3D className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => setShowWireframe((w) => !w)
    },
    {
      title: 'Copy Code',
      icon: <LuBlocks className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => setSnippetOpen((s) => !s)
    },
    {
      title: 'Reset defaults',
      icon: <BiReset className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => resetDefaults()
    }
  ];

  const [selectedColor, setSelectedColor] = useState<number>(0);
  const currentColor = useMemo(() => {
    switch (selectedColor) {
      case 1:
        return { color: color2, onChange: setColor2 };
      case 2:
        return { color: color3, onChange: setColor3 };
      default:
        return { color: color1, onChange: setColor1 };
    }
  }, [selectedColor, color1, setColor1, color2, setColor2, color3, setColor3]);

  const ActiveColorSelector = ({
    id,
    color,
    name
  }: {
    id: number;
    color: IColor;
    name: string;
  }) => {
    return (
      <div
        className={cn(
          'transition-all ease-in-out w-20 h-20 rounded-xl opacity-100 cursor-pointer overflow-hidden',
          selectedColor === id && 'ring-4 ring-stone-700 ring-offset-6 ring-offset-stone-900'
        )}
        style={{ backgroundColor: color.hex }}
        onClick={() => setSelectedColor(id)}
      >
        <div className="transition-opacity duration-400 w-full h-full opacity-0 hover:opacity-75 bg-stone-800 text-white flex align-bottom p-2 font-bold text-sm">
          {name}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!gradientRef.current) return;

    if (playGradient) {
      gradientRef.current.play();
    } else {
      gradientRef.current.pause();
    }
  }, [gradientRef, playGradient]);

  // Snippet Gen
  const builtSnippet = useMemo(() => {
    let codeSnippet = '<BalatroGradientCanvas';

    if (color1.hex !== DEFAULTS.COLOR1) codeSnippet += `\n  color1={'${color1.hex}'}`;
    if (color2.hex !== DEFAULTS.COLOR2) codeSnippet += `\n  color2={'${color2.hex}'}`;
    if (color3.hex !== DEFAULTS.COLOR3) codeSnippet += `\n  color3={'${color3.hex}'}`;

    if (spinRotation !== DEFAULTS.SPIN_ROTATION)
      codeSnippet += `\n  spinRotation={${spinRotation}}`;
    if (spinSpeed !== DEFAULTS.SPIN_SPEED) codeSnippet += `\n  spinSpeed={${spinSpeed}}`;
    if (spinAmount !== DEFAULTS.SPIN_AMOUNT) codeSnippet += `\n  spinAmount={${spinAmount}}`;
    if (spinEase !== DEFAULTS.SPIN_EASE) codeSnippet += `\n  spinEase={${spinEase}}`;
    if (isRotate !== DEFAULTS.IS_ROTATE) codeSnippet += `\n  isRotate={${isRotate}}`;

    if (contrast !== DEFAULTS.CONTRAST) codeSnippet += `\n  contrast={${contrast}}`;
    if (lighting !== DEFAULTS.LIGHTING) codeSnippet += `\n  lighting={${lighting}}`;
    if (pixelFilter !== DEFAULTS.PIXEL_FILTER) codeSnippet += `\n  pixelFilter={${pixelFilter}}`;

    if (offset[0] !== DEFAULTS.OFFSET[0] || offset[1] !== DEFAULTS.OFFSET[1])
      codeSnippet += `\n  offset={[${offset[0]}, ${offset[1]}]}`;

    if (showWireframe !== DEFAULTS.WIREFRAME) codeSnippet += `\n  wireframe={${showWireframe}}`;
    if (mouseInteraction !== DEFAULTS.MOUSE_INTERACTION)
      codeSnippet += `\n  mouseInteraction={${mouseInteraction}}`;

    codeSnippet += ' />';

    return `\`\`\`tsx\n${codeSnippet}\n\`\`\``;
  }, [
    color1,
    color2,
    color3,
    spinRotation,
    spinSpeed,
    spinAmount,
    spinEase,
    isRotate,
    contrast,
    lighting,
    pixelFilter,
    offset,
    showWireframe,
    mouseInteraction
  ]);

  return (
    <>
      <ModalContext.Provider value={{ open: colorOpen, setOpen: setColorOpen }}>
        <ModalBody>
          <ModalContent className="mt-2">
            <div className="text-2xl font-semibold text-neutral-300 flex flex-row align-middle content-center mb-4 gap-x-2">
              <IoColorFilterSharp size={32} />
              <span>Color Customization</span>
            </div>
            <div className="flex flex-row mt-4 mb-12 gap-x-8">
              <ActiveColorSelector color={color1} id={0} name={'Color 1'} />
              <ActiveColorSelector color={color2} id={1} name={'Color 2'} />
              <ActiveColorSelector color={color3} id={2} name={'Color 3'} />
            </div>
            <div className="bg-stone-900 opacity-100">
              <ColorPicker {...currentColor} />
            </div>
          </ModalContent>
        </ModalBody>
      </ModalContext.Provider>

      <ModalContext.Provider value={{ open: spinOpen, setOpen: setSpinOpen }}>
        <ModalBody>
          <ModalContent className="mt-2">
            <div className="text-2xl font-semibold text-neutral-300 flex flex-row align-middle content-center mb-4 gap-x-2">
              <TbRotate360 size={32} />
              <span>Spin Parameters</span>
            </div>
            <div className="flex flex-col mt-4 mb-12 gap-x-8">
              <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="spinRotation" className="flex flex-row gap-x-2">
                    <MdOutlineRotateRight /> Spin Rotation
                  </Label>
                  <RangePicker
                    id="spinRotation"
                    min={-10}
                    max={10}
                    step={0.1}
                    onChange={(e) =>
                      setSpinRotation(parseFloat(e.target?.value ?? DEFAULTS.SPIN_ROTATION))
                    }
                    value={spinRotation}
                  />
                  <Input
                    id="spinRotation"
                    placeholder="Spin Rotation (#)"
                    type="number"
                    value={spinRotation}
                    onChange={(e) =>
                      setSpinRotation(parseFloat(e.target?.value ?? DEFAULTS.SPIN_ROTATION))
                    }
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="spinSpeed" className="flex flex-row gap-x-2">
                    <BsSpeedometer /> Spin Speed
                  </Label>
                  <RangePicker
                    id="spinSpeed"
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={(e) =>
                      setSpinSpeed(parseFloat(e.target?.value ?? DEFAULTS.SPIN_SPEED))
                    }
                    value={spinSpeed}
                  />
                  <Input
                    id="spinSpeed"
                    placeholder="Spin Speed (#)"
                    type="number"
                    value={spinSpeed}
                    onChange={(e) =>
                      setSpinSpeed(parseFloat(e.target?.value ?? DEFAULTS.SPIN_SPEED))
                    }
                  />
                </LabelInputContainer>
              </div>
              <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="spinAmount" className="flex flex-row gap-x-2">
                    <GiPerspectiveDiceSixFacesRandom /> Spin Amount
                  </Label>
                  <RangePicker
                    id="spinAmount"
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(e) =>
                      setSpinAmount(parseFloat(e.target?.value ?? DEFAULTS.SPIN_AMOUNT))
                    }
                    value={spinAmount}
                  />
                  <Input
                    id="spinAmount"
                    placeholder="Spin Amount (#)"
                    type="number"
                    value={spinAmount}
                    onChange={(e) =>
                      setSpinAmount(parseFloat(e.target?.value ?? DEFAULTS.SPIN_AMOUNT))
                    }
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="spinEase" className="flex flex-row gap-x-2">
                    <GiPerspectiveDiceSixFacesRandom /> Spin Ease
                  </Label>
                  <RangePicker
                    id="spinEase"
                    min={0}
                    max={5}
                    step={0.1}
                    onChange={(e) => setSpinEase(parseFloat(e.target?.value ?? DEFAULTS.SPIN_EASE))}
                    value={spinEase}
                  />
                  <Input
                    id="spinEase"
                    placeholder="Spin Ease (#)"
                    type="number"
                    value={spinEase}
                    onChange={(e) => setSpinEase(parseFloat(e.target?.value ?? DEFAULTS.SPIN_EASE))}
                  />
                </LabelInputContainer>
              </div>
              <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRotate"
                    checked={isRotate}
                    onChange={(e) => setIsRotate(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isRotate" className="flex flex-row gap-x-2">
                    <MdOutlineRotateRight /> Auto Rotate
                  </Label>
                </LabelInputContainer>
              </div>
            </div>
          </ModalContent>
        </ModalBody>
      </ModalContext.Provider>

      <ModalContext.Provider value={{ open: visualOpen, setOpen: setVisualOpen }}>
        <ModalBody>
          <ModalContent className="mt-2">
            <div className="text-2xl font-semibold text-neutral-300 flex flex-row align-middle content-center mb-4 gap-x-2">
              <MdOutlineSettings size={32} />
              <span>Visual Parameters</span>
            </div>
            <div className="flex flex-col mt-4 mb-12 gap-x-8">
              <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="contrast" className="flex flex-row gap-x-2">
                    <MdOutlineInvertColors /> Contrast
                  </Label>
                  <RangePicker
                    id="contrast"
                    min={0.5}
                    max={10}
                    step={0.1}
                    onChange={(e) => setContrast(parseFloat(e.target?.value ?? DEFAULTS.CONTRAST))}
                    value={contrast}
                  />
                  <Input
                    id="contrast"
                    placeholder="Contrast (#)"
                    type="number"
                    value={contrast}
                    onChange={(e) => setContrast(parseFloat(e.target?.value ?? DEFAULTS.CONTRAST))}
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="lighting" className="flex flex-row gap-x-2">
                    <CgColorPicker /> Lighting
                  </Label>
                  <RangePicker
                    id="lighting"
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(e) => setLighting(parseFloat(e.target?.value ?? DEFAULTS.LIGHTING))}
                    value={lighting}
                  />
                  <Input
                    id="lighting"
                    placeholder="Lighting (#)"
                    type="number"
                    value={lighting}
                    onChange={(e) => setLighting(parseFloat(e.target?.value ?? DEFAULTS.LIGHTING))}
                  />
                </LabelInputContainer>
              </div>
              <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="pixelFilter" className="flex flex-row gap-x-2">
                    <AiOutlineBlock /> Pixel Filter
                  </Label>
                  <RangePicker
                    id="pixelFilter"
                    min={100}
                    max={2000}
                    step={50}
                    onChange={(e) =>
                      setPixelFilter(parseFloat(e.target?.value ?? DEFAULTS.PIXEL_FILTER))
                    }
                    value={pixelFilter}
                  />
                  <Input
                    id="pixelFilter"
                    placeholder="Pixel Filter (#)"
                    type="number"
                    value={pixelFilter}
                    onChange={(e) =>
                      setPixelFilter(parseFloat(e.target?.value ?? DEFAULTS.PIXEL_FILTER))
                    }
                  />
                </LabelInputContainer>
              </div>
              <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="offsetX" className="flex flex-row gap-x-2">
                    X Offset
                  </Label>
                  <RangePicker
                    id="offsetX"
                    min={-1}
                    max={1}
                    step={0.05}
                    onChange={(e) =>
                      setOffset([parseFloat(e.target?.value ?? DEFAULTS.OFFSET[0]), offset[1]])
                    }
                    value={offset[0]}
                  />
                  <Input
                    id="offsetX"
                    placeholder="X Offset (#)"
                    type="number"
                    value={offset[0]}
                    onChange={(e) =>
                      setOffset([parseFloat(e.target?.value ?? DEFAULTS.OFFSET[0]), offset[1]])
                    }
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="offsetY" className="flex flex-row gap-x-2">
                    Y Offset
                  </Label>
                  <RangePicker
                    id="offsetY"
                    min={-1}
                    max={1}
                    step={0.05}
                    onChange={(e) =>
                      setOffset([offset[0], parseFloat(e.target?.value ?? DEFAULTS.OFFSET[1])])
                    }
                    value={offset[1]}
                  />
                  <Input
                    id="offsetY"
                    placeholder="Y Offset (#)"
                    type="number"
                    value={offset[1]}
                    onChange={(e) =>
                      setOffset([offset[0], parseFloat(e.target?.value ?? DEFAULTS.OFFSET[1])])
                    }
                  />
                </LabelInputContainer>
              </div>
            </div>
          </ModalContent>
        </ModalBody>
      </ModalContext.Provider>

      <ModalContext.Provider value={{ open: snippetOpen, setOpen: setSnippetOpen }}>
        <ModalBody>
          <ModalContent className="mt-2">
            <div className="text-2xl font-semibold text-neutral-300 flex flex-row align-middle content-center mb-4 gap-x-2">
              <LuBlocks size={32} />
              <span>Code Snippet</span>
            </div>
            <div className="flex flex-col mt-4 mb-12 gap-x-8">
              <div className="markdown-body">
                <pre>
                  <code className="language-tsx">{builtSnippet.replace(/```tsx|```/g, '')}</code>
                </pre>
              </div>
            </div>
          </ModalContent>
        </ModalBody>
      </ModalContext.Provider>

      <div className="relative w-full h-full">
        <AnimatePresence mode="popLayout">
          <motion.div
            key="gradient-canvas"
            className="w-full h-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <BalatroGradientCanvas
              color1={color1.hex}
              color2={color2.hex}
              color3={color3.hex}
              spinRotation={spinRotation}
              spinSpeed={spinSpeed}
              spinAmount={spinAmount}
              spinEase={spinEase}
              isRotate={isRotate}
              contrast={contrast}
              lighting={lighting}
              pixelFilter={pixelFilter}
              offset={offset}
              mouseInteraction={mouseInteraction}
              onInit={onInitGradient}
              wireframe={showWireframe}
            />
          </motion.div>
        </AnimatePresence>

        <FloatingDock
          items={dockItems}
          desktopClassName="z-[999] absolute bottom-5 left-5"
          mobileClassName="z-[999] absolute bottom-5 left-5"
        />
      </div>
    </>
  );
}
