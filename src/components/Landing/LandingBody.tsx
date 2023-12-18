import { useBalances } from '@/hooks/useBalances'
const LandingBody = () => {
  const {
    gccBalance,
    glowBalance,
    nominationBalance,
    usdcBalance,
    usdgBalance,
  } = useBalances()

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
        rewards and incentiviizes the creation of clean solar energy.
      </p>
      <p className="text-3xl font-bold mt-8 mb-4">Your Balances</p>
      <p className="text-5xl text-gray-700">{glowBalance} GLW-BETA</p>
      <p className="text-5xl text-gray-700">{gccBalance} GCC-BETA</p>
      <p className="text-5xl text-gray-700">{nominationBalance} NOMINATIONS</p>
      <p className="text-5xl text-gray-700">{usdcBalance} USDC</p>
      <p className="text-5xl text-gray-700">{usdgBalance} USDG-GLOW</p>
    </div>
  )
}

export default LandingBody
