export function computeGeometricSeries(
  firstTerm: number,
  commonRatio: number,
  numberOfTerms: number
): number {
  // Check if the common ratio is 1, as it requires a different formula
  if (commonRatio === 1) {
    return firstTerm * numberOfTerms
  }

  // Use the geometric series formula
  let sum =
    (firstTerm * (1 - Math.pow(commonRatio, numberOfTerms))) / (1 - commonRatio)
  return sum
}
