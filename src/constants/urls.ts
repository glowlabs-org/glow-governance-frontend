const txHashPrefix = 'https://etherscan.io/tx/'
const addressPrefix = 'https://etherscan.io/address/'

export const getTxHashURL = (txHash: string) => {
  return txHashPrefix + txHash
}

export const getAddressURL = (address: string) => {
  return addressPrefix + address
}
