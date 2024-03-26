import { computeGeometricSeries } from './math/computeGeometricSeries'

export function computeTotalRaisedFromEarlyLiquidity(totalSold: number) {
  let firstTerm = 0.3 // First term of the series
  let commonRatio = 1.0000006931474208 // Common ratio
  const seriesSum = computeGeometricSeries(firstTerm, commonRatio, totalSold)
  return seriesSum
}
