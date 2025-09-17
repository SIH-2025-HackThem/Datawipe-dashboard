"use client"

import { motion } from "framer-motion"
import { Check, Download, Server } from "lucide-react"

export function DownloadSection() {
  return (
    <section className="relative py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <Server className="w-4 h-4 text-[#e78a53]" />
            <span className="text-sm font-medium text-white/80">Download</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-3">
            Get Wipe Suite for Linux & Bootable ISO
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Linux support is available today. Bootable ISO lets you wipe HDDs/SSDs from a clean environment. Windows and macOS installers are coming soon.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl p-6 border border-white/10 bg-white/5"
          >
            <h3 className="text-white font-semibold mb-2">Install via package</h3>
            <p className="text-white/60 text-sm mb-4">Debian/Ubuntu</p>
            <pre className="bg-black/50 border border-white/10 rounded-xl p-4 text-white text-xs sm:text-sm overflow-x-auto no-scrollbar">
sudo dpkg -i wipe-suite_latest_amd64.deb
sudo apt -f install
            </pre>
            <div className="flex items-center gap-2 text-white/70 text-sm mt-4">
              <Check className="w-4 h-4 text-[#e78a53]" /> Verified binaries
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl p-6 border border-white/10 bg-white/5"
          >
            <h3 className="text-white font-semibold mb-2">Install via script</h3>
            <p className="text-white/60 text-sm mb-4">Any modern Linux</p>
            <pre className="bg-black/50 border border-white/10 rounded-xl p-4 text-white text-xs sm:text-sm overflow-x-auto no-scrollbar">
curl -fsSL https://download.wipesuite.sh/install.sh | bash
            </pre>
            <div className="flex items-center gap-2 text-white/70 text-sm mt-4">
              <Check className="w-4 h-4 text-[#e78a53]" /> Checksums and signatures provided
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl p-6 border border-white/10 bg-white/5"
          >
            <h3 className="text-white font-semibold mb-2">Bootable ISO (USB)</h3>
            <p className="text-white/60 text-sm mb-4">Wipe HDDs/SSDs from a clean, offline environment</p>
            <pre className="bg-black/50 border border-white/10 rounded-xl p-4 text-white text-xs sm:text-sm overflow-x-auto no-scrollbar">
# Linux/macOS (replace sdX with your USB device)
sudo dd if=wipe-suite.iso of=/dev/sdX bs=4M status=progress conv=fsync

# Windows
Use Rufus or balenaEtcher to flash wipe-suite.iso to your USB drive.
            </pre>
            <div className="flex items-center gap-2 text-white/70 text-sm mt-4">
              <Check className="w-4 h-4 text-[#e78a53]" /> Works across vendors and file systems
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-center mt-10 flex flex-col items-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full">
            <a href="https://download.wipesuite.sh/wipe-suite_latest_amd64.deb" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#e78a53] text-white font-medium hover:bg-[#e78a53]/90 transition-colors w-full sm:w-auto">
              <Download className="w-4 h-4" /> Download .deb
            </a>
            <a href="https://download.wipesuite.sh/wipe-suite.iso" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors w-full sm:w-auto">
              <Download className="w-4 h-4" /> Download ISO
            </a>
          </div>
          <p className="text-white/50 text-sm">Coming soon: Windows and macOS installers</p>
        </motion.div>
      </div>
    </section>
  )
}


