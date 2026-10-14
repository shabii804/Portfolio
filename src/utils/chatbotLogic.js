import { portfolioKnowledge } from "../data/portfolioKnowledge";

// Keywords for different question categories
const keywords = {
  about: ["about", "who", "yourself", "introduce", "tell me", "know", "bio", "profile", "shoaib", "arshad"],
  cgpa: ["cgpa", "grade", "academic", "gpa", "score", "marks", "result", "academic performance"],
  location: ["location", "where", "based", "country", "city", "live", "reside", "islamabad", "pakistan"],
  contact: ["contact", "reach", "phone", "email", "message", "number", "socials", "address"],
  phone: ["phone", "number", "call", "mobile", "whatsapp", "wa.me", "cell"],
  email: ["email", "mail", "gmail", "address"],
  linkedin: ["linkedin", "linked in", "professional network"],
  github: ["github", "code", "repository", "repo", "git"],
  university: ["university", "riphah", "education", "college", "degree", "study", "student", "studies"],
  projects: ["projects", "built", "create", "development", "work", "portfolio", "application", "app", "systems"],
  skills: ["skills", "technologies", "tech stack", "tools", "languages", "expertise", "capable", "frameworks", "libraries"],
  tech: ["react", "node", "firebase", "java", "python", "sql", "database", "backend", "frontend", "mssql", "mongodb", "supabase"],
  certifications: ["certifications", "certificates", "certified", "courses", "cisco", "c++ certificate", "credentials"],
  education: ["education", "university", "degree", "study", "cgpa", "riphah", "school", "semester"],
  experience: ["experience", "worked", "background", "expertise", "intern", "internship", "developer hub", "job", "employment"],
  farooq: ["farooq", "ecommerce", "medical", "inventory", "supply", "agencies", "farooq agencies", "client"],
  spendsmart: ["spend", "smart", "finance", "expense", "budget", "voice", "spendsmart"],
  sms: ["school", "management", "desktop", "java", "attendance", "fees", "sms", "fyp", "project 4"],
  eshop: ["eshop", "shop", "cart", "products", "e-shop"],
  hire: ["hire", "work", "job", "available", "full-time", "freelance", "opportunity", "contract", "looking for", "position"],
};

// Scoring function to find the best matching FAQ
function findBestMatch(userMessage) {
  const messageLower = userMessage.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  // Direct check for specific project names or topics to ensure high accuracy
  if (messageLower.includes("why") && (messageLower.includes("hire") || messageLower.includes("choose") || messageLower.includes("select") || messageLower.includes("recruit"))) {
    const whyFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("why should i hire"));
    if (whyFAQ) return whyFAQ;
  }
  if (messageLower.includes("database") || messageLower.includes("sql server") || messageLower.includes("oracle") || messageLower.includes("postgres") || messageLower.includes("mysql") || messageLower.includes("nosql")) {
    const dbFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("databases"));
    if (dbFAQ) return dbFAQ;
  }
  if (messageLower.includes("who built") || messageLower.includes("who made") || messageLower.includes("who designed") || messageLower.includes("creator") || messageLower.includes("create this") || messageLower.includes("develop this")) {
    const creatorFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("who built this"));
    if (creatorFAQ) return creatorFAQ;
  }
  if (messageLower.includes("swing") || messageLower.includes("flatdarklaf") || (messageLower.includes("java") && messageLower.includes("desktop"))) {
    const swingFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("swing"));
    if (swingFAQ) return swingFAQ;
  }
  if (messageLower.includes("voice") || messageLower.includes("speech") || messageLower.includes("speak") || messageLower.includes("recognition")) {
    const voiceFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("voice"));
    if (voiceFAQ) return voiceFAQ;
  }
  if (messageLower.includes("how") && messageLower.includes("cgpa") && (messageLower.includes("get") || messageLower.includes("maintain") || messageLower.includes("achieve") || messageLower.includes("perfect"))) {
    const cgpaFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("how did he get"));
    if (cgpaFAQ) return cgpaFAQ;
  }
  if (messageLower.includes("riphah")) {
    const riphahFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("riphah"));
    if (riphahFAQ) return riphahFAQ;
  }
  if (messageLower.includes("custom") && (messageLower.includes("website") || messageLower.includes("web") || messageLower.includes("site") || messageLower.includes("dev"))) {
    const customFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("custom website"));
    if (customFAQ) return customFAQ;
  }
  if (messageLower.includes("farooq") && (messageLower.includes("result") || messageLower.includes("impact") || messageLower.includes("outcome") || messageLower.includes("benefit") || messageLower.includes("metrics"))) {
    const farooqResFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("results"));
    if (farooqResFAQ) return farooqResFAQ;
  }
  if (messageLower.includes("farooq") || messageLower.includes("medical")) {
    const farooqFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("farooq agencies."));
    if (farooqFAQ) return farooqFAQ;
  }
  if (messageLower.includes("spendsmart") || (messageLower.includes("spend") && messageLower.includes("smart")) || messageLower.includes("finance") || messageLower.includes("expense")) {
    const spendFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("spendsmart"));
    if (spendFAQ) return spendFAQ;
  }
  if (messageLower.includes("school") || messageLower.includes("sms")) {
    const smsFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("school"));
    if (smsFAQ) return smsFAQ;
  }
  if (messageLower.includes("eshop") || messageLower.includes("e-shop")) {
    const eshopFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("eshop"));
    if (eshopFAQ) return eshopFAQ;
  }
  if (messageLower.includes("cisco") || messageLower.includes("certificate") || messageLower.includes("certifications")) {
    const certsFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("certifications"));
    if (certsFAQ) return certsFAQ;
  }
  if (messageLower.includes("intern") || messageLower.includes("experience") || messageLower.includes("worked") || messageLower.includes("hub")) {
    const expFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("experience"));
    if (expFAQ) return expFAQ;
  }
  if (messageLower.includes("hire") || messageLower.includes("available") || messageLower.includes("job") || messageLower.includes("work")) {
    const hireFAQ = portfolioKnowledge.faqs.find(f => f.question.toLowerCase().includes("hire"));
    if (hireFAQ) return hireFAQ;
  }

  portfolioKnowledge.faqs.forEach((faq) => {
    const questionLower = faq.question.toLowerCase();
    const answerLower = faq.answer.toLowerCase();
    let score = 0;

    // Exact match of key terms or substring match
    if (questionLower.includes(messageLower) || messageLower.includes(questionLower)) {
      score += 60;
    }

    const words = messageLower.split(/\s+/);

    // Keyword matching
    words.forEach((word) => {
      // Remove punctuation
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      if (cleanWord.length <= 2) return;

      if (questionLower.includes(cleanWord)) {
        score += 15;
      }
      if (answerLower.includes(cleanWord)) {
        score += 5; // matching terms inside the answer text
      }

      // Group keywords matching
      Object.entries(keywords).forEach(([category, keywordGroup]) => {
        if (keywordGroup.includes(cleanWord)) {
          if (questionLower.includes(category)) {
            score += 10;
          }
        }
      });
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  });

  return bestScore > 12 ? bestMatch : null;
}

// Small-talk detector — greetings, thanks, bye, health checks.
// Used by the chat UI as a FAST PATH so these never burn an AI API call
// (and never feel broken when the model is rate-limited). Handles typos
// and stretched forms like "ehy", "hii", "helo", "heyyy" via Damerau
// distance (adjacent transposition = 1 edit).

// Real English words that are edit-distance-1 from a greeting — never
// treat them as greetings ("no" ≈ "yo", "ok" ≈ "yo", "you" ≈ "yo", …).
const NON_GREETING_WORDS = new Set([
  "no", "go", "do", "me", "we", "he", "she", "so", "ok", "okay", "oh", "ah",
  "hmm", "hm", "uh", "um", "on", "in", "is", "it", "am", "an", "as", "at",
  "be", "by", "if", "my", "of", "or", "to", "up", "us", "and", "but", "not",
  "now", "wow", "why", "who", "how", "what", "when", "job", "you", "yes",
  "know", "show", "how", "home", "hope", "help",
]);

// Damerau-Levenshtein distance ≤ 1 (substitution, insert, delete, transpose)
function withinOneEdit(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const diff = [];
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff.push(i);
    if (diff.length === 1) return true; // one substitution
    // one adjacent transposition
    return diff.length === 2 && diff[1] === diff[0] + 1 &&
      a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]];
  }
  // length differs by exactly 1 → allow a single insertion/deletion
  const [s, l] = a.length < b.length ? [a, b] : [b, a];
  let i = 0, j = 0, skipped = false;
  while (i < s.length && j < l.length) {
    if (s[i] === l[j]) { i++; j++; continue; }
    if (skipped) return false;
    skipped = true; j++;
  }
  return true;
}

const GREETING_CORES = ["hi", "hello", "hey", "yo", "hola", "howdy", "salam", "aoa", "assalam", "greetings"];
const GREETING_PHRASES = ["good morning", "good afternoon", "good evening", "hi there", "hello there", "assalamualaikum", "as-salam"];
const THANKS_HINTS = ["thank", "thx", "appreciate", "great help", "awesome", "ty "];
const BYE_HINTS = ["bye", "goodbye", "see you", "see ya", "talk later", "catch you later", "good night"];
const HEALTH_HINTS = ["how are you", "hows it going", "how's it going", "whats up", "what's up", "how do you do"];
const IDENTITY_HINTS = ["who are you", "your name", "what are you", "what is your name"];
const SMALL_TALK_HINTS = [...THANKS_HINTS, ...BYE_HINTS, ...HEALTH_HINTS, ...IDENTITY_HINTS];

function normalizeMsg(m) {
  return m.toLowerCase().trim().replace(/[?.,!]+/g, "").replace(/\s+/g, " ");
}

// True only for greeting-like messages (exact, stretched, or typo'd)
export function isGreetingLike(userMessage) {
  const q = normalizeMsg(userMessage);
  if (!q) return false;
  if (GREETING_PHRASES.some((g) => q === g || q.startsWith(g))) return true;
  const word = q.split(" ")[0];
  if (NON_GREETING_WORDS.has(word)) return false;
  if (GREETING_CORES.includes(word)) return true;
  return q.split(" ").length <= 2 && word.length <= 9 &&
    GREETING_CORES.some((g) => withinOneEdit(word, g));
}

// True for any casual small talk best answered locally (greeting, thanks,
// bye, health check, bot identity).
export function isSmallTalk(userMessage) {
  const q = normalizeMsg(userMessage);
  if (!q) return false;
  if (SMALL_TALK_HINTS.some((h) => q.includes(h))) return true;
  return isGreetingLike(userMessage);
}

// Main chatbot response function
export function getChatbotResponse(userMessage) {
  if (!userMessage.trim()) {
    return "Please ask me something about Shoaib's skills, projects, education, certifications, or experience!";
  }

  const messageLower = userMessage.toLowerCase().trim();
  const queryClean = messageLower.replace(/[?.,!]/g, "");

  // 1. Conversational Greetings (fuzzy — catches typos like "ehy", "helo", "hii")
  const greetingPhrases = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening", "howdy", "hola", "hi there", "hello there", "salam", "assalam", "aoa"];
  const healthCheckPhrases = ["how are you", "how are you doing", "how is it going", "hows it going", "how are you today", "whats up", "what's up", "how do you do"];
  if (greetingPhrases.includes(queryClean) || isGreetingLike(userMessage)) {
    return `Hello! 👋 I am **${portfolioKnowledge.personal.name}**'s AI Portfolio Assistant. How can I help you today?\n\nFeel free to ask me about:\n• 🚀 **Projects** (SpendSmart, Farooq Agencies, SMS, E-Shop)\n• 🏢 **Work Experience** (Frontend Intern at Developer Hub Corp)\n• 🎓 **Education** (Riphah SE, 4.0 CGPA)\n• 📜 **Certifications** (Cisco C++ & Cisco Advanced C++)\n• 📞 **Contact Information**`;
  }

  // 2. Health checks
  if (healthCheckPhrases.some(phrase => queryClean.includes(phrase))) {
    return `I am doing great and ready to assist you! 😊 I can share detailed portfolio insights, resume details, or help you contact Shoaib. What would you like to know?`;
  }

  // 3. Expressions of Thanks
  const thankPhrases = ["thank you", "thanks", "thank you so much", "ty", "thx", "appreciate it", "great help", "awesome"];
  if (thankPhrases.some(phrase => queryClean.includes(phrase)) || queryClean === "thanks" || queryClean === "thank you") {
    return `You're very welcome! I'm glad I could help. Let me know if you need any other information about Shoaib's skills or projects! 🚀`;
  }

  // 4. Farewells
  const byePhrases = ["bye", "goodbye", "see you", "see ya", "talk later", "exit", "quit", "good night"];
  if (byePhrases.some(phrase => queryClean.includes(phrase)) || queryClean === "bye" || queryClean === "goodbye") {
    return `Goodbye! Have an amazing day! If you ever want to get in touch with Shoaib, feel free to use the WhatsApp button below or drop him an email! 👋`;
  }

  // 5. Bot Identity
  if (queryClean.includes("who are you") || queryClean.includes("what is your name") || queryClean.includes("who is this") || queryClean.includes("your name") || queryClean.includes("what are you")) {
    return `I am the AI Assistant trained on **${portfolioKnowledge.personal.name}**'s resume data. My job is to answer questions about his skills, education, projects, certifications, and how to hire him.`;
  }

  // Find FAQ match next
  const faqMatch = findBestMatch(userMessage);
  if (faqMatch) {
    return faqMatch.answer;
  }

  // Fallback direct check for specific project questions
  for (const project of portfolioKnowledge.projects) {
    const projectName = project.name.toLowerCase();
    if (messageLower.includes(projectName) || messageLower.includes(project.subtitle.toLowerCase()) || messageLower.includes(project.id.toLowerCase())) {
      return generateProjectResponse(project);
    }
  }

  // Direct fallback checks
  if (messageLower.includes("phone") || messageLower.includes("number") || messageLower.includes("whatsapp") || messageLower.includes("call")) {
    return `You can reach Shoaib on WhatsApp or by call at: **${portfolioKnowledge.contact.phone}** (International: **${portfolioKnowledge.contact.phone_formatted}**)`;
  }

  if (messageLower.includes("email") || messageLower.includes("mail")) {
    return `You can email Shoaib at: **${portfolioKnowledge.contact.email}**`;
  }

  if (messageLower.includes("linkedin")) {
    return `Connect with Shoaib on LinkedIn: [linkedin.com/in/shoaib-arshad](${portfolioKnowledge.contact.linkedin})`;
  }

  if (messageLower.includes("github")) {
    return `Check out Shoaib's repositories on GitHub: [github.com/shabii804](${portfolioKnowledge.contact.github})`;
  }

  if (messageLower.includes("location") || messageLower.includes("where") || messageLower.includes("live")) {
    return `Shoaib is based in **${portfolioKnowledge.location}**, Pakistan. He is open to remote roles globally and relocation if required.`;
  }

  if (messageLower.includes("cgpa") || messageLower.includes("grade") || messageLower.includes("gpa")) {
    return `Shoaib has maintained a perfect **${portfolioKnowledge.cgpa} / 4.0 CGPA** throughout his degree at Riphah International University.`;
  }

  if (messageLower.includes("university") || messageLower.includes("riphah") || messageLower.includes("education") || messageLower.includes("degree")) {
    return `Shoaib is pursuing a **${portfolioKnowledge.education.degree}** at **${portfolioKnowledge.education.institution}**. He is in the class of ${portfolioKnowledge.education.period} and maintains a perfect **${portfolioKnowledge.education.cgpa}** CGPA.`;
  }

  if (messageLower.includes("skill") || messageLower.includes("expertise") || messageLower.includes("languages") || messageLower.includes("technologies") || messageLower.includes("frameworks")) {
    return generateSkillsResponse();
  }

  if (messageLower.includes("experience") || messageLower.includes("worked") || messageLower.includes("intern") || messageLower.includes("job")) {
    return `Shoaib's professional experience includes:
    
**Frontend Developer Intern** at **Developer Hub Corporation** (Remote)
*${portfolioKnowledge.experience[0]?.duration || "Mar 2023 – Apr 2026"}*
- Developed responsive React UI modules for E-Commerce and Prophecy Nexus platforms.
- Built production-ready real-time video calling features and interactive calendar systems.
- Awarded official internship certificate.`;
  }

  // Default response
  return portfolioKnowledge.responses.outOfScope;
}

// Generate detailed project response
function generateProjectResponse(project) {
  return `**${project.name}** - ${project.subtitle}
  
${project.description}

**Technologies Used:** ${project.technologies.join(", ")}

**Key Features:**
${project.details.map((f) => `• ${f}`).join("\n")}

**Project Link Details:**
${project.live ? `📍 Deployed live at: [${project.live}](${project.live})` : ""}
${project.github ? `💻 Code Repository: [GitHub Code](${project.github})` : ""}
${!project.live && !project.github ? "🔒 This project's code is private/client owned." : ""}`;
}

// Generate skills overview
function generateSkillsResponse() {
  const skills = portfolioKnowledge.skills;
  
  let response = "Here is an overview of Shoaib's skills:\n\n";
  
  Object.entries(skills).forEach(([category, skillList]) => {
    response += `**${category}:** ${skillList.join(", ")}\n`;
  });

  response += "\nHe is highly adaptable, continuously learning, and holds Cisco certifications in C++ programming.";
  
  return response;
}

// Get suggested questions
export function getSuggestedQuestions() {
  return [
    "Tell me about Shoaib",
    "What projects has he built?",
    "Tell me about Farooq Agencies",
    "What is his CGPA?",
    "Where did he intern?",
    "How can I contact him?",
  ];
}

// Get portfolio name for personalization
export function getPortfolioName() {
  return portfolioKnowledge.personal.name;
}

// Get complete contact info
export function getContactInfo() {
  return portfolioKnowledge.contact;
}

// Get all projects
export function getAllProjects() {
  return portfolioKnowledge.projects;
}

// Get all skills
export function getAllSkills() {
  return portfolioKnowledge.skills;
}

// Get education info
export function getEducationInfo() {
  return portfolioKnowledge.education;
}

// Get experience
export function getExperienceInfo() {
  return portfolioKnowledge.experience;
}

// Get personal info
export function getPersonalInfo() {
  return portfolioKnowledge.personal;
}
