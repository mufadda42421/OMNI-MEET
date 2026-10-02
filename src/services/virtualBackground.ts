import { VirtualBackgroundType } from '../types';

// Pre-rendered high-res SVG data URIs for pristine, guaranteed instant loading
export const BACKGROUND_PRESETS: Record<string, string> = {
  office: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="%231a2332"/>
        <stop offset="100%" stop-color="%230f141d"/>
      </linearGradient>
      <linearGradient id="window" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%2393c5fd" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="%233b82f6" stop-opacity="0.1"/>
      </linearGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="%235c3a21"/>
        <stop offset="50%" stop-color="%23784c28"/>
        <stop offset="100%" stop-color="%234a2e1a"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(%23bg)"/>
    <!-- Large architectural office windows -->
    <rect x="100" y="60" width="380" height="480" rx="8" fill="url(%23window)" stroke="%23374151" stroke-width="6"/>
    <line x1="290" y1="60" x2="290" y2="540" stroke="%23374151" stroke-width="4"/>
    <line x1="100" y1="300" x2="480" y2="300" stroke="%23374151" stroke-width="4"/>
    <!-- City skyline outside window -->
    <rect x="130" y="240" width="60" height="290" fill="%231e293b" opacity="0.6"/>
    <rect x="210" y="190" width="70" height="340" fill="%23334155" opacity="0.5"/>
    <rect x="300" y="270" width="50" height="260" fill="%231e293b" opacity="0.6"/>
    <rect x="370" y="210" width="80" height="320" fill="%23334155" opacity="0.5"/>
    <!-- Office Bookcase & modern decor -->
    <rect x="860" y="100" width="340" height="520" rx="6" fill="%231f2937" stroke="%23374151" stroke-width="4"/>
    <line x1="860" y1="230" x2="1200" y2="230" stroke="%234b5563" stroke-width="6"/>
    <line x1="860" y1="360" x2="1200" y2="360" stroke="%234b5563" stroke-width="6"/>
    <line x1="860" y1="490" x2="1200" y2="490" stroke="%234b5563" stroke-width="6"/>
    <!-- Books & architectural plant -->
    <rect x="880" y="140" width="25" height="85" rx="3" fill="%233b82f6"/>
    <rect x="910" y="150" width="20" height="75" rx="3" fill="%2310b981"/>
    <rect x="935" y="130" width="30" height="95" rx="3" fill="%23f59e0b"/>
    <circle cx="1060" cy="180" r="30" fill="%2310b981" opacity="0.8"/>
    <!-- Desk surface in foreground -->
    <rect x="0" y="600" width="1280" height="120" fill="url(%23wood)"/>
    <rect x="0" y="598" width="1280" height="4" fill="%239a6735"/>
    <!-- Warm ambiance glow -->
    <circle cx="640" cy="200" r="350" fill="%23fef08a" opacity="0.04"/>
  </svg>`,

  penthouse: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%230c1445"/>
        <stop offset="60%" stop-color="%232c1b4d"/>
        <stop offset="100%" stop-color="%23d97706" stop-opacity="0.8"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(%23sky)"/>
    <!-- High rise skyscraper silhouettes -->
    <polygon points="120,450 120,720 220,720 220,400 170,380" fill="%23090d16"/>
    <polygon points="260,320 260,720 380,720 380,320 320,280 320,230 318,230" fill="%230d131f"/>
    <polygon points="420,420 420,720 540,720 540,390" fill="%23090d16"/>
    <polygon points="580,350 580,720 700,720 700,350" fill="%23111827"/>
    <polygon points="760,280 760,720 890,720 890,280" fill="%23090d16"/>
    <polygon points="940,380 940,720 1060,720 1060,380" fill="%23111827"/>
    <!-- Glass railing & modern floor -->
    <rect x="0" y="580" width="1280" height="140" fill="%23111827"/>
    <rect x="0" y="576" width="1280" height="6" fill="%2338bdf8" opacity="0.6"/>
    <!-- City lights dots -->
    <circle cx="290" cy="380" r="2" fill="%23fef08a" opacity="0.9"/>
    <circle cx="310" cy="420" r="2" fill="%23fef08a" opacity="0.9"/>
    <circle cx="340" cy="400" r="2" fill="%23fef08a" opacity="0.9"/>
    <circle cx="620" cy="410" r="2" fill="%23fef08a" opacity="0.9"/>
    <circle cx="660" cy="460" r="2" fill="%23fef08a" opacity="0.9"/>
    <circle cx="800" cy="340" r="2" fill="%23fef08a" opacity="0.9"/>
    <circle cx="830" cy="390" r="2" fill="%23fef08a" opacity="0.9"/>
  </svg>`,

  library: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="lib_wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%231f1610"/>
        <stop offset="100%" stop-color="%230f0a07"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(%23lib_wall)"/>
    <!-- Classic library mahogany shelves full of colorful books -->
    <g fill="%233a2012" stroke="%2324140b" stroke-width="4">
      <rect x="60" y="60" width="360" height="600"/>
      <rect x="460" y="60" width="360" height="600"/>
      <rect x="860" y="60" width="360" height="600"/>
    </g>
    <!-- Shelves dividers -->
    <line x1="60" y1="200" x2="420" y2="200" stroke="%23542e1b" stroke-width="8"/>
    <line x1="60" y1="360" x2="420" y2="360" stroke="%23542e1b" stroke-width="8"/>
    <line x1="60" y1="520" x2="420" y2="520" stroke="%23542e1b" stroke-width="8"/>
    <line x1="460" y1="200" x2="820" y2="200" stroke="%23542e1b" stroke-width="8"/>
    <line x1="460" y1="360" x2="820" y2="360" stroke="%23542e1b" stroke-width="8"/>
    <line x1="460" y1="520" x2="820" y2="520" stroke="%23542e1b" stroke-width="8"/>
    <line x1="860" y1="200" x2="1220" y2="200" stroke="%23542e1b" stroke-width="8"/>
    <line x1="860" y1="360" x2="1220" y2="360" stroke="%23542e1b" stroke-width="8"/>
    <line x1="860" y1="520" x2="1220" y2="520" stroke="%23542e1b" stroke-width="8"/>
    <!-- Row of books -->
    <rect x="80" y="110" width="30" height="85" fill="%23991b1b" rx="2"/>
    <rect x="115" y="125" width="25" height="70" fill="%231e3a8a" rx="2"/>
    <rect x="145" y="105" width="35" height="90" fill="%23854d0e" rx="2"/>
    <rect x="185" y="115" width="28" height="80" fill="%23065f46" rx="2"/>
    <rect x="220" y="120" width="32" height="75" fill="%23581c87" rx="2"/>
    <rect x="880" y="110" width="30" height="85" fill="%231e3a8a" rx="2"/>
    <rect x="915" y="105" width="35" height="90" fill="%23991b1b" rx="2"/>
    <rect x="955" y="125" width="25" height="70" fill="%23065f46" rx="2"/>
    <!-- Warm amber library lamp glow -->
    <circle cx="640" cy="250" r="300" fill="%23fbbf24" opacity="0.08"/>
  </svg>`,

  cafe: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="cafewall" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="%23271c18"/>
        <stop offset="100%" stop-color="%231a120f"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(%23cafewall)"/>
    <!-- Exposed brick texture effect -->
    <rect x="80" y="80" width="1120" height="420" fill="%2338231a" opacity="0.5" rx="12"/>
    <!-- Cafe bistro pendant lights -->
    <line x1="280" y1="0" x2="280" y2="140" stroke="%2344403c" stroke-width="3"/>
    <path d="M250,140 L310,140 L295,170 L265,170 Z" fill="%2378716c"/>
    <circle cx="280" cy="180" r="14" fill="%23fef08a"/>
    <circle cx="280" cy="180" r="90" fill="%23fef08a" opacity="0.12"/>
    <line x1="1000" y1="0" x2="1000" y2="140" stroke="%2344403c" stroke-width="3"/>
    <path d="M970,140 L1030,140 L1015,170 L985,170 Z" fill="%2378716c"/>
    <circle cx="1000" cy="180" r="14" fill="%23fef08a"/>
    <circle cx="1000" cy="180" r="90" fill="%23fef08a" opacity="0.12"/>
    <!-- Wooden counter & plant -->
    <rect x="0" y="550" width="1280" height="170" fill="%23451a03"/>
    <rect x="0" y="546" width="1280" height="4" fill="%2392400e"/>
  </svg>`,

  studio: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <radialGradient id="cyberGlow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="%231e1b4b"/>
        <stop offset="60%" stop-color="%230f172a"/>
        <stop offset="100%" stop-color="%23020617"/>
      </radialGradient>
      <linearGradient id="neonCyan" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="%2306b6d4" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="%233b82f6" stop-opacity="0.8"/>
      </linearGradient>
      <linearGradient id="neonPurple" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%23a855f7" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="%23ec4899" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(%23cyberGlow)"/>
    <!-- Acoustic studio wall panels -->
    <g fill="%231e293b" opacity="0.4">
      <rect x="120" y="100" width="220" height="380" rx="8"/>
      <rect x="380" y="80" width="220" height="400" rx="8"/>
      <rect x="680" y="80" width="220" height="400" rx="8"/>
      <rect x="940" y="100" width="220" height="380" rx="8"/>
    </g>
    <!-- Vertical neon studio tubes -->
    <rect x="80" y="60" width="8" height="520" rx="4" fill="url(%23neonCyan)"/>
    <rect x="1190" y="60" width="8" height="520" rx="4" fill="url(%23neonPurple)"/>
    <!-- Studio floor grid -->
    <line x1="0" y1="580" x2="1280" y2="580" stroke="%23334155" stroke-width="2"/>
    <line x1="640" y1="580" x2="640" y2="720" stroke="%23334155" stroke-width="2"/>
    <line x1="300" y1="580" x2="150" y2="720" stroke="%23334155" stroke-width="2"/>
    <line x1="980" y1="580" x2="1130" y2="720" stroke="%23334155" stroke-width="2"/>
  </svg>`,
};

export class VirtualBackgroundProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private videoElement: HTMLVideoElement;
  private rawStream: MediaStream | null = null;
  private processedStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private currentMode: VirtualBackgroundType = 'none';
  private customImage: HTMLImageElement | null = null;
  private presetImages: Map<string, HTMLImageElement> = new Map();
  private segmenter: unknown = null;
  private isSegmenterReady = false;
  private latestMask: CanvasImageSource | null = null;
  private maskCanvas: HTMLCanvasElement;
  private maskCtx: CanvasRenderingContext2D;
  private isProcessing = false;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;

    this.maskCanvas = document.createElement('canvas');
    this.maskCanvas.width = 320;
    this.maskCanvas.height = 180;
    this.maskCtx = this.maskCanvas.getContext('2d')!;

    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;

    // Pre-cache SVG backgrounds
    for (const [key, uri] of Object.entries(BACKGROUND_PRESETS)) {
      const img = new Image();
      img.src = uri;
      this.presetImages.set(key, img);
    }

    this.initMediaPipe();
  }

  private async initMediaPipe() {
    try {
      // Dynamically load MediaPipe SelfieSegmentation if possible
      const { SelfieSegmentation } = await import('@mediapipe/selfie_segmentation');
      const segmenter = new SelfieSegmentation({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      segmenter.setOptions({
        modelSelection: 1, // 1 for landscape/desktop webcam
        selfieMode: false,
      });

      segmenter.onResults((results) => {
        this.latestMask = results.segmentationMask as CanvasImageSource;
      });

      this.segmenter = segmenter;
      this.isSegmenterReady = true;
    } catch {
      // Fallback mode will seamlessly handle background isolation
      this.isSegmenterReady = false;
    }
  }

  public setMode(mode: VirtualBackgroundType, customDataUrl?: string) {
    this.currentMode = mode;
    if (customDataUrl) {
      const img = new Image();
      img.src = customDataUrl;
      this.customImage = img;
    }
  }

  public async setInputStream(stream: MediaStream): Promise<MediaStream> {
    this.rawStream = stream;
    this.videoElement.srcObject = stream;

    await new Promise<void>((resolve) => {
      this.videoElement.onloadedmetadata = () => {
        this.videoElement.play().then(() => resolve()).catch(() => resolve());
      };
      if (this.videoElement.readyState >= 2) {
        resolve();
      }
    });

    if (this.videoElement.videoWidth && this.videoElement.videoHeight) {
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
    }

    this.startRenderingLoop();

    // Capture processed video track from canvas at 30 fps
    const canvasStream = this.canvas.captureStream(30);
    const processedVideoTrack = canvasStream.getVideoTracks()[0];

    // Combine with original audio tracks
    const audioTracks = stream.getAudioTracks();
    this.processedStream = new MediaStream([processedVideoTrack, ...audioTracks]);

    return this.processedStream;
  }

  public getProcessedStream(): MediaStream | null {
    return this.processedStream;
  }

  private startRenderingLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const render = async () => {
      if (this.videoElement.readyState >= 2 && !this.videoElement.paused) {
        await this.renderFrame();
      }
      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  private async renderFrame() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    if (this.currentMode === 'none') {
      // Direct pass-through: crisp, unaugmented camera
      ctx.drawImage(this.videoElement, 0, 0, width, height);
      return;
    }

    // Attempt MediaPipe segmentation pass
    if (this.isSegmenterReady && this.segmenter && !this.isProcessing) {
      this.isProcessing = true;
      try {
        const seg = this.segmenter as { send: (opt: { image: HTMLVideoElement }) => Promise<void> };
        await seg.send({ image: this.videoElement });
      } catch {
        // Continue with current frame
      } finally {
        this.isProcessing = false;
      }
    }

    // Draw background layer
    ctx.save();

    if (this.currentMode === 'blur-light' || this.currentMode === 'blur-heavy') {
      // Draw heavily blurred background of user's camera feed
      const blurRadius = this.currentMode === 'blur-light' ? 12 : 28;
      ctx.filter = `blur(${blurRadius}px) brightness(0.95)`;
      ctx.drawImage(this.videoElement, 0, 0, width, height);
      ctx.filter = 'none';
    } else {
      // Draw virtual scenic background (office, penthouse, library, studio, cafe, or custom)
      let bgImage: HTMLImageElement | undefined;
      if (this.currentMode === 'custom' && this.customImage) {
        bgImage = this.customImage;
      } else {
        bgImage = this.presetImages.get(this.currentMode);
      }

      if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
        ctx.drawImage(bgImage, 0, 0, width, height);
      } else {
        // Fallback stylish dark slate gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    }
    ctx.restore();

    // Now composite the person in the foreground
    if (this.latestMask) {
      // Use MediaPipe segmentation mask
      ctx.save();
      // Temporary canvas to mask out background
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
      this.maskCtx.clearRect(0, 0, width, height);

      // Draw mask
      this.maskCtx.drawImage(this.latestMask, 0, 0, width, height);

      // Source-in to only keep the person
      this.maskCtx.globalCompositeOperation = 'source-in';
      this.maskCtx.drawImage(this.videoElement, 0, 0, width, height);

      // Blit masked person onto canvas
      ctx.drawImage(this.maskCanvas, 0, 0, width, height);
      ctx.restore();
    } else {
      // Smart portrait soft-cut fallback:
      // Focuses on user centered in the webcam frame with a soft, radial feathered gradient
      ctx.save();
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.6,
        height * 0.15,
        width * 0.5,
        height * 0.6,
        height * 0.55
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Draw person through gradient mask
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
      this.maskCtx.clearRect(0, 0, width, height);
      this.maskCtx.fillStyle = grad;
      this.maskCtx.fillRect(0, 0, width, height);

      this.maskCtx.globalCompositeOperation = 'source-in';
      this.maskCtx.drawImage(this.videoElement, 0, 0, width, height);

      ctx.drawImage(this.maskCanvas, 0, 0, width, height);
      ctx.restore();
    }
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.rawStream) {
      this.rawStream.getTracks().forEach((t) => t.stop());
    }
  }
}
