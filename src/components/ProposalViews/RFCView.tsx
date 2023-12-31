import React from 'react'
import { RequestForCommentQueryResponse } from '@/subgraph/queries/getProposal'
import { Button } from '../ui/button'
import { getAddressURL, getTxHashURL } from '@/constants/urls'
import { ProposalViewBase } from './ProposalViewBase'
import { IsMostPopoularProposalResponse } from '@/subgraph/queries/isMostPopularProposal'

const Divider = () => {
  return <div className="border-t-[1px] border-gray-300 my-2" />
}
export const RFCView = (
  data: RequestForCommentQueryResponse & IsMostPopoularProposalResponse
) => {
  return (
    <ProposalViewBase data={data} proposalTypeTitle="Request For Comment">
      <p>RFC Hash: {data.hash}</p>
      <Divider />
    </ProposalViewBase>
  )
}
