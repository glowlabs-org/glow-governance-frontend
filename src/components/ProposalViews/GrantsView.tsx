import React from 'react'
import { GrantsQueryResponse } from '@/subgraph/queries/getProposal'
import { Button } from '../ui/button'
import { ethers } from 'ethers'
import { getAddressURL, getTxHashURL } from '@/constants/urls'
import { ProposalViewBase } from './ProposalViewBase'
import { IsMostPopoularProposalResponse } from '@/subgraph/queries/isMostPopularProposal'

const Divider = () => {
  return <div className="border-t-[1px] border-gray-300 my-2" />
}
export const GrantsView = (
  data: GrantsQueryResponse & IsMostPopoularProposalResponse
) => {
  const imgAddr =
    'https://i.seadn.io/s/raw/files/69adc8c4003830d4ad21c9191ab2a0ce.png?auto=format&dpr=1&w=1000'
  return (
    <ProposalViewBase data={data} proposalTypeTitle="Grants">
      <p>Description Hash: {data.hash}</p>
      <Divider />
      <p>Amount: {ethers.utils.formatEther(data.amount)} ETH</p>
      <Divider />
      <p>
        Recipient:
        <a
          className="text-blue-500 hover:text-blue-600"
          href={getAddressURL(data.recipient.id)}
          target="_blank"
          rel="noreferrer"
        >
          {data.recipient.id}
        </a>
      </p>
      <Divider />
    </ProposalViewBase>
  )
}
