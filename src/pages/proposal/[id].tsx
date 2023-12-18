'use client'
import React from 'react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
//Route is /proposals/id?proposalType=ProposalType
import { GenericProposal } from '@/subgraph/queries/getProposal'
import type { InferGetServerSidePropsType } from 'next'
import { findProposalInfo } from '@/subgraph/queries/getProposal'
import { ProposalType } from '@/types/enums'
import { GCARequirements } from '@/components/ProposalViews/GCARequirements'
import { VetoCouncilElectionOrSlashScreen } from '@/components/ProposalViews/VetoCouncilElectionOrSlash'
import { RFCView } from '@/components/ProposalViews/RFCView'
import { GrantsView } from '@/components/ProposalViews/GrantsView'
import { GCAElectionOrSlashView } from '@/components/ProposalViews/GCAElectionOrSlash'
import {
  IsMostPopoularProposalResponse,
  isMostPopularProposal,
} from '@/subgraph/queries/isMostPopularProposal'

export const getServerSideProps = (async (context) => {
  const id = context.query.id as string
  const proposalInfo = await findProposalInfo(id)
  const isMostPopularProposalInfo = await isMostPopularProposal(id)
  const fullInfo = { ...proposalInfo, ...isMostPopularProposalInfo }
  return { props: { proposalInfo: fullInfo } }
}) satisfies GetServerSideProps<{
  proposalInfo: GenericProposal & IsMostPopoularProposalResponse
}>

const Id = ({
  proposalInfo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // const {id} = useParams();
  // const {proposalType} = useParams();

  if (proposalInfo.proposalType == ProposalType.GCAElectionOrSlash) {
    return <GCAElectionOrSlashView {...proposalInfo} />
  }

  if (proposalInfo.proposalType == ProposalType.ChangeGCARequirements) {
    return <GCARequirements {...proposalInfo} />
  }

  if (proposalInfo.proposalType == ProposalType.VetoCouncilElectionOrSlash) {
    return <VetoCouncilElectionOrSlashScreen {...proposalInfo} />
  }

  if (proposalInfo.proposalType == ProposalType.RequestForComment) {
    return <RFCView {...proposalInfo} />
  }

  if (proposalInfo.proposalType == ProposalType.Grants) {
    return <GrantsView {...proposalInfo} />
  }

  return <div>{JSON.stringify(proposalInfo)}</div>
}

export default Id
