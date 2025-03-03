import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Budget, BudgetCategory } from "@/types/project";

interface ExternalBudgetFormState {
  categories: BudgetCategory[];
  totalBudget: number;
  notes: string;
}

interface ExternalBudgetStore {
  formState: ExternalBudgetFormState;
  isDrawerOpen: boolean;
  setFormState: (state: ExternalBudgetFormState) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  resetFormState: () => void;
  updateCategory: (categoryIndex: number, field: string, value: any) => void;
  updateItem: (categoryIndex: number, itemIndex: number, field: string, value: any) => void;
  addCategory: () => void;
  removeCategory: (categoryIndex: number) => void;
  addItem: (categoryIndex: number) => void;
  removeItem: (categoryIndex: number, itemIndex: number) => void;
  initializeFromBudget: (budget: Budget) => void;
}

const createInitialFormState = (): ExternalBudgetFormState => ({
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

export const useExternalBudgetStore = create<ExternalBudgetStore>()(
  persist(
    (set) => ({
      formState: createInitialFormState(),
      isDrawerOpen: false,

      setFormState: (state) => set({ formState: state }),
      setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      resetFormState: () => set({ formState: createInitialFormState() }),

      updateCategory: (categoryIndex, field, value) => 
        set((state) => ({
          formState: {
            ...state.formState,
            categories: state.formState.categories.map((category, index) =>
              index === categoryIndex ? { ...category, [field]: value } : category
            ),
          },
        })),

      updateItem: (categoryIndex, itemIndex, field, value) =>
        set((state) => ({
          formState: {
            ...state.formState,
            categories: state.formState.categories.map((category, cIndex) =>
              cIndex === categoryIndex
                ? {
                    ...category,
                    items: category.items?.map((item, iIndex) =>
                      iIndex === itemIndex ? { ...item, [field]: value } : item
                    ),
                  }
                : category
            ),
          },
        })),

      addCategory: () =>
        set((state) => ({
          formState: {
            ...state.formState,
            categories: [
              ...state.formState.categories,
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
          },
        })),

      removeCategory: (categoryIndex) =>
        set((state) => ({
          formState: {
            ...state.formState,
            categories: state.formState.categories.filter((_, index) => index !== categoryIndex),
          },
        })),

      addItem: (categoryIndex) =>
        set((state) => ({
          formState: {
            ...state.formState,
            categories: state.formState.categories.map((category, index) =>
              index === categoryIndex
                ? {
                    ...category,
                    items: [
                      ...(category.items || []),
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
                  }
                : category
            ),
          },
        })),

      removeItem: (categoryIndex, itemIndex) =>
        set((state) => ({
          formState: {
            ...state.formState,
            categories: state.formState.categories.map((category, cIndex) =>
              cIndex === categoryIndex
                ? {
                    ...category,
                    items: category.items?.filter((_, iIndex) => iIndex !== itemIndex),
                  }
                : category
            ),
          },
        })),

      initializeFromBudget: (budget) =>
        set((state) => ({
          formState: budget?.externalCategories?.length
            ? {
                categories: budget.externalCategories,
                totalBudget: budget.totalExternalBudget || 0,
                notes: budget.notes || "",
              }
            : state.formState,
        })),
    }),
    {
      name: "external-budget-storage",
      partialize: (state) => ({
        formState: state.formState,
      }),
    }
  )
);
