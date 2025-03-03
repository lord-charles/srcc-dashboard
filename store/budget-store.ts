import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Budget, BudgetCategory } from "@/types/project";

interface BudgetFormState {
  categories: BudgetCategory[];
  totalBudget: number;
  notes: string;
}

interface BudgetStore {
  internalFormState: BudgetFormState;
  externalFormState: BudgetFormState;
  isInternalDrawerOpen: boolean;
  isExternalDrawerOpen: boolean;
  setInternalFormState: (state: BudgetFormState) => void;
  setExternalFormState: (state: BudgetFormState) => void;
  setIsInternalDrawerOpen: (isOpen: boolean) => void;
  setIsExternalDrawerOpen: (isOpen: boolean) => void;
  resetInternalFormState: () => void;
  resetExternalFormState: () => void;
  initializeFromBudget: (budget: Budget) => void;
  updateCategory: (categoryIndex: number, field: string, value: any, type: "internal" | "external") => void;
}

const createInitialFormState = (): BudgetFormState => ({
  categories: [
    {
      name: "",
      description: "",
      tags: [],
      items: [
        {
          name: "",
          description: "",
          estimatedAmount: 0,
          actualAmount: 0,
          tags: [],
          frequency: "monthly",
          startDate: "",
          endDate: "",
        },
      ],
    },
  ],
  totalBudget: 0,
  notes: "",
});

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      internalFormState: createInitialFormState(),
      externalFormState: createInitialFormState(),
      isInternalDrawerOpen: false,
      isExternalDrawerOpen: false,

      setInternalFormState: (state) => set({ internalFormState: state }),
      setExternalFormState: (state) => set({ externalFormState: state }),
      setIsInternalDrawerOpen: (isOpen) => set({ isInternalDrawerOpen: isOpen }),
      setIsExternalDrawerOpen: (isOpen) => set({ isExternalDrawerOpen: isOpen }),

      resetInternalFormState: () => set({ internalFormState: createInitialFormState() }),
      resetExternalFormState: () => set({ externalFormState: createInitialFormState() }),

      updateCategory: (categoryIndex, field, value, type) => 
        set((state) => ({
          [type === "internal" ? "internalFormState" : "externalFormState"]: {
            ...state[type === "internal" ? "internalFormState" : "externalFormState"],
            categories: state[type === "internal" ? "internalFormState" : "externalFormState"].categories.map((category, index) =>
              index === categoryIndex ? { ...category, [field]: value } : category
            ),
          },
        })),

      initializeFromBudget: (budget) =>
        set((state) => ({
          internalFormState: budget?.internalCategories?.length ? {
            categories: budget.internalCategories,
            totalBudget: budget.totalInternalBudget || 0,
            notes: budget.notes || "",
          } : state.internalFormState,
          externalFormState: budget?.externalCategories?.length ? {
            categories: budget.externalCategories,
            totalBudget: budget.totalExternalBudget || 0,
            notes: budget.notes || "",
          } : state.externalFormState,
        })),
    }),
    {
      name: "budget-storage",
      partialize: (state) => ({
        internalFormState: state.internalFormState,
        externalFormState: state.externalFormState,
      }),
    }
  )
);
