import type { Goal, Milestone, NavItem, Task, TodayData } from "@/types";
import { getTodayDateString } from "@/lib/dates";

export const navItems: NavItem[] = [
  { id: "hoy", label: "Hoy", href: "/" },
  { id: "tareas", label: "Tareas", href: "/tareas" },
  { id: "calendario", label: "Calendario", href: "#" },
  { id: "objetivos", label: "Objetivos", href: "/objetivos" },
  { id: "bitacora", label: "Bitácora", href: "/bitacora" },
  { id: "progreso", label: "Progreso", href: "/progreso" },
  { id: "configuracion", label: "Configuración", href: "#" },
];

export const todayData: TodayData = {
  userName: "Isidro",
  summary: {
    completedTasks: 2,
    pendingTasks: 3,
    progressPercent: 40,
    mainPriority: "Avanzar con la primera versión de Momentum",
    introMessage:
      "Hoy tenés un día equilibrado. Priorizá el avance de Momentum y dejá espacio para la facultad por la noche.",
  },
  nextEvent: {
    id: "event-1",
    title: "Facultad",
    startTime: "19:00",
    endTime: "22:30",
    location: "Universidad",
  },
};

export function getSeedTasks(today: string = getTodayDateString()): Task[] {
  const createdAt = new Date().toISOString();

  return [
    {
      id: "1",
      title: "Revisar pendientes del equipo de Feater",
      category: "Feater",
      date: today,
      startTime: "09:30",
      priority: "media",
      status: "completada",
      createdAt,
      completedAt: createdAt,
    },
    {
      id: "2",
      title: "Actualizar CV para una postulación",
      category: "Búsqueda laboral",
      date: today,
      startTime: "13:00",
      priority: "alta",
      status: "completada",
      goalId: "goal-1",
      createdAt,
      completedAt: createdAt,
    },
    {
      id: "3",
      title: "Definir alcance inicial de Momentum",
      category: "Personal",
      date: today,
      startTime: "15:30",
      priority: "alta",
      status: "en_progreso",
      createdAt,
    },
    {
      id: "4",
      title: "Avanzar con propuesta de IFEDEL",
      category: "IFEDEL",
      date: today,
      startTime: "17:00",
      priority: "media",
      status: "pendiente",
      goalId: "goal-2",
      createdAt,
    },
    {
      id: "5",
      title: "Asistir a la facultad",
      category: "Facultad",
      date: today,
      startTime: "19:00",
      estimatedMinutes: 210,
      priority: "alta",
      status: "pendiente",
      goalId: "goal-3",
      createdAt,
    },
  ];
}

export function getSeedGoals(today: string = getTodayDateString()): {
  goals: Goal[];
  milestones: Milestone[];
} {
  const createdAt = new Date().toISOString();

  const goals: Goal[] = [
    {
      id: "goal-1",
      title: "Conseguir un nuevo trabajo",
      description:
        "Avanzar con postulaciones, entrevistas y preparación profesional.",
      category: "Búsqueda laboral",
      startDate: today,
      targetDate: undefined,
      status: "activo",
      progressMode: "hitos",
      createdAt,
    },
    {
      id: "goal-2",
      title: "Lanzar primera versión de IFEDEL",
      description: "Definir alcance, propuesta y un MVP usable.",
      category: "IFEDEL",
      startDate: today,
      targetDate: undefined,
      status: "activo",
      progressMode: "hitos",
      createdAt,
    },
    {
      id: "goal-3",
      title: "Aprobar el cuatrimestre",
      description: "Mantener el ritmo de estudio y cumplir con la facultad.",
      category: "Facultad",
      startDate: today,
      targetDate: undefined,
      status: "activo",
      progressMode: "manual",
      manualProgress: 65,
      createdAt,
    },
  ];

  const milestones: Milestone[] = [
    {
      id: "ms-1",
      goalId: "goal-1",
      title: "Actualizar CV y LinkedIn",
      completed: true,
      completedAt: createdAt,
      position: 0,
    },
    {
      id: "ms-2",
      goalId: "goal-1",
      title: "Armar portfolio con proyectos recientes",
      completed: false,
      position: 1,
    },
    {
      id: "ms-3",
      goalId: "goal-1",
      title: "Enviar primeras postulaciones",
      completed: false,
      position: 2,
    },
    {
      id: "ms-4",
      goalId: "goal-1",
      title: "Preparar entrevistas técnicas",
      completed: false,
      position: 3,
    },
    {
      id: "ms-5",
      goalId: "goal-2",
      title: "Definir alcance del MVP",
      completed: false,
      position: 0,
    },
    {
      id: "ms-6",
      goalId: "goal-2",
      title: "Redactar propuesta inicial",
      completed: false,
      position: 1,
    },
    {
      id: "ms-7",
      goalId: "goal-2",
      title: "Validar idea con potenciales usuarios",
      completed: false,
      position: 2,
    },
    {
      id: "ms-8",
      goalId: "goal-2",
      title: "Publicar primera versión",
      completed: false,
      position: 3,
    },
  ];

  return { goals, milestones };
}
