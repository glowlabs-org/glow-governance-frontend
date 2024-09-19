import React from 'react'
import { ChangeGCARequirementsSpecificComponent } from './views/ChangeGCARequirements'
import { VetoCouncilElectionSpecificComponent } from './views/VetoCouncilElectionOrSlash'
import { RFCSpecificComponent } from './views/CreateRFC'
import { GCAElectionOrSlashProposalSpecificComponent } from './views/GCAElectionOrSlash'
import { GrantsProposalSpecificComponent } from './views/GrantsProposal'
import { SingularProposal, SingularProposalProps } from './ProposalLayout'

const changeGCARequirements = {
  title: 'Change GCA Requirements',
  executionFunc: async () => {
    console.log('Change GCA Requirements')
  },
  ShowJSX: <ChangeGCARequirementsSpecificComponent />,
  descripton:
    "A change GCA requirements proposal let's you change the GCA requirements. The GCA requirements are the rules that GCAs have to follow.",
}

const vetoCouncilElectionOrSlash = {
  title: 'Veto Council Election Or Slash',
  executionFunc: async () => {
    console.log('Veto Council Election Or Slash')
  },
  ShowJSX: <VetoCouncilElectionSpecificComponent />,
  descripton:
    "A veto council election or slash let's you replace one veto council agent. The old agent will replace the new agent. To simply add an agent, you can leave the old agent field blank. To remove an agent, you can leave the new agent field blank. To slash an old agent, you can toggle the slash old agent switch.",
}

const RFC = {
  title: 'Request For Comment',
  executionFunc: async () => {
    console.log('Request For Comment')
  },
  ShowJSX: <RFCSpecificComponent />,
  descripton:
    "A request for comment proposal let's you request for a comment. The comment will be posted on the forum.",
}

const GCAElectionOrSlashProposal = {
  title: 'GCA Election Or Slash Proposal',
  executionFunc: async () => {
    console.log('GCA Election Or Slash Proposal')
  },
  ShowJSX: <GCAElectionOrSlashProposalSpecificComponent />,
  descripton:
    "A GCA election or slash proposal let's you add or remove GCAs. You can also slash GCAs.",
}

const grant = {
  title: 'Grant',
  executionFunc: async () => {
    console.log('Grant')
  },
  ShowJSX: <GrantsProposalSpecificComponent />,
  descripton: "A grant proposal let's you grant GLOW to an address.",
}
const proposals: SingularProposalProps[] = [
  changeGCARequirements,
  vetoCouncilElectionOrSlash,
  RFC,
  grant,
  GCAElectionOrSlashProposal,
]

export const CreateGovernanceProposal = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-x-2 gap-y-2">
      {proposals.map((proposal) => (
        <SingularProposal {...proposal} />
      ))}
    </div>
  )
}
