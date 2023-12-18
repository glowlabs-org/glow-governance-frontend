import React, { use, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { API_URL } from '@/constants/api-url'
import { useQueries } from '@tanstack/react-query'
import { getProtocolWeek } from '@/utils/getProtocolWeek'
// import {useMultical}
import { Contract, Provider } from 'ethers-multicall'
import { minerPoolAndGCAAbi } from '@/constants/abis/MinerPoolAndGCA.abi'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useContracts } from '@/hooks/useContracts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BigNumber, ethers } from 'ethers'
import { addresses } from '@/constants/addresses'
import keccak256 from 'keccak256'
import MerkleTree from 'merkletreejs'

type GetFarmFromApiQueryResponse = {
  id: string
  name: string
  payoutWallet: string
  gcaWalletAddress: string
}

type BucketCallResult = {
  finalizationTimestamp: number | BigNumber
  lastUpdatedNonce: number | BigNumber
  originalNonce: number | BigNumber
  reports: {
    proposingAgent: string
    merkleRoot: string
    totalGLWRewardsWeight: BigNumber
    totalGRCRewardsWeight: BigNumber
    totalNewGCC: BigNumber
  }[]
}
async function getFarmFromAPI(
  payoutWallet: string
): Promise<GetFarmFromApiQueryResponse> {
  const url = `${API_URL}/farm/farmByPayoutWallet?payoutWallet=${payoutWallet}`
  const res = await fetch(url)
  const data = (await res.json()) as GetFarmFromApiQueryResponse
  return data
}

const weeksArray = Array.from(Array(getProtocolWeek()).keys())
const Farm = () => {
  const { query } = useRouter()
  const { payoutWallet } = query as { payoutWallet: string }
  const [queryInfo] = useQueries({
    queries: [
      {
        enabled: !!payoutWallet,
        refetchInterval: false,
        refetchOnMount: false,
        queryKey: ['farm', payoutWallet],
        queryFn: () => getFarmFromAPI(payoutWallet),
      },
    ],
  })
  const { minerPoolAndGCA, governance } = useContracts()
  const [multicallBucketResults, setMulticallBucketResults] =
    useState<BucketCallResult[]>()

  async function getReportForWeek(weekNumber: number) {
    if (!minerPoolAndGCA) return
    const gcaWalletAddress = queryInfo.data?.gcaWalletAddress
    if (!gcaWalletAddress) return
    const bucket = await minerPoolAndGCA.bucket(weekNumber)
    const { finalizationTimestamp, lastUpdatedNonce, originalNonce } = bucket
    const { reports } = bucket
    const reportOfGCA = reports.find(
      (report) =>
        report.proposingAgent.toLowerCase() === gcaWalletAddress.toLowerCase()
    )

    if (!reportOfGCA) return
    console.log({ reportOfGCA })
    return reportOfGCA
  }

  async function getReportForWeeksMulticall() {
    if (typeof window === 'undefined') return
    if (!minerPoolAndGCA) return
    //@ts-ignore
    const provider = new ethers.providers.Web3Provider(window?.ethereum)
    const MulticallProvider = new Provider(provider)
    await MulticallProvider.init()
    const minerPoolMulticallContract = new Contract(
      minerPoolAndGCA.address,
      minerPoolAndGCAAbi
    )

    const calls = weeksArray.map((weekNumber) => {
      return minerPoolMulticallContract.bucket(weekNumber)
    })
    const results = (await MulticallProvider.all(calls)) as BucketCallResult[]
    setMulticallBucketResults(results)
    return results
  }

  useEffect(() => {
    getReportForWeeksMulticall()
  }, [minerPoolAndGCA])

  if (queryInfo.isLoading)
    return <div className="container mx-auto">Loading...</div>

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">Farm</h1>
      <div className="mt-4">
        <div className="font-bold">Name</div>
        <div>{queryInfo.data?.name}</div>
      </div>
      <div className="mt-4">
        <div className="font-bold">Payout Wallet</div>
        <div>{queryInfo.data?.payoutWallet}</div>
      </div>
      <div className="mt-4">
        <div className="font-bold">GCA Wallet Address</div>
        <div>{queryInfo.data?.gcaWalletAddress}</div>
      </div>

      <Table className="bg-white mt-12 rounded-lg">
        <TableCaption>Payouts</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Already Claimed</TableHead>
            <TableHead>More Information</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {multicallBucketResults?.map((week, index) => {
            return (
              <TableRow key={index}>
                <TableCell>{index}</TableCell>
                <TableCell>0</TableCell>
                <TableCell>
                  <MoreInfoButton
                    bucket={week}
                    gcaWalletAddress={queryInfo.data?.gcaWalletAddress || ''}
                    bucketNumber={index}
                    payoutWallet={payoutWallet}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default Farm

type MoreInfoButtonProps = {
  bucket: BucketCallResult
  gcaWalletAddress: string
  bucketNumber: number
  payoutWallet: string
}

type GetMerkleTreeFromRootSingle = {
  address: string
  glowWeight: string
  usdcWeight: string
}
async function getMerkleTreeFromRoot(merkleRoot: string) {
  const url = `${API_URL}/reports/getReportByRoot?merkleRoot=${merkleRoot}`
  const res = await fetch(url)
  const data = await res.json()

  const merkleTreeUrl = data.merkleTreeUrl as string
  const merkleTreeRes = await fetch(merkleTreeUrl)
  const merkleTreeData = await merkleTreeRes.json()
  const merkleTree = merkleTreeData as GetMerkleTreeFromRootSingle[]

  return merkleTree
}
export function MoreInfoButton({
  bucket,
  gcaWalletAddress,
  bucketNumber,
  payoutWallet,
}: MoreInfoButtonProps) {
  const data = bucket
  const { minerPoolAndGCA, governance } = useContracts()
  const bucketOfGCA = data.reports.find(
    (report) =>
      report.proposingAgent.toLowerCase() === gcaWalletAddress.toLowerCase()
  )

  if (!bucketOfGCA) return <Button>N/A</Button>
  const [merkleTreeQuery] = useQueries({
    queries: [
      {
        enabled: !!data && !!bucketOfGCA,
        refetchInterval: false,
        refetchOnMount: false,
        staleTime: Infinity,
        queryKey: ['merkleTree', bucketOfGCA!.merkleRoot],
        queryFn: () => getMerkleTreeFromRoot(bucketOfGCA!.merkleRoot),
      },
    ],
  })

  const claimRewardFunction = async () => {
    if (!minerPoolAndGCA) return
    if (!merkleTreeQuery.data) return

    //TODO: If there's a GCA change, this wont work since
    // The GCA would change. Need to make sure we correctly handle GCA changes
    const allGCAs = await minerPoolAndGCA.allGcas()
    const indexOfGCA = allGCAs.findIndex(
      (gca) => gca.toLowerCase() === gcaWalletAddress.toLowerCase()
    )

    console.log({ payoutWallet })
    const leafForPayoutWallet = merkleTreeQuery.data.find(
      (leaf) => leaf.address.toLowerCase() == payoutWallet.toLowerCase()
    )
    const { address, glowWeight, usdcWeight } = leafForPayoutWallet!

    const leafType = ['address', 'uint256', 'uint256']

    let targetLeaf = ethers.utils.solidityKeccak256(leafType, [
      address,
      glowWeight,
      usdcWeight,
    ])
    const leaves = merkleTreeQuery.data.map((leaf) => {
      const values = [leaf.address, leaf.glowWeight, leaf.usdcWeight]
      const hash = ethers.utils.solidityKeccak256(leafType, values)
      return hash
    })

    const tree = new MerkleTree(leaves, keccak256, { sort: true })

    const proof = tree.getHexProof(targetLeaf)
    const isValidProof = tree.verify(proof, targetLeaf, tree.getHexRoot())
    console.log({ isValidProof })
    console.log({ proof })

    const bucket = await minerPoolAndGCA.bucket(bucketNumber)
    console.log({ bucket })

    console.log({
      bucketNumber,
      glowWeight,
      usdcWeight,
      proof,
      indexOfGCA,
      payoutWallet,
    })

    /**
     * @param bucketNumber uint256
     * @param glowWeight uint256
     * @param usdcWeight uint256
     * @param merkleProof bytes32[]
     * @param indexOfGCA uint256
     * @param payoutWallet address
     * @param claimFromInflation bool
     * @param signature bytes (for relays)
     */
    const tx = await minerPoolAndGCA.claimRewardFromBucket(
      bucketNumber,
      glowWeight,
      usdcWeight,
      proof,
      indexOfGCA,
      payoutWallet,
      true,
      '0x'
    )

    await tx.wait()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-32" variant="default">
          More Info
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Week Stats</DialogTitle>
          <DialogDescription>
            See ths information about the week
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            {/* {JSON.stringify(data)} */}
            <div className="font-bold">Finalization Timestamp</div>
            <div>{data.finalizationTimestamp.toString()}</div>
            <div className="font-bold">Last Updated Nonce</div>
            <div>{data.lastUpdatedNonce.toString()}</div>
            <div className="font-bold">Original Nonce</div>
            <div>{data.originalNonce.toString()}</div>
          </div>
          <div className="grid grid-cols-2 items-center border px-2 rounded-lg border-black gap-4">
            {data.reports.map((report, index) => {
              if (
                report.proposingAgent.toLowerCase() !==
                gcaWalletAddress.toLowerCase()
              )
                return null

              return (
                <div key={index}>
                  <div className="font-bold">Proposing Agent</div>
                  <div>{report.proposingAgent}</div>
                  <div className="font-bold">Merkle Root</div>
                  <div>{report.merkleRoot}</div>
                  <div className="font-bold">Total GLW Rewards Weight</div>
                  <div>{report.totalGLWRewardsWeight.toString()}</div>
                  <div className="font-bold">Total GRC Rewards Weight</div>
                  <div>{report.totalGRCRewardsWeight.toString()}</div>
                  <div className="font-bold">Total New GCC</div>
                  <div>
                    {ethers.utils.formatEther(report.totalNewGCC.toString())}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={claimRewardFunction}>Claim Your Reward</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
