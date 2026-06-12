/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "dotenv/config";
import express from "express";
import crypto from "crypto";

import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";
import { format, addDays, isAfter } from "date-fns";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = 3000;

// Supabase Setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("WARNING: Supabase URL or Anon Key is missing from environment variables!");
}

const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co", 
  supabaseAnonKey || "placeholder-anon-key"
);

// Storage Setup
const VCF_DIR = path.join(process.cwd(), "public/vcf");
if (!fs.existsSync(VCF_DIR)) fs.mkdirSync(VCF_DIR, { recursive: true });

// Middleware
app.use(cors());
app.use(bodyParser.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// --- API Routes ---

// Submit Number
app.post("/api/submit", async (req, res) => {
  const { phoneNumber, name, plan, paymentReference } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: "Phone number is required" });

  // Normalize number
  let normalized = phoneNumber.replace(/\D/g, "");
  if (normalized.startsWith("0")) normalized = "234" + normalized.substring(1);
  if (!normalized.startsWith("+")) normalized = "+" + normalized;

  // Verify payment if premium plan
  let premiumDays = 0;
  if (plan && plan !== "Free") {
    if (!paymentReference) {
      return res.status(400).json({ error: "Payment reference is required for premium plans" });
    }
    
    if (plan === "Good") premiumDays = 30;
    else if (plan === "Better") premiumDays = 60;
    else if (plan === "Best") premiumDays = 90;

    try {
      const verifyRes = await fetch(`https://api.korapay.com/v1/charges/verify/${paymentReference}`, {
        headers: {
          "Authorization": `Bearer ${process.env.KORAPAY_SECRET_KEY}`
        }
      });
      const verifyData: any = await verifyRes.json();
      if (!verifyRes.ok || verifyData.data?.status !== "success") {
        return res.status(400).json({ error: "Payment verification failed" });
      }
      console.log(`Payment verified successfully for ref: ${paymentReference}`);
    } catch (err: any) {
      console.error("Korapay verification API error:", err.message);
      return res.status(500).json({ error: "Payment verification service unavailable" });
    }
  }

  try {
    // Check if user exists
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("id, phone_number, username, referral_code, premium_until")
      .eq("phone_number", normalized)
      .single();

    if (userError && userError.code !== "PGRST116") throw userError;

    if (user) {
      console.log("Existing user columns:", Object.keys(user));
      const updateData: any = {};
      if (name) updateData.username = name;
      if (req.body.businessName) {
        updateData.business_name = (req.body.plan === "Free" || !req.body.plan) 
          ? `${req.body.businessName} WSV` 
          : req.body.businessName;
      }
      if (req.body.gender) updateData.gender = req.body.gender;
      if (req.body.country) updateData.country = req.body.country;
      if (req.body.plan) {
        updateData.plan = req.body.plan;
        if (req.body.plan !== "Free" && premiumDays > 0) {
          const currentPremium = user.premium_until ? new Date(user.premium_until) : new Date();
          const newPremiumUntil = addDays(isAfter(new Date(), currentPremium) ? new Date() : currentPremium, premiumDays);
          updateData.premium_until = newPremiumUntil.toISOString();
        }
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

      if (!updateError && updatedUser) {
        user = updatedUser;
      } else {
        console.error("Update user details error:", updateError?.message);
      }
    }

    if (!user) {
      const insertData: any = {
        phone_number: normalized,
        username: name || "User",
        referral_code: uuidv4().substring(0, 8),
      };

      // Only add these if they are likely to exist
      if (req.body.businessName) {
        insertData.business_name = (req.body.plan === "Free" || !req.body.plan) 
          ? `${req.body.businessName} WSV` 
          : req.body.businessName;
      }
      if (req.body.gender) insertData.gender = req.body.gender;
      if (req.body.country) insertData.country = req.body.country;
      if (req.body.referredBy) insertData.referred_by = req.body.referredBy;
      if (req.body.plan) {
        insertData.plan = req.body.plan;
        if (req.body.plan !== "Free" && premiumDays > 0) {
          const newPremiumUntil = addDays(new Date(), premiumDays);
          insertData.premium_until = newPremiumUntil.toISOString();
        }
      }

      let { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([insertData])
        .select()
        .single();

      if (createError) {
        console.warn("Initial insert failed, retrying without new columns:", createError.message);
        // Handle both standard Postgres error code and PostgREST schema cache errors
        const isMissingColumn = createError.code === "42703" || 
                                createError.code?.startsWith("PGRST") ||
                                createError.message?.toLowerCase().includes("column") || 
                                createError.message?.toLowerCase().includes("schema cache");
        
        if (isMissingColumn) {
          const fallbackData: any = {
            phone_number: normalized,
            username: name || "User",
            referral_code: uuidv4().substring(0, 8),
          };
          if (req.body.referredBy) fallbackData.referred_by = req.body.referredBy;
          
          const { data: retryUser, error: retryError } = await supabase
            .from("users")
            .insert([fallbackData])
            .select()
            .single();
          
          if (retryError) {
            console.error("Retry insert also failed:", retryError.message);
            throw retryError;
          }
          newUser = retryUser;
        } else {
          throw createError;
        }
      }
      user = newUser;

      // Referral Reward Logic
      if (req.body.referredBy) {
        const { data: referrer, error: referrerError } = await supabase
          .from("users")
          .select("id, referral_code, premium_until")
          .eq("referral_code", req.body.referredBy)
          .single();

        if (referrer && !referrerError) {
          // Count referrals for this referrer
          const { count: referralCount, error: countError } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("referred_by", req.body.referredBy);

          if (!countError && referralCount && referralCount >= 5) {
            // Grant 7 days of premium
            const currentPremiumUntil = referrer.premium_until ? new Date(referrer.premium_until) : new Date();
            const newPremiumUntil = addDays(isAfter(new Date(), currentPremiumUntil) ? new Date() : currentPremiumUntil, 7);
            
            await supabase
              .from("users")
              .update({ premium_until: newPremiumUntil.toISOString() })
              .eq("id", referrer.id);
            
            console.log(`Granted 7 days of premium to referrer ${referrer.referral_code}`);
          }
        }
      }
    }

    const today = format(new Date(), "yyyy-MM-dd");

    // Check if already submitted today
    const { data: existingSubmission, error: subError } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("submission_date", today)
      .single();

    if (subError && subError.code !== "PGRST116") throw subError;

    if (existingSubmission) {
      if (req.body.plan && req.body.plan !== "Free") {
        return res.json({ 
          message: "Plan updated successfully. Proceed to payment verification.", 
          referralCode: user.referral_code 
        });
      }
      return res.status(400).json({ error: "You have already submitted today" });
    }

    // Create submission
    const { error: insertSubError } = await supabase
      .from("submissions")
      .insert([
        {
          user_id: user.id,
          submission_date: today,
        },
      ]);

    if (insertSubError) throw insertSubError;

    res.json({ message: "Submission successful", referralCode: user.referral_code });
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
    };
    console.error("Submission error:", errorDetails);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Login (Check if phone exists)
app.post("/api/login", async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: "Phone number is required" });

  // Normalize number
  let normalized = phoneNumber.replace(/\D/g, "");
  if (normalized.startsWith("0")) normalized = "234" + normalized.substring(1);
  if (!normalized.startsWith("+")) normalized = "+" + normalized;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, phone_number, username, referral_code, premium_until")
      .eq("phone_number", normalized)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found. Please join the network first." });
    }

    res.json({ 
      name: user.username, 
      phoneNumber: user.phone_number, 
      referralCode: user.referral_code,
      premiumUntil: user.premium_until
    });
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
    };
    console.error("Login error:", errorDetails);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get System Status (Countdown, Latest File)
app.get("/api/status", async (req, res) => {
  const phoneNumber = req.query.phoneNumber as string;
  
  try {
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("id, name, date, count, size, url")
      .order("date", { ascending: false })
      .limit(30);

    if (filesError) throw filesError;
    const latestFile = files && files.length > 0 ? files[0] : null;
    const olderFiles = files && files.length > 1 ? files.slice(1) : [];

    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    let userPremiumStatus = false;
    let referralCount = 0;

    if (phoneNumber) {
      let normalized = phoneNumber.replace(/\D/g, "");
      if (normalized.startsWith("0")) normalized = "234" + normalized.substring(1);
      if (!normalized.startsWith("+")) normalized = "+" + normalized;

      const { data: user } = await supabase
        .from("users")
        .select("id, referral_code, premium_until")
        .eq("phone_number", normalized)
        .single();

      if (user) {
        userPremiumStatus = user.premium_until ? isAfter(new Date(user.premium_until), new Date()) : false;
        
        const { count: refs } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("referred_by", user.referral_code);
        
        referralCount = refs || 0;
      }
    }

    // Calculate next drop (9:30 PM Africa/Lagos time)
    // 9:30 PM in Lagos is 20:30 UTC
    const now = new Date();
    const lagosDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now);
    
    let nextDrop = new Date(`${lagosDateStr}T20:30:00Z`);
    if (isAfter(now, nextDrop)) {
      const tomorrowLagosStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Lagos",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(addDays(now, 1));
      nextDrop = new Date(`${tomorrowLagosStr}T20:30:00Z`);
    }

    const nextDropLagosStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(nextDrop);

    res.json({
      latestFile,
      olderFiles,
      nextDrop: nextDrop.toISOString(),
      nextDropDate: nextDropLagosStr,
      totalUsers: count || 0,
      isPremium: userPremiumStatus,
      referralCount
    });
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
    };
    console.error("Status error:", errorDetails);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Korapay Webhook endpoint
app.post("/api/korapay/webhook", async (req: any, res) => {
  const signature = req.headers["x-korapay-signature"];
  if (!signature) {
    return res.status(400).send("Missing signature header");
  }

  // Calculate hash using secret key
  const secret = process.env.KORAPAY_SECRET_KEY || "";
  const hash = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody || JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    console.error("Korapay signature validation failed");
    return res.status(401).send("Invalid webhook signature");
  }

  const { event, data } = req.body;
  console.log(`Received Korapay webhook: ${event}`);

  if (event === "charge.success" && data.status === "success") {
    const reference = data.reference;
    // Format: wsv_<phone_digits>_<timestamp>
    const parts = reference.split("_");
    if (parts.length >= 2 && parts[0] === "wsv") {
      const cleanPhone = parts[1];
      const normalized = "+" + cleanPhone;

      const amount = data.amount;
      let plan = "Free";
      let premiumDays = 0;
      if (amount >= 3000) {
        plan = "Best";
        premiumDays = 90;
      } else if (amount >= 2000) {
        plan = "Better";
        premiumDays = 60;
      } else if (amount >= 1000) {
        plan = "Good";
        premiumDays = 30;
      }

      if (premiumDays > 0) {
        try {
          // Fetch user
          const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, premium_until")
            .eq("phone_number", normalized)
            .single();

          if (user && !userError) {
            const currentPremium = user.premium_until ? new Date(user.premium_until) : new Date();
            const newPremiumUntil = addDays(isAfter(new Date(), currentPremium) ? new Date() : currentPremium, premiumDays);

            await supabase
              .from("users")
              .update({
                plan: plan,
                premium_until: newPremiumUntil.toISOString()
              })
              .eq("id", user.id);

            console.log(`Successfully upgraded user ${normalized} via webhook to ${plan} until ${newPremiumUntil.toISOString()}`);
          } else {
            console.error(`User with phone ${normalized} not found for webhook upgrade`);
          }
        } catch (err: any) {
          console.error("Webhook processing error:", err.message);
        }
      }
    }
  }

  res.status(200).send("Ok");
});

// --- VCF Generation Logic ---

const generateDailyVCF = async () => {
  console.log("Starting daily VCF generation...");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  try {
    const { data: submissions, error: subError } = await supabase
      .from("submissions")
      .select("user_id")
      .eq("submission_date", today);

    if (subError) throw subError;

    if (!submissions || submissions.length === 0) {
      console.log("No submissions today. Skipping VCF generation.");
      return;
    }

    const userIds = Array.from(new Set(submissions.map((s: any) => s.user_id)));
    
    const { data: contacts, error: usersError } = await supabase
      .from("users")
      .select("id, username, phone_number")
      .in("id", userIds);

    if (usersError) throw usersError;

    if (!contacts || contacts.length === 0) {
      console.log("No contacts found for submissions. Skipping.");
      return;
    }

    let vcfContent = "";
    contacts.forEach((contact: any, index: number) => {
      vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.username} ${index + 1}\nTEL:${contact.phone_number}\nEND:VCARD\n`;
    });

    const fileName = `contacts-${today}.vcf`;
    const filePath = path.join(VCF_DIR, fileName);
    fs.writeFileSync(filePath, vcfContent);

    const { error: fileError } = await supabase
      .from("files")
      .upsert([
        {
          name: fileName,
          date: today,
          count: contacts.length,
          size: (vcfContent.length / 1024).toFixed(2) + " KB",
          url: `/vcf/${fileName}`,
        },
      ], { onConflict: "name" });

    if (fileError) throw fileError;

    console.log(`Generated ${fileName} with ${contacts.length} contacts.`);
    await cleanupOldVCFs();
  } catch (error: any) {
    console.error("VCF generation error:", error);
  }
};

const cleanupOldVCFs = async () => {
  console.log("Starting VCF history cleanup...");
  // Calculate date 30 days ago
  const thirtyDaysAgo = format(addDays(new Date(), -30), "yyyy-MM-dd");

  try {
    const { data: oldFiles, error: fetchError } = await supabase
      .from("files")
      .select("name, date")
      .lt("date", thirtyDaysAgo);

    if (fetchError) throw fetchError;

    if (oldFiles && oldFiles.length > 0) {
      console.log(`Found ${oldFiles.length} VCF records older than 30 days. Auto-destroying...`);

      for (const file of oldFiles) {
        const filePath = path.join(VCF_DIR, file.name);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted physical VCF file: ${file.name}`);
        }
      }

      const fileNames = oldFiles.map(f => f.name);
      const { error: deleteError } = await supabase
        .from("files")
        .delete()
        .in("name", fileNames);

      if (deleteError) throw deleteError;
      console.log(`Successfully deleted ${oldFiles.length} VCF database records.`);
    } else {
      console.log("No VCF files older than 30 days to destroy.");
    }
  } catch (error: any) {
    console.error("Failed to cleanup old VCF files:", error.message);
  }
};

// Admin: Seed Database with test data
app.post("/api/admin/seed", async (req, res) => {
  try {
    console.log("Seeding database...");
    
    // 1. Create mock users
    const mockUsers = [
      { phone_number: "+2348011111111", username: "Test User 1", referral_code: "REF001" },
      { phone_number: "+2348022222222", username: "Test User 2", referral_code: "REF002" },
      { phone_number: "+2348033333333", username: "Test User 3", referral_code: "REF003" },
    ];

    const { data: users, error: userError } = await supabase
      .from("users")
      .upsert(mockUsers, { onConflict: "phone_number" })
      .select();

    if (userError) throw userError;

    // 2. Create submissions for today
    const today = format(new Date(), "yyyy-MM-dd");
    const submissions = users.map(u => ({
      user_id: u.id,
      submission_date: today
    }));

    const { error: subError } = await supabase
      .from("submissions")
      .upsert(submissions, { onConflict: "user_id, submission_date" });

    if (subError) {
      console.warn("Submission upsert failed (might not have unique constraint), trying insert:", subError.message);
      // Fallback to simple insert if upsert fails due to missing constraint
      await supabase.from("submissions").insert(submissions);
    }

    // 3. Create mock files
    const yesterday = format(addDays(new Date(), -1), "yyyy-MM-dd");
    const tenDaysAgo = format(addDays(new Date(), -10), "yyyy-MM-dd");
    const mockFiles = [
      {
        name: `contacts-${today}.vcf`,
        date: today,
        count: 150,
        size: "12.5 KB",
        url: "/vcf/sample.vcf"
      },
      {
        name: `contacts-${yesterday}.vcf`,
        date: yesterday,
        count: 135,
        size: "11.2 KB",
        url: "/vcf/sample.vcf"
      },
      {
        name: `contacts-${tenDaysAgo}.vcf`,
        date: tenDaysAgo,
        count: 95,
        size: "8.1 KB",
        url: "/vcf/sample.vcf"
      }
    ];

    const { error: fileError } = await supabase
      .from("files")
      .upsert(mockFiles, { onConflict: "name" });

    if (fileError) throw fileError;

    res.json({ message: "Database seeded successfully with users, submissions, and files." });
  } catch (error: any) {
    console.error("Seed error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Manual VCF Generation
app.post("/api/admin/generate-vcf", async (req, res) => {
  try {
    await generateDailyVCF();
    res.json({ message: "VCF generation triggered successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule Cron Job (9:30 PM daily Africa/Lagos timezone)
// Cron format: minute hour day-of-month month day-of-week
cron.schedule("30 21 * * *", generateDailyVCF, {
  timezone: "Africa/Lagos"
});

// --- Vite Integration ---

async function startServer() {
  await cleanupOldVCFs();

  // Serve physical VCF files statically for downloads
  app.use("/vcf", express.static(path.join(process.cwd(), "public/vcf")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
