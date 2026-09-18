'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  GraduationCap, 
  LayoutDashboard, 
  CheckSquare, 
  Award, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Minus,
  Bell,
  Check,
  X,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  BookmarkCheck,
  AlertTriangle,
  Settings,
  HelpCircle,
  MessageSquareWarning,
  Pencil,
  Trash2
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  ects: number;
  total_sessions: number;
  min_attendance_pct: number;
  is_annual: boolean;
}

interface UserSubject {
  subject_id: string;
  missed_classes: number;
  is_convalidated: boolean;
}

interface EvaluationCriteria {
  id: string;
  subject_id: string;
  name: string;
  weight_pct: number;
  min_grade: number;
}

interface AcademicEvent {
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

interface ClassSlot {
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

interface CustomSubItem {
  id: string;
  criteria_id: string;
  name: string;
  grade: number | null;
}

const GROUPS_INFO = [
  { id: 'A', room: 'A41', label: 'Grupo A' },
  { id: 'B', room: 'A42', label: 'Grupo B' },
  { id: 'C', room: 'A51', label: 'Grupo C' },
  { id: 'D', room: 'A52', label: 'Grupo D' },
];

const LANGUAGE_ROOMS: Record<string, Record<string, string>> = {
  'ANG201': { 'A': 'A41', 'B': 'A42', 'C': 'A51', 'D': 'A52' },
  'XIN201': { 'A': 'A41', 'B': 'A42', 'C': 'A51', 'D': 'A52' },
};

const S1_SCHEDULE_CLEAN: Record<string, { name: string; slots: ClassSlot[] }> = {
  'EST101': {
    name: 'Estadística I',
    slots: [{ day: 1, startTime: '16:00', endTime: '19:00', startHour: 16, startMinute: 0, endHour: 19, endMinute: 0, defaultClassroom: 'A41' }]
  },
  'EPP101': {
    name: 'Estratègies productes i preus',
    slots: [{ day: 2, startTime: '16:00', endTime: '19:00', startHour: 16, startMinute: 0, endHour: 19, endMinute: 0, defaultClassroom: 'A41' }]
  },
  'PUB101': {
    name: 'Publicitat, promoció i RRPP',
    slots: [{ day: 3, startTime: '16:00', endTime: '19:00', startHour: 16, startMinute: 0, endHour: 19, endMinute: 0, defaultClassroom: 'A41' }]
  },
  'DPM101': {
    name: 'Desenvol. productes i marques',
    slots: [{ day: 4, startTime: '16:00', endTime: '19:00', startHour: 16, startMinute: 0, endHour: 19, endMinute: 0, defaultClassroom: 'A41' }]
  },
  'EDL101': {
    name: 'Estratègies distribució i logística',
    slots: [{ day: 5, startTime: '16:00', endTime: '19:00', startHour: 16, startMinute: 0, endHour: 19, endMinute: 0, defaultClassroom: 'A41' }]
  },
  'XIN201': {
    name: 'Xinès II',
    slots: [
      { day: 1, startTime: '19:00', endTime: '20:30', startHour: 19, startMinute: 0, endHour: 20, endMinute: 30, defaultClassroom: 'A41', isLanguage: true },
      { day: 3, startTime: '19:00', endTime: '20:30', startHour: 19, startMinute: 0, endHour: 20, endMinute: 30, defaultClassroom: 'A41', isLanguage: true }
    ]
  },
  'ANG201': {
    name: 'Anglès II',
    slots: [
      { day: 2, startTime: '19:00', endTime: '20:30', startHour: 19, startMinute: 0, endHour: 20, endMinute: 30, defaultClassroom: 'A41', isLanguage: true },
      { day: 4, startTime: '19:00', endTime: '20:30', startHour: 19, startMinute: 0, endHour: 20, endMinute: 30, defaultClassroom: 'A41', isLanguage: true }
    ]
  },
};

const S1_HOLIDAYS_INFO: Record<string, string> = {
  '2026-09-24': 'La Mercè (Festiu local)',
  '2026-09-25': 'Dia no lectiu',
  '2026-10-12': 'Festa Nacional d\'Espanya',
  '2026-11-05': 'EUM Business Summit',
  '2026-12-07': 'Dia no lectiu',
  '2026-12-08': 'Immaculada Concepció',
};

const DAYS_NAMES = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];

interface PendingSession {
  subjectCode: string;
  subjectName: string;
  subjectId: string;
  sessionDate: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userSubjects, setUserSubjects] = useState<Record<string, UserSubject>>({});
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [userGrades, setUserGrades] = useState<Record<string, number | null>>({});
  const [customSubCriteria, setCustomSubCriteria] = useState<Record<string, CustomSubItem[]>>({});
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const [userChineseGroup, setUserChineseGroup] = useState<string>('A');
  const [userEnglishGroup, setUserEnglishGroup] = useState<string>('A');

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'sincronizado' | 'guardando'>('sincronizado');

  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(1);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');

  const [activeTab, setActiveTab] = useState<'general' | 'diario' | 'calendario' | 'asistencia' | 'notas'>('general');
  const [activeSemester, setActiveSemester] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);

  const [calendarMode, setCalendarMode] = useState<'semanal' | 'mensual'>('semanal');
  const [selectedDay, setSelectedDay] = useState<Date>(new Date(2026, 8, 15));
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 8, 1));

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [eventSubjectId, setEventSubjectId] = useState('');
  const [eventType, setEventType] = useState<'examen' | 'trabajo' | 'otro'>('trabajo');
  const [eventStartDate, setEventStartDate] = useState('2026-09-15');
  const [eventDueDate, setEventDueDate] = useState('2026-09-15');
  const [eventDueTime, setEventDueTime] = useState('23:59');
  const [eventInClass, setEventInClass] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('chinese_group, english_group, has_seen_tour')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.chinese_group || !profile.english_group) {
        router.push('/onboarding');
        return;
      }

      setUserChineseGroup(profile.chinese_group);
      setUserEnglishGroup(profile.english_group);

      if (!profile.has_seen_tour) {
        setShowTour(true);
      }

      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('semester', { ascending: true });

      if (subjectsData) {
        setSubjects(subjectsData);
        if (subjectsData.length > 0) setEventSubjectId(subjectsData[0].id);

        const { data: userSubData } = await supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id);

        const subMap: Record<string, UserSubject> = {};
        for (const sub of subjectsData) {
          const existing = userSubData?.find((u: UserSubject) => u.subject_id === sub.id);
          if (existing) {
            subMap[sub.id] = existing;
          } else {
            const { data: inserted } = await supabase
              .from('user_subjects')
              .insert({ user_id: user.id, subject_id: sub.id, missed_classes: 0, is_convalidated: false })
              .select()
              .single();
            if (inserted) subMap[sub.id] = inserted;
          }
        }
        setUserSubjects(subMap);

        const { data: criteriaData } = await supabase.from('evaluation_criteria').select('*');
        if (criteriaData) setCriteria(criteriaData);

        const { data: gradesData } = await supabase.from('user_grades').select('*').eq('user_id', user.id);
        const gradeMap: Record<string, number | null> = {};
        if (gradesData) {
          gradesData.forEach((g: { criteria_id: string; grade: number | null }) => { gradeMap[g.criteria_id] = g.grade; });
        }
        setUserGrades(gradeMap);

        const { data: subCritData } = await supabase.from('custom_sub_criteria').select('*').eq('user_id', user.id);
        const subCritMap: Record<string, CustomSubItem[]> = {};
        if (subCritData) {
          subCritData.forEach((sc: CustomSubItem & { criteria_id: string }) => {
            if (!subCritMap[sc.criteria_id]) subCritMap[sc.criteria_id] = [];
            subCritMap[sc.criteria_id].push(sc);
          });
        }
        setCustomSubCriteria(subCritMap);

        const { data: eventsData } = await supabase.from('academic_events').select('*').eq('user_id', user.id);
        if (eventsData) setEvents(eventsData);

        await calculatePendingSessions(subjectsData, user.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatEuropeanDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const formatCleanTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  const handleFinishTour = async () => {
    setShowTour(false);
    if (userId) {
      await supabase.from('profiles').update({ has_seen_tour: true }).eq('id', userId);
    }
  };

  const calculatePendingSessions = async (allSubjects: Subject[], currentUserId: string) => {
    const { data: answeredLogs } = await supabase
      .from('attendance_logs')
      .select('subject_code, session_date')
      .eq('user_id', currentUserId);

    const answeredSet = new Set(
      (answeredLogs || []).map((l: { subject_code: string; session_date: string }) => `${l.subject_code}_${l.session_date}`)
    );

    const start = new Date(2026, 8, 14);
    const now = new Date();
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const todayStr = now.toISOString().split('T')[0];

    const pending: PendingSession[] = [];

    while (cur <= now) {
      const dayOfWeek = cur.getDay();
      const isoStr = cur.toISOString().split('T')[0];

      if (!S1_HOLIDAYS_INFO[isoStr] && dayOfWeek >= 1 && dayOfWeek <= 5) {
        for (const [code, item] of Object.entries(S1_SCHEDULE_CLEAN)) {
          for (const slot of item.slots) {
            if (slot.day === dayOfWeek) {
              let isFinished = false;
              if (isoStr < todayStr) {
                isFinished = true;
              } else if (isoStr === todayStr) {
                const classEndTime = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), slot.endHour, slot.endMinute);
                if (now >= classEndTime) isFinished = true;
              }

              if (isFinished) {
                const key = `${code}_${isoStr}`;
                if (!answeredSet.has(key)) {
                  const sub = allSubjects.find((s) => s.code === code);
                  if (sub) {
                    pending.push({
                      subjectCode: code,
                      subjectName: sub.name,
                      subjectId: sub.id,
                      sessionDate: isoStr
                    });
                  }
                }
              }
            }
          }
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
    setPendingSessions(pending);
  };

  const handleSurveyAnswer = async (session: PendingSession, attended: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSyncStatus('guardando');
    await supabase.from('attendance_logs').insert({
      user_id: user.id,
      subject_code: session.subjectCode,
      session_date: session.sessionDate,
      attended: attended
    });

    if (!attended) await handleUpdateMissedClasses(session.subjectId, 1);

    setPendingSessions((prev) =>
      prev.filter((p) => !(p.subjectCode === session.subjectCode && p.sessionDate === session.sessionDate))
    );
    setSyncStatus('sincronizado');
  };

  const getElapsedSessions = (code: string): number => {
    const item = S1_SCHEDULE_CLEAN[code];
    if (!item) return 0;

    const start = new Date(2026, 8, 14);
    const now = new Date();
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const todayStr = now.toISOString().split('T')[0];

    if (now < start) return 0;

    let count = 0;
    while (cur <= now) {
      const dayOfWeek = cur.getDay();
      const isoStr = cur.toISOString().split('T')[0];

      if (!S1_HOLIDAYS_INFO[isoStr]) {
        for (const slot of item.slots) {
          if (slot.day === dayOfWeek) {
            if (isoStr < todayStr) {
              count++;
            } else if (isoStr === todayStr) {
              const classEndTime = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), slot.endHour, slot.endMinute);
              if (now >= classEndTime) count++;
            }
          }
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const handleUpdateMissedClasses = async (subjectId: string, delta: number) => {
    const current = userSubjects[subjectId]?.missed_classes || 0;
    const nextVal = Math.max(0, current + delta);

    setUserSubjects((prev) => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], missed_classes: nextVal }
    }));

    setSyncStatus('guardando');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_subjects').update({ missed_classes: nextVal }).eq('user_id', user.id).eq('subject_id', subjectId);
    setSyncStatus('sincronizado');
  };

  const handleToggleConvalidation = async (subjectId: string) => {
    const current = userSubjects[subjectId]?.is_convalidated || false;
    const nextVal = !current;

    setUserSubjects((prev) => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], is_convalidated: nextVal }
    }));

    setSyncStatus('guardando');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_subjects').update({ is_convalidated: nextVal }).eq('user_id', user.id).eq('subject_id', subjectId);
    setSyncStatus('sincronizado');
  };

  const handleUpdateGrade = async (criteriaId: string, valStr: string) => {
    const parsed = valStr === '' ? null : Math.min(10, Math.max(0, parseFloat(valStr)));
    setUserGrades((prev) => ({ ...prev, [criteriaId]: parsed }));

    setSyncStatus('guardando');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_grades').upsert({
      user_id: user.id,
      criteria_id: criteriaId,
      grade: parsed
    }, { onConflict: 'user_id,criteria_id' });
    setSyncStatus('sincronizado');
  };

  const handleAddCustomSubCriteria = async (criteriaId: string) => {
    const subItems = customSubCriteria[criteriaId] || [];
    const name = `Treball ${subItems.length + 1}`;

    setSyncStatus('guardando');
    const { data: inserted, error } = await supabase.from('custom_sub_criteria').insert({
      user_id: userId,
      criteria_id: criteriaId,
      name: name,
      grade: null
    }).select().single();

    if (inserted && !error) {
      setCustomSubCriteria(prev => ({
        ...prev,
        [criteriaId]: [...(prev[criteriaId] || []), inserted]
      }));
    }
    setSyncStatus('sincronizado');
  };

  const handleUpdateCustomSubGrade = async (subId: string, criteriaId: string, valStr: string) => {
    const parsed = valStr === '' ? null : Math.min(10, Math.max(0, parseFloat(valStr)));
    
    setCustomSubCriteria(prev => ({
      ...prev,
      [criteriaId]: (prev[criteriaId] || []).map(item => item.id === subId ? { ...item, grade: parsed } : item)
    }));

    setSyncStatus('guardando');
    await supabase.from('custom_sub_criteria').update({ grade: parsed }).eq('id', subId);
    setSyncStatus('sincronizado');
  };

  const handleUpdateCustomSubName = async (subId: string, criteriaId: string, newName: string) => {
    setCustomSubCriteria(prev => ({
      ...prev,
      [criteriaId]: (prev[criteriaId] || []).map(item => item.id === subId ? { ...item, name: newName } : item)
    }));

    await supabase.from('custom_sub_criteria').update({ name: newName }).eq('id', subId);
  };

  const handleDeleteCustomSubCriteria = async (subId: string, criteriaId: string) => {
    setCustomSubCriteria(prev => ({
      ...prev,
      [criteriaId]: (prev[criteriaId] || []).filter(item => item.id !== subId)
    }));

    setSyncStatus('guardando');
    await supabase.from('custom_sub_criteria').delete().eq('id', subId);
    setSyncStatus('sincronizado');
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let cleanTitle = eventTitle.trim();
    if (eventType === 'otro' && otherDescription.trim()) {
      cleanTitle = `${cleanTitle} (${otherDescription.trim()})`;
    }

    setSyncStatus('guardando');

    if (editingEventId) {
      const { data: updated, error } = await supabase.from('academic_events').update({
        subject_id: eventSubjectId,
        title: cleanTitle,
        event_type: eventType,
        start_date: eventInClass ? eventDueDate : eventStartDate,
        due_date: eventDueDate,
        due_time: eventDueTime,
        in_class: eventInClass
      }).eq('id', editingEventId).select().single();

      if (updated && !error) {
        setEvents((prev) => prev.map((ev) => ev.id === editingEventId ? updated : ev));
        setEventTitle('');
        setOtherDescription('');
        setEditingEventId(null);
        setShowAddModal(false);
      }
    } else {
      const { data: inserted, error } = await supabase.from('academic_events').insert({
        user_id: user.id,
        subject_id: eventSubjectId,
        title: cleanTitle,
        event_type: eventType,
        start_date: eventInClass ? eventDueDate : eventStartDate,
        due_date: eventDueDate,
        due_time: eventDueTime,
        in_class: eventInClass
      }).select().single();

      if (inserted && !error) {
        setEvents((prev) => [...prev, inserted]);
        setEventTitle('');
        setOtherDescription('');
        setShowAddModal(false);
      }
    }
    setSyncStatus('sincronizado');
  };

  const handleOpenEditModal = (ev: AcademicEvent) => {
    setEditingEventId(ev.id);
    let titleToSet = ev.title;
    let descToSet = '';

    if (ev.event_type === 'otro' && ev.title.includes('(') && ev.title.endsWith(')')) {
      const lastIndex = ev.title.lastIndexOf('(');
      titleToSet = ev.title.substring(0, lastIndex).trim();
      descToSet = ev.title.substring(lastIndex + 1, ev.title.length - 1).trim();
    }

    setEventTitle(titleToSet);
    setOtherDescription(descToSet);
    setEventSubjectId(ev.subject_id);
    setEventType(ev.event_type);
    setEventStartDate(ev.start_date || ev.due_date);
    setEventDueDate(ev.due_date);
    setEventDueTime(ev.due_time);
    setEventInClass(ev.in_class);
    setShowAddModal(true);
  };

  const handleToggleEvent = async (eventId: string, current: boolean) => {
    setEvents((prev) => prev.map((ev) => ev.id === eventId ? { ...ev, completed: !current } : ev));
    await supabase.from('academic_events').update({ completed: !current }).eq('id', eventId);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este trabajo o examen?')) return;
    
    setSyncStatus('guardando');
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    await supabase.from('academic_events').delete().eq('id', eventId);
    setSyncStatus('sincronizado');
  };

  const handleUpdateGroups = async (chineseG: string, englishG: string) => {
    setUserChineseGroup(chineseG);
    setUserEnglishGroup(englishG);
    setSavingSettings(true);
    setSyncStatus('guardando');

    if (userId) {
      await supabase.from('profiles').update({
        chinese_group: chineseG,
        english_group: englishG,
      }).eq('id', userId);
    }

    setSavingSettings(false);
    setSyncStatus('sincronizado');
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres borrar tu cuenta? Se eliminarán todos tus datos, notas y registros de asistencia de forma permanente.'
    );
    if (!confirmDelete) return;

    try {
      if (userId) {
        await supabase.from('custom_sub_criteria').delete().eq('user_id', userId);
        await supabase.from('user_subjects').delete().eq('user_id', userId);
        await supabase.from('user_grades').delete().eq('user_id', userId);
        await supabase.from('academic_events').delete().eq('user_id', userId);
        await supabase.from('attendance_logs').delete().eq('user_id', userId);
        await supabase.from('profiles').delete().eq('id', userId);
        await supabase.auth.signOut();
      }
      router.push('/');
    } catch (err) {
      console.error('Error al borrar la cuenta:', err);
      alert('Hubo un error al intentar eliminar la cuenta.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getClassroomDisplay = (code: string, defaultRoom: string, isLanguage?: boolean) => {
    if (!isLanguage) return defaultRoom;
    if (code === 'XIN201') {
      const room = LANGUAGE_ROOMS['XIN201'][userChineseGroup] || defaultRoom;
      return `${room} (Grupo ${userChineseGroup})`;
    }
    if (code === 'ANG201') {
      const room = LANGUAGE_ROOMS['ANG201'][userEnglishGroup] || defaultRoom;
      return `${room} (Grupo ${userEnglishGroup})`;
    }
    return defaultRoom;
  };

  const getSubjectGrade = (subjectId: string) => {
    const subCriteria = criteria.filter((c) => c.subject_id === subjectId);
    if (subCriteria.length === 0) return null;

    let evaluatedWeight = 0;
    let weightedSum = 0;
    let hasAnyGrade = false;

    for (const c of subCriteria) {
      const subItems = customSubCriteria[c.id] || [];
      let effectiveGrade: number | null = null;

      if (subItems.length > 0) {
        const validGrades = subItems.filter((i) => i.grade !== null && i.grade !== undefined) as { grade: number }[];
        if (validGrades.length > 0) {
          const sum = validGrades.reduce((acc, curr) => acc + curr.grade, 0);
          effectiveGrade = Number((sum / validGrades.length).toFixed(2));
        }
      } else {
        effectiveGrade = userGrades[c.id] ?? null;
      }

      if (effectiveGrade !== null && !isNaN(effectiveGrade)) {
        weightedSum += (effectiveGrade * Number(c.weight_pct)) / 100;
        evaluatedWeight += Number(c.weight_pct);
        hasAnyGrade = true;
      }
    }

    if (!hasAnyGrade) return null;
    return {
      currentAccumulated: Number(weightedSum.toFixed(2)),
      scaledToTen: Number(((weightedSum / evaluatedWeight) * 10).toFixed(2)),
      completedPct: evaluatedWeight
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f8] text-gray-400 text-xs font-medium tracking-wide">
        Sincronizando expediente oficial...
      </div>
    );
  }

  const filteredSubjects = subjects.filter((s) => s.semester === activeSemester || s.is_annual);

  let totalElapsedGlobal = 0;
  let totalMissedGlobal = 0;
  filteredSubjects.forEach((sub) => {
    const isConv = userSubjects[sub.id]?.is_convalidated;
    if (!isConv) {
      const elapsed = getElapsedSessions(sub.code);
      const missed = userSubjects[sub.id]?.missed_classes || 0;
      totalElapsedGlobal += elapsed;
      totalMissedGlobal += Math.min(missed, elapsed);
    }
  });

  const totalAttendedGlobal = Math.max(0, totalElapsedGlobal - totalMissedGlobal);
  const globalAttendancePct = totalElapsedGlobal > 0 
    ? Math.round((totalAttendedGlobal / totalElapsedGlobal) * 100) 
    : 100;

  let totalEctsWithGrade = 0;
  let weightedGradeSum = 0;
  filteredSubjects.forEach((sub) => {
    const isConv = userSubjects[sub.id]?.is_convalidated;
    if (!isConv) {
      const res = getSubjectGrade(sub.id);
      if (res && res.scaledToTen !== null) {
        weightedGradeSum += res.scaledToTen * sub.ects;
        totalEctsWithGrade += sub.ects;
      }
    }
  });
  const courseGpa = totalEctsWithGrade > 0 ? (weightedGradeSum / totalEctsWithGrade).toFixed(2) : null;

  const selDayOfWeek = selectedDay.getDay();
  const selIso = selectedDay.toISOString().split('T')[0];
  const isSelectedHoliday = S1_HOLIDAYS_INFO[selIso];

  const dailyClasses: { code: string; name: string; slot: ClassSlot }[] = [];
  if (!isSelectedHoliday && selDayOfWeek >= 1 && selDayOfWeek <= 5) {
    for (const [code, item] of Object.entries(S1_SCHEDULE_CLEAN)) {
      const sub = subjects.find(s => s.code === code);
      const isConv = sub ? userSubjects[sub.id]?.is_convalidated : false;
      if (!isConv) {
        for (const slot of item.slots) {
          if (slot.day === selDayOfWeek) dailyClasses.push({ code, name: item.name, slot });
        }
      }
    }
    dailyClasses.sort((a, b) => a.slot.startHour - b.slot.startHour);
  }

  const dailyEvents = events.filter((e) => {
    if (e.in_class) {
      return e.due_date === selIso;
    } else {
      return e.due_date === selIso || (e.start_date && e.start_date === selIso);
    }
  });

  const getMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    let startDayOfWeek = firstDay.getDay();
    let padLeft = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    for (let i = 0; i < padLeft; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };
  const monthDaysList = getMonthDays(selectedMonth.getFullYear(), selectedMonth.getMonth());

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-900 font-sans antialiased relative overflow-x-hidden">
      
      <div 
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/15 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-4 left-4 bottom-4 z-50 w-72 sm:w-80 glass-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 ease-out border border-white/80 ${
          sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          <div className="flex items-center gap-3.5 pt-1">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              className="w-8 h-8 flex items-center justify-center cursor-pointer p-0 border-none bg-transparent"
            >
              <div className="flex flex-col items-center justify-center gap-1 w-5 h-5 rotate-90 transition-transform duration-300 ease-in-out">
                <span className="w-4 h-[2px] bg-gray-800 rounded-full" />
                <span className="w-4 h-[2px] bg-gray-800 rounded-full" />
                <span className="w-4 h-[2px] bg-gray-800 rounded-full" />
              </div>
            </button>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none">Menú</h2>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab('general'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-1' : ''
              } ${activeTab === 'general' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Resumen General</span>
            </button>

            <button
              onClick={() => { setActiveTab('diario'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-2' : ''
              } ${activeTab === 'diario' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Horario Diario y Tareas</span>
            </button>

            <button
              onClick={() => { setActiveTab('calendario'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-3' : ''
              } ${activeTab === 'calendario' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Calendario Académico</span>
            </button>

            <button
              onClick={() => { setActiveTab('asistencia'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-4' : ''
              } ${activeTab === 'asistencia' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>Control de Asistencia</span>
            </button>

            <button
              onClick={() => { setActiveTab('notas'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                sidebarOpen ? 'animate-ios-item-4' : ''
              } ${activeTab === 'notas' ? 'bg-white text-[#0071e3] shadow-xs border border-gray-200/70' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Calificaciones</span>
            </button>
          </nav>
        </div>

        <div className={`border-t border-gray-200/60 pt-4 space-y-2.5 ${sidebarOpen ? 'animate-ios-item-4' : ''}`}>
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#0071e3] shadow-xs shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-gray-900">UniNotas</span>
                <span className="text-[11px] font-normal text-gray-400">EUM</span>
              </div>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={() => { setSidebarOpen(false); setShowHelpModal(true); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            <span>Guía y Funcionalidades</span>
          </button>

          <button
            onClick={() => { setSidebarOpen(false); setSettingsOpen(true); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            <span>Ajustes del perfil</span>
          </button>

          <button
            onClick={() => { setSidebarOpen(false); setReportOpen(true); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-700 transition-colors cursor-pointer border border-amber-200/50"
          >
            <MessageSquareWarning className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Reportar un problema</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
        className={`fixed top-4 left-4 sm:top-5 sm:left-6 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl glass-panel flex items-center justify-center cursor-pointer shadow-sm hover:shadow transition-all duration-300 ${
          sidebarOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-1 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ease-in-out">
          <span className="w-3.5 sm:w-4 h-[2px] bg-gray-700 rounded-full" />
          <span className="w-3.5 sm:w-4 h-[2px] bg-gray-700 rounded-full" />
          <span className="w-3.5 sm:w-4 h-[2px] bg-gray-700 rounded-full" />
        </div>
      </button>

      <div className="w-full flex flex-col min-w-0">
        <header className="px-4 sm:px-8 pl-16 sm:pl-22 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/60 bg-white/40 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
              {activeTab === 'general' && 'Resumen Global del Curso'}
              {activeTab === 'diario' && 'Horario Diario y Tareas en Clase'}
              {activeTab === 'calendario' && 'Calendario Académico y Entregas'}
              {activeTab === 'asistencia' && 'Registro de Asistencias'}
              {activeTab === 'notas' && 'Expediente y Calificaciones'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-[11px] sm:text-xs text-gray-400">2n A Grau Màrqueting • 16:00 a 20:30</p>
              <span className="text-[10px] text-gray-400 hidden sm:inline">•</span>
              <span className={`text-[10px] font-semibold flex items-center gap-1 ${syncStatus === 'guardando' ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>
                {syncStatus === 'guardando' ? 'Sincronizando...' : 'Supabase Al Día'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notificaciones"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass-panel flex items-center justify-center text-gray-600 hover:text-gray-900 relative cursor-pointer shadow-xs transition-colors"
              >
                <Bell className="w-4 h-4" />
                {pendingSessions.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#ff3b30] text-white text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {pendingSessions.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl border border-gray-200/80 z-50 animate-ios-item-1">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">Asistencias Pendientes</span>
                        {pendingSessions.length > 0 && (
                          <span className="text-[10px] font-bold bg-blue-100 text-[#0071e3] px-2 py-0.5 rounded-full">
                            {pendingSessions.length}
                          </span>
                        )}
                      </div>
                      <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer">
                        Cerrar
                      </button>
                    </div>

                    <div className="mt-3 max-h-80 overflow-y-auto space-y-3">
                      {pendingSessions.length === 0 ? (
                        <div className="py-6 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          <span>¡Estás al día! No tienes asistencias pendientes por confirmar.</span>
                        </div>
                      ) : (
                        pendingSessions.map((session) => (
                          <div key={`${session.subjectCode}_${session.sessionDate}`} className="bg-white border border-gray-200/70 rounded-xl p-3.5 space-y-2.5 shadow-xs">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-gray-900 leading-tight">{session.subjectName}</p>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                  <CalendarDays className="w-3 h-3" />
                                  {session.sessionDate}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#0071e3] px-1.5 py-0.5 rounded">
                                {session.subjectCode}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                              <button
                                onClick={() => handleSurveyAnswer(session, true)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Sí, fui</span>
                              </button>
                              <button
                                onClick={() => handleSurveyAnswer(session, false)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Falté</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="inline-flex p-1 rounded-xl bg-gray-200/70 border border-gray-300/40">
              <button
                onClick={() => setActiveSemester(1)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  activeSemester === 1 ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                1r Sem.
              </button>
              <button
                onClick={() => setActiveSemester(2)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  activeSemester === 2 ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                2n Sem.
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">

          {activeTab === 'diario' && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-4 border border-gray-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                  <button
                    onClick={() => {
                      const d = new Date(selectedDay);
                      d.setDate(d.getDate() - 1);
                      setSelectedDay(d);
                    }}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="text-center sm:text-left">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                      {DAYS_NAMES[selectedDay.getDay()]}, {selectedDay.getDate()} de {selectedDay.toLocaleString('es-ES', { month: 'long' })}
                    </h3>
                    <p className="text-xs text-[#0071e3] font-semibold">
                      {selectedDay.toDateString() === new Date().toDateString() ? 'Jornada de hoy' : 'Día seleccionado'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const d = new Date(selectedDay);
                      d.setDate(d.getDate() + 1);
                      setSelectedDay(d);
                    }}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingEventId(null);
                    setEventStartDate(selIso);
                    setEventDueDate(selIso);
                    setEventInClass(true);
                    setOtherDescription('');
                    setEventTitle('');
                    setShowAddModal(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir trabajo o examen</span>
                </button>
              </div>

              {isSelectedHoliday ? (
                <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center space-y-2 border border-amber-200/70 bg-amber-50/40">
                  <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
                  <h4 className="text-base font-bold text-amber-900">Universidad Cerrada • Día no lectivo</h4>
                  <p className="text-xs text-amber-700 font-medium">{isSelectedHoliday}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
                      Horario y Clases de hoy
                    </h4>

                    {dailyClasses.length === 0 ? (
                      <div className="glass-panel rounded-2xl p-10 text-center border border-gray-200/70">
                        <p className="text-xs text-gray-400">Sin clases programadas para este día.</p>
                      </div>
                    ) : (
                      dailyClasses.map(({ code, name, slot }) => {
                        const now = new Date();
                        const isToday = selectedDay.toDateString() === now.toDateString();
                        const classStart = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), slot.startHour, slot.startMinute);
                        const classEnd = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), slot.endHour, slot.endMinute);

                        const isOngoing = isToday && now >= classStart && now < classEnd;
                        const isFinished = isToday ? now >= classEnd : selectedDay < now;

                        const classroomText = getClassroomDisplay(code, slot.defaultClassroom, slot.isLanguage);

                        return (
                          <div 
                            key={`${code}_${slot.startTime}`}
                            className={`glass-panel rounded-3xl p-4 sm:p-5 border transition-all shadow-xs ${
                              isOngoing ? 'border-[#0071e3] ring-2 ring-[#0071e3]/20 bg-blue-50/30' : 'border-gray-200/70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-[#0071e3] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                {code}
                              </span>
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                isOngoing ? 'bg-[#0071e3] text-white animate-pulse' : isFinished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {isOngoing ? 'En curso' : isFinished ? 'Finalizada' : 'Pendiente'}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-gray-900 mt-2">{name}</h4>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 sm:gap-5 text-xs text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
                                <span className="font-semibold text-gray-700">{slot.startTime} - {slot.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span>Aula: <strong className="text-gray-800 font-semibold">{classroomText}</strong></span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
                      Exámenes y Entregas de hoy
                    </h4>

                    {dailyEvents.length === 0 ? (
                      <div className="glass-panel rounded-2xl p-8 text-center border border-gray-200/70 space-y-2">
                        <BookmarkCheck className="w-6 h-6 text-emerald-500 mx-auto" />
                        <p className="text-xs font-semibold text-gray-700">Sin entregas hoy</p>
                        <p className="text-[11px] text-gray-400">Pulsa en "Añadir trabajo o examen" para apuntar una nueva entrega.</p>
                      </div>
                    ) : (
                      dailyEvents.map((ev) => {
                        const sub = subjects.find((s) => s.id === ev.subject_id);
                        return (
                          <div 
                            key={ev.id}
                            className={`glass-panel rounded-2xl p-4 border transition-all shadow-xs space-y-2.5 ${
                              ev.completed ? 'opacity-50 border-gray-200' : ev.event_type === 'examen' ? 'border-red-200 bg-red-50/20' : 'border-blue-200 bg-blue-50/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  ev.event_type === 'examen' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {ev.event_type === 'examen' ? 'Examen' : ev.in_class ? 'Entrega en clase' : 'Entrega fuera de clase'}
                                </span>
                                <h5 className={`text-xs font-bold text-gray-900 mt-1 ${ev.completed ? 'line-through' : ''}`}>
                                  {ev.title}
                                </h5>
                                <p className="text-[11px] text-gray-400 mt-0.5">{sub?.name || 'Asignatura'}</p>
                              </div>

                              <button
                                onClick={() => handleToggleEvent(ev.id, ev.completed)}
                                title="Marcar como completado"
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                  ev.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                              >
                                {ev.completed && <Check className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            <div className="pt-2 border-t border-gray-100 space-y-1.5">
                              {ev.in_class ? (
                                <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold">
                                  <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
                                  <span>Hora de clase: {formatCleanTime(ev.due_time) || 'Durante la sesión'}</span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {ev.start_date && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 opacity-60">
                                      <CalendarDays className="w-3 h-3" />
                                      <span>Asignado / Inicio: {formatEuropeanDate(ev.start_date)}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-100/70 border border-amber-300/70 px-2.5 py-1 rounded-lg font-bold">
                                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                    <span>Límite: {formatEuropeanDate(ev.due_date)} hasta las {formatCleanTime(ev.due_time)}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* BOTONES ABAJO DEL RECUADRO: MODIFICAR Y ELIMINAR */}
                            <div className="pt-2.5 border-t border-gray-200/60 flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(ev)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3 h-3 text-[#0071e3]" />
                                <span>Modificar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                                <span>Eliminar</span>
                              </button>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendario' && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-4 border border-gray-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Planificación Académica</h3>
                  <p className="text-xs text-gray-400">Festivos oficiales, entregas con límite de hora y exámenes</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="inline-flex p-1 rounded-2xl bg-gray-100 border border-gray-200/80 shadow-inner w-full sm:w-auto justify-center">
                    <button
                      onClick={() => setCalendarMode('semanal')}
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        calendarMode === 'semanal' ? 'bg-white text-[#0071e3] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Semanal
                    </button>
                    <button
                      onClick={() => setCalendarMode('mensual')}
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        calendarMode === 'mensual' ? 'bg-white text-[#0071e3] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Mensual
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setEditingEventId(null);
                      setEventInClass(false);
                      setOtherDescription('');
                      setEventTitle('');
                      setShowAddModal(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir trabajo o examen</span>
                  </button>
                </div>
              </div>

              {/* VISTA SEMANAL ADAPTADA A MÓVIL */}
              {calendarMode === 'semanal' && (
                <div className="glass-panel rounded-2xl border border-gray-200/70 overflow-hidden shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-200/70">
                    {['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres'].map((dayName, index) => {
                      const dayNum = index + 1;
                      const daySlots: { code: string; name: string; slot: ClassSlot }[] = [];
                      for (const [code, item] of Object.entries(S1_SCHEDULE_CLEAN)) {
                        const sub = subjects.find(s => s.code === code);
                        const isConv = sub ? userSubjects[sub.id]?.is_convalidated : false;
                        if (!isConv) {
                          for (const slot of item.slots) {
                            if (slot.day === dayNum) daySlots.push({ code, name: item.name, slot });
                          }
                        }
                      }
                      daySlots.sort((a, b) => a.slot.startHour - b.slot.startHour);

                      return (
                        <div key={dayName} className="p-4 space-y-3 bg-white/40">
                          <div className="text-center pb-2 border-b border-gray-200/60 bg-gray-50/60 -mx-4 -mt-4 p-3 mb-3">
                            <p className="text-xs font-bold text-gray-800">{dayName}</p>
                            <p className="text-[10px] text-gray-400">16:00 a 20:30</p>
                          </div>

                          {daySlots.length === 0 ? (
                            <p className="text-[11px] text-gray-400 text-center py-4">Sin clases</p>
                          ) : (
                            daySlots.map(({ code, name, slot }) => {
                              const room = getClassroomDisplay(code, slot.defaultClassroom, slot.isLanguage);
                              return (
                                <div key={`${code}_${slot.startTime}`} className="bg-white border border-gray-200/80 rounded-2xl p-3 shadow-xs space-y-1.5 hover:border-[#0071e3]/40 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold text-[#0071e3] bg-blue-50 px-1.5 py-0.5 rounded">
                                      {code}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-semibold">{room}</span>
                                  </div>
                                  <p className="text-xs font-bold text-gray-900 leading-snug">{name}</p>
                                  <p className="text-[11px] font-medium text-gray-500">{slot.startTime} - {slot.endTime}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VISTA MENSUAL ADAPTADA A MÓVIL */}
              {calendarMode === 'mensual' && (
                <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-gray-200/70 space-y-4 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <button
                      onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 capitalize">
                      {selectedMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                      onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold text-gray-400">
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mié</span>
                    <span>Jue</span>
                    <span>Vie</span>
                    <span>Sáb</span>
                    <span>Dom</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {monthDaysList.map((dayDate, idx) => {
                      if (!dayDate) return <div key={`empty_${idx}`} className="h-14 sm:h-20 rounded-xl bg-transparent" />;

                      const iso = dayDate.toISOString().split('T')[0];
                      const holiday = S1_HOLIDAYS_INFO[iso];
                      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
                      const isToday = dayDate.toDateString() === new Date().toDateString();
                      const dayEvents = events.filter((e) => e.due_date === iso);

                      return (
                        <div
                          key={iso}
                          onClick={() => {
                            setSelectedDay(dayDate);
                            setActiveTab('diario');
                          }}
                          className={`h-14 sm:h-20 p-1 sm:p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                            isToday
                              ? 'border-[#0071e3] bg-blue-50/50 shadow-xs'
                              : holiday
                              ? 'border-amber-200 bg-amber-50/40 text-amber-900'
                              : isWeekend
                              ? 'border-transparent bg-gray-50/40 text-gray-400'
                              : 'border-gray-100 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] sm:text-xs font-bold ${isToday ? 'text-[#0071e3]' : 'text-gray-700'}`}>
                              {dayDate.getDate()}
                            </span>
                            {holiday && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />}
                          </div>

                          <div className="space-y-0.5 truncate hidden sm:block">
                            {holiday ? (
                              <span className="text-[9px] font-bold text-amber-700 truncate block">
                                {holiday.split('(')[0]}
                              </span>
                            ) : (
                              dayEvents.slice(0, 2).map((ev) => (
                                <span
                                  key={ev.id}
                                  className={`text-[8px] font-bold px-1 py-0.5 rounded truncate block ${
                                    ev.event_type === 'examen' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {formatCleanTime(ev.due_time)} {ev.title}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-2xl p-5 border border-gray-200/70">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Asistencia Impartida</p>
                  <h3 className="text-3xl font-extrabold text-[#0071e3] mt-2">{globalAttendancePct}%</h3>
                  <p className="text-xs text-gray-500 mt-1">Límite mínimo: 60%</p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-gray-200/70">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Clases Concluidas</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{totalElapsedGlobal}</h3>
                  <p className="text-xs text-gray-500 mt-1">Finalizadas según horario</p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-gray-200/70">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Faltas Acumuladas</p>
                  <h3 className={`text-3xl font-extrabold mt-2 ${totalMissedGlobal > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                    {totalMissedGlobal}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Sobre clases finalizadas</p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-gray-200/70">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Media Expediente</p>
                  <h3 className={`text-3xl font-extrabold mt-2 ${courseGpa ? 'text-[#0071e3]' : 'text-gray-400'}`}>
                    {courseGpa ? courseGpa : '—'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {courseGpa ? 'Ponderada por créditos ECTS' : 'Pendiente de notas'}
                  </p>
                </div>
              </div>

              <div className="glass-panel rounded-2xl border border-gray-200/70 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Estado de Asignaturas</h3>
                  <span className="text-xs text-gray-400">{filteredSubjects.length} materias</span>
                </div>
                <div className="divide-y divide-gray-100 overflow-x-auto">
                  <div className="min-w-[700px]">
                    {filteredSubjects.map((sub) => {
                      const isConv = userSubjects[sub.id]?.is_convalidated;
                      const elapsed = getElapsedSessions(sub.code);
                      const missed = userSubjects[sub.id]?.missed_classes || 0;
                      const attended = Math.max(0, elapsed - missed);
                      const pct = elapsed > 0 ? Math.round((attended / elapsed) * 100) : 100;
                      const isDanger = pct < sub.min_attendance_pct && elapsed > 0;
                      const gradeObj = getSubjectGrade(sub.id);

                      if (isConv) {
                        return (
                          <div key={sub.id} className="px-6 py-4 flex items-center justify-between bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors">
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200">
                                {sub.code}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 line-through">{sub.name}</p>
                                <p className="text-xs text-emerald-700 font-bold">Asignatura Convalidada</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                              Convalidada
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div key={sub.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/40 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-mono font-bold text-[#0071e3] bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                              {sub.code}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
                              <p className="text-xs text-gray-400">
                                {elapsed === 0 ? 'Sin clases concluidas aún' : `${elapsed} sesiones`} • {sub.ects} ECTS {sub.is_annual ? '(Anual)' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="text-right w-28">
                              <p className="text-xs font-semibold text-gray-900">
                                {gradeObj ? `${gradeObj.scaledToTen} / 10` : '—'}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {gradeObj ? `${gradeObj.completedPct}% evaluado` : 'Sin notas'}
                              </p>
                            </div>

                            <div className="text-right w-24">
                              <p className="text-xs font-semibold text-gray-700">{pct}% asist.</p>
                              <p className="text-[11px] text-gray-400">{missed} faltas</p>
                            </div>

                            <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isDanger ? 'bg-red-500' : 'bg-[#0071e3]'}`} style={{ width: `${pct}%` }} />
                            </div>

                            <div className="w-20 text-right">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold ${isDanger ? 'text-red-600' : 'text-emerald-600'}`}>
                                {isDanger ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                {isDanger ? 'Crítico' : 'Al día'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'asistencia' && (
            <div className="glass-panel rounded-2xl border border-gray-200/70 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Control de Faltas al Día</h3>
                <p className="text-xs text-gray-400">Utiliza los botones + / - para regular o corregir cualquier falta manualmente</p>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredSubjects.map((sub) => {
                  const isConv = userSubjects[sub.id]?.is_convalidated;
                  const elapsed = getElapsedSessions(sub.code);
                  const missed = userSubjects[sub.id]?.missed_classes || 0;
                  const attended = Math.max(0, elapsed - missed);
                  const pct = elapsed > 0 ? Math.round((attended / elapsed) * 100) : 100;
                  const isDanger = pct < sub.min_attendance_pct && elapsed > 0;

                  if (isConv) {
                    return (
                      <div key={sub.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/20">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200">
                            {sub.code}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 line-through">{sub.name}</p>
                            <p className="text-xs text-emerald-700 font-bold">Convalidada (Sin control de faltas)</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full self-start sm:self-auto">
                          Convalidada
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={sub.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-[#0071e3] bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                          {sub.code}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
                          <p className="text-xs text-gray-400">
                            Concluidas: <strong className="text-gray-700 font-semibold">{elapsed}</strong> de {sub.total_sessions}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <div className="text-left sm:text-right">
                          <span className={`text-sm font-bold ${isDanger ? 'text-red-600' : 'text-gray-900'}`}>{pct}%</span>
                          <p className="text-[11px] text-gray-400">{missed} faltas</p>
                        </div>

                        <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200/60">
                          <button
                            onClick={() => handleUpdateMissedClasses(sub.id, -1)}
                            disabled={missed <= 0}
                            className="w-7 h-7 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-30 flex items-center justify-center cursor-pointer shadow-xs transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-800">{missed}</span>
                          <button
                            onClick={() => handleUpdateMissedClasses(sub.id, 1)}
                            className="w-7 h-7 rounded-lg bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center cursor-pointer shadow-xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

{activeTab === 'notas' && (
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-6 border border-gray-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Expediente de Calificaciones</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Desglosa pruebas oficiales y notas en directo</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Media Semestre</span>
                  <p className="text-2xl font-black text-[#0071e3]">{courseGpa ? `${courseGpa}` : '—'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredSubjects.map((sub) => {
                  const isConv = userSubjects[sub.id]?.is_convalidated;
                  const subCriteria = criteria.filter((c) => c.subject_id === sub.id);
                  const gradeObj = getSubjectGrade(sub.id);
                  const isExpanded = expandedSubject === sub.id;

                  if (isConv) {
                    return (
                      <div key={sub.id} className="glass-panel rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200">
                            {sub.code}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-gray-800 line-through">{sub.name}</p>
                            <p className="text-xs text-emerald-700 font-bold">Asignatura Convalidada (No computa en media)</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full self-start sm:self-auto">
                          Convalidada
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={sub.id} className="glass-panel rounded-2xl border border-gray-200/70 overflow-hidden transition-all shadow-xs">
                      <div 
                        onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/40 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-[#0071e3] bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                            {sub.code}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{sub.name}</p>
                            <p className="text-xs text-gray-400">{sub.ects} ECTS {sub.is_annual ? '• Anual' : ''}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-gray-900">
                              {gradeObj ? `${gradeObj.scaledToTen} / 10` : 'Sin notas'}
                            </span>
                            <p className="text-[11px] text-gray-400 hidden sm:block">
                              {gradeObj ? `${gradeObj.completedPct}% evaluado (${gradeObj.currentAccumulated} pts acumulados)` : '0% completado'}
                            </p>
                          </div>

                          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                            {isExpanded ? <ChevronUp className="w-4 h-4 transition-transform duration-300" /> : <ChevronDown className="w-4 h-4 transition-transform duration-300" />}
                          </div>
                        </div>
                      </div>

                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1500px] opacity-100 border-t border-gray-100 bg-white/50 p-4 sm:p-6' : 'max-h-0 opacity-0 p-0'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {subCriteria.map((crit) => {
                            const currentVal = userGrades[crit.id];
                            const subItems = customSubCriteria[crit.id] || [];
                            
                            let effectiveGrade = currentVal;
                            if (subItems.length > 0) {
                              const validGrades = subItems.filter((i) => i.grade !== null && i.grade !== undefined) as { grade: number }[];
                              if (validGrades.length > 0) {
                                const sum = validGrades.reduce((acc, curr) => acc + curr.grade, 0);
                                effectiveGrade = Number((sum / validGrades.length).toFixed(2));
                              } else {
                                effectiveGrade = null;
                              }
                            }

                            return (
                              <div key={crit.id} className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-bold text-gray-900">{crit.name}</p>
                                    <p className="text-[11px] text-gray-400 font-medium">Peso: {crit.weight_pct}%</p>
                                  </div>

                                  {subItems.length === 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="number"
                                        step="0.05"
                                        min="0"
                                        max="10"
                                        placeholder="—"
                                        value={currentVal !== null && currentVal !== undefined ? currentVal : ''}
                                        onChange={(e) => handleUpdateGrade(crit.id, e.target.value === '' ? '' : String(parseFloat(e.target.value)))}
                                        className="w-16 text-center py-1.5 px-2 text-sm font-bold rounded-lg border border-gray-200 focus:outline-none focus:border-[#0071e3] bg-gray-50/50"
                                      />  
                                        <span className="text-xs text-gray-400 font-bold">/10</span>
                                      </div>
                                  )}
                                </div>

                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                                      Entregas / Trabajos ({subItems.length})
                                    </span>
                                    <button
                                      onClick={() => handleAddCustomSubCriteria(crit.id)}
                                      className="text-[11px] font-bold text-[#0071e3] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Añadir trabajo</span>
                                    </button>
                                  </div>

                                  {subItems.map((subItem) => (
                                    <div key={subItem.id} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200/60">
                                      <input
                                        type="text"
                                        value={subItem.name}
                                        onChange={(e) => handleUpdateCustomSubName(subItem.id, crit.id, e.target.value)}
                                        className="text-xs font-semibold text-gray-800 bg-transparent border-none focus:outline-none w-full"
                                      />

                                      <div className="flex items-center gap-2 shrink-0">
                                        <input
                                          type="number"
                                          step="0.05"
                                          min="0"
                                          max="10"
                                          placeholder="—"
                                          value={subItem.grade !== null && subItem.grade !== undefined ? subItem.grade : ''}
                                          onChange={(e) => handleUpdateCustomSubGrade(subItem.id, crit.id, e.target.value === '' ? '' : String(parseFloat(e.target.value)))}
                                          className="w-14 text-center py-1 px-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white"
                                        />
                                        <span className="text-[10px] text-gray-400 font-bold">/10</span>
                                        <button
                                          onClick={() => handleDeleteCustomSubCriteria(subItem.id, crit.id)}
                                          className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  {subItems.length > 0 && (
                                    <div className="flex items-center justify-between pt-1 text-xs">
                                      <span className="font-bold text-gray-500">Nota media del apartado:</span>
                                      <span className="font-black text-[#0071e3]">
                                        {effectiveGrade !== null ? `${effectiveGrade} / 10` : 'Sin calificar'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>

        <footer className="w-full border-t border-gray-200/60 bg-white/40 backdrop-blur-sm py-8 px-6 mt-12">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-gray-700">UniNotas</span>
              <span>•</span>
              <span>2n A Grau Màrqueting (EUM)</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-gray-500">
              <Link href="/legal/aviso-legal" className="hover:text-gray-900 transition-colors">Aviso Legal</Link>
              <Link href="/legal/privacidad" className="hover:text-gray-900 transition-colors">Política de Privacidad</Link>
              <Link href="/legal/cookies" className="hover:text-gray-900 transition-colors">Cookies</Link>
              <Link href="/legal/terminos" className="hover:text-gray-900 transition-colors">Términos y Condiciones</Link>
              <Link href="/sitemap.xml" target="_blank" className="hover:text-gray-900 transition-colors">Sitemap</Link>
            </nav>

            <p className="text-[11px] text-gray-400">
              © {new Date().getFullYear()} UniNotas. Uso académico personal.
            </p>
          </div>
        </footer>

      </div>

      {(showTour || showHelpModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/80 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0071e3] shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-gray-900">
                    {showTour ? `Bienvenido a UniNotas (${tourStep}/4)` : 'Guía de Funcionalidades'}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium">Todo lo que necesitas saber para dominar el curso</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowTour(false);
                  setShowHelpModal(false);
                  if (showTour) handleFinishTour();
                }} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-2">
              {(showHelpModal || tourStep === 1) && (
                <div className="space-y-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/80">
                  <h5 className="text-xs font-black uppercase tracking-wider text-[#0071e3]">1. Resumen Global y GPA</h5>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    En la pantalla principal verás tu **media ponderada en directo** (calculada automáticamente con los créditos ECTS de cada asignatura) y el porcentaje de asistencia global frente al **límite crítico del 60%**.
                  </p>
                </div>
              )}

              {(showHelpModal || tourStep === 2) && (
                <div className="space-y-2 bg-purple-50/50 p-4 rounded-2xl border border-purple-100/80">
                  <h5 className="text-xs font-black uppercase tracking-wider text-purple-700">2. Control de Asistencia y Notificaciones</h5>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    La campana superior te avisará de clases pasadas para que confirmes si fuiste o faltaste. También puedes usar la pestaña **Control de Asistencia** con los botones `+` y `-` para regular tus faltas manualmente.
                  </p>
                </div>
              )}

              {(showHelpModal || tourStep === 3) && (
                <div className="space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/80">
                  <h5 className="text-xs font-black uppercase tracking-wider text-emerald-700">3. Calificaciones y Trabajos Personalizados</h5>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    En **Calificaciones**, despliega cualquier asignatura. Puedes meter notas sueltas o pulsar **"+ Añadir trabajo"** para crear tantas prácticas como tengas; la app calculará la media del apartado y su peso final ella solita.
                  </p>
                </div>
              )}

              {(showHelpModal || tourStep === 4) && (
                <div className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/80">
                  <h5 className="text-xs font-black uppercase tracking-wider text-amber-700">4. Horario Diario, Convalidaciones y Ajustes</h5>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Consulta las aulas (A41, A42...) en el **Horario Diario**, revisa festivos oficiales en el **Calendario**, o modifica tus grupos de idiomas y asignaturas convalidadas desde los **Ajustes del perfil**.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {showTour ? (
                <>
                  <button
                    type="button"
                    onClick={handleFinishTour}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  >
                    Saltar tutorial
                  </button>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {tourStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setTourStep(tourStep - 1)}
                        className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 cursor-pointer"
                      >
                        Anterior
                      </button>
                    )}
                    {tourStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => setTourStep(tourStep + 1)}
                        className="px-5 py-2.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Siguiente
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinishTour}
                        className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
                      >
                        ¡Empezar!
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(false)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Cerrar Guía
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200/80 space-y-4 animate-ios-item-1">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-base font-bold text-gray-900">Reportar un Problema</h4>
              <button onClick={() => setReportOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">¿Has encontrado algún error, fallo de asistencia o nota que no cuadra? Cuéntanoslo.</p>
            <textarea
              rows={4}
              placeholder="Describe el problema aquí..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#0071e3] bg-gray-50/50"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('¡Gracias por el reporte! Lo revisaremos enseguida.');
                  setReportText('');
                  setReportOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Enviar Reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-200/80 space-y-6 animate-ios-item-1 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                  <Settings className="w-4 h-4" />
                </div>
                <h4 className="text-base font-extrabold text-gray-900">Ajustes del Perfil</h4>
              </div>
              <button 
                onClick={() => setSettingsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cuenta Activa</span>
              <p className="text-xs font-bold text-gray-900">{userEmail}</p>
              <p className="text-[11px] text-gray-500">2n A Grau Màrqueting • EUM</p>
            </div>

            <div className="space-y-2.5 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/70">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Gestión de Convalidaciones</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {subjects.map(sub => {
                  const isConv = userSubjects[sub.id]?.is_convalidated || false;
                  return (
                    <div 
                      key={`set_conv_${sub.id}`}
                      onClick={() => handleToggleConvalidation(sub.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs ${
                        isConv ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="truncate">{sub.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${isConv ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {isConv ? 'Convalidada' : 'Activa'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Grupo de Xinès II</label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {GROUPS_INFO.map((g) => {
                  const isSelected = userChineseGroup === g.id;
                  return (
                    <button
                      key={`set_chin_${g.id}`}
                      type="button"
                      onClick={() => handleUpdateGroups(g.id, userEnglishGroup)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected ? 'border-[#0071e3] bg-[#0071e3] text-white shadow-xs font-bold' : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <p className="text-xs font-black">{g.label}</p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>{g.room}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Grupo de Anglès II</label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {GROUPS_INFO.map((g) => {
                  const isSelected = userEnglishGroup === g.id;
                  return (
                    <button
                      key={`set_eng_${g.id}`}
                      type="button"
                      onClick={() => handleUpdateGroups(userChineseGroup, g.id)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected ? 'border-[#0071e3] bg-[#0071e3] text-white shadow-xs font-bold' : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <p className="text-xs font-black">{g.label}</p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>{g.room}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 border border-red-200/60"
              >
                <span>Eliminar mi cuenta permanentemente</span>
              </button>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[11px] text-gray-400 font-medium">
                {savingSettings ? 'Guardando en Supabase...' : 'Cambios sincronizados en vivo'}
              </p>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200/80 space-y-5 animate-ios-item-1 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-base font-bold text-gray-900">
                {editingEventId ? 'Modificar Tarea o Examen' : 'Añadir Tarea o Examen'}
              </h4>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700">Título de la entrega o examen</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Caso Práctico 1, Examen Parcial..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700">Asignatura</label>
                  <select
                    value={eventSubjectId}
                    onChange={(e) => setEventSubjectId(e.target.value)}
                    className="w-full mt-1.5 p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#0071e3] bg-white"
                  >
                    {filteredSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700">Tipo</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full mt-1.5 p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#0071e3] bg-white"
                  >
                    <option value="trabajo">Trabajo / Práctica</option>
                    <option value="examen">Examen</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              {eventType === 'otro' && (
                <div className="animate-ios-item-1">
                  <label className="text-xs font-bold text-gray-700">Descripción / Detalle (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Presentación grupal, Debate..."
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl border border-blue-200 bg-blue-50/20 text-xs font-semibold focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              )}

              {eventInClass ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Fecha en clase</label>
                    <input
                      type="date"
                      required
                      value={eventDueDate}
                      onChange={(e) => setEventDueDate(e.target.value)}
                      className="w-full mt-1.5 p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700">Hora de clase</label>
                    <input
                      type="time"
                      required
                      value={eventDueTime}
                      onChange={(e) => setEventDueTime(e.target.value)}
                      className="w-full mt-1.5 p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-200/70">
                  <div className="opacity-70">
                    <label className="text-[11px] font-bold text-gray-600">Fecha de inicio / asignación</label>
                    <input
                      type="date"
                      required
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      className="w-full mt-1 p-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#0071e3] bg-white"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-200/80">
                    <label className="text-xs font-extrabold text-amber-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Fecha y hora límite de entrega</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                      <input
                        type="date"
                        required
                        value={eventDueDate}
                        onChange={(e) => setEventDueDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#0071e3]"
                      />
                      <input
                        type="time"
                        required
                        value={eventDueTime}
                        onChange={(e) => setEventDueTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#0071e3]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal_in_class"
                  checked={eventInClass}
                  onChange={(e) => setEventInClass(e.target.checked)}
                  className="rounded text-[#0071e3] focus:ring-[#0071e3]"
                />
                <label htmlFor="modal_in_class" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Se realiza / entrega presencialmente en clase
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingEventId ? 'Actualizar Evento' : 'Guardar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}