import { useRef } from 'react';
import {
  MorphGradientCanvas,
  type MorphGradientInitCallback
} from '@dragonspark/hikari-react';
import { MorphGradient } from '@dragonspark/hikari-effects';

const App = () => {
  const gradientRef = useRef<MorphGradient>(null);

  const handleInit: MorphGradientInitCallback = (gradient) => {
    gradientRef.current = gradient;
  };

  return (
    <>
      <MorphGradientCanvas
        amplitude={300}
        // seed={5}
        // freqX={14e-5}
        // freqY={29e-5}
        // freqDelta={1e-5}
        onInit={handleInit}
        // baseColor={"#1d132e"}
        // waveColors={["#4c1898", "#831e3e"]}
        zoom={1}
        rotation={0}
        darkenTop={true}
        wireframe={false}
      />

      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button onClick={() => gradientRef.current?.play()}>Play</button>
        <button onClick={() => gradientRef.current?.pause()}>Pause</button>
        <button onClick={() => gradientRef.current?.toggleColor(0)}>Toggle Base Color</button>
      </div>
    </>
  );
};

export default App;
