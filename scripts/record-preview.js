#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEMP_DIR = '/tmp/vex-recording-frames';
const OUTPUT_FILE = 'preview.gif';
const DEV_SERVER_URL = 'http://localhost:5173';
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 500;
const RECORDING_DURATION_MS = 5000;
const TARGET_FPS = 15;
const TOTAL_FRAMES = Math.ceil((RECORDING_DURATION_MS / 1000) * TARGET_FPS);
const FRAME_INTERVAL = RECORDING_DURATION_MS / TOTAL_FRAMES;

async function main() {
  console.log('🎬 Starting vex-dashboard preview recording...');
  
  // Clean up and create temp directory
  if (fs.existsSync(TEMP_DIR)) {
    console.log('🧹 Cleaning up old frames...');
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  // Launch browser with WebGL support
  console.log('🚀 Launching Chromium...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--use-gl=swiftshader',
      '--enable-webgl',
      '--disable-software-rasterizer',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: 1,
    });

    console.log('🌐 Navigating to dev server...');
    await page.goto(DEV_SERVER_URL, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for particle system to initialize
    console.log('⏱️ Waiting for particle system to initialize...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start recording frames
    console.log(`📸 Recording ${TOTAL_FRAMES} frames over ${RECORDING_DURATION_MS/1000}s...`);
    const startTime = Date.now();
    
    for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
      const frameNumber = frame.toString().padStart(4, '0');
      const framePath = path.join(TEMP_DIR, `frame_${frameNumber}.png`);
      
      await page.screenshot({
        path: framePath,
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
        },
      });
      
      // Wait for next frame timing
      const expectedTime = startTime + (frame + 1) * FRAME_INTERVAL;
      const currentTime = Date.now();
      const waitTime = Math.max(0, expectedTime - currentTime);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      if (frame % 15 === 0 || frame === TOTAL_FRAMES - 1) {
        console.log(`📸 Frame ${frame + 1}/${TOTAL_FRAMES}`);
      }
    }

    console.log('✅ Frame capture complete!');
    
  } finally {
    await browser.close();
  }

  // Convert frames to GIF using ffmpeg
  console.log('🎞️ Converting frames to GIF...');
  const ffmpegCmd = [
    'ffmpeg',
    '-y', // overwrite output file
    '-framerate', TARGET_FPS.toString(),
    '-i', path.join(TEMP_DIR, 'frame_%04d.png'),
    '-vf', '"scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer"',
    OUTPUT_FILE
  ].join(' ');
  
  try {
    execSync(ffmpegCmd, { cwd: process.cwd(), stdio: 'inherit' });
    console.log(`🎉 GIF created: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ FFmpeg failed:', error.message);
    process.exit(1);
  }

  // Clean up temp frames
  console.log('🧹 Cleaning up temporary files...');
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  // Check file size
  const stats = fs.statSync(OUTPUT_FILE);
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`📏 Final GIF size: ${fileSizeMB}MB`);
  
  if (stats.size > 3 * 1024 * 1024) {
    console.log('⚠️ Warning: GIF is larger than 3MB, consider optimizing');
  }

  console.log('✅ Recording complete!');
}

// Handle errors
main().catch(error => {
  console.error('❌ Recording failed:', error);
  process.exit(1);
});