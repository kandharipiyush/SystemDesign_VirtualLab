export interface StudentProgress {
  completedSections: string[];
  preTestScore: { score: number; total: number; timestamp: number } | null;
  postTestScore: { score: number; total: number; timestamp: number } | null;
  completedExercises: string[];
  completedExperiments: string[];
}

const STORAGE_KEY = 'sd_vlab_exp14_progress';

export function getStudentProgress(): StudentProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        completedSections: ['overview'],
        preTestScore: null,
        postTestScore: null,
        completedExercises: [],
        completedExperiments: [],
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      completedSections: ['overview'],
      preTestScore: null,
      postTestScore: null,
      completedExercises: [],
      completedExperiments: [],
    };
  }
}

export function saveStudentProgress(progress: StudentProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function markSectionComplete(sectionId: string): StudentProgress {
  const current = getStudentProgress();
  if (!current.completedSections.includes(sectionId)) {
    const updated = {
      ...current,
      completedSections: [...current.completedSections, sectionId],
    };
    saveStudentProgress(updated);
    return updated;
  }
  return current;
}

export function resetAllProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset progress', e);
  }
}
