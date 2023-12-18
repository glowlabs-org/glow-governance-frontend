import React, { useEffect } from 'react'
import { ChangeGCARequirementsQueryResponse } from '@/subgraph/queries/getProposal'
import { Button } from '../ui/button'
import { getAddressURL, getTxHashURL } from '@/constants/urls'
import { ProposalViewBase } from './ProposalViewBase'
import { IsMostPopoularProposalResponse } from '@/subgraph/queries/isMostPopularProposal'
const Divider = () => {
  return <div className="border-t-[1px] border-gray-300 my-2" />
}
export const GCARequirements = (
  data: ChangeGCARequirementsQueryResponse & IsMostPopoularProposalResponse
) => {
  const imgAddr =
    'https://i.seadn.io/s/raw/files/69adc8c4003830d4ad21c9191ab2a0ce.png?auto=format&dpr=1&w=1000'

  return (
    <ProposalViewBase data={data} proposalTypeTitle="GCA Requirements">
      <p>GCA Requirement: {data.hash}</p>
      <Divider />
    </ProposalViewBase>
  )
}
