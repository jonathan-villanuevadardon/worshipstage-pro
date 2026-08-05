import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceDateKey, sortServicesChronologically } from './serviceCalendarUtils.js';

test('preserves the database calendar day without a UTC timezone shift', () => {
  assert.equal(serviceDateKey('2026-08-04T00:00:00-06:00'), '2026-08-04');
});

test('sorts the complete service list by day and start time', () => {
  const sorted = sortServicesChronologically([
    { id: 'c', date: '2026-09-01', start_time: '09:00' },
    { id: 'b', date: '2026-08-04', start_time: '18:00' },
    { id: 'a', date: '2026-08-04', start_time: '08:00' },
  ]);
  assert.deepEqual(sorted.map(({ id }) => id), ['a', 'b', 'c']);
});
