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
  EarlyLiquidity,
  EarlyLiquidity__factory,
  VetoCouncil,
  VetoCouncil__factory,
  HoldingContract,
  HoldingContract__factory,
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
  const [vetoCouncilContract, setVetoCouncilContract] = useState<VetoCouncil>()
  const [holdingContract, setHoldingContract] = useState<HoldingContract>()
  const [usdg, setUSDG] = useState<USDG>()
  const [earlyLiquidity, setEarlyLiquidity] = useState<EarlyLiquidity>()
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
    const _earlyLiquidity = EarlyLiquidity__factory.connect(
      addresses.earlyLiquidity,
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
    const _vetoCouncilContract = VetoCouncil__factory.connect(
      addresses.vetoCouncilContract,
      signer
    )
    const _usdg = USDG__factory.connect(addresses.usdg, signer)

    const _holdingContract = HoldingContract__factory.connect(
      addresses.holdingContract,
      signer
    )
    setGCC(_gcc)
    setGlow(_glow)
    setGovernance(_governance)
    setBatchRetire(_batchRetire)
    setEarlyLiquidity(_earlyLiquidity)
    setPoolAndGCA(_poolAndGCA)
    setUSDC(_usdc)
    setVetoCouncilContract(_vetoCouncilContract)
    setUSDG(_usdg)
    setHoldingContract(_holdingContract)
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
    earlyLiquidity,
    usdg,
    vetoCouncilContract,
    holdingContract,
  }
}
