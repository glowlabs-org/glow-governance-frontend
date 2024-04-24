import React, { use, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { API_URL } from '@/constants/api-url'
import { useQueries } from '@tanstack/react-query'
import { getProtocolWeek } from '@/utils/getProtocolWeek'
// import {useMultical}
import { Contract, Provider } from 'ethers-multicall'
import { minerPoolAndGCAAbi } from '@/constants/abis/MinerPoolAndGCAEthersAbi.abi'
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
import { formatUnits, getAddress, isAddress } from 'viem'
import { Input } from '@/components/ui/input'
import { useAccount } from 'wagmi'
import { BucketSubmission } from '@/typechain-types'
import ClaimUSDGRow from './components/ClaimUSDGRow'

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
  const { address: payoutWallet } = useAccount()
  // const payoutWallet = '0x2e2771032d119fe590FD65061Ad3B366C8e9B7b9'
  const gcaWalletAddress = '0xB2d687b199ee40e6113CD490455cC81eC325C496'
  // const [queryInfo] = useQueries({
  //   queries: [
  //     {
  //       enabled: payoutWallet && isAddress(payoutWallet),
  //       refetchInterval: false,
  //       refetchOnMount: false,
  //       queryKey: ['farm', payoutWallet],
  //       queryFn: () => getFarmFromAPI(payoutWallet!),
  //     },
  //   ],
  // })
  const { minerPoolAndGCA } = useContracts()
  const [multicallBucketResults, setMulticallBucketResults] =
    useState<BucketCallResult[]>()

  async function getReportForWeeksMulticall() {
    if (typeof window === 'undefined') return
    if (!minerPoolAndGCA) return
    //@ts-ignore
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_PRIVATE_RPC_URL
    )
    const MulticallProvider = new Provider(provider)
    await MulticallProvider.init()
    const minerPoolMulticallContract = new Contract(
      minerPoolAndGCA.address,
      minerPoolAndGCAAbi
    )

    const calls = weeksArray.slice(9).map((weekNumber) => {
      return minerPoolMulticallContract.bucket(weekNumber)
    })
    const results = (await MulticallProvider.all(calls)) as BucketCallResult[]
    console.log({ results })
    setMulticallBucketResults(results)
    return results
  }

  useEffect(() => {
    getReportForWeeksMulticall()
  }, [minerPoolAndGCA])

  // if (queryInfo.isLoading)
  //   return <div className="container mx-auto">Loading...</div>

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">Farm</h1>
      <div className="mt-4">
        <div className="font-bold">Name</div>
        {/* <div>{queryInfo.data?.name}</div> */}
      </div>
      <div className="mt-4">
        <div className="font-bold">Payout Wallet</div>
        <div>{payoutWallet}</div>
      </div>
      <div className="mt-4">
        <div className="font-bold">GCA Wallet Address</div>
        <div>{gcaWalletAddress}</div>
      </div>
      <div className="mt-4">
        <h3 className=" font-bold">USDG Stats</h3>
        <ClaimUSDGRow />
      </div>
      {!payoutWallet && <Button>Make sure to connect your wallet</Button>}
      {payoutWallet && (
        <Table className="bg-white mt-12 rounded-lg">
          <TableCaption>Payouts</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Week</TableHead>
              {/* <TableHead>Glow Rewards</TableHead>
              <TableHead>USDG Rewards</TableHead> */}

              <TableHead>More Information</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {multicallBucketResults?.map((week, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>{index + 9}</TableCell>
                  {/* <TableCell>
                    {' '}
                    {week.reports[0].totalGLWRewardsWeight.toString()}
                  </TableCell>
                  <TableCell>
                    {week.reports[0].totalGRCRewardsWeight.toString()}
                  </TableCell> */}
                  <TableCell>
                    <MoreInfoButton
                      bucket={week}
                      gcaWalletAddress={gcaWalletAddress}
                      bucketNumber={index + 9}
                      payoutWallet={payoutWallet || ''}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
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

type MerkleTreeApiResponse = {
  address?: string
  wallet?: string
  glowWeight: string
  usdcWeight?: string
  usdgWeight?: string
}
async function getMerkleTreeFromRoot(
  gca: string,
  weekNumber: number,
  merkleRoot: string,
  payoutWallet: string,
  bucketCall: BucketCallResult
) {
  // const url = `${API_URL}/farm/merkleTree?merkleRoot=${merkleRoot}`
  // const url = `https://glow-merkle-trees.s3.amazonaws.com/${getAddress(
  //   gca
  // )}/${weekNumber}/${merkleRoot}.json`
  const url = `https://pub-7e0365747f054c9e85051df5f20fa815.r2.dev/week-${
    weekNumber - 1
  }%2Fmerkletree.json`
  const res = await fetch(url)
  const merkleTree = (await res.json()) as MerkleTreeApiResponse[]
  const cleanedMerkleTree = merkleTree.map((leaf) => {
    return {
      address: leaf.address || leaf.wallet,
      glowWeight: leaf.glowWeight,
      usdcWeight: leaf.usdcWeight || leaf.usdgWeight || '0',
    }
  })

  let leafGlowWeightStr = merkleTree.find(
    (leaf) => leaf.address?.toLowerCase() === payoutWallet.toLowerCase()
  )?.glowWeight

  if (!leafGlowWeightStr) {
    leafGlowWeightStr = merkleTree.find(
      (leaf) => leaf.wallet?.toLowerCase() === payoutWallet.toLowerCase()
    )?.glowWeight
  }

  let leafUsdcWeightStr = merkleTree.find(
    (leaf) => leaf.address?.toLowerCase() === payoutWallet.toLowerCase()
  )?.usdcWeight

  if (!leafUsdcWeightStr) {
    leafUsdcWeightStr = merkleTree.find(
      (leaf) => leaf.wallet?.toLowerCase() === payoutWallet.toLowerCase()
    )?.usdcWeight
  }

  if (!leafUsdcWeightStr) {
    leafUsdcWeightStr = merkleTree.find(
      (leaf) => leaf.address?.toLowerCase() === payoutWallet.toLowerCase()
    )?.usdgWeight
  }

  if (!leafUsdcWeightStr) {
    leafUsdcWeightStr = merkleTree.find(
      (leaf) => leaf.wallet?.toLowerCase() === payoutWallet.toLowerCase()
    )?.usdgWeight
  }
  //
  const leafGlowWeight = BigInt(leafGlowWeightStr || '0')
  const leafUsdcWeight = BigInt(leafUsdcWeightStr || '0')
  console.log({ leafGlowWeight, leafUsdcWeight })
  return {
    merkleTree: cleanedMerkleTree,
    leafGlowWeight,
    leafUsdcWeight,
  }
}
export function MoreInfoButton({
  bucket,
  gcaWalletAddress,
  bucketNumber,
  payoutWallet,
}: MoreInfoButtonProps) {
  const data = bucket
  const { minerPoolAndGCA } = useContracts()
  const [rewards, setRewards] =
    useState<BucketSubmission.WeeklyRewardStructOutput>()

  useEffect(() => {
    async function getRewards() {
      try {
        if (!minerPoolAndGCA) return
        const rewards = await minerPoolAndGCA.reward(bucketNumber)
        setRewards(rewards)
      } catch (e) {}
    }
    getRewards()
  }, [minerPoolAndGCA])
  const bucketOfGCA = data.reports.find(
    (report) =>
      report.proposingAgent.toLowerCase() === gcaWalletAddress.toLowerCase()
  )
  if (!bucketOfGCA) return <Button>N/A</Button>

  if (!bucketOfGCA) return <Button>N/A</Button>
  const [merkleTreeQuery] = useQueries({
    queries: [
      {
        enabled: !!data && !!bucketOfGCA && isAddress(gcaWalletAddress),
        refetchInterval: false,
        refetchOnMount: false,
        staleTime: Infinity,
        queryKey: ['merkleTree', bucketOfGCA!.merkleRoot],
        queryFn: () =>
          getMerkleTreeFromRoot(
            gcaWalletAddress,
            bucketNumber,
            bucketOfGCA!.merkleRoot,
            payoutWallet,
            data
          ),
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
    let leafForPayoutWallet = merkleTreeQuery.data.merkleTree.find(
      (leaf) => leaf.address?.toLowerCase() == payoutWallet.toLowerCase() /// @0xSimbo Check if this is ok.
    )

    const { address, glowWeight, usdcWeight } = leafForPayoutWallet!

    const leafType = ['address', 'uint256', 'uint256']

    let targetLeaf = ethers.utils.solidityKeccak256(leafType, [
      address,
      glowWeight,
      usdcWeight,
    ])
    const leaves = merkleTreeQuery.data.merkleTree.map((leaf) => {
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

  if (!merkleTreeQuery.data) return <Button>Not Ready</Button>
  //If the weights are 0 in the merkle tree, then the user is not in the merkle tree
  if (
    merkleTreeQuery.data.leafGlowWeight === BigInt(0) &&
    merkleTreeQuery.data.leafUsdcWeight === BigInt(0)
  ) {
    return <Button>No Rewards For You</Button>
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
                  <div className="font-bold">Glow Rewards</div>
                  <div>
                    {(
                      (merkleTreeQuery.data?.leafGlowWeight! *
                        BigInt(175_000)) /
                      report.totalGLWRewardsWeight.toBigInt()
                    ).toString()}
                  </div>
                  <div className="font-bold">USDC Rewards</div>
                  {(report.totalGRCRewardsWeight.toBigInt() || BigInt(0)) >
                    BigInt(0) && (
                    <div>
                      {(merkleTreeQuery.data?.leafUsdcWeight || BigInt(0)) ===
                      BigInt(0)
                        ? '0'
                        : formatUnits(
                            ((rewards?.amountInBucket.toBigInt() || BigInt(0)) *
                              merkleTreeQuery.data?.leafUsdcWeight) /
                              report.totalGRCRewardsWeight.toBigInt(),
                            6
                          ).toString()}
                    </div>
                  )}
                  {`amount in bucket: ${rewards?.amountInBucket.toString()}` +
                    `\n\n` +
                    `totalGRCRewardsWeight: ${report.totalGRCRewardsWeight.toString()}` +
                    `\n\n` +
                    `leafUsdcWeight: ${merkleTreeQuery.data?.leafUsdcWeight}`}
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
