import { useEffect } from 'react';
import { ColorService, IColor } from 'react-color-palette';

type SnippetImporterOptions = {
  setBaseColor: (c: IColor) => void;
  setWaveColor1: (c: IColor) => void;
  setWaveColor2: (c: IColor) => void;
  setWaveColor3: (c: IColor) => void;
  setDensity: (d: [number, number]) => void;
  setZoom: (n: number) => void;
  setRotation: (n: number) => void;
  setAmplitude: (n: number) => void;
  setSeed: (n: number) => void;
  setFreqX: (n: number) => void;
  setFreqY: (n: number) => void;
  setFreqDelta: (n: number) => void;
  setShowWireframe: (b: boolean) => void;
  setApplyColorMix: (b: boolean) => void;
  setColorMixPower: (n: number) => void;
  setColorMixR: (n: number) => void;
  setColorMixG: (n: number) => void;
  setColorMixB: (n: number) => void;
};

export function useSnippetImporter(opts: SnippetImporterOptions) {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text') ?? '';
      if (!text.includes('<MorphGradientCanvas')) return;

      // prevent the snippet from actually inserting into any input
      e.preventDefault();

      // helper to parse with a regex
      const get = (rx: RegExp): string[] | null => {
        const m = text.match(rx);
        return m ? m.slice(1) : null;
      };

      // baseColor={'#abcdef'}
      const base = get(/baseColor=\{\s*['"](#?[0-9A-Fa-f]+)['"]\s*\}/);
      if (base) opts.setBaseColor(ColorService.convert('hex', base[0]));

      // waveColors={['#111111','#222222','#333333']}
      const waves = get(/waveColors=\[\s*['"](#?[0-9A-Fa-f]+)['"]\s*,\s*['"](#?[0-9A-Fa-f]+)['"]\s*,\s*['"](#?[0-9A-Fa-f]+)['"]\s*\]/);
      if (waves) {
        opts.setWaveColor1(ColorService.convert('hex', waves[0]));
        opts.setWaveColor2(ColorService.convert('hex', waves[1]));
        opts.setWaveColor3(ColorService.convert('hex', waves[2]));
      }

      // density={[1.23, 4.56]}
      const density = get(/density=\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/);
      if (density) {
        opts.setDensity([parseFloat(density[0]), parseFloat(density[1])]);
      }

      // zoom={1.23}
      const zoom = get(/zoom=\{\s*([\d.]+)\s*\}/);
      if (zoom) opts.setZoom(parseFloat(zoom[0]));

      // rotation
      const rot = get(/rotation=\{\s*([\d.]+)\s*\}/);
      if (rot) opts.setRotation(parseFloat(rot[0]));

      // amplitude
      const amp = get(/amplitude=\{\s*([\d.]+)\s*\}/);
      if (amp) opts.setAmplitude(parseFloat(amp[0]));

      // seed
      const seed = get(/seed=\{\s*([\d.]+)\s*\}/);
      if (seed) opts.setSeed(parseFloat(seed[0]));

      // freqX, freqY, freqDelta
      const fx = get(/freqX=\{\s*([\d.]+)\s*\}/);
      if (fx) opts.setFreqX(parseFloat(fx[0]));
      const fy = get(/freqY=\{\s*([\d.]+)\s*\}/);
      if (fy) opts.setFreqY(parseFloat(fy[0]));
      const fd = get(/freqDelta=\{\s*([\d.]+)\s*\}/);
      if (fd) opts.setFreqDelta(parseFloat(fd[0]));

      // wireframe
      const wf = get(/wireframe=\{\s*(true|false)\s*\}/);
      if (wf) opts.setShowWireframe(wf[0] === 'true');

      // applyColorMix
      const acm = get(/applyColorMix=\{\s*(true|false)\s*\}/);
      if (acm) opts.setApplyColorMix(acm[0] === 'true');

      // colorMixPower
      const cmp = get(/colorMixPower=\{\s*([\d.]+)\s*\}/);
      if (cmp) opts.setColorMixPower(parseFloat(cmp[0]));

      // colorMixValues={[0.1,0.2,0.3]}
      const cmv = get(/colorMixValues\s*=\s*\{\s*\[\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\]\s*\}/);
      if (cmv) {
        opts.setColorMixR(parseFloat(cmv[0]));
        opts.setColorMixG(parseFloat(cmv[1]));
        opts.setColorMixB(parseFloat(cmv[2]));
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [
    opts,
    opts.setBaseColor, opts.setWaveColor1, opts.setWaveColor2, opts.setWaveColor3,
    opts.setDensity, opts.setZoom, opts.setRotation, opts.setAmplitude,
    opts.setSeed, opts.setFreqX, opts.setFreqY, opts.setFreqDelta,
    opts.setShowWireframe, opts.setApplyColorMix,
    opts.setColorMixPower, opts.setColorMixR, opts.setColorMixG, opts.setColorMixB,
  ]);
}
