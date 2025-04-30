import { useRef } from 'react';
import { MorphGradient, type MorphGradientProps } from '@dragonspark/hikari-react';

const App = () => {
  const gradientRef = useRef(null);

  const handleInit: MorphGradientProps['onInit'] = (gradient) => {
    // Store the gradient instance if needed
    gradientRef.current = gradient;

    // You can control the gradient here
    // gradient.play();
    // gradient.pause();
    // gradient.toggleColor(0);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MorphGradient
        amplitude={320}
        seed={5}
        freqX={14e-5}
        freqY={29e-5}
        freqDelta={1e-5}
        onInit={handleInit}
      />

      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button onClick={() => gradientRef.current?.play()}>Play</button>
        <button onClick={() => gradientRef.current?.pause()}>Pause</button>
        <button onClick={() => gradientRef.current?.toggleColor(0)}>Toggle Base Color</button>
      </div>
    </div>
  );
};

export default App;