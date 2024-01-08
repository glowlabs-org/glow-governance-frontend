import { cn } from '@/lib/utils'
import React from 'react'
import { useExpandedState } from './useExpandedState'
export type SingularProposalProps = {
  title: string
  descripton: string
  executionFunc: () => void
  ShowJSX: React.ReactNode
}

export const SingularProposal = ({
  title,
  descripton,
  ShowJSX,
}: SingularProposalProps) => {
  const [selected, setSelected] = React.useState(false)
  const toggleSelected = () => {
    setSelected(!selected)
  }
  const { isRFCExpanded, isRequirementsExpanded } = useExpandedState(
    (state) => {
      return {
        isRFCExpanded: state.isRFCExpanded,
        isRequirementsExpanded: state.isRequirementsExpanded,
      }
    }
  )
  const isChangeGCARequirements = title.includes('Change GCA Requirements')
  const isVetoCouncilElectionOrSlash = title.includes(
    'Veto Council Election Or Slash'
  )
  const isRFC = title.includes('Request For Comment')
  return (
    <div
      className={cn(
        ' shadow-sm  rounded-xl flex flex-col py-4 bg-white  px-4  duration-150',
        !selected ? 'w-full' : 'w-full',
        title.includes('GCA Election') &&
          'sm:col-span-1 md:col-span-2 lg:col-span-2',
        isRFC && isRFCExpanded && 'sm:col-span-1 md:col-span-2 lg:col-span-3',
        isChangeGCARequirements &&
          isRequirementsExpanded &&
          'sm:col-span-1 md:col-span-2 lg:col-span-3',

        isVetoCouncilElectionOrSlash &&
          isRFCExpanded &&
          'sm:col-span-1 md:col-span-1 lg:col-span-2'

        // isChangeGCARequirements && isRFCExpanded &&
        // 'sm:col-span-1 md:col-span-1 lg:col-span-2',
      )}
    >
      <div className="flex flex-row gap-x-4 justify-start items-center">
        <img src="/frame.png" alt="rocket" className="w-12 h-12" />

        <h2 className="text-lg   font-semibold mb-4">{title}</h2>
      </div>
      <p className="mb-4 text-slate-600 ">{descripton}</p>

      <div className="grow w-full justify-end  flex flex-col">
        <div>{<div className="mt-4 mb-4">{ShowJSX}</div>}</div>
      </div>
    </div>
  )
}
