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
import { API_URL } from '@/constants/api-url'

export const getServerSideProps = (async (context) => {
  const id = context.query.id as string
  const proposalInfo = await findProposalInfo(id)
  const isMostPopularProposalInfo = await isMostPopularProposal(id)
  const fullInfo = { ...proposalInfo, ...isMostPopularProposalInfo }
  let hashText: string = ''
  if (proposalInfo.proposalType == ProposalType.Grants) {
    const urlToQuery = `${API_URL}/hash?hash=${proposalInfo.hash}`
    const response = await fetch(urlToQuery)
    const data = (await response.json()) as { text: string; hash: string }
    hashText = data.text
  }
  return { props: { proposalInfo: fullInfo, hashText: hashText } }
}) satisfies GetServerSideProps<{
  proposalInfo: GenericProposal & IsMostPopoularProposalResponse
  hashText: string
}>

const Id = ({
  proposalInfo,
  hashText,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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
    return <GrantsView data={proposalInfo} hashText={hashText} />
  }

  return <div>{JSON.stringify(proposalInfo)}</div>
}

export default Id
