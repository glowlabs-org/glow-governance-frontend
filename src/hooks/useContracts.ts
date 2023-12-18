import {
  TestGCC__factory,
  TestGLOW__factory,
  TestGCC,
  TestGLOW,
  Governance,
  Governance__factory,
  BatchCommit,
  BatchCommit__factory,
  MockUSDC,
  MockUSDC__factory,
  MinerPoolAndGCA,
  MinerPoolAndGCA__factory,
  USDG,
  USDG__factory,
} from '@/typechain-types'
import { useEthersSigner } from './useEthersSigner'
import { addresses } from '@/constants/addresses'
import { useState, useEffect } from 'react'
export const useContracts = () => {
  const [gcc, setGCC] = useState<TestGCC>()
  const [glow, setGlow] = useState<TestGLOW>()
  const [usdc, setUSDC] = useState<MockUSDC>()
  const [minerPoolAndGCA, setPoolAndGCA] = useState<MinerPoolAndGCA>()
  const [batchRetire, setBatchRetire] = useState<BatchCommit>()
  const [governance, setGovernance] = useState<Governance>()
  const [usdg, setUSDG] = useState<USDG>()
  const [genesisTimestamp, setGenesisTimestamp] = useState<number>(0)
  const { signer } = useEthersSigner()
  const [poolAddress, setPoolAddress] = useState<string>()
  const fetchPoolAddress = async () => {
    if (!gcc) return
    // const pool = await gcc.un
  }
  useEffect(() => {
    if (!signer) return
    const _gcc = TestGCC__factory.connect(addresses.gcc, signer)
    const _glow = TestGLOW__factory.connect(addresses.glow, signer)
    const _governance = Governance__factory.connect(
      addresses.governance,
      signer
    )
    const _poolAndGCA = MinerPoolAndGCA__factory.connect(
      addresses.gcaAndMinerPoolContract,
      signer
    )

    const _usdc = MockUSDC__factory.connect(addresses.usdc, signer)
    const _batchRetire = BatchCommit__factory.connect(
      addresses.batchCommit,
      signer
    )
    const _usdg = USDG__factory.connect(addresses.usdg, signer)
    setGCC(_gcc)
    setGlow(_glow)
    setGovernance(_governance)
    setBatchRetire(_batchRetire)
    setPoolAndGCA(_poolAndGCA)
    setUSDC(_usdc)
    setUSDG(_usdg)
  }, [signer])

  const fetchGenesisTimestamp = async () => {
    if (!glow) return
    const timestamp = await glow?.GENESIS_TIMESTAMP()
    setGenesisTimestamp(timestamp.toNumber())
  }
  useEffect(() => {
    fetchGenesisTimestamp()
  }, [glow])

  return {
    gcc,
    glow,
    governance,
    batchRetire,
    genesisTimestamp,
    usdc,
    minerPoolAndGCA,
    usdg,
  }
}
