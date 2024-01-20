export function formatNumber(num: number | string) {
  if (typeof num === 'string') num = Number(num)
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
