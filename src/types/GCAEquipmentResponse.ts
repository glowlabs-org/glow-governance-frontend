export type GCAEquipmentResponse = {
  EquipmentList: {
    [key: string]: number
  }
  EquipmentDetails: {
    [key: string]: EquipmentDetails
  }
}

export type EquipmentDetails = {
  PublicKey: number[]
  Latitude: number
  Longitude: number
  Capacity: number
  Debt: number
  Expiration: number
  Initialization: number
  ProtocolFee: number
  Signature: number[]
}
