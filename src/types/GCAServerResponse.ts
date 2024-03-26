export type GCAServerResponse = {
  Devices: {
    PublicKey: number[]
    PowerOutputs: number[]
    ImpactRates: number[]
  }[]
  TimeslotOffset: number
  Signature: number[]
}
