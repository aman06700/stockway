/**
 * Centralized motion constants for consistent animations across the app.
 * Performance-optimized: uses only transform and opacity properties.
 */

// Durations in milliseconds
export const durations = {
  fast: 120,
  base: 180,
  slow: 240,
} as const;

// Easing curves
export const easings = {
  // Standard ease for most interactions
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Decelerate for entrances (starts fast, ends slow)
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  // Accelerate for exits (starts slow, ends fast)
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// Pre-built transition strings for common use cases
export const transitions = {
  // Button interactions
  button: `background-color ${durations.fast}ms ${easings.standard}, 
           transform ${durations.fast}ms ${easings.standard}, 
           border-color ${durations.fast}ms ${easings.standard}`,
  
  // Card hover effects
  card: `border-color ${durations.base}ms ${easings.standard}, 
         background-color ${durations.base}ms ${easings.standard}`,
  
  // Input focus transitions
  input: `border-color ${durations.base}ms ${easings.standard}`,
  
  // Link color transitions
  link: `color ${durations.fast}ms ${easings.standard}`,
  
  // Opacity fade
  fade: `opacity ${durations.base}ms ${easings.decelerate}`,
  
  // Transform + opacity for entrances
  entrance: `opacity ${durations.slow}ms ${easings.decelerate}, 
             transform ${durations.slow}ms ${easings.decelerate}`,
} as const;

// CSS custom properties to inject globally
export const motionCSSProperties = `
  --motion-duration-fast: ${durations.fast}ms;
  --motion-duration-base: ${durations.base}ms;
  --motion-duration-slow: ${durations.slow}ms;
  --motion-easing-standard: ${easings.standard};
  --motion-easing-decelerate: ${easings.decelerate};
  --motion-easing-accelerate: ${easings.accelerate};
`;
