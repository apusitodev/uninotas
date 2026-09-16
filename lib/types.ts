export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  ects: number;
  total_sessions: number;
  min_attendance_pct: number;
  is_annual: boolean;
}

export interface UserSubject {
  subject_id: string;
  missed_classes: number;
  is_convalidated: boolean;
}

export interface EvaluationCriteria {
  id: string;
  subject_id: string;
  name: string;
  weight_pct: number;
  min_grade: number;
}

export interface AcademicEvent {
  id: string;
  subject_id: string;
  title: string;
  event_type: 'examen' | 'trabajo' | 'otro';
  start_date?: string;
  due_date: string;
  due_time: string;
  in_class: boolean;
  completed: boolean;
}

export interface ClassSlot {
  day: number;
  startTime: string;
  endTime: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  defaultClassroom: string;
  isLanguage?: boolean;
}

export interface CustomSubItem {
  id: string;
  criteria_id: string;
  name: string;
  grade: number | null;
}

export interface PendingSession {
  subjectCode: string;
  subjectName: string;
  subjectId: string;
  sessionDate: string;
}