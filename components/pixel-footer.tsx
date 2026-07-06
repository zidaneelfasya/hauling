"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// GLSL Shaders for background image rendering
const QUAD_VS = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_position * 0.5 + 0.5;
    v_texCoord.y = 1.0 - v_texCoord.y; // Flip Y for WebGL texture space
  }
`;

const QUAD_FS = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_texture;
  uniform float u_progress;
  
  // Noise functions for organic, irregular dissolution edge
  float hash1(float n) { return fract(sin(n) * 43758.5453123); }
  float noise1d(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash1(i), hash1(i + 1.0), f);
  }
  
  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    
    float y = v_texCoord.y;
    float x = v_texCoord.x;
    float alpha = 1.0;
    
    // Top 45% dissolution zone with organic noise boundary
    if (y < 0.45) {
      // Multi-octave noise: low freq for large peaks, high freq for jagged detail
      float n = noise1d(x * 5.0) * 0.35
             + noise1d(x * 13.0 + 3.7) * 0.18
             + noise1d(x * 28.0 + 7.1) * 0.07;
      
      // Noise strength fades toward the bottom of the zone so lower areas stay intact longer
      float zonePos = y / 0.45;
      float activation = zonePos + n * (1.0 - zonePos * 0.6);
      float sweep = u_progress * 1.6;
      
      if (sweep > activation) {
        float t = (sweep - activation) / max(1.6 - activation, 0.01);
        alpha = clamp(1.0 - t * 2.5, 0.0, 1.0);
      }
    }
    
    // Filter out the white sky pixels to allow blending with the page
    float brightness = (color.r + color.g + color.b) / 3.0;
    if (brightness > 0.95) {
      discard;
    }
    
    gl_FragColor = vec4(color.rgb, color.a * alpha);
  }
`;

// GLSL Shaders for GPU Particle System
const PARTICLE_VS = `
  attribute vec2 a_position; // normalized coordinates [0, 1]
  attribute vec3 a_random;   // random values: x=seed, y=speedScale, z=type
  attribute vec3 a_color;    // RGB color channels
  varying vec3 v_color;
  varying float v_alpha;
  varying float v_type;
  
  uniform float u_progress;
  
  // GLSL Pseudo-random function
  float hash(float n) { 
    return fract(sin(n) * 43758.5453123); 
  }
  
  // Noise function matching fragment shader for consistent organic edge
  float noise1d(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), f);
  }
  
  void main() {
    float nx = a_position.x;
    float ny = a_position.y;
    
    // Multi-octave noise matching fragment shader for organic dissolution
    float n = noise1d(nx * 5.0) * 0.35
            + noise1d(nx * 13.0 + 3.7) * 0.18
            + noise1d(nx * 28.0 + 7.1) * 0.07;
    
    // Top 45% activation region with noise-shifted boundary
    float zonePos = ny / 0.45;
    float activation = zonePos + n * (1.0 - zonePos * 0.6);
    float sweep = u_progress * 1.6;
    
    float t = 0.0;
    if (sweep > activation) {
      t = (sweep - activation) / max(1.6 - activation, 0.01);
      t = clamp(t, 0.0, 1.0);
    }
    
    // Map back to WebGL clip space [-1, 1]
    float x = nx * 2.0 - 1.0;
    float y = (1.0 - ny) * 2.0 - 1.0;
    
    float alpha = 0.0;
    float size = 1.0;
    
    if (t > 0.0) {
      // Vertical translation (rising upwards)
      float riseSpeed = 0.4 + a_random.y * 0.4;
      if (a_random.z >= 0.70 && a_random.z < 0.90) {
        riseSpeed += 0.3; // Dust floats faster
      } else if (a_random.z >= 0.90) {
        riseSpeed -= 0.15; // Debris moves slower
      }
      y += t * riseSpeed;
      
      // Horizontal wind noise
      float angle = t * 6.0 + a_random.x * 6.28;
      float windNoise = sin(angle) * 0.05 * t;
      float windStrength = 0.12 * t * a_random.y; // Drift to the right
      x += windNoise + windStrength;
      
      // Rotational translation for debris fragments
      if (a_random.z >= 0.90) {
        x += cos(t * 4.0 + a_random.x * 6.28) * 0.02 * t;
      }
      
      // Sizing and Base Alpha based on type
      if (a_random.z < 0.70) {
        // Pixel: 1-3px
        size = 1.0 + hash(a_random.x) * 2.0;
        alpha = 1.0;
      } else if (a_random.z < 0.90) {
        // Dust: 0.5-1.0px (fades quicker)
        size = 0.5 + hash(a_random.x) * 0.5;
        alpha = 0.75;
      } else {
        // Debris: 1.5-3.0px (fades slower)
        size = 1.5 + hash(a_random.x) * 1.5;
        alpha = 0.45;
      }
      
      // 1. Organic disappearance at the top 1/5 of the screen (y > 0.6)
      // Using the exact same noise 'n' to make the disappear edge organic and matching the disassembly
      // 'n' is roughly 0.0 to 0.6. This maps the start of fading to y = 0.4 to 0.7
      float disappearStart = 0.4 + (n * 0.5); 
      if (y > disappearStart) {
        float fade = (y - disappearStart) / 0.3; // Fades out over 0.3 units of y
        alpha *= clamp(1.0 - fade, 0.0, 1.0);
      }
      
      // 2. Lifespan fallback (fade out at the very end of 't' if not already disappeared)
      alpha *= clamp(2.0 - t * 2.0, 0.0, 1.0);
    }
    
    gl_Position = vec4(x, y, 0.0, 1.0);
    v_color = a_color;
    v_alpha = alpha;
    v_type = a_random.z;
    
    gl_PointSize = size * 1.5;
  }
`;

const PARTICLE_FS = `
  precision mediump float;
  varying vec3 v_color;
  varying float v_alpha;
  varying float v_type;
  
  void main() {
    if (v_alpha <= 0.01) {
      discard;
    }
    
    // Render dust particles as circles, pixels/debris as squares
    if (v_type >= 0.70 && v_type < 0.90) {
      vec2 pt = gl_PointCoord - vec2(0.5);
      if (dot(pt, pt) > 0.25) {
        discard;
      }
    }
    
    gl_FragColor = vec4(v_color, v_alpha);
  }
`;

function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
  const vs = compileShader(gl, vsSource, gl.VERTEX_SHADER);
  const fs = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export default function PixelFooter() {
  const footerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = footerRef.current;
    if (!canvas || !wrapper) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: true }) ||
      canvas.getContext("experimental-webgl", { alpha: true, antialias: true }) as WebGLRenderingContext | null;
    if (!gl) {
      console.error("WebGL not supported in this browser.");
      return;
    }

    // Compile GLSL programs
    const quadProgram = createProgram(gl, QUAD_VS, QUAD_FS);
    const particleProgram = createProgram(gl, PARTICLE_VS, PARTICLE_FS);
    if (!quadProgram || !particleProgram) return;

    // Load background image texture
    const img = new Image();
    img.src = "/footer-image.png";
    let imageLoaded = false;
    let particlesCount = 0;

    // Create buffers
    const quadBuffer = gl.createBuffer();
    const particleBuffer = gl.createBuffer();
    const texture = gl.createTexture();

    // 1. Setup Background Quad Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const quadVertices = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    // 2. Setup Texture Parameters
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const initParticles = () => {
      if (!imageLoaded) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasRatio = canvasWidth / canvasHeight;

      // Extract cover dimensions mapping
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const imageRatio = imgW / imgH;
      let sX = 0, sY = 0, sW = imgW, sH = imgH;

      if (imageRatio > canvasRatio) {
        sW = imgH * canvasRatio;
        sX = (imgW - sW) / 2;
      } else {
        sH = imgW / canvasRatio;
        sY = (imgH - sH) / 2;
      }

      // Sample grid resolution: 400x300 (gives ~30,000 active particles)
      const sampleW = 400;
      const sampleH = 300;

      const offscreen = document.createElement("canvas");
      offscreen.width = sampleW;
      offscreen.height = sampleH;
      const oCtx = offscreen.getContext("2d");
      if (!oCtx) return;

      oCtx.drawImage(img, sX, sY, sW, sH, 0, 0, sampleW, sampleH);

      const imgData = oCtx.getImageData(0, 0, sampleW, sampleH);
      const data = imgData.data;

      // Top 45% height in sampled grid (matches shader dissolution zone)
      const topThirdHeight = Math.floor(sampleH * 0.45);

      // Setup raw interleaved array buffer data
      // For each particle: [nx, ny, seed, speedScale, type, r, g, b] (8 floats = 32 bytes)
      const tempArray: number[] = [];

      for (let y = 0; y < topThirdHeight; y++) {
        for (let x = 0; x < sampleW; x++) {
          const idx = (y * sampleW + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a < 50) continue;

          // Skip bright pixels (the white sky)
          const brightness = (r + g + b) / 3;
          if (brightness > 240) continue;

          // Determine particle type and parameters
          const rand = Math.random();
          const seed = Math.random() * 100;
          const speedScale = 0.5 + Math.random() * 1.5;
          let type = 0.0; // 70% pixels (type < 0.70)

          if (rand >= 0.70 && rand < 0.90) {
            type = 0.80; // 20% fine dust
          } else if (rand >= 0.90) {
            type = 0.95; // 10% debris
          }

          // Push floats to array
          tempArray.push(
            x / sampleW,           // nx
            y / sampleH,           // ny
            seed,                  // random seed
            speedScale,            // movement velocity scaling
            type,                  // type category mapping
            r / 255.0,             // normalized Red channel
            g / 255.0,             // normalized Green channel
            b / 255.0              // normalized Blue channel
          );
        }
      }

      particlesCount = tempArray.length / 8;

      // Upload particle data to GPU
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tempArray), gl.STATIC_DRAW);
    };

    img.onload = () => {
      imageLoaded = true;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      resizeCanvas();
      initParticles();
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      if (imageLoaded) {
        initParticles();
      }
    };

    // Scroll handler with two-phase logic:
    // Phase 1 (reveal): Footer scrolls into view from below. No animation yet.
    // Phase 2 (animate): Footer is pinned (sticky top:0), continued scrolling drives disintegration.
    const handleScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // The sticky inner element height (100vh)
      const stickyH = windowHeight;
      // Total wrapper height (set in CSS)
      const wrapperH = wrapper.offsetHeight;

      // The scroll distance available for animation = wrapperH - stickyH
      // This is the distance we can scroll while the sticky element stays pinned.
      const animationScrollDistance = wrapperH - stickyH;

      let targetProgress = 0;

      if (rect.top <= 0 && animationScrollDistance > 0) {
        // Phase 2: Footer is pinned, drive animation with continued scroll
        const scrolledPastPin = Math.abs(rect.top);
        targetProgress = scrolledPastPin / animationScrollDistance;
        targetProgress = Math.max(0, Math.min(0.65, targetProgress));
      }
      // Phase 1: rect.top > 0 means footer hasn't reached top yet, no animation

      targetProgressRef.current = targetProgress;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", handleScroll, { passive: true });

    resizeCanvas();
    handleScroll();

    let animationFrameId: number;

    const render = () => {
      // Linear interpolation to smooth scroll changes
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.07;
      const progress = currentProgressRef.current;

      if (imageLoaded) {
        // Clear viewport with background color
        gl.clearColor(0.9686, 0.9608, 0.9490, 1.0); // Matches light background #F7F5F2
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.viewport(0, 0, canvas.width, canvas.height);

        // 1. Draw quad background image
        gl.useProgram(quadProgram);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        const qPos = gl.getAttribLocation(quadProgram, "a_position");
        gl.enableVertexAttribArray(qPos);
        gl.vertexAttribPointer(qPos, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(gl.getUniformLocation(quadProgram, "u_progress"), progress);

        // Enable alpha blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // 2. Render particle layers
        if (progress > 0.001 && particlesCount > 0) {
          gl.useProgram(particleProgram);

          gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);

          const pPos = gl.getAttribLocation(particleProgram, "a_position");
          const pRand = gl.getAttribLocation(particleProgram, "a_random");
          const pCol = gl.getAttribLocation(particleProgram, "a_color");

          gl.enableVertexAttribArray(pPos);
          gl.vertexAttribPointer(pPos, 2, gl.FLOAT, false, 32, 0); // 32 bytes stride, 0 offset

          gl.enableVertexAttribArray(pRand);
          gl.vertexAttribPointer(pRand, 3, gl.FLOAT, false, 32, 8); // 8 bytes offset

          gl.enableVertexAttribArray(pCol);
          gl.vertexAttribPointer(pCol, 3, gl.FLOAT, false, 32, 20); // 20 bytes offset

          gl.uniform1f(gl.getUniformLocation(particleProgram, "u_progress"), progress);

          gl.drawArrays(gl.POINTS, 0, particlesCount);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);

      // Clean up GPU buffers & programs
      gl.deleteBuffer(quadBuffer);
      gl.deleteBuffer(particleBuffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(quadProgram);
      gl.deleteProgram(particleProgram);
    };
  }, []);

  return (
    <div
      ref={footerRef}
      className="relative w-full pointer-events-none select-none"
      style={{ height: "300vh" }}
    >
      {/* Sticky Inner Footer Container - pins to top of viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-between font-jakarta p-8 md:p-20 text-[#F7F5F2]">

        {/* WebGL Canvas Background */}
        <div className="absolute inset-0 -z-10 bg-[#F7F5F2]">
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>

        {/* Minimalist White Footer Content Overlay */}
        {/* Glow effect wrapping layer with extremely faint radial glow behind typography */}
        <div
          className="relative z-10 max-w-7xl mx-auto w-full h-full flex flex-col justify-between pt-[32vh] pb-4 pointer-events-auto"
          style={{
            background: "radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 60%)"
          }}
        >

          {/* Main Footer Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

            {/* Left Column: Title and CTA */}
            <div className="md:col-span-6 space-y-4 md:space-y-6">
              <span className="font-outfit text-xs font-bold uppercase tracking-[0.3em] text-[#C67A2B] bg-[#C67A2B]/10 px-3 py-1.5 rounded inline-block">
                Partnership Inquiries
              </span>
              <h2 className="font-outfit text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter leading-[0.95] text-white">
                MINING LOGISTICS<br />
                {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C67A2B] to-[#56694E]">
                  SHAPE THE FUTURE.
                </span> */}
              </h2>
              {/* <p className="text-neutral-400 font-light text-xs md:text-sm max-w-md leading-relaxed">
                Leverage our telemetry-linked heavy fleet and complete hauling audit systems to hit your monthly yield targets securely.
              </p> */}
              <Link
                href="/dashboard"
                className="bg-white text-[#1B1B1B] hover:bg-[#C67A2B] hover:text-white text-xs font-bold uppercase tracking-widest px-6 py-4 rounded-full transition-all duration-300 flex items-center gap-3 shadow-lg group inline-flex"
              >
                Access ERP Dashboard
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Right Column: Address details */}
            {/* <div className="md:col-span-6 grid grid-cols-2 gap-6 text-[10px] md:text-[11px] text-neutral-400 font-jakarta md:justify-items-end">
              <div className="space-y-2 md:max-w-[200px]">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">Corporate Office</span>
                <p className="leading-relaxed">Jl. Tambang Lestari Blok A4, Jakarta, Indonesia</p>
              </div>
              <div className="space-y-2 md:max-w-[200px]">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">Site Operations</span>
                <p className="leading-relaxed">Kolonodale & Sorowako Operations, Sulawesi, Indonesia</p>
              </div>
            </div> */}

          </div>

          {/* Bottom Row: Branding, social media, and legal */}
          <div className=" pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-[10px] md:text-[11px] text-neutral-400">

            {/* Branding */}
            <div className="space-y-1">
              <h3 className="font-syne text-sm font-bold tracking-tight text-white uppercase leading-none">
                PT HAULING KEMBAR JAYA
              </h3>
              <p className="text-[9px] text-white uppercase tracking-wider">
                Heavy Operations & Mining Logistics Services
              </p>
              <span className="block text-[9px] text-white font-mono">
                © {new Date().getFullYear()} — Indonesia. All rights reserved.
              </span>
            </div>

            {/* Links and control system tag */}
            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors">Privacy Statement</a>
                <span>•</span>
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                <span>•</span>
                <a href="/dashboard" className="hover:text-white transition-colors font-bold text-[#C67A2B]">System Portal</a>
              </div>
              <div className="text-[9px] text-white font-mono">
                HMS://HKJ.OPERATIONS-CONTROL
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
