/* =====================================================================
   CONTENT & CONFIG  —  everything you will want to edit lives here.
   Anything marked  placeholder: true  is a clearly-flagged stand-in:
   the site shows a "REPLACE" tag on it and a hint when it is clicked.
   ===================================================================== */

export const SITE = {
  name: 'Kuntal Biswas',
  // public/images/profile.jpg is the photograph used for the particle portrait
  photo: 'public/images/profile2.jpg',
};

/* ---------- contact links (replace the placeholders) ---------- */
export const LINKS = {
    github:   { label: 'GitHub',   url: 'https://github.com/Kuntalbiswas06', handle: 'github.com/Kuntalbiswas06', placeholder: false },
  linkedin: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/kuntal-biswas-367598387', handle: 'linkedin.com/in/kuntal-biswas-367598387', placeholder: false },
  email:    { label: 'Email',    url: 'mailto:kuntal.biswas.0698@gmail.com',            handle: 'kuntal.biswas.0698@gmail.com', placeholder: false },
  // Put your PDF at public/Kuntal_Biswas_Resume.pdf, then set placeholder:false
  resume:   { label: 'Résumé',   url: 'public/Kuntal_Biswas_Resume.pdf',          handle: 'Download PDF', placeholder: false, download: true },
};

/* ---------- typing animation in the hero ---------- */
export const ROLES = [
  'Java Backend Developer',
  'Software Engineer',
  'Cloud & DevOps Enthusiast',
  'Problem Solver',
  'Product Builder',
];

/* ---------- skills ----------
   level:  'using'     = I build with it
           'exploring' = I am actively learning it
   The defaults below follow the direction you described (cloud & DevOps = exploring).
   Change any item's level so it reflects your real proficiency.            */
export const LEVELS = { using: 'Using', exploring: 'Exploring' };

export const SKILLS = [
  { id: 'programming', title: 'Programming', blurb: 'Languages I think and build in.',
    items: [
      { name: 'Java',       icon: 'java-original', level: 'using' },
      { name: 'JavaScript', icon: 'javascript-original', level: 'using' },
      { name: 'TypeScript', icon: 'typescript-original', level: 'using' },
      { name: 'Python',     icon: 'python-original', level: 'using' },
    ] },
  { id: 'backend', title: 'Backend', blurb: 'Services, APIs and the logic behind them.',
    items: [
      { name: 'Spring Boot', icon: 'spring-original', level: 'using' },
      { name: 'Node.js',     icon: 'nodejs-original', level: 'using' },
      { name: 'Express.js',  icon: 'express-original', invert: true, level: 'using' },
      { name: 'REST APIs',   icon: null, mono: 'API', level: 'using' },
    ] },
  { id: 'database', title: 'Database', blurb: 'Where the data lives.',
    items: [
      { name: 'PostgreSQL', icon: 'postgresql-original', level: 'using' },
      { name: 'MySQL',      icon: 'mysql-original', level: 'using' },
      { name: 'MongoDB',    icon: 'mongodb-original', level: 'using' },
      { name: 'Redis',      icon: 'redis-original', level: 'using' },
    ] },
  { id: 'tools', title: 'Tools', blurb: 'The everyday workbench.',
    items: [
      { name: 'Git',           icon: 'git-original', level: 'using' },
      { name: 'GitHub',        icon: 'github-original', invert: true, level: 'using' },
      { name: 'Docker',        icon: 'docker-original', level: 'using' },
      { name: 'Linux',         icon: 'linux-original', level: 'using' },
      { name: 'Maven',         icon: null, mono: 'Mvn', level: 'using' },
      { name: 'IntelliJ IDEA', icon: 'intellij-original', level: 'using' },
    ] },
  { id: 'cloud', title: 'Cloud & DevOps', blurb: 'Where I am heading next.',
    items: [
      { name: 'AWS',        icon: 'amazonwebservices-plain-wordmark', level: 'exploring' },
      { name: 'Kubernetes', icon: 'kubernetes-plain', level: 'exploring' },
      { name: 'Jenkins',    icon: 'jenkins-original', level: 'exploring' },
      { name: 'CI/CD',      icon: null, mono: 'CI', level: 'exploring' },
    ] },
];

/* ---------- projects ----------
   image:  path to a real screenshot (e.g. 'public/images/maandrishti.png').
           When null, an animated placeholder preview is drawn instead.
   stack:  add your real technologies; empty shows a dashed "add stack" badge.
   github / live:  real URLs only. null = shows "coming soon".                */
export const PROJECTS = [
  { id: 'maandrishti', n: '01', name: 'MaanDrishti', kind: 'Legal Metrology',
    desc: 'A Legal Metrology verification platform. Digital verification workflows, instrument management, certificate generation and QR-based verification.',
    stack: [], github: null, live: null, image: null },
  { id: 'swasthyasetu', n: '02', name: 'SwasthyaSetu', kind: 'Rural Healthcare · AI',
    desc: 'An AI-powered rural healthcare platform. Offline-first healthcare access, AI-assisted functionality, and workflows for patients and doctors.',
    stack: [], github: null, live: null, image: null },
  { id: 'reliefroute', n: '03', name: 'ReliefRoute', kind: 'Disaster Relief · Concept',
    desc: 'A disaster relief coordination concept. Technology-assisted disaster relief and resource tracking.',
    stack: [], github: null, live: null, image: null },
  { id: 'experiments', n: '04', name: 'Other Experiments', kind: 'In progress',
    desc: 'Room for what comes next — small builds, prototypes and ideas still taking shape.',
    stack: [], github: null, live: null, image: null },
];

/* ---------- journey (no dates on purpose) ---------- */
export const JOURNEY = [
  { t: 'Beginning the CSE journey',      d: 'Starting B.Tech in Computer Science and Engineering at Narula Institute of Technology.' },
  { t: 'Programming fundamentals',       d: 'Learning to think in code — logic, structure and solving problems step by step.' },
  { t: 'Exploring full-stack development', d: 'Connecting interfaces, APIs and databases into complete applications.' },
  { t: 'Building practical software',    d: 'Turning ideas into working projects: MaanDrishti, SwasthyaSetu, ReliefRoute.' },
  { t: 'Hackathons & technical competitions', d: 'Testing ideas under pressure and learning from other builders.' },
  { t: 'Moving towards Java backend',    d: 'Going deeper into Java, Spring Boot and the architecture behind scalable services.' },
  { t: 'Exploring cloud & DevOps',       d: 'Learning how software is packaged, deployed and operated — AWS, Docker, Kubernetes, CI/CD.', now: true },
];

/* ---------- GitHub (public API, no token) ---------- */
export const GITHUB_USER = 'Kuntalbiswas06';
export const GITHUB_CACHE_MINUTES = 60;

/* ---------- identity selector ---------- */
export const IDENTITY = [
  { id: 'engineering', title: 'Engineering', text: 'Java and Spring Boot are where I go deep: designing REST APIs, structuring backend code and working with relational and document databases.',
    tags: ['Java', 'Spring Boot', 'REST APIs', 'Backend Architecture', 'PostgreSQL', 'MySQL', 'MongoDB'],
    icons: ['java-original', 'spring-original', 'postgresql-original', 'mysql-original', 'mongodb-original'] },
  { id: 'building', title: 'Building', text: 'I learn by shipping. These are the projects and hackathon experiments where ideas become working software.',
    tags: ['MaanDrishti', 'SwasthyaSetu', 'ReliefRoute', 'Software Projects', 'Hackathon Experiments'], icons: [] },
  { id: 'exploring', title: 'Exploring', text: 'Learning how software is packaged, deployed and operated: cloud services, containers and delivery pipelines.',
    tags: ['Cloud Computing', 'AWS', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'System Design'],
    icons: ['amazonwebservices-plain-wordmark', 'docker-original', 'kubernetes-plain', 'jenkins-original', 'linux-original'] },
];
