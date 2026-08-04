export interface SamplePreset {
  id: string;
  name: string;
  role: string;
  experienceLevel: 'Entry' | 'Mid-Level' | 'Senior' | 'Executive';
  resumeText: string;
  jobDescription: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'frontend-dev',
    name: 'Frontend Developer (Junior)',
    role: 'Frontend Developer',
    experienceLevel: 'Entry',
    resumeText: `ALEX RIVERA
Email: alex.rivera@email.com | Phone: (555) 234-5678 | GitHub: github.com/arivera | Portfolio: alexrivera.dev

OBJECTIVE
Motivated Computer Science graduate seeking Junior Frontend Developer position. Skilled in React, JavaScript (ES6+), HTML5, CSS3, and modern UI frameworks.

EDUCATION
B.S. in Computer Science | State University (2020 - 2024)
Relevant Coursework: Web Development, Data Structures & Algorithms, Software Engineering, UI/UX Design

SKILLS
- Languages: JavaScript, TypeScript, HTML5, CSS3
- Frameworks & Libraries: React, Tailwind CSS, Redux Toolkit, REST APIs
- Tools: Git, VS Code, Figma, Vite, npm

PROJECTS
E-Commerce Web Application (React, Tailwind CSS, REST API)
- Developed a responsive online store interface with cart management and product filtering.
- Integrated mock REST APIs for real-time inventory and pricing display.
- Improved page load performance by 30% through code splitting and image optimization.

Personal Task Dashboard (React, Context API, LocalStorage)
- Built a productivity app with drag-and-drop task sorting and persistent storage.
- Designed accessible UI with high WCAG contrast compliance.

EXPERIENCE
Web Development Intern | TechCorp Solutions (Summer 2023)
- Assisted in building client landing pages using HTML, CSS, and JavaScript.
- Fixed 25+ frontend bug tickets in Jira and participated in daily agile standups.
- Refactored legacy CSS code to modular Tailwind utility classes.`,
    jobDescription: `Position: Junior Frontend Developer
Company: Apex Digital Labs
Location: Remote

Responsibilities:
- Build responsive, fast, and scalable web applications using React, TypeScript, and Tailwind CSS.
- Collaborate with UI/UX designers to translate Figma mockups into pixel-perfect code.
- Integrate RESTful APIs and GraphQL endpoints for dynamic data fetching.
- Write clean, maintainable unit tests with Vitest and Jest.
- Optimize web application performance, accessibility, and SEO best practices.

Requirements:
- 0-2 years of experience with React.js and TypeScript.
- Strong proficiency in CSS, HTML5, and responsive design systems.
- Familiarity with version control (Git) and CI/CD pipelines.
- Knowledge of state management (Redux, Zustand, or React Context).
- Understanding of web performance (Lighthouse, Core Web Vitals).
- Excellent communication skills and passion for learning.`
  },
  {
    id: 'fullstack-dev',
    name: 'Full Stack Engineer (Mid-Level)',
    role: 'Full Stack Engineer',
    experienceLevel: 'Mid-Level',
    resumeText: `JORDAN LEE
Email: jordan.lee@email.com | LinkedIn: linkedin.com/in/jordanlee-dev | GitHub: github.com/jlee-fullstack

SUMMARY
Full Stack Engineer with 3 years of experience building scalable Node.js microservices and modern React applications. Proven track record of improving application throughput and leading feature development.

TECHNICAL SKILLS
- Frontend: React, Next.js, TypeScript, Tailwind CSS, Redux
- Backend: Node.js, Express, PostgreSQL, MongoDB, GraphQL, REST APIs
- DevOps & Cloud: Docker, AWS (S3, EC2, Lambda), CI/CD (GitHub Actions)
- Testing: Jest, Cypress, Supertest

PROFESSIONAL EXPERIENCE
Software Engineer | CloudScale Inc. (2022 - Present)
- Designed and deployed Node.js microservices handling 1M+ daily request payloads with 99.9% uptime.
- Built automated OAuth2 authentication workflow reducing customer onboarding dropoff by 18%.
- Optimized PostgreSQL database queries with strategic indexing, reducing p95 latency from 450ms to 120ms.
- Mentored 2 junior engineers and conducted weekly code reviews.

Associate Developer | Innovate Tech (2021 - 2022)
- Developed real-time collaborative features using Socket.io and Express.
- Created reusable React UI component library used across 4 internal web portals.

EDUCATION
B.S. in Software Engineering | Tech Institute (2017 - 2021)`,
    jobDescription: `Position: Senior Full Stack Engineer
Company: CloudPulse Systems
Location: Hybrid / San Francisco, CA

Key Responsibilities:
- Architect and develop end-to-end full stack web applications with React, Next.js, and Node.js.
- Implement serverless functions and event-driven microservices on AWS (Lambda, DynamoDB, SQS).
- Drive backend performance optimization, database schema migrations, and API rate limiting.
- Establish automated CI/CD pipelines and deployment strategies with Docker and Kubernetes.
- Mentor team members and drive architectural decision-making.

Qualifications:
- 4+ years of professional full-stack development experience.
- Deep knowledge of TypeScript, Node.js, React, and SQL/NoSQL databases.
- Practical experience with AWS cloud infrastructure and serverless architecture.
- Strong automated testing experience (unit, integration, and E2E testing).`
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst / Scientist',
    role: 'Data Analyst',
    experienceLevel: 'Entry',
    resumeText: `SAMANTHA CHEN
Email: samantha.chen@email.com | Portfolio: samanthachen.data | Kaggle: kaggle.com/schen

SUMMARY
Data Analyst with strong background in Python, SQL, Tableau, and statistical modeling. Experienced in extracting actionable business insights from complex datasets.

TECHNICAL SKILLS
- Programming: Python (Pandas, NumPy, Scikit-learn, Matplotlib), SQL (PostgreSQL, BigQuery)
- Visualization: Tableau, Power BI, Seaborn
- Statistics: Hypothesis Testing, A/B Testing, Regression Analysis, Forecasting
- Tools: Jupyter Notebook, Git, Excel (Advanced Macros, Pivot Tables)

PROJECTS
Customer Churn Prediction Model (Python, Scikit-learn, XGBoost)
- Built classification model predicting churn with 87% accuracy on 50k customer records.
- Identified top 3 churn drivers and presented strategic retention recommendations to leadership.

E-Commerce Sales Dashboard (Tableau, SQL)
- Created interactive Tableau dashboard visualizing monthly revenue trends across 12 regions.

EDUCATION
B.S. in Statistics & Data Analytics | University of California (2020 - 2024)`,
    jobDescription: `Position: Data Analyst
Company: Insights Metrics Co.

Responsibilities:
- Perform exploratory data analysis and build predictive statistical models using Python and SQL.
- Build and maintain executive dashboards in Tableau or Power BI.
- Collaborate with product management to design, execute, and analyze A/B tests.
- Query large data warehouses (Snowflake, BigQuery) to track KPI metrics.

Requirements:
- 1-3 years experience in data analytics or business intelligence.
- Advanced SQL proficiency (window functions, CTEs, query optimization).
- Strong Python skills (Pandas, Scikit-learn).
- Experience with BI visualization tools (Tableau, Power BI).
- Knowledge of statistical hypothesis testing and A/B testing frameworks.`
  }
];
