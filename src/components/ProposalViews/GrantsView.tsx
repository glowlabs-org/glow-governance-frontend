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

type GrantsViewProps = {
  data: GrantsQueryResponse & IsMostPopoularProposalResponse
  hashText: string
}
export const GrantsView = ({ data, hashText }: GrantsViewProps) => {
  return (
    <>
      <ProposalViewBase data={data} proposalTypeTitle="Grants">
        <p>Description Hash: {data.hash}</p>
        <Divider />
        <p>Amount: {ethers.utils.formatEther(data.amount)} GLOW</p>
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
        <p>
          <p>Description:</p>
          {hashText}
        </p>
      </ProposalViewBase>
    </>
  )
}
