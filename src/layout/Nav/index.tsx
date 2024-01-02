import React from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useAccountModal } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

const Nav = () => {
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { address } = useAccount()
  const { data: session, status } = useSession()

  const connect = () => {
    if (openConnectModal) {
      openConnectModal()
    }
  }

  const showInfo = () => {
    if (openAccountModal) {
      openAccountModal()
    }
  }

  return (
    <div className="container w-full mx-auto py-2 border-b-gray-400 border-b">
      <div className="grid grid-cols-2 gap-x-4 items-center">
        <div className="flex flex-row items-center gap-x-4">
          {/* <img src="https://www.glowlabs.org/assets/imgs/logos/glow-logo.png"
        className='w-12 h-12'/>
        <h2 className='font-bold text-xl'>
            GLOW
        </h2> */}
          <a href="/">
            {/* <svg
              className="cursor-pointer"
              width="139"
              height="30"
              viewBox="0 0 139 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.9958 9L20.4229 10.4875L17.8501 11.975"
                stroke="black"
                stroke-width="2.79766"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M17.8501 18.0117L20.4229 19.4992L22.9958 20.9867"
                stroke="black"
                stroke-width="2.79766"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M7.14567 11.975L4.57283 10.4875L2 9"
                stroke="black"
                stroke-width="2.79766"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M2 20.9867L4.57283 19.4992L7.14567 18.0117"
                stroke="black"
                stroke-width="2.79766"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M12.5 4V26"
                stroke="black"
                stroke-width="2.79766"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M40.29 22.3C39.3233 22.3 38.4333 22.1333 37.62 21.8C36.8067 21.46 36.1 20.9667 35.5 20.32C34.9 19.6733 34.4333 18.8867 34.1 17.96C33.7667 17.0333 33.6 15.98 33.6 14.8C33.6 13.2467 33.8833 11.9133 34.45 10.8C35.0167 9.68 35.8033 8.82 36.81 8.22C37.8167 7.61333 38.9767 7.31 40.29 7.31C41.9833 7.31 43.3333 7.70333 44.34 8.49C45.3533 9.27667 46.0433 10.3633 46.41 11.75L44.29 12.13C43.9967 11.27 43.5233 10.5833 42.87 10.07C42.2167 9.55667 41.3967 9.29667 40.41 9.29C39.39 9.28333 38.54 9.51 37.86 9.97C37.1867 10.43 36.68 11.0767 36.34 11.91C36 12.7367 35.8267 13.7 35.82 14.8C35.8133 15.9 35.98 16.8633 36.32 17.69C36.66 18.51 37.17 19.15 37.85 19.61C38.5367 20.07 39.39 20.3033 40.41 20.31C41.23 20.3233 41.9333 20.1733 42.52 19.86C43.1133 19.54 43.5833 19.0733 43.93 18.46C44.2767 17.8467 44.5 17.0933 44.6 16.2H41.8V14.52H46.82C46.8333 14.64 46.8433 14.8 46.85 15C46.8567 15.1933 46.86 15.3167 46.86 15.37C46.86 16.7033 46.6033 17.8933 46.09 18.94C45.5767 19.9867 44.83 20.81 43.85 21.41C42.87 22.0033 41.6833 22.3 40.29 22.3ZM49.0531 22V7.3H51.1431V22H49.0531ZM58.8361 22.3C57.7561 22.3 56.8194 22.0567 56.0261 21.57C55.2328 21.0833 54.6194 20.4133 54.1861 19.56C53.7594 18.7 53.5461 17.71 53.5461 16.59C53.5461 15.4633 53.7661 14.4733 54.2061 13.62C54.6461 12.76 55.2628 12.0933 56.0561 11.62C56.8494 11.14 57.7761 10.9 58.8361 10.9C59.9161 10.9 60.8528 11.1433 61.6461 11.63C62.4394 12.1167 63.0528 12.7867 63.4861 13.64C63.9194 14.4933 64.1361 15.4767 64.1361 16.59C64.1361 17.7167 63.9161 18.71 63.4761 19.57C63.0428 20.4233 62.4294 21.0933 61.6361 21.58C60.8428 22.06 59.9094 22.3 58.8361 22.3ZM58.8361 20.33C59.8694 20.33 60.6394 19.9833 61.1461 19.29C61.6594 18.59 61.9161 17.69 61.9161 16.59C61.9161 15.4633 61.6561 14.5633 61.1361 13.89C60.6228 13.21 59.8561 12.87 58.8361 12.87C58.1361 12.87 57.5594 13.03 57.1061 13.35C56.6528 13.6633 56.3161 14.1 56.0961 14.66C55.8761 15.2133 55.7661 15.8567 55.7661 16.59C55.7661 17.7233 56.0261 18.63 56.5461 19.31C57.0661 19.99 57.8294 20.33 58.8361 20.33ZM68.6336 22L65.3336 11.19L67.4036 11.2L69.6636 18.61L71.9436 11.2H73.7436L76.0236 18.61L78.2836 11.2H80.3436L77.0436 22H75.3636L72.8436 14.18L70.3136 22H68.6336ZM88.0244 22.3C87.0577 22.3 86.1677 22.1333 85.3544 21.8C84.541 21.46 83.8344 20.9667 83.2344 20.32C82.6344 19.6733 82.1677 18.8867 81.8344 17.96C81.501 17.0333 81.3344 15.98 81.3344 14.8C81.3344 13.2467 81.6177 11.9133 82.1844 10.8C82.751 9.68 83.5377 8.82 84.5444 8.22C85.551 7.61333 86.711 7.31 88.0244 7.31C89.7177 7.31 91.0677 7.70333 92.0744 8.49C93.0877 9.27667 93.7777 10.3633 94.1444 11.75L92.0244 12.13C91.731 11.27 91.2577 10.5833 90.6044 10.07C89.951 9.55667 89.131 9.29667 88.1444 9.29C87.1244 9.28333 86.2744 9.51 85.5944 9.97C84.921 10.43 84.4144 11.0767 84.0744 11.91C83.7344 12.7367 83.561 13.7 83.5544 14.8C83.5477 15.9 83.7144 16.8633 84.0544 17.69C84.3944 18.51 84.9044 19.15 85.5844 19.61C86.271 20.07 87.1244 20.3033 88.1444 20.31C88.9644 20.3233 89.6677 20.1733 90.2544 19.86C90.8477 19.54 91.3177 19.0733 91.6644 18.46C92.011 17.8467 92.2344 17.0933 92.3344 16.2H89.5344V14.52H94.5544C94.5677 14.64 94.5777 14.8 94.5844 15C94.591 15.1933 94.5944 15.3167 94.5944 15.37C94.5944 16.7033 94.3377 17.8933 93.8244 18.94C93.311 19.9867 92.5644 20.81 91.5844 21.41C90.6044 22.0033 89.4177 22.3 88.0244 22.3ZM96.5875 22V11.2H98.4475V13.82L98.1875 13.48C98.3208 13.1333 98.4942 12.8167 98.7075 12.53C98.9208 12.2367 99.1675 11.9967 99.4475 11.81C99.7208 11.61 100.024 11.4567 100.358 11.35C100.698 11.2367 101.044 11.17 101.398 11.15C101.751 11.1233 102.091 11.14 102.418 11.2V13.16C102.064 13.0667 101.671 13.04 101.238 13.08C100.811 13.12 100.418 13.2567 100.058 13.49C99.7175 13.71 99.4475 13.9767 99.2475 14.29C99.0542 14.6033 98.9142 14.9533 98.8275 15.34C98.7408 15.72 98.6975 16.1233 98.6975 16.55V22H96.5875ZM108.917 22.3C107.843 22.3 106.9 22.0667 106.087 21.6C105.28 21.1267 104.65 20.47 104.197 19.63C103.75 18.7833 103.527 17.8033 103.527 16.69C103.527 15.51 103.747 14.4867 104.187 13.62C104.633 12.7533 105.253 12.0833 106.047 11.61C106.84 11.1367 107.763 10.9 108.817 10.9C109.917 10.9 110.853 11.1567 111.627 11.67C112.4 12.1767 112.977 12.9 113.357 13.84C113.743 14.78 113.897 15.8967 113.817 17.19H111.727V16.43C111.713 15.1767 111.473 14.25 111.007 13.65C110.547 13.05 109.843 12.75 108.897 12.75C107.85 12.75 107.063 13.08 106.537 13.74C106.01 14.4 105.747 15.3533 105.747 16.6C105.747 17.7867 106.01 18.7067 106.537 19.36C107.063 20.0067 107.823 20.33 108.817 20.33C109.47 20.33 110.033 20.1833 110.507 19.89C110.987 19.59 111.36 19.1633 111.627 18.61L113.677 19.26C113.257 20.2267 112.62 20.9767 111.767 21.51C110.913 22.0367 109.963 22.3 108.917 22.3ZM105.067 17.19V15.56H112.777V17.19H105.067ZM120.85 22.3C119.777 22.3 118.833 22.0667 118.02 21.6C117.213 21.1267 116.583 20.47 116.13 19.63C115.683 18.7833 115.46 17.8033 115.46 16.69C115.46 15.51 115.68 14.4867 116.12 13.62C116.567 12.7533 117.187 12.0833 117.98 11.61C118.773 11.1367 119.697 10.9 120.75 10.9C121.85 10.9 122.787 11.1567 123.56 11.67C124.333 12.1767 124.91 12.9 125.29 13.84C125.677 14.78 125.83 15.8967 125.75 17.19H123.66V16.43C123.647 15.1767 123.407 14.25 122.94 13.65C122.48 13.05 121.777 12.75 120.83 12.75C119.783 12.75 118.997 13.08 118.47 13.74C117.943 14.4 117.68 15.3533 117.68 16.6C117.68 17.7867 117.943 18.7067 118.47 19.36C118.997 20.0067 119.757 20.33 120.75 20.33C121.403 20.33 121.967 20.1833 122.44 19.89C122.92 19.59 123.293 19.1633 123.56 18.61L125.61 19.26C125.19 20.2267 124.553 20.9767 123.7 21.51C122.847 22.0367 121.897 22.3 120.85 22.3ZM117 17.19V15.56H124.71V17.19H117ZM135.281 22V16.69C135.281 16.27 135.244 15.84 135.171 15.4C135.104 14.9533 134.971 14.54 134.771 14.16C134.577 13.78 134.301 13.4733 133.941 13.24C133.587 13.0067 133.124 12.89 132.551 12.89C132.177 12.89 131.824 12.9533 131.491 13.08C131.157 13.2 130.864 13.3967 130.611 13.67C130.364 13.9433 130.167 14.3033 130.021 14.75C129.881 15.1967 129.811 15.74 129.811 16.38L128.511 15.89C128.511 14.91 128.694 14.0467 129.061 13.3C129.427 12.5467 129.954 11.96 130.641 11.54C131.327 11.12 132.157 10.91 133.131 10.91C133.877 10.91 134.504 11.03 135.011 11.27C135.517 11.51 135.927 11.8267 136.241 12.22C136.561 12.6067 136.804 13.03 136.971 13.49C137.137 13.95 137.251 14.4 137.311 14.84C137.371 15.28 137.401 15.6667 137.401 16V22H135.281ZM127.691 22V11.2H129.561V14.32H129.811V22H127.691Z"
                fill="black"
              />
            </svg> */}
            <img
              src="https://avatars.githubusercontent.com/u/133675302?s=200&v=4"
              className="w-12 h-12"
            />
          </a>
        </div>

        <div className="items-end justify-end flex">
          {!address ? (
            <Button onClick={connect} size="lg">
              Connect
            </Button>
          ) : (
            <Button onClick={showInfo} size="lg">
              Connected
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Nav