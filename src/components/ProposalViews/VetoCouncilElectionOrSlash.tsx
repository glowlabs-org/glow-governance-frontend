import React from 'react'
import {
  ChangeGCARequirementsQueryResponse,
  VetoCouncilElectionOrSlashQueryResponse,
} from '@/subgraph/queries/getProposal'
import { Button } from '../ui/button'
import { getAddressURL, getTxHashURL } from '@/constants/urls'
import { ProposalViewBase } from './ProposalViewBase'
import { IsMostPopoularProposalResponse } from '@/subgraph/queries/isMostPopularProposal'
const Divider = () => {
  return <div className="border-t-[1px] border-gray-300 my-2" />
}
export const VetoCouncilElectionOrSlashScreen = (
  data: VetoCouncilElectionOrSlashQueryResponse & IsMostPopoularProposalResponse
) => {
  return (
    <ProposalViewBase
      data={data}
      proposalTypeTitle="Veto Council Election or Slash"
    >
      <p>
        Old Agent:
        <a
          className="text-blue-500 hover:text-blue-600"
          href={getAddressURL(data.oldAgent.id)}
          target="_blank"
          rel="noreferrer"
        >
          {data.oldAgent.id}
        </a>
      </p>
      <Divider />
      <p>Slash Old Agent: {data.slashOldAgent ? 'Yes' : 'No'}</p>
      <Divider />
      <p>
        New Agent:
        <a
          className="text-blue-500 hover:text-blue-600"
          href={getAddressURL(data.newAgent.id)}
          target="_blank"
          rel="noreferrer"
        >
          {data.newAgent.id}
        </a>
      </p>

      {/* <Button>
        {data.isMostPopularProposal ? "You're the most popular proposal" : "You're not the most popular proposal"}
      </Button> */}
      <Divider />
    </ProposalViewBase>
  )
}
