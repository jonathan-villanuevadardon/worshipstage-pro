import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import pb from '@/lib/supabaseClient';
import { buildRepertoirePDF } from '@/lib/repertoireUtils.js';
import { createServicePrintContent } from '@/lib/servicePrintContent.js';

export async function loadServicePrintData(service) {
  const assignmentsPromise = pb.collection('service_assignments').getFullList({
    filter: `service_id="${service.id}"`,
    expand: 'team_member_id',
    $autoCancel: false,
  });
  const songsPromise = service.repertoire_id
    ? pb.collection('repertoire_songs').getFullList({
      filter: `repertoire_id="${service.repertoire_id}"`,
      sort: 'order',
      expand: 'song_id',
      $autoCancel: false,
    })
    : Promise.resolve([]);
  const [assignments, repertoireSongs] = await Promise.all([assignmentsPromise, songsPromise]);
  return { assignments, repertoireSongs };
}

function buildServiceOnlyPdf(serviceContent) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(serviceContent.serviceTitle, 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(serviceContent.serviceSummary, 182);
  doc.text(summaryLines, 14, 27);

  const messageY = 27 + (summaryLines.length * 4) + 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, messageY - 5, 196, messageY - 5);
  doc.setFontSize(11);
  doc.text('No hay repertorio o canciones asignadas a este servicio.', 14, messageY);
  return doc;
}

export async function buildServicePdf(service, options = {}, preparedData = null) {
  const data = preparedData || await loadServicePrintData(service);
  const content = createServicePrintContent(service, data.assignments, data.repertoireSongs);
  return content.songs.length
    ? buildRepertoirePDF(content.repertoire, content.songs, options)
    : buildServiceOnlyPdf(content);
}

function getServiceFileName(service) {
  const serviceDate = /^\d{4}-\d{2}-\d{2}$/.test(service.date || '')
    ? service.date
    : format(new Date(service.date || Date.now()), 'yyyy-MM-dd');
  return `Service_Sheet_${serviceDate}.pdf`;
}

export async function generateServicePdf(service, options = {}, preparedData = null) {
  const doc = await buildServicePdf(service, options, preparedData);
  doc.save(getServiceFileName(service));
}

export async function printServicePdf(service, options = {}, preparedData = null) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('PRINT_POPUP_BLOCKED');
  printWindow.document.write('<p style="font-family:Arial;padding:24px">Preparando impresión...</p>');

  try {
    const doc = await buildServicePdf(service, options, preparedData);
    doc.autoPrint();
    printWindow.location.href = doc.output('bloburl');
  } catch (error) {
    printWindow.close();
    throw error;
  }
}
