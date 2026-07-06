/**
 * QR Matrix Operations
 * Handles mapping micro-QR as a subset of the master QR raster
 */

export const QR_RENDER_STATES = {
  BRAILLE: 'braille',      // "touch me" - Braille dots
  MICRO: 'micro',          // "touch again" - Micro QR highlighted in full raster
  QR: 'qr',                // "scan me" - Full QR code
};

/**
 * Maps a micro-QR matrix into the center of a full QR raster
 * @param {Array<Array<boolean>>} microMatrix - Source micro-QR matrix (e.g., 11x11)
 * @param {Array<Array<boolean>>} fullMatrix - Target full QR matrix (e.g., 37x37)
 * @returns {Array<Array<boolean>>} New matrix with micro highlighted in center of full raster
 */
export function mapMicroToQrRaster(microMatrix, fullMatrix) {
  if (!microMatrix?.length || !fullMatrix?.length) {
    return fullMatrix;
  }

  const microSize = microMatrix.length;
  const fullSize = fullMatrix.length;
  const offset = Math.floor((fullSize - microSize) / 2);

  // Create result - start with full matrix (empty)
  const result = fullMatrix.map(row => [...row]);

  // Overlay micro matrix in center
  for (let y = 0; y < microSize; y++) {
    for (let x = 0; x < microSize; x++) {
      const targetY = y + offset;
      const targetX = x + offset;
      
      if (targetY >= 0 && targetY < fullSize && targetX >= 0 && targetX < fullSize) {
        result[targetY][targetX] = microMatrix[y][x];
      }
    }
  }

  return result;
}

/**
 * Creates a simple Braille "TOUCH ME" pattern
 * Uses a normalized dot grid
 */
export function createBrailleTouchMeMatrix(gridSize = 37) {
  const matrix = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
  
  // Simple dot pattern to spell "TOUCH ME" in abstract form
  // Center region lights up in a touch-prompt pattern
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  const radius = 8;

  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      if (y >= 0 && y < gridSize && x >= 0 && x < gridSize) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Create a circular pulse pattern with dots
        if (dist <= radius && (dist % 2 < 1 || (dx + dy) % 2 === 0)) {
          matrix[y][x] = true;
        }
      }
    }
  }

  return matrix;
}

/**
 * Blends between micro-QR highlight and full QR visibility
 * Used for smooth transitions
 */
export function blendQrMatrices(microHighlightMatrix, fullMatrix, blendFactor = 0.5) {
  if (!microHighlightMatrix?.length || !fullMatrix?.length) {
    return fullMatrix;
  }

  const size = fullMatrix.length;
  const result = Array(size).fill(null).map(() => Array(size).fill(false));

  // For visual blending: show both micro and full based on blend factor
  // If blendFactor = 0: show only micro
  // If blendFactor = 1: show full
  const threshold = blendFactor;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const microOn = microHighlightMatrix[y][x];
      const fullOn = fullMatrix[y][x];

      // Show full if blend is high, or if micro is off but full is on
      if (blendFactor > 0.7) {
        result[y][x] = fullOn;
      } else if (microOn) {
        // Always show micro highlight when visible
        result[y][x] = true;
      } else {
        result[y][x] = fullOn && Math.random() < blendFactor;
      }
    }
  }

  return result;
}

/**
 * Applies visual pulse/animation effect to a matrix
 * Used for the "pulse" class effect
 */
export function applyPulseEffect(matrix, pulseIntensity = 0.3) {
  const result = matrix.map(row => [...row]);
  const timestamp = Date.now() % 1000;
  const pulsePhase = (timestamp / 1000) * Math.PI * 2;
  const intensity = Math.abs(Math.sin(pulsePhase)) * pulseIntensity;

  // Add shimmer to on-pixels
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] && Math.random() < intensity) {
        // Create shimmer effect - temporarily brighten
        // (handled in rendering layer with opacity/glow)
      }
    }
  }

  return result;
}
