import 'react-color-palette/css';

import 'github-markdown-css/github-markdown-dark.css';
import { createFileRoute } from '@tanstack/react-router';
import { type DockItem, FloatingDock } from '../components/floating-dock';
import { MorphGradientCanvas, type MorphGradientInitCallback } from '@dragonspark/hikari-react';
import { IoColorFilterSharp, IoDocument } from 'react-icons/io5';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PiWaveSineDuotone } from 'react-icons/pi';
import { MdOutlineInvertColors, MdScreenRotation, MdTransform } from 'react-icons/md';
import { HiMiniPlay, HiMiniStop } from 'react-icons/hi2';
import { GiAmplitude } from 'react-icons/gi';
import { ModalBody, ModalContent, ModalContext } from '../components/animated-modal';
import { ColorPicker, ColorService, type IColor, useColor } from 'react-color-palette';
import { cn } from '../lib/utils';
import { MorphGradient } from '@dragonspark/hikari-effects';
import { LabelInputContainer } from '../components/label-input-container';
import { Label } from '../components/label';
import { Input } from '../components/input';
import {
  RiColorFilterAiFill,
  RiColorFilterFill,
  RiColorFilterLine,
  RiSeedlingLine
} from 'react-icons/ri';
import { TbAxisX, TbAxisY, TbDelta, TbZoomInArea } from 'react-icons/tb';
import { AnimatePresence, motion } from 'motion/react';
import { LuBlocks, LuScale3D } from 'react-icons/lu';
import { markdown as GradientDocs } from '../docs/morph-gradient.md';
import { MdRenderer } from '../components/md-renderer';
import { BiReset } from 'react-icons/bi';
import { RangePicker } from '../components/range-picker';
import { CgColorPicker } from 'react-icons/cg';
import { useSnippetImporter } from '../components/morph-gradient/snippet-import';

export const Route = createFileRoute('/morph-gradient')({
  component: RouteComponent
});

const DEFAULTS = {
  BASE_COLOR: '#09235C',
  WAVE1_COLOR: '#57B7EA',
  WAVE2_COLOR: '#408A79',
  WAVE3_COLOR: '#408A79',
  AMPLITUDE: 320,
  SEED: 5,
  FREQ_X: 14e-5,
  FREQ_Y: 29e-5,
  FREQ_DELTA: 1e-5,
  ZOOM: 1,
  ROTATION: 0,
  DENSITY: [0.06, 0.16],
  WIREFRAME: false,
  APPLY_COLOR_MIX: false,
  COLOR_MIX_POWER: 5,
  COLOR_MIX_R: 0,
  COLOR_MIX_G: 0.4,
  COLOR_MIX_B: 0
};

function RouteComponent() {
  useEffect(() => {
    document.title = 'Hikari GL - Morph Gradient';
  }, []);

  // Gradient conf
  const gradientRef = useRef<MorphGradient>(null);
  const onInitGradient: MorphGradientInitCallback = (gradient) => (gradientRef.current = gradient);

  // Color properties
  const [colorOpen, setColorOpen] = useState<boolean>(false);
  const [baseColor, setBaseColor] = useColor(DEFAULTS.BASE_COLOR);
  const [waveColor1, setWaveColor1] = useColor(DEFAULTS.WAVE1_COLOR);
  const [waveColor2, setWaveColor2] = useColor(DEFAULTS.WAVE2_COLOR);
  const [waveColor3, setWaveColor3] = useColor(DEFAULTS.WAVE3_COLOR);

  // Wave properties
  const [waveOpen, setWaveOpen] = useState<boolean>(false);
  const [amplitude, setAmplitude] = useState<number>(DEFAULTS.AMPLITUDE);
  const [seed, setSeed] = useState<number>(DEFAULTS.SEED);
  const [freqX, setFreqX] = useState<number>(DEFAULTS.FREQ_X);
  const [freqY, setFreqY] = useState<number>(DEFAULTS.FREQ_Y);
  const [freqDelta, setFreqDelta] = useState<number>(DEFAULTS.FREQ_DELTA);

  // Transform properties
  const [transformOpen, setTransformOpen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(DEFAULTS.ZOOM);
  const [rotation, setRotation] = useState<number>(DEFAULTS.ROTATION);
  const [density, setDensity] = useState<number[]>(DEFAULTS.DENSITY);

  // Misc properties
  const [playGradient, setPlayGradient] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  // Color Mix
  const [colorMixOpen, setColorMixOpen] = useState<boolean>(false);
  const [applyColorMix, setApplyColorMix] = useState<boolean>(true);
  const [colorMixPower, setColorMixPower] = useState<number>(DEFAULTS.COLOR_MIX_POWER);
  const [colorMixR, setColorMixR] = useState<number>(DEFAULTS.COLOR_MIX_R);
  const [colorMixG, setColorMixG] = useState<number>(DEFAULTS.COLOR_MIX_G);
  const [colorMixB, setColorMixB] = useState<number>(DEFAULTS.COLOR_MIX_B);

  // Viewport
  const [viewDocs, setViewDocs] = useState<boolean>(false);

  const [snippetOpen, setSnippetOpen] = useState<boolean>(false);

  const resetDefaults = () => {
    setBaseColor(ColorService.convert('hex', DEFAULTS.BASE_COLOR));
    setWaveColor1(ColorService.convert('hex', DEFAULTS.WAVE1_COLOR));
    setWaveColor2(ColorService.convert('hex', DEFAULTS.WAVE2_COLOR));
    setWaveColor3(ColorService.convert('hex', DEFAULTS.WAVE3_COLOR));
    setAmplitude(DEFAULTS.AMPLITUDE);
    setSeed(DEFAULTS.SEED);
    setFreqX(DEFAULTS.FREQ_X);
    setFreqY(DEFAULTS.FREQ_Y);
    setFreqDelta(DEFAULTS.FREQ_DELTA);
    setZoom(DEFAULTS.ZOOM);
    setRotation(DEFAULTS.ROTATION);
    setDensity(DEFAULTS.DENSITY);
    setShowWireframe(DEFAULTS.WIREFRAME);
    setApplyColorMix(DEFAULTS.APPLY_COLOR_MIX);
    setColorMixPower(DEFAULTS.COLOR_MIX_POWER);
    setColorMixR(DEFAULTS.COLOR_MIX_R);
    setColorMixG(DEFAULTS.COLOR_MIX_G);
    setColorMixB(DEFAULTS.COLOR_MIX_B);
    setPlayGradient(true);
    setSnippetOpen(false);
    setViewDocs(false);
  };

  const dockItems: DockItem[] = [
    {
      title: 'Colors',
      icon: <IoColorFilterSharp className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => setColorOpen(true)
    },
    {
      title: 'Toggle Color Mix',
      icon: applyColorMix ? (
        <RiColorFilterFill className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ) : (
        <RiColorFilterLine className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => setApplyColorMix((c) => !c)
    },
    {
      title: 'ColorMix Parameters',
      icon: (
        <RiColorFilterAiFill className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => setColorMixOpen(true)
    },
    {
      title: 'Wave Parameters',
      icon: <PiWaveSineDuotone className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => setWaveOpen(true)
    },
    {
      title: 'Transform Parameters',
      icon: <MdTransform className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => setTransformOpen(true)
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
      title: 'View Docs',
      icon: <IoDocument className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => setViewDocs((d) => !d)
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
        return { color: waveColor1, onChange: setWaveColor1 };
      case 2:
        return { color: waveColor2, onChange: setWaveColor2 };
      case 3:
        return { color: waveColor3, onChange: setWaveColor3 };
      default:
        return { color: baseColor, onChange: setBaseColor };
    }
  }, [selectedColor, waveColor1, setWaveColor1, waveColor2, setWaveColor2, waveColor3, setWaveColor3, baseColor, setBaseColor]);

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

  const waveCoalescence = useMemo(
    () => [waveColor1.hex, waveColor2.hex, waveColor3.hex],
    [waveColor1, waveColor2, waveColor3]
  );

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
    let codeSnippet = '<MorphGradientCanvas';

    if (baseColor.hex !== DEFAULTS.BASE_COLOR) codeSnippet += `\n  baseColor={'${baseColor.hex}'}`;

    if (
      waveColor1.hex !== DEFAULTS.WAVE1_COLOR ||
      waveColor2.hex !== DEFAULTS.WAVE2_COLOR ||
      waveColor3.hex !== DEFAULTS.WAVE3_COLOR
    )
      codeSnippet += `\n  waveColors={['${waveColor1.hex}', '${waveColor2.hex}', '${waveColor3.hex}']}`;

    if (density[0] !== DEFAULTS.DENSITY[0] || density[1] !== DEFAULTS.DENSITY[1])
      codeSnippet += `\n  density={[${density[0]}, ${density[1]}]}`;

    if (zoom !== DEFAULTS.ZOOM) codeSnippet += `\n  zoom={${zoom}}`;

    if (rotation !== DEFAULTS.ROTATION) codeSnippet += `\n  rotation={${rotation}}`;

    if (amplitude !== DEFAULTS.AMPLITUDE) codeSnippet += `\n  amplitude={${amplitude}}`;

    if (seed !== DEFAULTS.SEED) codeSnippet += `\n  seed={${seed}}`;

    if (freqX !== DEFAULTS.FREQ_X) codeSnippet += `\n  freqX={${freqX}}`;

    if (freqY !== DEFAULTS.FREQ_Y) codeSnippet += `\n  freqY={${freqY}}`;

    if (freqDelta !== DEFAULTS.FREQ_DELTA) codeSnippet += `\n  freqDelta={${freqDelta}}`;

    if (showWireframe !== DEFAULTS.WIREFRAME) codeSnippet += `\n  wireframe={${showWireframe}}`;

    if (applyColorMix !== DEFAULTS.APPLY_COLOR_MIX)
      codeSnippet += `\n  applyColorMix={${applyColorMix}}`;

    if (colorMixPower !== DEFAULTS.COLOR_MIX_POWER)
      codeSnippet += `\n  colorMixPower={${colorMixPower}}`;

    if (
      colorMixR !== DEFAULTS.COLOR_MIX_R ||
      colorMixG !== DEFAULTS.COLOR_MIX_G ||
      colorMixB !== DEFAULTS.COLOR_MIX_B
    )
      codeSnippet += `\n  colorMixValues={[${colorMixR}, ${colorMixG}, ${colorMixB}]}`;

    codeSnippet += ' />';

    return `\`\`\`tsx\n${codeSnippet}\n\`\`\``;
  }, [
    baseColor,
    waveColor1,
    waveColor2,
    waveColor3,
    amplitude,
    seed,
    freqX,
    freqY,
    freqDelta,
    zoom,
    rotation,
    density,
    showWireframe,
    applyColorMix,
    colorMixPower,
    colorMixR,
    colorMixG,
    colorMixB
  ]);

  useSnippetImporter({
    setBaseColor,
    setWaveColor1,
    setWaveColor2,
    setWaveColor3,
    setDensity,
    setZoom,
    setRotation,
    setAmplitude,
    setSeed,
    setFreqX,
    setFreqY,
    setFreqDelta,
    setShowWireframe,
    setApplyColorMix,
    setColorMixPower,
    setColorMixR,
    setColorMixG,
    setColorMixB,
  });

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
              <ActiveColorSelector color={baseColor} id={0} name={'Base'} />
              <ActiveColorSelector color={waveColor1} id={1} name={'Wave 1'} />
              <ActiveColorSelector color={waveColor2} id={2} name={'Wave 2'} />
              <ActiveColorSelector color={waveColor3} id={3} name={'Wave 3'} />
            </div>
            <div className="bg-stone-900 opacity-100">
              <ColorPicker {...currentColor} />
            </div>
          </ModalContent>
        </ModalBody>
      </ModalContext.Provider>

      <ModalContext.Provider value={{ open: colorMixOpen, setOpen: setColorMixOpen }}>
        <ModalBody>
          <ModalContent className="mt-2">
            <div className="text-2xl font-semibold text-neutral-300 flex flex-row align-middle content-center mb-4 gap-x-2">
              <RiColorFilterAiFill size={32} />
              <span>ColorMix Customization</span>
            </div>
            <div className="flex flex-col mt-4 mb-12 gap-x-8">
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="colorMixPower" className="flex flex-row gap-x-2">
                    <MdOutlineInvertColors /> Mix Power
                  </Label>
                  <RangePicker
                    id="colorMixPower"
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={(e) =>
                      setColorMixPower(parseFloat(e.target?.value ?? DEFAULTS.COLOR_MIX_POWER))
                    }
                    value={colorMixPower}
                  />
                  <Input
                    id="colorMixPower"
                    placeholder="Mix Power (#)"
                    type="number"
                    value={colorMixPower}
                    onChange={(e) =>
                      setColorMixPower(parseFloat(e.target?.value ?? DEFAULTS.COLOR_MIX_POWER))
                    }
                  />
                </LabelInputContainer>
              </div>
            </div>
            <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
              <LabelInputContainer>
                <Label htmlFor="colorMixPower" className="flex flex-row gap-x-2">
                  <CgColorPicker /> Red Mix
                </Label>
                <RangePicker
                  id="colorMixR"
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(e) =>
                    setColorMixR(parseFloat(e.target?.value ?? DEFAULTS.COLOR_MIX_R))
                  }
                  value={colorMixR}
                />
                <Input
                  id="colorMixR"
                  placeholder="Red Mix (#)"
                  type="number"
                  value={colorMixR}
                  onChange={(e) =>
                    setColorMixR(parseFloat(e.target?.value ?? DEFAULTS.COLOR_MIX_R))
                  }
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="colorMixPower" className="flex flex-row gap-x-2">
                  <CgColorPicker /> Green Mix
                </Label>
                <RangePicker
                  id="colorMixG"
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(e) =>
                    setColorMixG(parseFloat(e.target?.value ?? DEFAULTS.COLOR_MIX_G))
                  }
                  value={colorMixG}
                />
                <Input
                  id="colorMixG"
                  placeholder="Green Mix (#)"
                  type="number"
                  value={colorMixG}
                  onChange={(e) =>
                    setColorMixG(parseFloat(e.target?.value ?? DEFAULTS.COLOR_MIX_G))
                  }
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="colorMixPower" className="flex flex-row gap-x-2">
                  <CgColorPicker /> Blue Mix (Current: {colorMixB})
                </Label>
                <RangePicker
                  id="colorMixB"
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(e) =>
                    setColorMixB(parseFloat(e.target?.value ?? DEFAULTS.COLOR_MIX_B))
                  }
                  value={colorMixB}
                />
                <Input
                  id="colorMixB"
                  placeholder="Blue Mix (#)"
                  type="number"
                  value={colorMixB}
                  onChange={(e) =>
                    setColorMixB(parseFloat(e.target?.value ?? DEFAULTS.COLOR_MIX_B))
                  }
                />
              </LabelInputContainer>
            </div>
          </ModalContent>
        </ModalBody>
      </ModalContext.Provider>

      <ModalContext.Provider value={{ open: waveOpen, setOpen: setWaveOpen }}>
        <ModalBody>
          <ModalContent className="mt-2">
            <div className="text-2xl font-semibold text-neutral-300 flex flex-row align-middle content-center mb-4 gap-x-2">
              <PiWaveSineDuotone size={32} />
              <span>Wave Parameters</span>
            </div>
            <div className="flex flex-col mt-4 mb-12 gap-x-8">
              <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="amplitude" className="flex flex-row gap-x-2">
                    <GiAmplitude /> Amplitude
                  </Label>
                  <Input
                    id="amplitude"
                    placeholder="Amplitude (#)"
                    type="number"
                    value={amplitude}
                    onChange={(e) =>
                      setAmplitude(parseFloat(e.target?.value ?? DEFAULTS.AMPLITUDE))
                    }
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="seed" className="flex flex-row gap-x-2">
                    <RiSeedlingLine /> Seed
                  </Label>
                  <Input
                    id="seed"
                    placeholder="Seed (#)"
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseFloat(e.target?.value ?? DEFAULTS.SEED))}
                  />
                </LabelInputContainer>
              </div>
              <div className="mt-6 mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="freqX" className="flex flex-row gap-x-2">
                    <TbAxisX /> Frequency in X axis
                  </Label>
                  <RangePicker
                    id="freqX"
                    min={0.00001}
                    max={0.00040}
                    step={0.00001}
                    onChange={(e) => setFreqX(parseFloat(e.target?.value ?? DEFAULTS.FREQ_X))}
                    value={freqX}
                  />
                  <Input
                    id="freqX"
                    placeholder="Freq. X (#)"
                    type="number"
                    value={freqX}
                    onChange={(e) =>
                      setFreqX(parseFloat(e.target?.value ?? DEFAULTS.FREQ_X))
                    }
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="freqY" className="flex flex-row gap-x-2">
                    <TbAxisY /> Frequency in Y axis
                  </Label>
                  <RangePicker
                    id="freqY"
                    min={0.00001}
                    max={0.00040}
                    step={0.00001}
                    onChange={(e) => setFreqY(parseFloat(e.target?.value ?? DEFAULTS.FREQ_Y))}
                    value={freqY}
                  />
                  <Input
                    id="freqY"
                    placeholder="Freq. Y (#)"
                    type="number"
                    value={freqY}
                    onChange={(e) =>
                      setFreqY(parseFloat(e.target?.value ?? DEFAULTS.FREQ_Y))
                    }
                  />
                </LabelInputContainer>
              </div>
              <div className="mt-2 mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="seed" className="flex flex-row gap-x-2">
                    <TbDelta /> Frequency Delta
                  </Label>
                  <RangePicker
                    id="freqDelta"
                    min={0.00001}
                    max={1}
                    step={0.01000}
                    onChange={(e) => setFreqDelta(parseFloat(e.target?.value ?? DEFAULTS.FREQ_DELTA))}
                    value={freqDelta}
                  />
                  <Input
                    id="freqDelta"
                    placeholder="Freq. Delta (#)"
                    type="number"
                    value={freqDelta}
                    onChange={(e) =>
                      setFreqDelta(parseFloat(e.target?.value ?? DEFAULTS.FREQ_DELTA))
                    }
                  />
                </LabelInputContainer>
              </div>
            </div>
          </ModalContent>
        </ModalBody>
      </ModalContext.Provider>

      <ModalContext.Provider value={{ open: transformOpen, setOpen: setTransformOpen }}>
        <ModalBody>
          <ModalContent className="mt-2">
            <div className="text-2xl font-semibold text-neutral-300 flex flex-row align-middle content-center mb-4 gap-x-2">
              <MdTransform size={32} />
              <span>Transform Parameters</span>
            </div>
            <div className="flex flex-col mt-4 mb-12 gap-x-8">
              <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="zoom" className="flex flex-row gap-x-2">
                    <TbZoomInArea /> Zoom Scale
                  </Label>
                  <RangePicker
                    id="zoom"
                    min={0.5}
                    max={5}
                    step={0.5}
                    onChange={(e) =>
                      setZoom(parseFloat(e.target?.value ?? DEFAULTS.ZOOM))
                    }
                    value={zoom}
                  />
                  <Input
                    id="zoom"
                    placeholder="Zoom Scale (#)"
                    type="number"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target?.value ?? DEFAULTS.ZOOM))}
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="seed" className="flex flex-row gap-x-2">
                    <MdScreenRotation /> Orthographic Rotation
                  </Label>
                  <RangePicker
                    id="rotation"
                    min={0}
                    max={365}
                    step={5}
                    onChange={(e) =>
                      setRotation(parseFloat(e.target?.value ?? DEFAULTS.ROTATION))
                    }
                    value={rotation}
                  />
                  <Input
                    id="rotation"
                    placeholder="Orthographic Rotation (#)"
                    type="number"
                    value={rotation}
                    onChange={(e) => setRotation(parseFloat(e.target?.value ?? DEFAULTS.ROTATION))}
                  />
                </LabelInputContainer>
              </div>
              <div className="mt-6 mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 w-full">
                <LabelInputContainer>
                  <Label htmlFor="densityX" className="flex flex-row gap-x-2">
                    <TbAxisX /> Mesh Density in X axis
                  </Label>
                  <RangePicker
                    id="densityX"
                    min={0.01}
                    max={0.5}
                    step={0.001}
                    onChange={(e) =>
                      setDensity([parseFloat(e.target?.value ?? DEFAULTS.DENSITY[0]), density[1]])
                    }
                    value={density[0]}
                  />
                  <Input
                    id="densityX"
                    placeholder="Mesh Density in X axis (#)"
                    type="number"
                    value={density[0]}
                    onChange={(e) => setDensity([parseFloat(e.target?.value ?? DEFAULTS.DENSITY[0]), density[1]])}
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="densityY" className="flex flex-row gap-x-2">
                    <TbAxisY /> Mesh Density in Y axis
                  </Label>
                  <RangePicker
                    id="densityY"
                    min={0.01}
                    max={0.5}
                    step={0.001}
                    onChange={(e) =>
                      setDensity([density[0], parseFloat(e.target?.value ?? DEFAULTS.DENSITY[1])])
                    }
                    value={density[1]}
                  />
                  <Input
                    id="densityY"
                    placeholder="Mesh Density in Y axis (#)"
                    type="number"
                    value={density[1]}
                    onChange={(e) => setDensity([density[0], parseFloat(e.target?.value ?? DEFAULTS.DENSITY[1])])}
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
                <MdRenderer markdown={builtSnippet} />
              </div>
            </div>
          </ModalContent>
        </ModalBody>
      </ModalContext.Provider>

      <div className="relative w-full h-full">
        <AnimatePresence mode="popLayout">
          {viewDocs ? (
            <motion.div
              key="gradient-docs"
              className="w-full max-h-full overflow-y-scroll flex flex-row align-middle justify-center bg-[#0d1117]"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div></div>
              <div className="markdown-body block h-fit">
                <MdRenderer markdown={GradientDocs} />
                <div className="min-h-[100px]">&nbsp;</div>
              </div>
              <div></div>
            </motion.div>
          ) : (
            <motion.div
              key="gradient-canvas"
              className="w-full h-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <MorphGradientCanvas
                baseColor={baseColor.hex}
                waveColors={waveCoalescence}
                wireframe={showWireframe}
                onInit={onInitGradient}
                amplitude={amplitude}
                seed={seed}
                freqX={freqX}
                freqY={freqY}
                freqDelta={freqDelta}
                zoom={zoom}
                rotation={rotation}
                density={density as [number, number]}
                applyColorMix={applyColorMix}
                colorMixPower={colorMixPower}
                colorMixValues={[colorMixR, colorMixG, colorMixB]}
              />
            </motion.div>
          )}
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
