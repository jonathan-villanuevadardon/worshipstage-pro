import { format } from 'date-fns';

function getAssignmentName(assignment) {
  const user = assignment.expand?.team_member_id;
  return user?.name
    || [user?.first_name, user?.last_name].filter(Boolean).join(' ')
    || user?.email
    || 'Miembro sin nombre';
}

function getServiceDateLabel(value) {
  if (!value) return 'Fecha pendiente';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : format(date, 'MMMM d, yyyy');
}

export function createServicePrintContent(service, assignments = [], repertoireSongs = []) {
  const serviceTitle = service.title || service.name || 'Servicio';
  const repertoire = service.expand?.repertoire_id || {};
  const team = assignments.length
    ? assignments.map((assignment) => {
      const role = assignment.role ? ` (${assignment.role})` : '';
      return `${getAssignmentName(assignment)}${role}`;
    }).join(', ')
    : 'Sin asignaciones';
  const serviceSummary = [
    `Fecha: ${getServiceDateLabel(service.date)}`,
    `Hora: ${service.start_time || 'Pendiente'}`,
    `Lugar: ${service.location || 'Santuario principal'}`,
    `Equipo: ${team}`,
  ].join(' | ');

  const songs = repertoireSongs.map((repertoireSong, index) => {
    if (index !== 0) return repertoireSong;
    return {
      ...repertoireSong,
      notes: [serviceSummary, repertoireSong.notes].filter(Boolean).join(' | '),
    };
  });

  return {
    repertoire: {
      ...repertoire,
      id: repertoire.id || service.repertoire_id,
      name: `${serviceTitle} - ${repertoire.name || 'Hoja de servicio'}`,
    },
    songs,
    serviceSummary,
    serviceTitle,
  };
}
