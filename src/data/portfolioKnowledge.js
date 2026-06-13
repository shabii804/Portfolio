// Portfolio Knowledge Base for Chatbot Assistant
// This file extracts and organizes all data from portfolio.js for the chatbot

import { defaultProjects, defaultSkills, defaultPersonal, defaultExperience } from './portfolio';

export const portfolioKnowledge = {
  // PERSONAL INFORMATION - Extract all fields
  personal: {
    name: defaultPersonal.name,
    title: defaultPersonal.title,
    roles: defaultPersonal.roles,
    bio: defaultPersonal.bio,
    email: defaultPersonal.email,
    phone: defaultPersonal.phone,
    linkedin: defaultPersonal.linkedin,
    github: defaultPersonal.github,
    slack: defaultPersonal.slack,
    location: defaultPersonal.location,
    available: defaultPersonal.available,
    resumePdf: defaultPersonal.resumePdf,
  },

  // EDUCATION - Extract from bio and add details
  education: {
    degree: "BS Software Engineering",
    institution: "Riphah International University",
    location: "Islamabad, Pakistan",
    period: "Sep 2021 – Present",
    cgpa: "4.0",
    highlights: [
      "Perfect 4.0 CGPA out of 4.0 across all semesters",
      "In-depth focus on software engineering, object-oriented design, and algorithms",
      "Relational database design and systems analysis",
      "Hands-on experience with web apps and desktop frameworks",
    ],
  },

  // SKILLS - Extract directly from portfolio
  skills: defaultSkills,

  // PROJECTS - Extract all projects with complete details
  projects: defaultProjects.map(project => ({
    id: project.id,
    name: project.title,
    subtitle: project.subtitle,
    tagline: project.tagline,
    description: project.description,
    details: project.details,
    technologies: project.stack,
    features: project.features,
    impact: project.impact,
    live: project.live,
    github: project.github,
    status: project.badge,
    date: project.date,
    accentColor: project.accentHex,
  })),

  // EXPERIENCE - Extract from portfolio
  experience: defaultExperience.map(exp => ({
    role: exp.role,
    company: exp.company,
    duration: exp.duration,
    type: exp.type,
    highlights: exp.points,
  })),

  // CONTACT INFO - Organized for easy reference
  contact: {
    email: defaultPersonal.email,
    phone: defaultPersonal.phone,
    phone_formatted: `+92 ${defaultPersonal.phone.substring(1)}`,
    linkedin: defaultPersonal.linkedin,
    github: defaultPersonal.github,
    location: defaultPersonal.location,
    available: defaultPersonal.available,
  },

  // LOCATION INFO
  location: defaultPersonal.location,

  // CGPA
  cgpa: "4.0",

  // FAQs with comprehensive answers (training dataset for chatbot)
  faqs: [
    {
      question: "Tell me about Shoaib.",
      answer: `Hi! I'm **${defaultPersonal.name}**, an ambitious Software Engineering student at Riphah International University with an exceptional, perfect **4.0 CGPA**. 

I am a **${defaultPersonal.title}** based in **${defaultPersonal.location}**.

${defaultPersonal.bio}

I specialize in building full-stack web applications with React, Node.js, and Firebase, as well as production-ready Java desktop applications with SQL Server. I love solving complex problems and engineering solutions that actually ship and work in production.`,
    },
    {
      question: "What is his CGPA?",
      answer: `Shoaib maintains a perfect **4.0 / 4.0 CGPA** in his BS in Software Engineering at Riphah International University. This perfect score across all semesters showcases his strong work ethic, technical mastery, and academic discipline.`,
    },
    {
      question: "Where is he located?",
      answer: `Shoaib is based in **${defaultPersonal.location}**, Pakistan. He is open to remote roles worldwide as well as local opportunities and relocation.`,
    },
    {
      question: "What projects has he built?",
      answer: `Shoaib has built **${defaultProjects.length} major projects** which are:

1. **Farooq Agencies** - A full-stack medical supply E-Commerce platform built with React, Firebase Firestore/Auth/Hosting, and WhatsApp integration, deployed for a real business in Rawalpindi.
2. **SpendSmart** - A personal finance tracker with voice expense logging, advanced analytics with Recharts, SQL Server, Node.js, Express, and PDF reports.
3. **E-Shop** - A React-based e-commerce frontend UI using the React Context API and Tailwind CSS.
4. **School Management System** - A role-based desktop application written in Java Swing with MS SQL Server, currently deployed and actively running in a real school.

*Ask me about any specific project (e.g., 'Tell me about Farooq Agencies' or 'What is SpendSmart?') to get more details!*`,
    },
    {
      question: "Tell me about Farooq Agencies.",
      answer: `**Farooq Agencies** is a full-stack Medical Supply E-Commerce Platform developed and deployed for a real business in Rawalpindi, Pakistan (**farooqagensies.com**).

**Key Features:**
- **Customer Portal**: Categories, advanced search, filtering, product details, real-time availability, and WhatsApp order placement.
- **Admin Dashboard**: Secure role-based login, full inventory CRUD, variants, order tracking, and sales monitoring.
- **Automation**: Centralized inventory replaced manual sheets, and automated customer inquiry routing was set up via WhatsApp.
- **Tech Stack**: React.js, Firebase (Firestore, Auth, Hosting), JavaScript, CSS3.
- **My Role**: System architecture, React frontend development, serverless Firebase backend, database design, WhatsApp integration, and production deployment.`,
    },
    {
      question: "Tell me about SpendSmart.",
      answer: `**SpendSmart** is a full-stack personal finance tracking application.

**Key Features:**
- **Voice expense logging**: Integrated Web Speech API to add expenses using natural voice commands (e.g. "Add 500 rupees for food").
- **Interactive Analytics**: Dashboard powered by Recharts (spending distribution, monthly trends, weekday vs weekend patterns, budget limits).
- **Carry-over budgets**: Scoped monthly budgets with automated carry-over calculations.
- **PDF Reports**: Generating downloadble transaction summaries and budget audits.
- **Tech Stack**: React (Vite), Node.js, Express.js, Microsoft SQL Server, Recharts, Vercel.`,
    },
    {
      question: "Tell me about the School Management System.",
      answer: `The **School Management System** is a role-based desktop application built for school administration. It is **actively deployed and running in a real school today**.

**Key Features:**
- **Role-based portals**: Custom portals for Admins, Teachers, and Students.
- **Academic Management**: Timetables, subject mapping, exam schedules, and attendance marking.
- **Financial Module**: Real-time student fee tracking, printable HTML fee receipts, salary tracking, and institutional expenses.
- **Modern UI**: Dark mode desktop interface styling using FlatDarkLaf.
- **Tech Stack**: Java (Swing), C#, Microsoft SQL Server, JDBC, HTML/CSS report generation.`,
    },
    {
      question: "Tell me about E-Shop.",
      answer: `**E-Shop** is a polished, fully responsive frontend E-Commerce Platform.

**Key Features:**
- **Interactive UI**: Category filters, deal/offer boards, and product search.
- **Dynamic Cart**: Real-time quantity, price, and total price adjustments.
- **Global State**: Managed purely with React Context API (no external libraries like Redux needed).
- **Tech Stack**: React.js, Tailwind CSS, JavaScript, Context API.`,
    },
    {
      question: "What is his work experience?",
      answer: `Shoaib worked as a **Frontend Developer Intern** at **Developer Hub Corporation** (Remote) from **March 2023 to April 2026**.

**Key Contributions:**
- Built advanced responsive UI modules for E-Commerce and Prophecy Nexus platforms.
- Developed and integrated a real-time video calling interface into production.
- Built a custom interactive calendar module with event scheduling capabilities.
- Received an official internship completion and recommendation certificate.`,
    },
    {
      question: "What certifications does he hold?",
      answer: `Shoaib holds two major professional credentials from Cisco:
1. **Cisco C++ Programming Certificate** - Validates proficiency in OOP, memory management, and data structures.
2. **Cisco Advanced Programming Certificate** - Validates advanced algorithms, systems programming, and performance optimization.`,
    },
    {
      question: "What technologies does he use?",
      answer: `Shoaib's technology stack includes:

- **Frontend**: React.js, JavaScript ES6+, HTML5, CSS3, Tailwind CSS, Figma, Recharts
- **Backend & APIs**: Node.js, Express.js, Firebase, Supabase, REST APIs
- **Databases**: Microsoft SQL Server, Oracle DB, Firebase Firestore, Supabase, SQL
- **Languages**: JavaScript, C, C++, C#, Java, SQL
- **Tools**: Git, GitHub, VS Code, Visual Studio, Figma, Agile methodologies`,
    },
    {
      question: "What are his soft skills?",
      answer: `Shoaib's professional soft skills include:
- **Problem Solving**: Strong analytical mindset for debugging and optimizing complex algorithms.
- **Communication**: Clear collaboration style, certified via remote team workflows.
- **Teamwork**: Experience working in team sprints and corporate internship structures.
- **Time Management**: Balancing a perfect 4.0 CGPA with multiple client/production projects.`,
    },
    {
      question: "How can I contact him?",
      answer: `You can reach out to Shoaib directly:
      
📧 **Email:** shoaib.arshad.se@gmail.com
📱 **Phone/WhatsApp:** +92 3086519867
💼 **LinkedIn:** [linkedin.com/in/shoaib-arshad](https://linkedin.com/in/shoaib-arshad)
💻 **GitHub:** [github.com/shabii804/](https://github.com/shabii804/)

Feel free to send a message on WhatsApp or email for job opportunities, internships, or collaborations!`,
    },
    {
      question: "Is he available for hire?",
      answer: `Yes! Shoaib is **actively looking for opportunities** including full-time roles, software engineering internships, junior full-stack developer positions, or freelance work. He is ready to collaborate immediately.`,
    },
    {
      question: "Where did he study?",
      answer: `Shoaib is pursuing a **BS in Software Engineering** at **Riphah International University** (Islamabad, Pakistan). He maintains a perfect **4.0 CGPA** and is in the class of 2021 – Present.`,
    },
    {
      question: "Why should I hire Shoaib?",
      answer: `Here are 4 key reasons to hire Shoaib:
1. **Academic Excellence (4.0 CGPA)**: Possesses an exceptionally deep, theoretical foundation in Software Engineering (OOP, database normalization, data structures).
2. **Real-world Experience**: Built and deployed production sites like **Farooq Agencies** (which serves a real business) and active desktop systems.
3. **Certified Competence**: Cisco certified in both C++ and Advanced Programming.
4. **Reliability & Intern experience**: Has 3 years of remote developer intern experience at Developer Hub Corp and handles modern react/node/sql stacks natively.`,
    },
    {
      question: "What databases does he know?",
      answer: `Shoaib is highly proficient in relational and non-relational database design, querying, and management:
- **Relational Databases**: Microsoft SQL Server (MSSQL), Oracle Database, PostgreSQL, MySQL, SQL.
- **NoSQL / Cloud Services**: Firebase Firestore, Supabase.
- He specializes in database schema normalization, transaction optimization, database modeling (ERD), and secure JDBC/REST endpoints.`,
    },
    {
      question: "Who built this website/chatbot?",
      answer: `This portfolio website and the interactive AI Chatbot were custom-designed and built by **Shoaib Arshad** himself using React.js, Tailwind CSS, and custom matching algorithms!`,
    },
    {
      question: "Is he looking for internships?",
      answer: `Yes, Shoaib is actively looking for **Software Engineering internships**, junior frontend developer positions, junior full-stack developer roles, or freelance projects. He can start immediately.`,
    },
    {
      question: "Tell me about his Java Swing experience.",
      answer: `Shoaib has strong Java desktop development skills. His major project, the **School Management System**, is a role-based Java Swing application integrated with Microsoft SQL Server. It includes a custom modern UI (using FlatDarkLaf) and is currently deployed and running in a real school to handle student portals, timetables, and fee tracking.`,
    },
    {
      question: "How does the voice feature in SpendSmart work?",
      answer: `The voice feature in SpendSmart leverages the browser's native **Web Speech API** (Speech Recognition). When the user clicks the voice logging button and speaks, the application parses natural language inputs (like 'add 1000 rupees for dinner') using smart regex matching, extracts the value and category, and logs it directly to MS SQL Server.`,
    },
    {
      question: "How did he get a 4.0 CGPA?",
      answer: `Shoaib's perfect **4.0 CGPA** is a result of consistent study, mastery of software engineering concepts, scoring top grades in difficult courses like Database Systems, Data Structures, and OOP, and building comprehensive, deployed semester projects.`,
    },
    {
      question: "What is Riphah International University?",
      answer: `Riphah International University is a premier academic institution in Pakistan. Shoaib is studying at its Islamabad campus, pursuing a BS in Software Engineering, where he is at the top of his class.`,
    },
    {
      question: "Can he build custom websites?",
      answer: `Yes! Shoaib builds fully custom, production-ready, and responsive websites. For instance, he designed, built, and launched **Farooq Agencies** (farooqagensies.com) for a local business, moving their operations from manual books to automated online ordering.`,
    },
    {
      question: "Tell me about Farooq Agencies' results.",
      answer: `Farooq Agencies successfully automated the inventory and ordering pipeline for a local medical supplier:
- Replaced manual spreadsheets with a secure database.
- Enabled direct WhatsApp routing for order placements.
- Streamlined order processing time by over 50%.`,
    },
  ],

  // Default responses
  responses: {
    default: `I am **${defaultPersonal.name}**'s portfolio assistant. I can tell you about his projects (Farooq Agencies, SpendSmart, SMS, E-Shop), skills, work experience at Developer Hub Corp, Cisco certifications, education, and how to contact or hire him. What would you like to know?`,
    outOfScope: `I'm specifically trained on Shoaib Arshad's professional portfolio and resume. Feel free to ask about his skills, projects (SpendSmart, Farooq Agencies), certifications, education (Riphah SE), or how to contact him!`,
  },
};
