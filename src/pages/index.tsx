import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Manrope } from 'next/font/google'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
const inter = Manrope({ subsets: ['latin'] })
import { useEffect, useState } from 'react'
import { type FindRetirementsByAddressResponse } from '@/subgraph/queries'
import { useContracts } from '@/hooks/useContracts'
import { BigNumber, BigNumberish, ethers } from 'ethers'
import { findRetirementsByAddress } from '@/subgraph/queries'
import { addresses } from '@/constants/addresses'
import { ProposalDashResponse } from '@/subgraph/queries/proposals'
import { ProposalsTable, StatusLegend } from '@/components/Tables/Proposals'
import { Button } from '@/components/ui/button'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreateGovernanceProposal } from '@/components/CreateGovernanceProposal'
import LandingBody from '@/components/Landing/LandingBody'
import { MintGCCCard } from '@/components/Cards/MintGCC'
import { RetireGCCCard } from '@/components/Cards/RetireGCC'
import BatchRetire from '@/components/BatchRetire'
import { CommitUSDCCard } from '@/components/Cards/RetireUSDC'
import { MintUSDCCard } from '@/components/Cards/MintUSDC'
import { SwapUSDGCard } from '@/components/Cards/SwapUSDG'
import { useBalances } from '@/hooks/useBalances'
import { GetStaticPropsContext } from 'next'
import { findProposalsDash } from '@/subgraph/queries/proposals'

export default function Home({
  proposalDashInfo,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { openConnectModal } = useConnectModal()
  const { address } = useAccount()
  const { gcc, glow } = useContracts()
  const connect = () => {
    if (openConnectModal) {
      openConnectModal()
    }
  }

  const [amountGCCToMint, setAmountGCCToMint] = useState(0)

  const [amountToRetire, setAmountToRetire] = useState(0)
  const [gccBalance, setGCCBalance] = useState<string>('')
  const { nominationBalance } = useBalances()
  // const
  const [proposalPrice, setProposalPrice] = useState<string>()

  const { governance } = useContracts()
  const [retirements, setRetirements] =
    useState<FindRetirementsByAddressResponse>()

  const findRetirements = async () => {
    if (!address) return
    const res = await findRetirementsByAddress(address)
    setRetirements(res)
  }
  const findProposalPrice = async () => {
    if (!governance) return
    const proposalPrice = await governance.costForNewProposal()
    setProposalPrice(ethers.utils.formatUnits(proposalPrice, 12))
  }

  async function fetchGCCBalance() {
    if (!gcc) return
    if (!address) return
    const balance = await gcc.balanceOf(address!)
    setGCCBalance(ethers.utils.formatEther(balance))
  }

  useEffect(() => {
    findRetirements()
  }, [address])
  useEffect(() => {
    fetchGCCBalance()
    findProposalPrice()
  }, [gcc, governance])
  return (
    <main
      className={`flex min-h-screen flex-col container mx-auto p-24 ${inter.className}`}
    >
      <LandingBody />
      {address ? (
        <>
          {/* <h1 className='text-xl font-bold mb-4'>
        Goerli Test Functions
      </h1>
      <div className='pl-4 flex flex-col gap-y-3 py-4 rounded-md border-white  border'>
      <p>
        Signed In As: {address}
      </p>
      <p>
        GCC Balance: {gccBalance}
      </p>
      <p>
        GCC Address: {addresses.gcc}
      </p>
      </div> */}
          <div className="py-4  gap-y-4  gap-x-2 grid  grid-cols-1 lg:grid-cols-2 items-center  border-b-white border-b mb-12">
            {/* <MintGCCCard /> */}
            <RetireGCCCard />
            {/* <MintUSDCCard /> */}
            {/* <CommitUSDCCard /> */}
            <SwapUSDGCard />
          </div>
          <div className="py-4 border-b-white border-b mb-12">
            <h2 className="text-7xl mb-4  font-bold">
              Participate In Governance
            </h2>
            <h3 className="text-xl">
              Nominations Required to Create a Proposal: {proposalPrice}
            </h3>
            <h3>Your nominations: {nominationBalance}</h3>
            <CreateGovernanceProposal />
          </div>

          {/* <div>
            <h2 className="text-7xl mb-4  font-bold">Your Past Retirements</h2>
            <Table className="bg-white rounded-lg">
              <TableCaption>Past Retirements</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>GCC Retired</TableHead>
                  <TableHead>USDC Effect</TableHead>
                  <TableHead> Impact Power</TableHead>
                  <TableHead className="text-right">Reward Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retirements?.gccretireds.map((data) => (
                  <TableRow key={data.rewardAddress.id}>
                    <TableCell className="font-medium">
                      {new Date(
                        parseInt(data.blockTimestamp) * 1000
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {ethers.utils.formatEther(data.amountGCCRetired)}
                    </TableCell>
                    <TableCell>
                      {ethers.utils.formatUnits(data.usdcEffect, 6)}
                    </TableCell>
                    <TableCell>
                      {ethers.utils.formatUnits(data.impactPower, 12)}
                    </TableCell>

                    <TableCell className="text-right">
                      {data.rewardAddress.id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-12"></div>
    

            <div className="mt-12"></div>
            <h2 className="text-7xl mb-4  font-bold">Batch Retire</h2>
            <BatchRetire />
          </div> */}
          <h2 className="text-7xl mb-4  font-bold">Proposals</h2>
          <div className="mb-4">
            <StatusLegend />
          </div>
          <ProposalsTable proposalDashInfo={proposalDashInfo} />
        </>
      ) : (
        <Button onClick={connect}>Connect Wallet</Button>
      )}
    </main>
  )
}

//Get static props
export const getStaticProps = (async (ctx: GetStaticPropsContext) => {
  const res = await findProposalsDash()
  return {
    props: {
      proposalDashInfo: res,
    },
    revalidate: 30,
  }
}) satisfies GetStaticProps<{
  proposalDashInfo: ProposalDashResponse
}>
