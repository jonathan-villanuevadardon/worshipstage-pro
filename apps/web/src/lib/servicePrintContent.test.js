import test from 'node:test';
import assert from 'node:assert/strict';
import { createServicePrintContent } from './servicePrintContent.js';

test('adds service and team details only to the first repertoire song', () => {
  const service = {
    id: 'service-1',
    title: 'Domingo por la mañana',
    date: '2026-08-09',
    start_time: '10:00',
    location: 'Auditorio',
    repertoire_id: 'rep-1',
    expand: { repertoire_id: { id: 'rep-1', name: 'Alabanza' } },
  };
  const assignments = [{
    role: 'Guitarra',
    expand: { team_member_id: { first_name: 'Ana', last_name: 'López' } },
  }];
  const songs = [{ id: 'one', notes: 'Entrada suave' }, { id: 'two', notes: 'Final fuerte' }];
  const result = createServicePrintContent(service, assignments, songs);

  assert.equal(result.repertoire.name, 'Domingo por la mañana - Alabanza');
  assert.match(result.songs[0].notes, /Ana López \(Guitarra\)/);
  assert.match(result.songs[0].notes, /Entrada suave/);
  assert.equal(result.songs[1].notes, 'Final fuerte');
});

test('keeps an empty service printable when no repertoire is assigned', () => {
  const result = createServicePrintContent({ title: 'Oración', date: '2026-08-10' });

  assert.equal(result.songs.length, 0);
  assert.match(result.serviceSummary, /Sin asignaciones/);
  assert.equal(result.repertoire.name, 'Oración - Hoja de servicio');
});
