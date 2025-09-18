import { jsPDF } from 'jspdf'

interface WipeCertificateData {
  deviceId: string
  generatedAt: Date
  hashHex: string
  signatureHex?: string
  history: Array<{
    when: string
    sizeGb: number
    passes: number
  }>
}

export function generateWipeCertificatePDF(data: WipeCertificateData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  let currentY = 0

  // Colors
  const accentColor = '#e78a53' // Orange
  const primaryTextColor = '#2a2a2a' // Dark Gray
  const secondaryTextColor = '#666666' // Medium Gray
  const lightLineColor = '#cccccc' // A new, lighter gray for lines

  // Helper function to add a clean, minimal header
  const addHeader = () => {
    doc.setTextColor(primaryTextColor)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('SwiftWipe', margin, 20)

    doc.setTextColor(secondaryTextColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Data Wipe Certificate', pageWidth - margin, 20, { align: 'right' })

    // A thin line for separation, colored with the accent
    doc.setDrawColor(accentColor)
    doc.setLineWidth(0.5)
    doc.line(margin, 25, pageWidth - margin, 25)
  }

  // Helper function to add a minimalistic footer
  const addFooter = () => {
    const footerY = pageHeight - 15

    doc.setDrawColor(lightLineColor)
    doc.setLineWidth(0.2)
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    doc.setTextColor(secondaryTextColor)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('This certificate verifies secure data wiping operations', margin, footerY)
    doc.text(`Generated: ${data.generatedAt.toLocaleDateString()}`, pageWidth - margin, footerY, { align: 'right' })
  }

  // Helper function for section headers using the accent color
  const addSectionHeader = (title: string, y: number): number => {
    doc.setTextColor(accentColor)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, y)
    // A thin underline for the title
    doc.setDrawColor(lightLineColor)
    doc.setLineWidth(0.5)
    doc.line(margin, y + 2, pageWidth - margin, y + 2)
    return y + 10
  }

  // Start building the document
  addHeader()
  currentY = 40

  // Main Title section
  doc.setTextColor(primaryTextColor)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Certificate of Secure Data Wipe', margin, currentY)
  currentY += 10
  doc.setFontSize(10)
  doc.text('This document certifies the secure wiping of data storage device', margin, currentY)
  currentY += 20

  // Device Information Section (no boxes, just clean text)
  currentY = addSectionHeader('DEVICE INFORMATION', currentY)
  doc.setTextColor(primaryTextColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Device ID:', margin, currentY)
  doc.setFont('helvetica', 'normal')
  doc.text(data.deviceId, margin + 25, currentY)
  currentY += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Generated At:', margin, currentY)
  doc.setFont('helvetica', 'normal')
  doc.text(data.generatedAt.toLocaleString(), margin + 25, currentY)
  currentY += 20

  // Verification Section (cleaner, single-line presentation)
  currentY = addSectionHeader('CRYPTOGRAPHIC VERIFICATION', currentY)
  doc.setTextColor(primaryTextColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('SHA-256 Hash:', margin, currentY)
  doc.setFontSize(8)
  doc.setFont('courier', 'normal')
  const hashChunks = data.hashHex.match(/.{1,60}/g) || [] // Longer chunks for less lines
  hashChunks.forEach((chunk, index) => {
    doc.text(chunk, margin, currentY + 5 + (index * 4))
  })
  currentY += 10 + (hashChunks.length * 4)

  if (data.signatureHex) {
    if (currentY + 30 > pageHeight - margin) {
        doc.addPage()
        addHeader()
        currentY = 40
    }
    doc.setTextColor(primaryTextColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Digital Signature:', margin, currentY)
    doc.setFontSize(8)
    doc.setFont('courier', 'normal')
    const sigChunks = data.signatureHex.match(/.{1,60}/g) || []
    sigChunks.forEach((chunk, index) => {
        doc.text(chunk, margin, currentY + 5 + (index * 4))
    })
    currentY += 10 + (sigChunks.length * 4)
  }
  currentY += 10

  // Wipe History Section (simple table)
  if (currentY + 40 > pageHeight - margin) {
    doc.addPage()
    addHeader()
    currentY = 40
  }
  currentY = addSectionHeader('WIPE OPERATION HISTORY', currentY)

  if (data.history.length === 0) {
    doc.setTextColor(secondaryTextColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text('No prior wipe operations recorded for this device.', margin, currentY)
  } else {
    // Table header (using bold text and a line)
    doc.setTextColor(primaryTextColor)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('DATE & TIME', margin, currentY)
    doc.text('SIZE (GB)', margin + 70, currentY)
    doc.text('PASSES', margin + 120, currentY)
    doc.setDrawColor(lightLineColor)
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2)
    currentY += 8

    // Table rows
    data.history.forEach((operation) => {
      if (currentY + 10 > pageHeight - margin) {
        doc.addPage()
        addHeader()
        currentY = 40
        doc.setTextColor(primaryTextColor)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('DATE & TIME', margin, currentY)
        doc.text('SIZE (GB)', margin + 70, currentY)
        doc.text('PASSES', margin + 120, currentY)
        doc.setDrawColor(lightLineColor)
        doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2)
        currentY += 8
      }
      doc.setTextColor(secondaryTextColor)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(operation.when, margin, currentY)
      doc.text(operation.sizeGb.toString(), margin + 70, currentY)
      doc.text(operation.passes.toString(), margin + 120, currentY)
      currentY += 6
    })
  }

  // Security Notice
  currentY += 20
  if (currentY + 20 > pageHeight - margin) {
    doc.addPage()
    addHeader()
    currentY = 40
  }
  doc.setTextColor(accentColor)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('VERIFIED & SECURE', margin, currentY)
  currentY += 5
  doc.setTextColor(secondaryTextColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('This certificate provides cryptographic proof of secure data wiping operations.', margin, currentY)
  currentY += 5
  doc.text('The SHA-256 hash and digital signature ensure document integrity and authenticity.', margin, currentY)

  // Add footer to all pages
  addFooter()
  
  return doc
}