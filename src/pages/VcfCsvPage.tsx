/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState, useRef } from "react";
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  Settings, 
  Trash2, 
  UserCheck
} from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { toast } from "sonner";

interface ParsedContact {
  name: string;
  phone: string;
}

export const VcfCsvPage = () => {
  const [step, setStep] = useState<number>(1);
  const [vcfText, setVcfText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  
  // Export Settings
  const [delimiter, setDelimiter] = useState<string>(",");
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);
  const [cleanPhone, setCleanPhone] = useState<boolean>(true);
  
  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Free VCF to CSV Contacts Converter Online | WSV Nigeria";
    window.scrollTo(0, 0);
  }, []);

  // VCF Parser Logic
  const parseVCFData = (text: string) => {
    if (!text.trim()) {
      toast.error("VCF data is empty.");
      return;
    }

    const parsedList: ParsedContact[] = [];
    
    // Split text by BEGIN:VCARD (case-insensitive)
    const cards = text.split(/BEGIN:VCARD/i);
    
    cards.forEach((card) => {
      if (!card.trim()) return;
      
      const lines = card.split(/\r?\n/);
      let name = "";
      const phones: string[] = [];
      
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        
        // Match Full Name (FN)
        const fnMatch = trimmedLine.match(/^FN(?:;[^:]*)?:(.*)$/i);
        if (fnMatch) {
          name = fnMatch[1].trim();
        }
        
        // Fallback to Name (N) if FN is not present
        if (!name) {
          const nMatch = trimmedLine.match(/^N(?:;[^:]*)?:(.*)$/i);
          if (nMatch) {
            // N format is typically Last;First;Middle;Prefix;Suffix
            const parts = nMatch[1].split(";");
            const first = parts[1] ? parts[1].trim() : "";
            const last = parts[0] ? parts[0].trim() : "";
            name = `${first} ${last}`.trim();
          }
        }
        
        // Match Phone (TEL)
        const telMatch = trimmedLine.match(/^TEL(?:;[^:]*)?:(.*)$/i);
        if (telMatch) {
          phones.push(telMatch[1].trim());
        }
      });
      
      // Clean name fallback
      if (!name.trim() && phones.length > 0) {
        name = "Contact " + phones[0];
      }

      // Add name-phone pairs
      phones.forEach((phone) => {
        if (phone.trim() && name.trim()) {
          parsedList.push({
            name: name,
            phone: phone.trim()
          });
        }
      });
    });

    if (parsedList.length === 0) {
      toast.error("No valid contacts could be extracted from this VCF.");
      return;
    }

    setContacts(parsedList);
    toast.success(`Successfully extracted ${parsedList.length} contacts.`);
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setVcfText(text);
      parseVCFData(text);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".vcf") || file.name.endsWith(".txt"))) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setVcfText(text);
        parseVCFData(text);
      };
      reader.readAsText(file);
    } else {
      toast.error("Please drop a valid .vcf file.");
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!cleanPhone) return phone;
    // Keep only numbers and + symbol
    return phone.replace(/[^0-9+]/g, "");
  };

  const getProcessedContacts = (): ParsedContact[] => {
    return contacts.map((c) => ({
      name: c.name,
      phone: formatPhoneNumber(c.phone)
    })).filter(c => c.phone !== "");
  };

  const handleDownloadCSV = () => {
    const processed = getProcessedContacts();
    if (processed.length === 0) {
      toast.error("No contacts to download.");
      return;
    }

    let csvContent = "";
    
    // Add headers if selected
    if (includeHeaders) {
      csvContent += `Name${delimiter}Phone\r\n`;
    }

    // Helper to escape values containing delimiters or quotes
    const escapeCSV = (val: string): string => {
      const escaped = val.replace(/"/g, '""');
      if (escaped.includes(delimiter) || escaped.includes('\n') || escaped.includes('\r') || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    processed.forEach((contact) => {
      csvContent += `${escapeCSV(contact.name)}${delimiter}${escapeCSV(contact.phone)}\r\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "contacts";
    const extension = delimiter === "\t" ? "txt" : "csv";
    link.download = `${baseName}_converted.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Successfully saved ${processed.length} contacts to CSV!`);
  };

  const clearData = () => {
    setVcfText("");
    setFileName("");
    setContacts([]);
    setStep(1);
  };

  const processedContacts = getProcessedContacts();

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "WSV Free VCF to CSV Contacts Converter",
    "operatingSystem": "All",
    "applicationCategory": "UtilityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Convert VCF (.vcf) vCard files to Excel or CSV spreadsheets completely client-side in the browser."
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary/30 selection:text-primary pb-16">
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      <main className="max-w-4xl mx-auto px-margin-mobile sm:px-margin-desktop pt-16 sm:pt-20 md:pt-24 relative">
        <Breadcrumbs items={[
          { label: "VCF to CSV Converter", path: "/vcf-csv" }
        ]} />

        {/* Hero Header */}
        <section className="text-center mb-10 sm:mb-14 relative mt-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-64 sm:h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
          >
            <Sparkles size={12} className="text-accent animate-pulse" />
            100% Client-Side Parsing
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display-lg text-white tracking-tighter leading-none mb-3 sm:mb-4">
            VCF to <span className="text-gradient">CSV Converter</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-on-surface-variant max-w-xl mx-auto font-medium leading-relaxed">
            Convert VCF (vCard) files into standard CSV spreadsheets for Excel or Google Sheets. Clean, fast, and completely private.
          </p>
        </section>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 max-w-lg mx-auto">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === s 
                    ? "bg-primary text-black ring-4 ring-primary/20 scale-110" 
                    : step > s 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white/5 text-on-surface-variant/40 border border-white/5"
                }`}>
                  {step > s ? <Check size={14} strokeWidth={3} /> : s}
                </div>
                <span className={`text-xs font-bold hidden sm:inline ${step === s ? "text-white" : "text-on-surface-variant/50"}`}>
                  {s === 1 ? "Upload VCF" : s === 2 ? "Configure Settings" : "Download CSV"}
                </span>
              </div>
              {s < 3 && (
                <div className={`h-[1px] flex-grow max-w-[40px] transition-all duration-500 ${
                  step > s ? "bg-emerald-500" : "bg-white/5"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Action Panel */}
        <div className="glass-card rounded-[2rem] border border-white/5 p-6 sm:p-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Upload */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group ${
                    isDragging 
                      ? "border-primary bg-primary/5 scale-[0.99]" 
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.01]"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".vcf"
                    className="hidden"
                  />
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                    Drag & Drop your VCF file here
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant/60 max-w-xs mx-auto mb-4 font-semibold">
                    Support file formats: <code className="text-secondary bg-secondary/5 px-1.5 py-0.5 rounded font-mono">.vcf</code>
                  </p>
                  <button className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-opacity-95 transition-all shadow-md">
                    Choose Local File
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Or Paste VCF Content</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider block">
                    Paste raw VCF data
                  </label>
                  <textarea
                    value={vcfText}
                    onChange={(e) => setVcfText(e.target.value)}
                    placeholder="BEGIN:VCARD&#10;VERSION:3.0&#10;FN:John Doe&#10;TEL;TYPE=CELL:+2348012345678&#10;END:VCARD"
                    rows={6}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl p-4 text-sm font-mono text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-all resize-y"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={!vcfText.trim()}
                    onClick={() => parseVCFData(vcfText)}
                    className="px-6 py-4 bg-primary text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg"
                  >
                    Parse Paste Data
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Settings */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <Settings size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Export Configuration</h3>
                      <p className="text-xs text-on-surface-variant/60 font-semibold">{fileName || "Raw data"} loaded • {contacts.length} entries parsed</p>
                    </div>
                  </div>
                  <button
                    onClick={clearData}
                    className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
                    title="Clear uploaded data"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary">File Type Settings</h4>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant/80 block">
                        CSV Column Separator:
                      </label>
                      <select
                        value={delimiter}
                        onChange={(e) => setDelimiter(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/30 transition-all font-semibold"
                      >
                        <option value="," className="bg-surface text-white">Comma ( , )</option>
                        <option value=";" className="bg-surface text-white">Semicolon ( ; )</option>
                        <option value="&#9;" className="bg-surface text-white">Tab-delimited ( .txt )</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between bg-surface-container-lowest/50 p-3 rounded-xl border border-white/5">
                      <div className="space-y-0.5">
                        <label className="text-xs font-bold text-white block">
                          Include Header Row
                        </label>
                        <span className="text-[10px] text-on-surface-variant/50 font-medium block">
                          Appends "Name, Phone" as the first row.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeHeaders}
                        onChange={(e) => setIncludeHeaders(e.target.checked)}
                        className="w-4 h-4 rounded accent-primary bg-surface"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Cleaning Settings</h4>
                    
                    <div className="flex items-center justify-between bg-surface-container-lowest/50 p-3 rounded-xl border border-white/5">
                      <div className="space-y-0.5">
                        <label className="text-xs font-bold text-white block">
                          Sanitize Phone Numbers
                        </label>
                        <span className="text-[10px] text-on-surface-variant/50 font-medium block">
                          Removes parenthesis, spaces, dashes.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cleanPhone}
                        onChange={(e) => setCleanPhone(e.target.checked)}
                        className="w-4 h-4 rounded accent-primary bg-surface"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3.5 bg-white/5 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3.5 bg-primary text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
                  >
                    Preview Extracted Grid
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Download */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Contacts Ready</h3>
                      <p className="text-xs text-on-surface-variant/60 font-semibold">{processedContacts.length} numbers ready for conversion</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Extracted Preview (First 5 Rows)</h4>
                  <div className="bg-surface-container-lowest border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-on-surface-variant/80">
                            <th className="p-4 font-bold uppercase tracking-wider">#</th>
                            <th className="p-4 font-bold uppercase tracking-wider">Contact Name</th>
                            <th className="p-4 font-bold uppercase tracking-wider">Phone Number</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                          {processedContacts.slice(0, 5).map((contact, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                              <td className="p-4 text-on-surface-variant/40">{idx + 1}</td>
                              <td className="p-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {contact.name}
                              </td>
                              <td className="p-4 font-mono text-secondary">{contact.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {processedContacts.length > 5 && (
                    <span className="text-[10px] text-on-surface-variant/40 font-medium block text-right italic">
                      + {processedContacts.length - 5} more records will be exported.
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-3 bg-secondary/5 border border-secondary/15 p-4 rounded-2xl">
                  <AlertCircle size={16} className="text-secondary shrink-0 mt-0.5" />
                  <p className="text-xs text-on-surface-variant/70 leading-relaxed font-semibold">
                    <strong className="text-white font-bold">Privacy Guarantee:</strong> All processing is done locally within your browser context. No spreadsheet rows, files, names, or numbers are transferred to our backend or logs.
                  </p>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-3.5 bg-white/5 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5"
                  >
                    <ArrowLeft size={14} />
                    Settings
                  </button>
                  
                  <button
                    onClick={handleDownloadCSV}
                    className="px-6 py-4 bg-gradient-to-r from-primary to-emerald-400 text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    <Download size={14} strokeWidth={3} />
                    Save CSV File
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <section className="mt-16 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 rounded bg-primary" />
                How to open a VCF file in Excel?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/70 leading-relaxed font-semibold">
                Excel cannot open raw VCF files directly in a clean format. Use this converter to transform the `.vcf` file into a `.csv` format. Once downloaded, double-click the CSV file to open it in Microsoft Excel, Google Sheets, or LibreOffice Calc.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 rounded bg-primary" />
                What versions of vCard files are supported?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/70 leading-relaxed font-semibold">
                Our parser reads all standard versions of vCard files, including VCF 2.1, VCF 3.0, and VCF 4.0. It extracts the full name fields (FN/N) and cell phone numbers (TEL).
              </p>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6">Step-by-Step VCF to CSV Guide</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Select VCF", text: "Drag and drop your phone contact export (.vcf) file here." },
                { step: "2", title: "Configure Settings", text: "Choose comma or semicolon separation and decide if you want headers." },
                { step: "3", title: "Open in Excel", text: "Click Save CSV to retrieve your formatted contact table instantly." }
              ].map((item, idx) => (
                <div key={idx} className="space-y-2 relative">
                  <div className="text-3xl font-extrabold text-primary/10 absolute -top-4 -left-2 font-stats-number select-none">{item.step}</div>
                  <h4 className="text-sm font-bold text-white relative z-10">{item.title}</h4>
                  <p className="text-xs text-on-surface-variant/60 leading-relaxed font-semibold relative z-10">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
};
