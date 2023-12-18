const txHashPrefix = 'https://goerli.etherscan.io/tx/'
const addressPrefix = 'https://goerli.etherscan.io/address/'

export const getTxHashURL = (txHash: string) => {
  return txHashPrefix + txHash
}

export const getAddressURL = (address: string) => {
  return addressPrefix + address
}
