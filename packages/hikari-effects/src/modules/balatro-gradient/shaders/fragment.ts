/**
 * Fragment shader for the Balatro gradient effect.
 * 
 * This shader creates a morphing gradient effect with multiple colors and various parameters
 * to control the appearance and animation.
 */

export const fragment = `
varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / u_pixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - u_offset;
    float uv_len = length(uv);
    
    float speed = (u_spinRotation * u_spinEase * 0.2);
    if(u_isRotate){
       speed = u_time * speed;
    }
    speed += 302.2;
    
    // Mouse influence for gentle rotation (applied additively)
    float mouseInfluence = (u_mouse.x * 2.0 - 1.0);
    speed += mouseInfluence * 0.1;
    
    float new_pixel_angle = atan(uv.y, uv.x) + speed - u_spinEase * 20.0 * (u_spinAmount * uv_len + (1.0 - u_spinAmount));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);
    
    uv *= 30.0;
    // Fix: Apply mouse influence additively rather than scaling with time.
    float baseSpeed = u_time * u_spinSpeed;
    speed = baseSpeed + mouseInfluence * 2.0;
    
    vec2 uv2 = vec2(uv.x + uv.y);
    
    for(int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }
    
    float contrast_mod = (0.25 * u_contrast + 0.5 * u_spinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (u_lighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + u_lighting * max(c2p * 5.0 - 4.0, 0.0);
    
    return (0.3 / u_contrast) * u_color1 + (1.0 - 0.3 / u_contrast) * (u_color1 * c1p + u_color2 * c2p + vec4(c3p * u_color3.rgb, c3p * u_color1.a)) + light;
}

void main() {
    vec2 uv = vUv * resolution.xy;
    gl_FragColor = effect(resolution.xy, uv);
}
`;