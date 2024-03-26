import { create } from 'zustand'

interface BearState {
  isRFCExpanded: boolean
  setRfcExpanded: (newState: boolean) => void
  isRequirementsExpanded: boolean
  setIsRequirementsExpanded: (newState: boolean) => void
}

export const useExpandedState = create<BearState>()((set) => ({
  isRequirementsExpanded: false,
  setRfcExpanded: (newState) => set({ isRFCExpanded: newState }),
  isRFCExpanded: false,
  setIsRequirementsExpanded: (newState) =>
    set({ isRequirementsExpanded: newState }),
}))
