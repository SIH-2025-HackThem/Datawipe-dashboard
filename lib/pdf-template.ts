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
  
  // Colors
  const primaryColor = '#e78a53' // Orange theme color
  const darkGray = '#2a2a2a'
  const mediumGray = '#666666'
  const lightGray = '#999999'
  
  // Helper function to add gradient-like header
  const addHeader = () => {
    // Header background
    doc.setFillColor(42, 42, 42) // Dark gray
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    // Accent line
    doc.setFillColor(231, 138, 83) // Primary orange
    doc.rect(0, 32, pageWidth, 3, 'F')
    
    // Logo/Brand area (left side)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('SwiftWipe', 20, 22)
    
    // Certificate title (right side)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('WIPE CERTIFICATE', pageWidth - 20, 22, { align: 'right' })
  }
  
  // Helper function to add footer
  const addFooter = () => {
    const footerY = pageHeight - 20
    
    // Footer line
    doc.setDrawColor(231, 138, 83)
    doc.setLineWidth(0.5)
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5)
    
    // Footer text
    doc.setTextColor(102, 102, 102)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('This certificate verifies secure data wiping operations', 20, footerY)
    doc.text(`Generated: ${data.generatedAt.toLocaleString()}`, pageWidth - 20, footerY, { align: 'right' })
  }
  
  // Helper function for section headers
  const addSectionHeader = (title: string, y: number): number => {
    doc.setFillColor(231, 138, 83)
    doc.rect(20, y - 2, pageWidth - 40, 12, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(title, 22, y + 6)
    
    return y + 20
  }
  
  // Helper function for info boxes
  const addInfoBox = (label: string, value: string, x: number, y: number, width: number): number => {
    // Box background
    doc.setFillColor(248, 248, 248)
    doc.setDrawColor(220, 220, 220)
    doc.rect(x, y, width, 16, 'FD')
    
    // Label
    doc.setTextColor(102, 102, 102)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(label.toUpperCase(), x + 5, y + 6)
    
    // Value
    doc.setTextColor(42, 42, 42)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(value, x + 5, y + 12)
    
    return y + 20
  }
  
  // Start building the document
  let currentY = 50
  
  // Add header
  addHeader()
  
  // Title section
  doc.setTextColor(42, 42, 42)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Certificate of Secure Data Wipe', 20, currentY)
  currentY += 15
  
  // Subtitle
  doc.setTextColor(102, 102, 102)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('This document certifies the secure wiping of data storage device', 20, currentY)
  currentY += 25
  
  // Device Information Section
  currentY = addSectionHeader('DEVICE INFORMATION', currentY)
  
  // Device ID box
  currentY = addInfoBox('Device ID', data.deviceId, 20, currentY, 160)
  
  // Generation timestamp box
  currentY = addInfoBox('Certificate Generated', data.generatedAt.toLocaleString(), 20, currentY, 160)
  currentY += 10
  
  // Verification Section
  currentY = addSectionHeader('CRYPTOGRAPHIC VERIFICATION', currentY)
  
  // Hash verification box
  doc.setFillColor(245, 245, 245)
  doc.setDrawColor(200, 200, 200)
  doc.rect(20, currentY, pageWidth - 40, 25, 'FD')
  
  doc.setTextColor(102, 102, 102)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('SHA-256 HASH OF CERTIFICATE DATA', 22, currentY + 6)
  
  // Hash value (split into multiple lines for readability)
  doc.setTextColor(42, 42, 42)
  doc.setFontSize(8)
  doc.setFont('courier', 'normal')
  const hashChunks = data.hashHex.match(/.{1,32}/g) || []
  hashChunks.forEach((chunk, index) => {
    doc.text(chunk, 22, currentY + 12 + (index * 4))
  })
  
  currentY += 35
  
  // Digital Signature Section (if available)
  if (data.signatureHex) {
    doc.setFillColor(245, 245, 245)
    doc.setDrawColor(200, 200, 200)
    doc.rect(20, currentY, pageWidth - 40, 25, 'FD')
    
    doc.setTextColor(102, 102, 102)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('SERVER DIGITAL SIGNATURE (ED25519)', 22, currentY + 6)
    
    // Signature value (split into multiple lines)
    doc.setTextColor(42, 42, 42)
    doc.setFontSize(8)
    doc.setFont('courier', 'normal')
    const sigChunks = data.signatureHex.match(/.{1,32}/g) || []
    sigChunks.forEach((chunk, index) => {
      if (currentY + 12 + (index * 4) > pageHeight - 50) {
        doc.addPage()
        addHeader()
        addFooter()
        currentY = 50
      }
      doc.text(chunk, 22, currentY + 12 + (index * 4))
    })
    
    currentY += 35
  }
  
  // Wipe History Section
  if (currentY > pageHeight - 80) {
    doc.addPage()
    addHeader()
    addFooter()
    currentY = 50
  }
  
  currentY = addSectionHeader('WIPE OPERATION HISTORY', currentY)
  
  if (data.history.length === 0) {
    doc.setTextColor(153, 153, 153)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text('No prior wipe operations recorded for this device.', 20, currentY)
  } else {
    // Table header
    doc.setFillColor(240, 240, 240)
    doc.rect(20, currentY, pageWidth - 40, 12, 'F')
    
    doc.setTextColor(42, 42, 42)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('DATE & TIME', 22, currentY + 8)
    doc.text('SIZE (GB)', 90, currentY + 8)
    doc.text('PASSES', 140, currentY + 8)
    
    currentY += 15
    
    // Table rows
    data.history.slice(0, 15).forEach((operation, index) => {
      // Check if we need a new page
      if (currentY > pageHeight - 50) {
        doc.addPage()
        addHeader()
        addFooter()
        currentY = 50
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(252, 252, 252)
        doc.rect(20, currentY - 2, pageWidth - 40, 10, 'F')
      }
      
      doc.setTextColor(42, 42, 42)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(operation.when, 22, currentY + 5)
      doc.text(operation.sizeGb.toString(), 90, currentY + 5)
      doc.text(operation.passes.toString(), 140, currentY + 5)
      
      currentY += 10
    })
    
    if (data.history.length > 15) {
      currentY += 5
      doc.setTextColor(153, 153, 153)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.text(`... and ${data.history.length - 15} more operations`, 22, currentY)
    }
  }
  
  // Security notice
  currentY += 20
  if (currentY > pageHeight - 70) {
    doc.addPage()
    addHeader()
    currentY = 50
  }
  
  // Security seal/badge
  doc.setFillColor(231, 138, 83)
  doc.circle(40, currentY + 15, 15, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('VERIFIED', 40, currentY + 12, { align: 'center' })
  doc.text('SECURE', 40, currentY + 18, { align: 'center' })
  
  // Security notice text
  doc.setTextColor(42, 42, 42)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('This certificate provides cryptographic proof of secure data wiping operations.', 65, currentY + 10)
  doc.text('The SHA-256 hash and digital signature ensure document integrity and authenticity.', 65, currentY + 18)
  
  // Add footer to all pages
  addFooter()
  
  return doc
}