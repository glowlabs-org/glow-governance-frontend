import { useBalances } from '@/hooks/useBalances'
const LandingBody = () => {
  const {
    gccBalance,
    glowBalance,
    nominationBalance,
    usdcBalance,
    usdgBalance,
  } = useBalances()
  const parseFloatToFixed2OrEmptyString = (value: string) => {
    const parsed = parseFloat(value)
    if (isNaN(parsed)) return ''
    return parsed.toFixed(2)
  }
  return (
    <div className="pl-3 flex flex-col items-start justify-end py-8 max-w-[1400px] w-full bg-accent-1 rounded-xl">
      <h2 className=" text-7xl ">GLOW PROTOCOL</h2>
      <br />
      <p>
        The Glow Protocol is a decentralized governance protocol for the Glow
        ecosystem.
      </p>
      <p>
        Glow's goal is to create a decentralized, self-sustaining ecosystem that
        rewards and incentivizes the creation of clean solar energy.
      </p>
      <p className="text-3xl font-bold mt-8 mb-4">Your Balances</p>
      <p className="text-4xl text-gray-700">
        {parseFloatToFixed2OrEmptyString(glowBalance)} GLW-BETA
      </p>
      <p className="text-4xl text-gray-700">
        {parseFloatToFixed2OrEmptyString(gccBalance)} GCC-BETA
      </p>
      <p className="text-4xl text-gray-700">
        {parseFloatToFixed2OrEmptyString(nominationBalance)} NOMINATIONS
      </p>
      <p className="text-4xl text-gray-700">
        {parseFloatToFixed2OrEmptyString(usdcBalance)} USDC
      </p>
      <p className="text-4xl text-gray-700">
        {parseFloatToFixed2OrEmptyString(usdgBalance)} USDG-GLOW
      </p>
    </div>
  )
}

export default LandingBody
