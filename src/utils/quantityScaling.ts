/**
 * Quantity scaling utilities to prevent visualization lines from extending too far
 */

export interface ScalingResult {
  scaledValues: number[];
  scaleFactor: number;
  maxOriginalValue: number;
  maxScaledValue: number;
}

/**
 * Scales quantity values proportionally to keep them within reasonable visualization bounds
 * @param quantities Array of quantity values to scale
 * @param maxAllowedLength Maximum allowed line length (default: 1.5)
 * @param minLength Minimum line length for any quantity (default: 0.1)
 * @returns ScalingResult with scaled values and metadata
 */
export function scaleQuantities(
  quantities: number[],
  maxAllowedLength: number = 2.5,
  minLength: number = 0.2
): ScalingResult {
  if (quantities.length === 0) {
    return {
      scaledValues: [],
      scaleFactor: 1,
      maxOriginalValue: 0,
      maxScaledValue: 0,
    };
  }

  // Filter out invalid quantities
  const validQuantities = quantities.filter(q => q != null && q > 0);
  
  if (validQuantities.length === 0) {
    return {
      scaledValues: quantities.map(() => minLength),
      scaleFactor: 1,
      maxOriginalValue: 0,
      maxScaledValue: minLength,
    };
  }

  const maxOriginalValue = Math.max(...validQuantities);
  
  // If the maximum value would result in a reasonable line length, no scaling needed
  const directMaxLength = Math.max(minLength, Math.min(maxAllowedLength, maxOriginalValue / 50));
  
  if (directMaxLength <= maxAllowedLength * 0.9) {
    return {
      scaledValues: quantities.map(q => 
        q != null && q > 0 
          ? Math.max(minLength, Math.min(maxAllowedLength, q / 50))
          : minLength
      ),
      scaleFactor: 1,
      maxOriginalValue,
      maxScaledValue: directMaxLength,
    };
  }

  // Calculate scale factor to bring the maximum value down to maxAllowedLength
  const scaleFactor = (maxAllowedLength * 50) / maxOriginalValue;
  
  // Apply scaling to all quantities
  const scaledValues = quantities.map(q => {
    if (q == null || q <= 0) return minLength;
    const scaled = (q * scaleFactor) / 50;
    return Math.max(minLength, Math.min(maxAllowedLength, scaled));
  });

  return {
    scaledValues,
    scaleFactor,
    maxOriginalValue,
    maxScaledValue: maxAllowedLength,
  };
}

/**
 * Gets scaling information for display purposes
 * @param scalingResult Result from scaleQuantities function
 * @returns Formatted string with scaling information
 */
export function getScalingInfo(scalingResult: ScalingResult): string {
  if (scalingResult.scaleFactor === 1) {
    return "No scaling applied";
  }
  
  const percentage = Math.round((1 - scalingResult.scaleFactor) * 100);
  return `Values scaled down by ${percentage}% (max: ${scalingResult.maxOriginalValue} → ${scalingResult.maxScaledValue})`;
}
