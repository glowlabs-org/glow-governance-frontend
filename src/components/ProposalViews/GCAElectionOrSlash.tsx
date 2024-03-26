import React, { useEffect } from 'react'
import { GCAElectionOrSlashQueryResponse } from '@/subgraph/queries/getProposal'
import { Button } from '../ui/button'
import { getAddressURL, getTxHashURL } from '@/constants/urls'
import { ProposalViewBase } from './ProposalViewBase'
import { IsMostPopoularProposalResponse } from '@/subgraph/queries/isMostPopularProposal'
const Divider = () => {
  return <div className="border-t-[1px] border-gray-300 my-2" />
}
export const GCAElectionOrSlashView = (
  data: GCAElectionOrSlashQueryResponse & IsMostPopoularProposalResponse
) => {
  return (
    <ProposalViewBase data={data} proposalTypeTitle="GCA Election or Slash">
      <p>
        New GCAs:
        <ul>
          {data.newGCAs.map((gca) => (
            <li key={gca.id}>
              <a
                className="text-blue-500 hover:text-blue-600"
                href={getAddressURL(gca.id)}
                target="_blank"
                rel="noreferrer"
              >
                {gca.id}
              </a>
            </li>
          ))}
        </ul>
      </p>

      <Divider />

      <p>
        GCAs To Slash:
        <ul>
          {data.agentsToSlash.map((gca) => (
            <li key={gca.id}>
              <a
                className="text-blue-500 hover:text-blue-600"
                href={getAddressURL(gca.id)}
                target="_blank"
                rel="noreferrer"
              >
                {gca.id}
              </a>
            </li>
          ))}
        </ul>
      </p>
      <Divider />
    </ProposalViewBase>
  )
}
