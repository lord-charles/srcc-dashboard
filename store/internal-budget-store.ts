import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Budget, BudgetCategory, BudgetItem } from "@/types/budget";

interface InternalBudgetFormState {
  categories: BudgetCategory[];
  totalBudget: number;
  notes: string;
}

interface InternalBudgetStore {
  formState: InternalBudgetFormState;
  setFormState: (state: InternalBudgetFormState) => void;
  updateCategory: (categoryIndex: number, field: string, value: any) => void;
  updateItem: (
    categoryIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => void;
  addCategory: () => void;
  removeCategory: (categoryIndex: number) => void;
  addItem: (categoryIndex: number) => void;
  removeItem: (categoryIndex: number, itemIndex: number) => void;
  initializeFromBudget: (budget: Budget) => void;
}

export const createInitialFormState = (): InternalBudgetFormState => ({
  categories: [],
  totalBudget: 0,
  notes: "",
});

const createEmptyBudgetItem = (): BudgetItem => ({
  name: "",
  description: "",
  estimatedAmount: 0,
  actualAmount: 0,
  tags: [],
  frequency: "monthly",
  startDate: "",
  endDate: "",
});

const createEmptyCategory = (): BudgetCategory => ({
  name: "",
  description: "",
  tags: [],
  items: [],
});

export const useInternalBudgetStore = create<InternalBudgetStore>()(
  persist(
    (set, get) => ({
      formState: createInitialFormState(),
      setFormState: (formState) => {
        // Ensure we're not setting undefined or null
        if (!formState) return;
        
        // Deep clone the formState to avoid reference issues
        const sanitizedFormState = {
          categories: (formState.categories || []).map(category => ({
            name: category.name || "",
            description: category.description || "",
            tags: category.tags || [],
            items: (category.items || []).map(item => ({
              name: item.name || "",
              description: item.description || "",
              estimatedAmount: Number(item.estimatedAmount) || 0,
              actualAmount: Number(item.actualAmount) || 0,
              tags: item.tags || [],
              frequency: item.frequency || "monthly",
              startDate: item.startDate || "",
              endDate: item.endDate || "",
            })),
          })),
          totalBudget: Number(formState.totalBudget) || 0,
          notes: formState.notes || "",
        };
        
        set({ formState: sanitizedFormState });
      },
      initializeFromBudget: (budget) => {
        if (!budget?.internalCategories) return;

        const formState = {
          categories: budget.internalCategories.map((category) => ({
            name: category.name || "",
            description: category.description || "",
            tags: category.tags || [],
            items: (category.items || []).map((item) => ({
              name: item.name || "",
              description: item.description || "",
              estimatedAmount: Number(item.estimatedAmount) || 0,
              actualAmount: Number(item.actualAmount) || 0,
              tags: item.tags || [],
              frequency: item.frequency || "monthly",
              startDate: item.startDate || "",
              endDate: item.endDate || "",
            })),
          })),
          totalBudget: Number(budget.totalInternalBudget) || 0,
          notes: budget.notes || "",
        };

        set({ formState });
      },
      updateCategory: (categoryIndex, field, value) => {
        const { formState } = get();
        const updatedCategories = [...(formState.categories || [])];
        if (!updatedCategories[categoryIndex]) {
          updatedCategories[categoryIndex] = createEmptyCategory();
        }
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          [field]: value,
        };
        set({ formState: { ...formState, categories: updatedCategories } });
      },
      updateItem: (categoryIndex, itemIndex, field, value) => {
        const { formState } = get();
        const updatedCategories = [...(formState.categories || [])];
        if (!updatedCategories[categoryIndex]) {
          updatedCategories[categoryIndex] = createEmptyCategory();
        }
        const updatedItems = [
          ...(updatedCategories[categoryIndex].items || []),
        ];
        if (!updatedItems[itemIndex]) {
          updatedItems[itemIndex] = createEmptyBudgetItem();
        }
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          [field]: value,
        };
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          items: updatedItems,
        };
        set({ formState: { ...formState, categories: updatedCategories } });
      },
      addCategory: () => {
        const { formState } = get();
        set({
          formState: {
            ...formState,
            categories: [
              ...(formState.categories || []),
              createEmptyCategory(),
            ],
          },
        });
      },
      removeCategory: (categoryIndex) => {
        const { formState } = get();
        const updatedCategories = (formState.categories || []).filter(
          (_, index) => index !== categoryIndex
        );
        set({ formState: { ...formState, categories: updatedCategories } });
      },
      addItem: (categoryIndex) => {
        const { formState } = get();
        const updatedCategories = [...(formState.categories || [])];
        if (!updatedCategories[categoryIndex]) {
          updatedCategories[categoryIndex] = createEmptyCategory();
        }
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          items: [
            ...(updatedCategories[categoryIndex].items || []),
            createEmptyBudgetItem(),
          ],
        };
        set({ formState: { ...formState, categories: updatedCategories } });
      },
      removeItem: (categoryIndex, itemIndex) => {
        const { formState } = get();
        const updatedCategories = [...(formState.categories || [])];
        if (!updatedCategories[categoryIndex]) return;

        const updatedItems = (
          updatedCategories[categoryIndex].items || []
        ).filter((_, index) => index !== itemIndex);
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          items: updatedItems,
        };
        set({ formState: { ...formState, categories: updatedCategories } });
      },
    }),
    {
      name: "internal-budget-store",
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({ formState: state.formState }),
      version: 1,
    }
  )
);
