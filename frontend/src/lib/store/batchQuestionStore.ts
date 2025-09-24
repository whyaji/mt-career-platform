import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { BatchQuestionType } from '@/types/question.type';

export interface Question {
  id: string;
  label: string;
  type: string;
  code: string;
  description?: string;
  required?: boolean;
  is_active?: boolean;
  question_id?: string;
}

export interface LocalBatchQuestion
  extends Omit<BatchQuestionType, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  localId: string; // Temporary ID for local operations
  operation: 'create' | 'update' | 'delete' | 'none';
  originalData?: BatchQuestionType; // Store original data for comparison
}

export interface BatchQuestionFormState {
  // Edit mode state
  isEditMode: boolean;
  originalQuestions: BatchQuestionType[];
  localQuestions: LocalBatchQuestion[];

  // Form state
  selectedQuestions: string[];
  editingQuestion: Question | null;
  bulkModalOpened: boolean;

  // Form actions
  setSelectedQuestions: (questions: string[]) => void;
  addSelectedQuestion: (questionId: string) => void;
  removeSelectedQuestion: (questionId: string) => void;
  clearSelectedQuestions: () => void;

  setEditingQuestion: (question: Question | null) => void;
  setBulkModalOpened: (opened: boolean) => void;

  // Edit mode actions
  enterEditMode: (questions: BatchQuestionType[]) => void;
  exitEditMode: () => void;

  // Local question management
  addLocalQuestion: (question: Omit<LocalBatchQuestion, 'localId' | 'operation'>) => void;
  updateLocalQuestion: (localId: string, updates: Partial<LocalBatchQuestion>) => void;
  removeLocalQuestion: (localId: string) => void;
  reorderLocalQuestions: (localIds: string[]) => void;

  // Form management
  resetForm: () => void;
  cancelForm: () => void;
  hasChanges: () => boolean;
  getPendingOperations: () => Array<{
    question_id: string;
    info: 'create' | 'update' | 'delete';
    display_order?: number;
    is_required?: boolean;
    is_active?: boolean;
    batch_specific_options?: unknown;
    batch_specific_validation?: unknown;
    batch_specific_scoring?: unknown;
  }>;
}

const initialState = {
  isEditMode: false,
  originalQuestions: [],
  localQuestions: [],
  selectedQuestions: [],
  editingQuestion: null,
  bulkModalOpened: false,
};

export const useBatchQuestionStore = create<BatchQuestionFormState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSelectedQuestions: (questions) => set({ selectedQuestions: questions }),

      addSelectedQuestion: (questionId) =>
        set((state) => ({
          selectedQuestions: [...state.selectedQuestions, questionId],
        })),

      removeSelectedQuestion: (questionId) =>
        set((state) => ({
          selectedQuestions: state.selectedQuestions.filter((id) => id !== questionId),
        })),

      clearSelectedQuestions: () => set({ selectedQuestions: [] }),

      setEditingQuestion: (question) => set({ editingQuestion: question }),

      setBulkModalOpened: (opened) => set({ bulkModalOpened: opened }),

      // Edit mode actions
      enterEditMode: (questions) => {
        const localQuestions: LocalBatchQuestion[] = questions.map((q, index) => ({
          ...q,
          localId: `local-${q.id || index}`,
          operation: 'none' as const,
          originalData: q,
        }));

        set({
          isEditMode: true,
          originalQuestions: questions,
          localQuestions,
        });
      },

      exitEditMode: () => {
        set({
          isEditMode: false,
          originalQuestions: [],
          localQuestions: [],
        });
      },

      // Local question management
      addLocalQuestion: (question) => {
        const localId = `local-${Date.now()}-${Math.random()}`;
        const newQuestion: LocalBatchQuestion = {
          ...question,
          localId,
          operation: 'create',
        };

        set((state) => ({
          localQuestions: [...state.localQuestions, newQuestion],
        }));
      },

      updateLocalQuestion: (localId, updates) => {
        set((state) => ({
          localQuestions: state.localQuestions.map((q) => {
            if (q.localId === localId) {
              const updated = { ...q, ...updates };
              // Determine operation type
              if (q.operation === 'create') {
                updated.operation = 'create';
              } else if (q.operation === 'delete') {
                // If we're updating a deleted item, restore it
                updated.operation = 'update';
              } else {
                updated.operation = 'update';
              }
              return updated;
            }
            return q;
          }),
        }));
      },

      removeLocalQuestion: (localId) => {
        set((state) => ({
          localQuestions: state.localQuestions
            .map((q) => {
              if (q.localId === localId) {
                if (q.operation === 'create') {
                  // Remove completely if it was just created
                  return null;
                }
                // Mark for deletion if it was existing
                return { ...q, operation: 'delete' };
              }
              return q;
            })
            .filter((q): q is LocalBatchQuestion => q !== null),
        }));
      },

      reorderLocalQuestions: (localIds) => {
        set((state) => {
          const reorderedQuestions = localIds
            .map((id) => state.localQuestions.find((q) => q.localId === id))
            .filter((q): q is LocalBatchQuestion => q !== undefined)
            .map((q, index) => ({
              ...q,
              display_order: index + 1,
              operation: (q.operation === 'create' ? 'create' : 'update') as
                | 'create'
                | 'update'
                | 'delete'
                | 'none',
            }));

          return {
            localQuestions: reorderedQuestions,
          };
        });
      },

      resetForm: () => set(initialState),

      cancelForm: () => {
        const state = get();
        if (state.isEditMode) {
          set({
            isEditMode: false,
            originalQuestions: [],
            localQuestions: [],
            selectedQuestions: [],
            editingQuestion: null,
            bulkModalOpened: false,
          });
        } else {
          set(initialState);
        }
      },

      hasChanges: () => {
        const state = get();
        if (state.isEditMode) {
          return state.localQuestions.some((q) => q.operation !== 'none');
        }
        return (
          state.selectedQuestions.length > 0 ||
          state.editingQuestion !== null ||
          state.bulkModalOpened
        );
      },

      getPendingOperations: () => {
        const state = get();
        if (!state.isEditMode) {
          return [];
        }

        return state.localQuestions
          .filter((q) => q.operation !== 'none')
          .map((q) => ({
            question_id: q.question_id,
            info: q.operation,
            display_order: q.display_order,
            is_required: q.is_required,
            is_active: q.is_active,
            batch_specific_options: q.batch_specific_options,
            batch_specific_validation: q.batch_specific_validation,
            batch_specific_scoring: q.batch_specific_scoring,
          }));
      },
    }),
    {
      name: 'batch-question-store',
    }
  )
);
