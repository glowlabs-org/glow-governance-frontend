'use client'
import { Manrope } from 'next/font/google'
import { useState } from 'react'
import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { getToken } from 'next-auth/jwt'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useContracts } from '@/hooks/useContracts'
import { BigNumber, ethers } from 'ethers'
import { PROXY_URL } from '@/constants/proxy-url'
import { useQueries } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import MerkleTree from 'merkletreejs'
import keccak256 from 'keccak256'
import { useSession } from 'next-auth/react'

const calculateCredits = (powerOutputs: number[], impactRates: number[]) => {
  let powerOutputsSum = 0
  let impactRatesSum = 0
  let credits = 0
  let totalDataPoints = 0
  if (powerOutputs.length !== impactRates.length)
    throw new Error('powerOutputs and impactRates must be the same length')
  for (let i = 0; i < powerOutputs.length; i++) {
    const powerOutput = powerOutputs[i]
    if (SENTINEL_VALUES.includes(powerOutput)) continue
    const impactRate = impactRates[i]
    powerOutputsSum += powerOutput
    impactRatesSum += impactRate
    credits += (powerOutput * impactRate) / 10 ** 15
    if (powerOutput !== 0) totalDataPoints++
  }
  // console.log({ totalDataPoints })

  return {
    credits,
    powerOutputsSum,
    impactRatesSum,
  }
}

const inter = Manrope({ subsets: ['latin'] })
const TESTING: boolean = false
const SENTINEL_VALUES = [1, 2] //1=cancelled, 2=ignore
type ServerDataResponse = {
  device: string
  powerOutput: number
  impactRate: number
  credits: number
  glowWeight: number
}
async function getServerData(url: string, weekNumber: number) {
  if (!url) return undefined
  if (!url.includes('http')) return undefined //TODO: Adjust this as needed
  let weekNumberMinus1 = weekNumber - 1
  if (weekNumberMinus1 < 0) weekNumberMinus1 = 0
  const weekTimes2016 = weekNumberMinus1 * 2016
  // alert(weekTimes2016)
  const fullUrl = `${PROXY_URL}/${url}?timeslot_offset=${weekTimes2016}`
  const equipmentUrl =
    (PROXY_URL + '/' + url).split('/all-device-stats')[0] + '/equipment'

  //make a promise.all
  const [equipmentDataRes, res] = await Promise.all([
    fetch(equipmentUrl),
    fetch(fullUrl),
  ])

  // const responseMap = new Map<ServerDataResponse & { glowWeight: string }>()
  const equipmentData = (await equipmentDataRes.json()) as GCAEquipmentResponse
  const equipmentDataMap = new Map<string, EquipmentDetails>()
  const equipmentDetailsKeys = Object.keys(equipmentData.EquipmentDetails)
  for (let i = 0; i < equipmentDetailsKeys.length; i++) {
    const key = equipmentDetailsKeys[i]
    const value = equipmentData.EquipmentDetails[key]
    if (value) {
      equipmentDataMap.set(farmPubKeyToId(value.PublicKey), value)
    }
  }
  const data = (await res.json()) as GCAServerResponse
  // console.log('full url = ', fullUrl)
  // console.log({ data })
  // console.log({ data })
  //TODO: calculate impact points the same way that /src/output.tsx does
  const serverData: ServerDataResponse[] = data.Devices.map((device, index) => {
    const { credits, powerOutputsSum, impactRatesSum } = calculateCredits(
      device.PowerOutputs,
      device.ImpactRates
    )
    let glowWeight = 0
    const equipmentDetails = equipmentDataMap.get(
      farmPubKeyToId(device.PublicKey)
    )
    if (!equipmentDetails) {
      console.log('equipmentDetails not found for ', device.PublicKey)
    } else {
      const donationSlot = equipmentDetails.Initialization
      const matchingTimestamp = GENESIS_TIMESTAMP + donationSlot * 300
      glowWeight = calculateVestingAmountForWeek({
        currentTimestamp: Date.now() / 1000,
        genesisTimestamp: GENESIS_TIMESTAMP,
        joinTimestamp: matchingTimestamp,
        totalVestingAmount: equipmentDetails.ProtocolFee,
        totalVestingWeeks: 192,
        vestingOffset: 16,
      })
      //Remove it from the map
      equipmentDataMap.delete(farmPubKeyToId(device.PublicKey))
      //
    }

    // console.log('------------------')
    // console.log('pubkey', farmPubKeyToId(device.PublicKey))
    // console.log(powerOutputsSum, impactRatesSum)
    return {
      device: farmPubKeyToId(device.PublicKey),
      powerOutput: powerOutputsSum,
      impactRate: impactRatesSum,
      credits: credits,
      glowWeight: glowWeight,
    }
  })

  // //Loop through all the farms that are left, and if they have a glow weight > 0, add them to the server data
  const values = Array.from(equipmentDataMap.values())
  for (const equipmentDetails of values) {
    const donationSlot = equipmentDetails.Initialization
    const matchingTimestamp = GENESIS_TIMESTAMP + donationSlot * 300
    const glowWeight = calculateVestingAmountForWeek({
      currentTimestamp: Date.now() / 1000,
      genesisTimestamp: GENESIS_TIMESTAMP,
      joinTimestamp: matchingTimestamp,
      totalVestingAmount: equipmentDetails.ProtocolFee,
      totalVestingWeeks: 192,
      vestingOffset: 16,
    })
    if (glowWeight > 0) {
      serverData.push({
        device: farmPubKeyToId(equipmentDetails.PublicKey),
        powerOutput: 0,
        impactRate: 0,
        credits: 0,
        glowWeight: glowWeight,
      })
    }
  }
  return serverData
}
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/T7rjxaeMhxl
 */
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from '@/components/ui/dropdown-menu'
import {
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from '@/components/ui/card'
import { API_URL } from '@/constants/api-url'
import { Label } from '@/components/ui/label'
import { getProtocolWeek } from '@/utils/getProtocolWeek'
import { GCAServerResponse } from '@/types/GCAServerResponse'
import { farmPubKeyToId } from '@/utils/farmPubKeyToId'

async function getAllGCAServerUrls(): Promise<string[]> {
  const res = await fetch(API_URL + '/gca-server-urls')
  const data = (await res.json()) as string[]
  console.log({ data })
  return data
}

type CheckIfDevicesExistType = {
  foundPubKeyHexes: {
    farmId: string
    pubKeyHex: string
    nickname: string
  }[]
  notFoundPubKeyHexes: string[]
}
async function checkIfDevicesExist(pubKeyHexes: string[]) {
  const queryUrl = API_URL + '/farm/checkIfDevicesExist'
  const queryParam = 'pubKeyHexes' + '=' + pubKeyHexes.join('&pubKeyHexes=')
  const res = await fetch(queryUrl + '?' + queryParam, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = (await res.json()) as CheckIfDevicesExistType
  return data
}

type GetAllGCAFarmsQueryResponse = {
  id: string
  name: string
  payoutWallet: string
  gcaWalletAddress: string
}

const getAllGCAFarms = async (gcaWalletAddress: string) => {
  const url = API_URL + '/farm/allFarmsForGCA'
  const queryParam = `gcaWalletAddress=${gcaWalletAddress}`
  const res = await fetch(url + '?' + queryParam, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = (await res.json()) as GetAllGCAFarmsQueryResponse[]
  return data
}
const isPubKeyFound = (pubKeyHex: string, data: CheckIfDevicesExistType) => {
  const onlyKeys = data.foundPubKeyHexes.map((d) => {
    return d.pubKeyHex
  })
  return onlyKeys.includes(pubKeyHex)
}

export default function Component({ rawJWT }: { rawJWT: string }) {
  // console.log('raw jwt', rawJWT)
  const { address } = useAccount()
  const { data: session } = useSession()
  const gcaWalletAddress = session?.user?.name || address
  const [serverUrl, setServerUrl] = useState('')
  const [weekNumber, setWeekNumber] = useState<number>(getProtocolWeek())
  const { minerPoolAndGCA: minerPoolAndGCA } = useContracts()
  const [query, { data: allServerUrls }, allGCAFarmsQuery] = useQueries({
    queries: [
      {
        queryKey: ['serverData', serverUrl, weekNumber],
        enabled:
          serverUrl.length > 0 &&
          serverUrl.includes('http') &&
          weekNumber !== undefined,
        refetchInterval: false, // Disable periodic refetching
        refetchOnMount: false, // Disable refetching on mount
        refetchOnWindowFocus: false, // Disable refetching when the window regains focus
        refetchOnReconnect: false, // Disable refetching on reconnect
        queryFn: () => getServerData(serverUrl, weekNumber!),
      },

      {
        queryKey: ['allServerUrls'],
        queryFn: getAllGCAServerUrls,
        refetchInterval: false, // Disable periodic refetching
        refetchOnMount: false, // Disable refetching on mount
        refetchOnWindowFocus: false, // Disable refetching when the window regains focus
        refetchOnReconnect: false, // Disable refetching on reconnect,
      },
      {
        queryKey: ['allGCAFarms'],
        queryFn: () => getAllGCAFarms(gcaWalletAddress || ''),
        refetchInterval: false, // Disable periodic refetching
        enabled: gcaWalletAddress !== undefined,
        refetchOnMount: false, // Disable refetching on mount
        refetchOnWindowFocus: false, // Disable refetching when the window regains focus
        refetchOnReconnect: false, // Disable refetching on reconnect,
      },
    ],
  })
  const [devicesExistQuery] = useQueries({
    queries: [
      {
        queryKey: ['devicesExist', serverUrl],
        enabled: query.isSuccess,
        refetchInterval: false, // Disable periodic refetching
        refetchOnMount: false, // Disable refetching on mount
        refetchOnWindowFocus: false, // Disable refetching when the window regains focus
        refetchOnReconnect: false, // Disable refetching on reconnect
        queryFn: () =>
          checkIfDevicesExist(
            query.data!.map((d) => {
              return d.device
            })
          ),
      },
    ],
  })

  const [unselectedDeviceIndexes, setUnselectedDeviceIndexes] = useState<
    number[]
  >([])

  const findNicknameFromPubkey = (pubKeyHex: string) => {
    return devicesExistQuery.data?.foundPubKeyHexes.find(
      (d) => d.pubKeyHex === pubKeyHex
    )?.nickname
  }
  const constructMerkleTree = async () => {
    if (!query.data) return
    if (!devicesExistQuery.data) return
    if (devicesExistQuery.data.notFoundPubKeyHexes.length > 0) {
      alert(
        'Some devices are not found in the database. Please add them to a farm first.'
      )
      // const leaves
      return
    }

    /**
     * Leaves are {glowWeight,usdcWeight,payoutWallet}
     * Payout wallet is the payout wallet of the farm
     * glowWeight and usdcWeight are the credits earned by the device
     */
    let totalGlowWeight = BigNumber.from(0)
    let totalUSDCWeight = BigNumber.from(0)
    let totalGCCProduced = BigNumber.from(0)

    const totalOwedToWalletMap = new Map<
      string,
      { glowWeight: BigNumber; usdcWeight: BigNumber }
    >()

    query.data.forEach((d, index) => {
      if (unselectedDeviceIndexes.includes(index)) return
      if (SENTINEL_VALUES.includes(d.powerOutput)) return
      if (d.credits == 0) return
      let numCredits = ethers.utils.parseEther(d.credits.toFixed(18))
      if (TESTING) {
        if (numCredits.eq(0)) {
          const randomNum = getRandomNumberBetween(0, 10_000)
          numCredits = ethers.utils.parseEther(randomNum.toString())
        }
      }

      const numCreditsDownScaled = numCredits.div(10 ** (18 - WEIGHTS_DECIMALS))

      //TODO: Left off here
      totalGlowWeight = totalGlowWeight.add(d.glowWeight)
      totalUSDCWeight = totalUSDCWeight.add(numCreditsDownScaled)
      totalGCCProduced = totalGCCProduced.add(numCredits)
      const devicePubKeyToFarm = devicesExistQuery.data?.foundPubKeyHexes.find(
        (d2) => d2.pubKeyHex.toLowerCase() === d.device.toLowerCase()
      )
      const farm = allGCAFarmsQuery.data?.find(
        (farm) =>
          farm.id.toLowerCase() === devicePubKeyToFarm?.farmId.toLowerCase()
      )
      console.log({ farm })
      const wallet = farm?.payoutWallet!

      console.log({ allGCAFarmsQuery: allGCAFarmsQuery.data })
      console.log({ wallet })
      if (totalOwedToWalletMap.has(wallet)) {
        const current = totalOwedToWalletMap.get(wallet)!
        totalOwedToWalletMap.set(wallet, {
          glowWeight: current.glowWeight.add(numCreditsDownScaled),
          usdcWeight: current.usdcWeight.add(numCreditsDownScaled),
        })
      } else {
        totalOwedToWalletMap.set(wallet, {
          glowWeight: numCreditsDownScaled,
          usdcWeight: numCreditsDownScaled,
        })
      }
    })

    const unhashedLeaves = Array.from(totalOwedToWalletMap.entries()).map(
      (d) => {
        return {
          glowWeight: d[1].glowWeight.toString(),
          usdcWeight: d[1].usdcWeight.toString(),
          address: d[0],
        }
      }
    )

    const leafType = ['address', 'uint256', 'uint256']
    const leaves = unhashedLeaves.map((d) => {
      const values = [d.address, d.glowWeight, d.usdcWeight]
      console.log({ values })
      const hash = ethers.utils.solidityKeccak256(leafType, values)
      return hash
    })

    const tree = new MerkleTree(leaves, keccak256, { sort: true })

    const root = tree.getHexRoot()
    /*
    const InsertMerkleTreeSchema = z.object({
    gcaWalletAddress: EthereumAddressSchema,
    week: StringNumberSchema,
    leaves: z.array(MerkleTreeLeaf),
    totalGlowWeight: StringNumberSchema,
    totalUSDCWeight: StringNumberSchema,
    totalNewGCC: StringNumberSchema,
    merkleRoot: ThirtyTwoBytesHexSchema,
})
*/
    console.log({ root, leaves, unhashedLeaves })

    //TODO: Implement GLOW Weight (Remember the offset is 16 so the bucket will already be finalized)
    // @0xSimbo should be as easy as finding out how much the device/farm donated to the pool for that bucket
    // and then doing the division

    const url = API_URL + '/reports/create'
    const body = {
      gcaWalletAddress: gcaWalletAddress || '',
      week: weekNumber, //from state
      leaves: unhashedLeaves,
      totalGlowWeight: totalGlowWeight.toString(),
      totalUSDCWeight: totalUSDCWeight.toString(),
      totalNewGCC: totalGCCProduced.toString(),
      merkleRoot: root,
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + rawJWT,
      },
      body: JSON.stringify(body),
    })

    const data = (await res.json()) as string

    if (!minerPoolAndGCA) return
    const currentBucket = await minerPoolAndGCA.currentBucket()

    const tx = await minerPoolAndGCA.submitWeeklyReport(
      currentBucket, // TODO: Change to current week - hardcode genesis timestamp
      totalGCCProduced,
      totalGlowWeight,
      totalUSDCWeight,
      root
    )

    await tx.wait()
  }

  return (
    <div className="grid h-screen relative min-h-screen w-full lg:grid-cols-[280px_1fr]">
      {TESTING && (
        <div className="fixed bottom-12  w-screen items-center justify-center flex bg-red-300/80 py-8 rounded-md border-black border">
          <p>You're in testing, turn this off in prod</p>
        </div>
      )}
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="#">
              <Package2Icon className="h-6 w-6" />
              <span>Glow</span>
            </Link>
            <Button className="ml-auto h-8 w-8" size="icon" variant="outline">
              <BellIcon className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <PackageIcon className="h-4 w-4" />
                All Farms
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <UsersIcon className="h-4 w-4" />
                Customers
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <LineChartIcon className="h-4 w-4" />
                Analytics
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 md:p-6">
        <header className="flex h-14 items-center gap-4 bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <Link className="lg:hidden" href="#">
            <Package2Icon className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="w-full flex-1">
            <form>
              {/* <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  className="w-full bg-white shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3 dark:bg-gray-950"
                  placeholder="Search"
                  type="search"
                />
              </div> */}
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full border border-gray-200 w-8 h-8 dark:border-gray-800"
                size="icon"
                variant="ghost"
              >
                <img
                  alt="Avatar"
                  className="rounded-full"
                  height="32"
                  src="/placeholder.svg"
                  style={{
                    aspectRatio: '32/32',
                    objectFit: 'cover',
                  }}
                  width="32"
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4">
          <h1 className="font-semibold text-lg md:text-xl">Analytics</h1>
          <CreateFarmButton gcaWalletAddress={gcaWalletAddress || 'Sign In'} />
          <Card className="flex flex-col mt-4">
            <CardHeader>
              <CardDescription>Funnel Graph</CardDescription>
            </CardHeader>
            <CardContent>
              {/* <BarChart className="w-full h-[300px]" /> */}
              {allServerUrls && (
                <RadioGroup defaultValue={allServerUrls[0]}>
                  {allServerUrls.map((url) => (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        onClick={() => {
                          setServerUrl(url)
                        }}
                        value="default"
                        id="r1"
                      />
                      <Label htmlFor="r1">{url}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {query.isFetching ||
                (devicesExistQuery.isFetching && (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  </div>
                ))}
              {query.data && devicesExistQuery.data && (
                <>
                  <Table className="bg-white rounded-lg">
                    <TableCaption>Server Data</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>Power Output</TableHead>
                        <TableHead>Impact Rate</TableHead>
                        <TableHead>Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {query.data.map((row, index) => {
                        return (
                          <TableRow key={row.device}>
                            <TableCell>
                              <>
                                {!isPubKeyFound(
                                  row.device,
                                  devicesExistQuery.data
                                ) && (
                                  <AddDeviceToFarmButton
                                    devicePubKeyHex={row.device}
                                    farms={allGCAFarmsQuery.data || []}
                                  />
                                )}

                                {!isPubKeyFound(
                                  row.device,
                                  devicesExistQuery.data
                                ) ? (
                                  <>{'⚠️' + row.device}</>
                                ) : (
                                  <>
                                    {/*Radio Group to remove the index if its selected*/}
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        // className="w-12"
                                        checked={
                                          !unselectedDeviceIndexes.includes(
                                            index
                                          ) && row.credits !== 0
                                          // &&
                                          // !SENTINEL_VALUES.includes(
                                          //   row.powerOutput
                                          // )
                                        }
                                        disabled={row.credits == 0}
                                        onCheckedChange={() => {
                                          //toggle it
                                          if (
                                            unselectedDeviceIndexes.includes(
                                              index
                                            )
                                          ) {
                                            setUnselectedDeviceIndexes(
                                              unselectedDeviceIndexes.filter(
                                                (i) => i !== index
                                              )
                                            )
                                          } else {
                                            setUnselectedDeviceIndexes([
                                              ...unselectedDeviceIndexes,
                                              index,
                                            ])
                                          }
                                        }}
                                        value={'default'}
                                        id={`r1${index}`}
                                      />
                                      <Label htmlFor="r1">
                                        {findNicknameFromPubkey(row.device)}
                                      </Label>
                                    </div>
                                  </>
                                )}
                              </>
                            </TableCell>
                            <TableCell>
                              {(row.powerOutput / 1e6).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {(row.impactRate / 1e3).toFixed(2)}
                            </TableCell>
                            <TableCell>{row.credits}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  <Button onClick={constructMerkleTree}>
                    Submit Report On-Chain
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

type SVGProps = React.SVGProps<SVGSVGElement>
function BellIcon(props: SVGProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function HomeIcon(props: SVGProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function LineChartIcon(props: SVGProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

function Package2Icon(props: SVGProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  )
}

function PackageIcon(props: SVGProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function SearchIcon(props: SVGProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function UsersIcon(props: SVGProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

type CreateFarmParams = {
  name: string
  payoutWallet: string
  gcaWalletAddress: string
}
async function createAFarmMutation(data: CreateFarmParams) {
  if (!isAddress(data.payoutWallet)) {
    alert('Insert a valid ethereum address')
    throw new Error('Invalid payout wallet')
  }
  const res = await fetch(API_URL + '/farm/createFarm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  console.log(res)
  const data2 = (await res.json()) as string
  return data2
}

import { useMutation } from '@tanstack/react-query'
import { isAddress, parseEther } from 'viem'
import { Switch } from '@/components/ui/switch'
import { GetServerSidePropsContext } from 'next'
import { useAccount } from 'wagmi'
import {
  EquipmentDetails,
  GCAEquipmentResponse,
} from '@/types/GCAEquipmentResponse'
import { GENESIS_TIMESTAMP } from '@/constants/genesis-timestamp'
import { calculateVestingAmountForWeek } from '@/utils/calculateVestingAmountForWeek'
export function CreateFarmButton({
  gcaWalletAddress,
}: {
  gcaWalletAddress: string
}) {
  const { mutate, data, isSuccess, isLoading } =
    useMutation(createAFarmMutation)
  const [payoutWallet, setPayoutWallet] = useState<string>('')
  const [name, setName] = useState<string>('')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-32" variant="default">
          Create A Farm
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create A Farm</DialogTitle>
          <DialogDescription>
            Create a farm so you can add devices to it
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              onChange={(e) => setName(e.target.value)}
              id="name"
              defaultValue="Nevada Farm 1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payoutWallet" className="text-right">
              Payout Wallet
            </Label>
            <Input
              onChange={(e) => setPayoutWallet(e.target.value)}
              id="payoutWallet"
              defaultValue="0x01......"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gcaWallet" className="text-right">
              GCA Wallet (you)
            </Label>
            <Input
              disabled={true}
              id="gcaWallet"
              defaultValue={gcaWalletAddress}
              className="col-span-3 bg-zinc-200"
            />
          </div>
        </div>
        <DialogFooter>
          {/* <Button type="submit"></Button> */}
          {isLoading || isSuccess ? (
            <Button disabled>
              {isLoading ? 'Creating Farm...' : 'Farm Created!'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                mutate({
                  name: name,
                  payoutWallet: payoutWallet,
                  gcaWalletAddress: gcaWalletAddress,
                })
              }}
            >
              Create Farm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AddDeviceToFarmButtonProps = {
  devicePubKeyHex: string
  farms: GetAllGCAFarmsQueryResponse[]
}

type ValueLabel = {
  value: string
  label: string
  farmId: string
}[]

type AddDeviceToFarmParams = {
  pubKeyHex: string
  farmId: string
  nickname: string
}
async function addDeviceToFarm(args: AddDeviceToFarmParams) {
  console.log({ args })
  const res = await fetch(API_URL + '/farm/createDevice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  })
  const data = (await res.json()) as string
  return data
}

export function AddDeviceToFarmButton(props: AddDeviceToFarmButtonProps) {
  const { devicePubKeyHex, farms } = props
  const [nickname, setNickname] = useState<string>('')
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [valueLabels, setValueLabels] = useState<ValueLabel>([])

  const { mutate, data, isSuccess, isLoading } = useMutation(addDeviceToFarm)

  const findSelectedFarmId = () => {
    const farm = valueLabels.find(
      (valueLabel) => valueLabel.value.toLowerCase() === value.toLowerCase()
    )?.farmId
    return farm
  }
  React.useEffect(() => {
    setValueLabels(
      farms.map((farm) => {
        return {
          value: farm.name,
          label: farm.name,
          farmId: farm.id,
        }
      })
    )
  }, [farms])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-20 bg-red-400 hover:bg-red-400 text-xs"
          variant="default"
        >
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add This Device To Farm</DialogTitle>
          <DialogDescription>
            Select a farm to add this device to
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            onChange={(e) => setNickname(e.target.value)}
            id="nickname"
            placeholder="Device Nickname"
          />

          {/* start modal */}
          <p className="text-sm">
            Which farm would you like to add this device to?{' '}
          </p>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[400px] justify-between"
              >
                {value
                  ? valueLabels.find(
                      (framework) =>
                        framework.value.toLowerCase() === value.toLowerCase()
                    )?.label
                  : 'Select farm...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search farm..." />
                <CommandEmpty>No farm found.</CommandEmpty>
                <CommandGroup>
                  {valueLabels.map((valueLabels) => (
                    <CommandItem
                      key={valueLabels.value}
                      value={valueLabels.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? '' : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === valueLabels.value
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {valueLabels.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          {/* <Button type="submit"></Button> */}
          {/* <Button>Add Device To Farm</Button> */}
          {isSuccess ? (
            <Button disabled>
              {isLoading ? 'Adding Device...' : 'Device Added!'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                mutate({
                  pubKeyHex: devicePubKeyHex,
                  farmId: findSelectedFarmId() || '',
                  nickname: nickname,
                })
              }}
            >
              Add Device To Farm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getRandomNumberBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const WEIGHTS_DECIMALS = 6

//get server data

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const token = await getToken({ ...context, raw: true })
  return {
    props: {
      rawJWT: token || '',
    },
  }
}
