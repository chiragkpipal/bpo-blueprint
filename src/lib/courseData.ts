export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string; // Embed or MP4 link
  description: string;
  resources: { title: string; type: string; url: string }[];
}

export interface Chapter {
  id: string;
  number: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "ch-01",
    number: "01",
    title: "Understanding BPO",
    description: "What business process outsourcing actually is, why overseas companies pay for it, and exactly where you fit in as the middleman.",
    lessons: [
      {
        id: "les-101",
        title: "Introduction to BPO & The Middleman Model",
        duration: "14:20",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Embed preview
        description: "Learn the core fundamentals of Business Process Outsourcing and why US/UK/AU businesses pay premium rates for remote operations.",
        resources: [
          { title: "BPO Fundamentals Cheat Sheet.pdf", type: "PDF", url: "#" },
          { title: "Market Research Worksheet.docx", type: "DOCX", url: "#" }
        ]
      },
      {
        id: "les-102",
        title: "Target Markets & Identifying High Ticket Niches",
        duration: "18:45",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "How to select lucrative niches (Real Estate, Legal, E-commerce, Medical Billing) where margins are 60%+.",
        resources: [
          { title: "Top 10 High Margin BPO Niches.pdf", type: "PDF", url: "#" }
        ]
      }
    ]
  },
  {
    id: "ch-02",
    number: "02",
    title: "Building Your Offer",
    description: "Choosing the services you'll sell, pricing them for real margin, and packaging an offer that clients say yes to.",
    lessons: [
      {
        id: "les-201",
        title: "Packaging Your BPO Service Offer",
        duration: "21:10",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Structuring your offer so clients view it as a high-ROI solution rather than an expense.",
        resources: [
          { title: "Service Offer Template.pdf", type: "PDF", url: "#" },
          { title: "Pricing Calculator Spreadsheet.xlsx", type: "XLSX", url: "#" }
        ]
      },
      {
        id: "les-202",
        title: "Pricing Models: Retainers vs Cost-Plus",
        duration: "16:05",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "How to calculate your markup and keep $3,000+ net margin per client seat.",
        resources: [
          { title: "BPO Markup Breakdown.pdf", type: "PDF", url: "#" }
        ]
      }
    ]
  },
  {
    id: "ch-03",
    number: "03",
    title: "Finding Clients",
    description: "Where the buyers actually are, how to reach them, and the outreach scripts that get replies from overseas businesses.",
    lessons: [
      {
        id: "les-301",
        title: "LinkedIn & Cold Email Prospecting System",
        duration: "25:30",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Step-by-step prospecting setup to generate 15+ qualified discovery calls every month.",
        resources: [
          { title: "Battle-Tested Cold Email Scripts.pdf", type: "PDF", url: "#" },
          { title: "LinkedIn DM Sequences.pdf", type: "PDF", url: "#" }
        ]
      },
      {
        id: "les-302",
        title: "Setting Up Domain Infrastructure",
        duration: "19:50",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Technical guide to setting up secondary domains, Google Workspace, and DNS records so emails land in inbox.",
        resources: [
          { title: "Cold Email DNS Setup SOP.pdf", type: "PDF", url: "#" }
        ]
      }
    ]
  },
  {
    id: "ch-04",
    number: "04",
    title: "Closing The Deal",
    description: "Running the call, handling objections, sending proposals, and getting paid upfront so you never fund the work yourself.",
    lessons: [
      {
        id: "les-401",
        title: "The 2-Call Closing Framework",
        duration: "28:15",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Exact script for running discovery and demo calls that turn prospects into paying retainer clients.",
        resources: [
          { title: "Discovery Call Script.pdf", type: "PDF", url: "#" },
          { title: "BPO Client Agreement Contract.docx", type: "DOCX", url: "#" }
        ]
      },
      {
        id: "les-402",
        title: "Objection Handling & Closing Upfront Payments",
        duration: "22:40",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Overcoming objections on price, timezone differences, and remote team management.",
        resources: [
          { title: "Objection Handling Cheat Sheet.pdf", type: "PDF", url: "#" }
        ]
      }
    ]
  },
  {
    id: "ch-05",
    number: "05",
    title: "Outsourcing Delivery",
    description: "Finding and vetting the people who do the work, managing them properly, and keeping quality high while you stay out of delivery.",
    lessons: [
      {
        id: "les-501",
        title: "Hiring Top 1% Virtual Assistants & Teams",
        duration: "24:00",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Where to source offshore talent, how to test skills, and setting up KPI scorecards.",
        resources: [
          { title: "VA Hiring Scorecard.xlsx", type: "XLSX", url: "#" },
          { title: "Job Description Templates.docx", type: "DOCX", url: "#" }
        ]
      },
      {
        id: "les-502",
        title: "Operations Management & Quality Control",
        duration: "20:15",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "How to manage teams autonomously without spending all day micro-managing.",
        resources: [
          { title: "Daily Ops Tracking Sheet.pdf", type: "PDF", url: "#" }
        ]
      }
    ]
  },
  {
    id: "ch-06",
    number: "06",
    title: "Scaling The Operation",
    description: "Systemising everything, retaining clients long-term, raising your rates, and turning it into a business that runs without you.",
    lessons: [
      {
        id: "les-601",
        title: "Building an Executive Management Layer",
        duration: "27:10",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Promoting account managers and team leads so the business runs without your daily involvement.",
        resources: [
          { title: "Scaling Roadmap 7-Figures.pdf", type: "PDF", url: "#" },
          { title: "Account Manager SOP.docx", type: "DOCX", url: "#" }
        ]
      }
    ]
  }
];
