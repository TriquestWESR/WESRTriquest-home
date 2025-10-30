import PDFDocument from 'pdfkit'
import type { Endorsement } from './types-extra'
import QRCode from 'qrcode'

export async function buildCertificatePDF(opts: {
  learnerId: string
  certificateId: string
  verifyUrl: string
  endorsements: Endorsement[]
  branding?: { title?: string; subtitle?: string }
}) : Promise<Buffer> {
  const { learnerId, certificateId, verifyUrl, endorsements, branding } = opts

  // Prepare QR (PNG buffer)
  const qrPng = await QRCode.toBuffer(verifyUrl, { errorCorrectionLevel: 'M', margin: 1, width: 256 })

  const doc = new PDFDocument({ size: 'A4', margin: 48 })
  const chunks: Buffer[] = []
  return await new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    doc.on('error', reject)
    doc.on('end', () => resolve(Buffer.concat(chunks)))

    // Header
    doc.fillColor('#0a0a0a')
    doc.fontSize(22).text(branding?.title || 'WESR Triquest — Certificate', { align: 'left' })
    doc.moveDown(0.25)
    doc.fontSize(11).fillColor('#555').text(branding?.subtitle || 'Endorsements for WESR Training Requirements sections', { align: 'left' })
    doc.moveDown(1)

    // Meta box
    const startY = doc.y
    doc.roundedRect(doc.x, startY, doc.page.width - 96, 80, 12).stroke('#ddd')
    doc.moveDown(0.4)
    doc.fontSize(12).fillColor('#0a0a0a').text(`Learner: ${learnerId}`, { continued: false })
    doc.moveDown(0.2)
    doc.text(`Certificate ID: ${certificateId}`)
    doc.moveDown(0.2)
    doc.text('Issued endorsements shown below. Each endorsement expires 24 months after grant unless renewed.')

    // QR on the right
    const qrX = doc.page.width - 48 - 96
    const qrY = startY + 8
    doc.image(qrPng, qrX, qrY, { width: 96 })
    doc.fontSize(8).fillColor('#555').text('Verify via QR', qrX, qrY + 100, { width: 96, align: 'center' })

    doc.moveDown(2)

    // Table Header
    doc.moveDown(1)
    doc.fontSize(13).fillColor('#0a0a0a').text('Endorsements', { underline: false })
    doc.moveDown(0.4)

    // Columns
    const colX = [48, 200, 300, 410]
    doc.fontSize(10).fillColor('#333')
    doc.text('Section', colX[0], doc.y)
    doc.text('Version', colX[1], doc.y)
    doc.text('Granted', colX[2], doc.y)
    doc.text('Expires', colX[3], doc.y)
    doc.moveDown(0.4)
    doc.moveTo(48, doc.y).lineTo(doc.page.width - 48, doc.y).strokeColor('#e5e5e5').stroke()
    doc.moveDown(0.4)

    // Rows
    endorsements.forEach(e => {
      doc.fillColor('#111')
      doc.text(e.sectionId, colX[0], doc.y)
      doc.text(e.version, colX[1], doc.y)
      doc.text(new Date(e.grantedAt).toLocaleDateString('en-GB'), colX[2], doc.y)
      doc.text(new Date(e.expiresAt).toLocaleDateString('en-GB'), colX[3], doc.y)
      doc.moveDown(0.2)
      doc.moveTo(48, doc.y).lineTo(doc.page.width - 48, doc.y).strokeColor('#f0f0f0').stroke()
      doc.moveDown(0.2)
    })

    doc.moveDown(1.2)
    doc.fontSize(9).fillColor('#666')
      .text('This certificate attests that the learner achieved ≥80% in the endorsed TR sections, based on the locked blueprint and question counts set by WESR Admin. Endorsements are version-bound.', { width: doc.page.width - 96 })

    doc.end()
  })
}
