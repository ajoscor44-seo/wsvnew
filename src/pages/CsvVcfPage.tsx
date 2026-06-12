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
  UserCheck, 
  Heading
} from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { toast } from "sonner";

interface ParsedContact {
  name: string;
  phone: string;
}

export const CsvVcfPage = () => {
  const [step, setStep] = useState<number>(1);
  const [csvText, setCsvText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Mapping config
  const [nameColIdx, setNameColIdx] = useState<number>(-1);
  const [phoneColIdx, setPhoneColIdx] = useState<number>(-1);
  const [namePrefix, setNamePrefix] = useState<string>("WSV ");
  const [nameSuffix, setNameSuffix] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("234");
  const [cleanPhone, setCleanPhone] = useState<boolean>(true);
  
  // File drag & drop ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Free CSV to VCF Contacts Converter Online | WSV Nigeria";
    window.scrollTo(0, 0);
  }, []);

  // Custom parser logic
  const parseCSVData = (text: string) => {
    if (!text.trim()) {
      toast.error("CSV data is empty.");
      return;
    }
    
    const lines: string[][] = [];
    let currentRow: string[] = [];
    let insideQuotes = false;
    let cellContent = "";
    
    // Auto-detect delimiter
    const firstLine = text.split("\n")[0] || "";
    const commas = (firstLine.match(/,/g) || []).length;
    const semicolons = (firstLine.match(/;/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;
    let delimiter = ",";
    
    if (semicolons > commas && semicolons > tabs) delimiter = ";";
    if (tabs > commas && tabs > semicolons) delimiter = "\t";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          cellContent += '"';
          i++; // skip next char
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(cellContent.trim());
        cellContent = "";
      } else if ((char === "\r" || char === "\n") && !insideQuotes) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        currentRow.push(cellContent.trim());
        if (currentRow.some(c => c !== "")) {
          lines.push(currentRow);
        }
        currentRow = [];
        cellContent = "";
      } else {
        cellContent += char;
      }
    }
    if (cellContent !== "" || currentRow.length > 0) {
      currentRow.push(cellContent.trim());
      if (currentRow.some(c => c !== "")) {
        lines.push(currentRow);
      }
    }

    if (lines.length < 2) {
      toast.error("CSV must contain a header row and at least one contact row.");
      return;
    }

    const detectedHeaders = lines[0].map((h, index) => h || `Column ${index + 1}`);
    setHeaders(detectedHeaders);
    setCsvRows(lines.slice(1));
    
    // Auto-map name and phone based on keywords
    let nameIdx = -1;
    let phoneIdx = -1;
    
    detectedHeaders.forEach((h, index) => {
      const cleanH = h.toLowerCase().replace(/[^a-z]/g, "");
      if (cleanH.includes("name") || cleanH.includes("fullname") || cleanH.includes("displayname") || cleanH.includes("contact")) {
        if (nameIdx === -1) nameIdx = index;
      }
      if (cleanH.includes("phone") || cleanH.includes("number") || cleanH.includes("mobile") || cleanH.includes("tel")) {
        if (phoneIdx === -1) phoneIdx = index;
      }
    });

    // Fallbacks if no keywords matched
    if (nameIdx === -1) nameIdx = 0;
    if (phoneIdx === -1 && detectedHeaders.length > 1) phoneIdx = 1;
    if (phoneIdx === -1) phoneIdx = 0;

    setNameColIdx(nameIdx);
    setPhoneColIdx(phoneIdx);
    
    toast.success(`Parsed ${lines.length - 1} rows successfully.`);
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCSVData(text);
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
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".txt"))) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text);
        parseCSVData(text);
      };
      reader.readAsText(file);
    } else {
      toast.error("Please drop a valid .csv or .txt file.");
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    let clean = phone.replace(/[^0-9+]/g, "");
    if (!cleanPhone) return clean;

    // Standardize local format (e.g. 0803... or 0706...) to international format if country code is selected
    if (countryCode) {
      if (clean.startsWith("0") && !clean.startsWith("00")) {
        clean = countryCode + clean.slice(1);
      }
      if (!clean.startsWith("+") && !clean.startsWith(countryCode)) {
        clean = countryCode + clean;
      }
    }
    
    if (!clean.startsWith("+") && clean !== "") {
      clean = "+" + clean;
    }
    
    return clean;
  };

  const getProcessedContacts = (): ParsedContact[] => {
    if (nameColIdx === -1 || phoneColIdx === -1) return [];
    
    return csvRows.map((row) => {
      const rawName = row[nameColIdx] || "Unknown Contact";
      const rawPhone = row[phoneColIdx] || "";
      
      const formattedName = `${namePrefix}${rawName}${nameSuffix}`.trim();
      const formattedPhone = formatPhoneNumber(rawPhone);
      
      return {
        name: formattedName,
        phone: formattedPhone
      };
    }).filter(c => c.phone !== "");
  };

  const handleDownloadVCF = () => {
    const contacts = getProcessedContacts();
    if (contacts.length === 0) {
      toast.error("No valid contacts with phone numbers found.");
      return;
    }

    let vcfContent = "";
    contacts.forEach((contact) => {
      vcfContent += "BEGIN:VCARD\r\n";
      vcfContent += "VERSION:3.0\r\n";
      vcfContent += `FN:${contact.name}\r\n`;
      vcfContent += `N:${contact.name};;;;\r\n`;
      vcfContent += `TEL;TYPE=CELL:${contact.phone}\r\n`;
      vcfContent += "END:VCARD\r\n";
    });

    const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Output file name
    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "contacts";
    link.download = `${baseName}_converted.vcf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Successfully downloaded ${contacts.length} contacts!`);
  };

  const clearData = () => {
    setCsvText("");
    setFileName("");
    setCsvRows([]);
    setHeaders([]);
    setStep(1);
    setNameColIdx(-1);
    setPhoneColIdx(-1);
  };

  const processedContacts = getProcessedContacts();

  // JSON-LD Schema
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "WSV Free CSV to VCF Contacts Converter",
    "operatingSystem": "All",
    "applicationCategory": "UtilityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Convert Excel or CSV spreadsheets into Android/iPhone compatible VCF vCard contact files completely offline for privacy."
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary/30 selection:text-primary pb-16">
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      <main className="max-w-4xl mx-auto px-margin-mobile sm:px-margin-desktop pt-16 sm:pt-20 md:pt-24 relative">
        <Breadcrumbs items={[
          { label: "CSV to VCF Converter", path: "/csv-vcf" }
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
            100% Secure & Client-Side
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display-lg text-white tracking-tighter leading-none mb-3 sm:mb-4">
            CSV to <span className="text-gradient">VCF Converter</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-on-surface-variant max-w-xl mx-auto font-medium leading-relaxed">
            Convert Excel, CSV, or Google Sheets contact lists into standard mobile vCard files instantly. Safe, simple, and processed strictly in your browser.
          </p>
        </section>

        {/* Progress Tracker */}
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
                  {s === 1 ? "Upload CSV" : s === 2 ? "Configure Settings" : "Download VCF"}
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

        {/* Action Card Wrapper */}
        <div className="glass-card rounded-[2rem] border border-white/5 p-6 sm:p-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Upload / Input */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Drag and Drop Zone */}
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
                    accept=".csv,.txt"
                    className="hidden"
                  />
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                    Drag & Drop your CSV file here
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant/60 max-w-xs mx-auto mb-4 font-semibold">
                    Support file formats: <code className="text-secondary bg-secondary/5 px-1.5 py-0.5 rounded font-mono">.csv</code> or <code className="text-secondary bg-secondary/5 px-1.5 py-0.5 rounded font-mono">.txt</code>
                  </p>
                  <button className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-opacity-95 transition-all shadow-md">
                    Choose Local File
                  </button>
                </div>

                {/* Paste Area Toggle / Option */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Or Paste Raw Data</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider block">
                    Paste CSV / Plain Text Comma Separated Contacts
                  </label>
                  <textarea
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="Name,Phone&#10;John Doe,08012345678&#10;Jane Smith,+2347065432100"
                    rows={6}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl p-4 text-sm font-mono text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-all resize-y"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={!csvText.trim()}
                    onClick={() => parseCSVData(csvText)}
                    className="px-6 py-4 bg-primary text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg shadow-primary/10"
                  >
                    Parse Paste Data
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Mapping / Configuration */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <Settings size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Mapping & Settings</h3>
                      <p className="text-xs text-on-surface-variant/60 font-semibold">{fileName || "Raw data"} loaded • {csvRows.length} rows</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Columns Mapping */}
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Column Mapping</h4>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant/80 block">
                        Select Full Name Column:
                      </label>
                      <select
                        value={nameColIdx}
                        onChange={(e) => setNameColIdx(Number(e.target.value))}
                        className="w-full bg-surface-container-lowest border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/30 transition-all font-semibold"
                      >
                        {headers.map((h, idx) => (
                          <option key={idx} value={idx} className="bg-surface-container-lowest text-white">
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant/80 block">
                        Select Phone Number Column:
                      </label>
                      <select
                        value={phoneColIdx}
                        onChange={(e) => setPhoneColIdx(Number(e.target.value))}
                        className="w-full bg-surface-container-lowest border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/30 transition-all font-semibold"
                      >
                        {headers.map((h, idx) => (
                          <option key={idx} value={idx} className="bg-surface-container-lowest text-white">
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right: Contact Formatting */}
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Contact Formatting</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant/80 block">
                          Name Prefix:
                        </label>
                        <input
                          type="text"
                          value={namePrefix}
                          onChange={(e) => setNamePrefix(e.target.value)}
                          placeholder="e.g. WSV "
                          className="w-full bg-surface-container-lowest border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/30 transition-all font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant/80 block">
                          Name Suffix:
                        </label>
                        <input
                          type="text"
                          value={nameSuffix}
                          onChange={(e) => setNameSuffix(e.target.value)}
                          placeholder="e.g. TV"
                          className="w-full bg-surface-container-lowest border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/30 transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between bg-surface-container-lowest/50 p-3 rounded-xl border border-white/5">
                        <div className="space-y-0.5">
                          <label className="text-xs font-bold text-white block">
                            Format Phone Numbers
                          </label>
                          <span className="text-[10px] text-on-surface-variant/50 font-medium leading-relaxed block">
                            Standardizes local numbers for WhatsApp compatibility.
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={cleanPhone}
                          onChange={(e) => setCleanPhone(e.target.checked)}
                          className="w-4 h-4 rounded accent-primary bg-surface"
                        />
                      </div>

                      {cleanPhone && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-on-surface-variant/80 block">
                            Default Country Code:
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-on-surface-variant/40 px-2">+</span>
                            <input
                              type="text"
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value.replace(/[^0-9]/g, ""))}
                              placeholder="e.g. 234"
                              className="w-full bg-surface-container-lowest border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/30 transition-all font-semibold"
                            />
                          </div>
                          <span className="text-[10px] text-on-surface-variant/40 font-medium block">
                            Converts local 080... format to international (e.g. +23480...) format.
                          </span>
                        </div>
                      )}
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
                    Preview Contacts
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Preview and Download */}
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
                      <h3 className="text-base font-bold text-white">Conversion Ready</h3>
                      <p className="text-xs text-on-surface-variant/60 font-semibold">{processedContacts.length} valid contacts parsed</p>
                    </div>
                  </div>
                </div>

                {/* Contacts Preview Area */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Preview (First 5 Rows)</h4>
                  <div className="bg-surface-container-lowest border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-on-surface-variant/80">
                            <th className="p-4 font-bold uppercase tracking-wider">#</th>
                            <th className="p-4 font-bold uppercase tracking-wider">Output Name</th>
                            <th className="p-4 font-bold uppercase tracking-wider">Output Phone Number</th>
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
                          {processedContacts.length === 0 && (
                            <tr>
                              <td colSpan={3} className="p-8 text-center text-on-surface-variant/40 italic">
                                No valid contacts found. Please map columns correctly.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {processedContacts.length > 5 && (
                    <span className="text-[10px] text-on-surface-variant/40 font-medium block text-right italic">
                      + {processedContacts.length - 5} more contacts will be compiled.
                    </span>
                  )}
                </div>

                {/* Privacy Warning Label */}
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
                    disabled={processedContacts.length === 0}
                    onClick={handleDownloadVCF}
                    className="px-6 py-4 bg-gradient-to-r from-primary to-emerald-400 text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    <Download size={14} strokeWidth={3} />
                    Download .VCF File
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Informational SEO Accordion / Content */}
        <section className="mt-16 space-y-12">
          
          {/* Quick FAQ Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 rounded bg-primary" />
                How to convert Excel to VCF for WhatsApp?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/70 leading-relaxed font-semibold">
                To import Excel contacts to WhatsApp, save your Excel sheet as a <code className="text-primary bg-primary/5 px-1 py-0.5 rounded font-mono font-bold">.csv</code> (Comma Separated Values) file. Upload it to this online converter, map the names and phone columns, then download the compiled vCard file. Send it to your phone via WhatsApp or email, tap the file, and choose "Import to Contacts."
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 rounded bg-primary" />
                Is my contact information secure here?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/70 leading-relaxed font-semibold">
                Yes, absolutely. Our CSV to VCF converter uses modern browser File Reader APIs to parse files completely client-side. We do not use any backend upload servers or tracking for this tool. Your data never leaves your device.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 rounded bg-primary" />
                Why are some contact numbers missing?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/70 leading-relaxed font-semibold">
                Make sure you select the correct phone number column during the mapping step. By default, formatting deletes any letters or spaces. Enable phone number cleaning to automatically prepend your target country prefix.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 rounded bg-primary" />
                What is a vCard (.vcf) file format?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/70 leading-relaxed font-semibold">
                A vCard (Virtual Contact File) is a standard file format specification for digital address books. VCF files are natively recognized by Android, iOS, Windows, and macOS contact managers for instant batch imports.
              </p>
            </div>
          </div>

          {/* Quick Guide Step Banner */}
          <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6">Step-by-Step Conversion Guide</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Select File", text: "Export your contact list to a .csv file and drag it into the uploader." },
                { step: "2", title: "Map Fields", text: "Select the Name and Phone headers. Add custom prefixes or suffixes if needed." },
                { step: "3", title: "Sync Contacts", text: "Click Download, open the generated .vcf file on your mobile device, and sync!" }
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
