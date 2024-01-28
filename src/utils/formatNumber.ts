export function formatNumber(num: number | string, decimals: number = 2) {
  if (typeof num === 'string') num = Number(num)
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
