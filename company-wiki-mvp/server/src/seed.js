require('dotenv').config();

if (!process.env.OPENAI_API_KEY) {
  console.error('FATAL: OPENAI_API_KEY is required for seeding (embedding generation).');
  process.exit(1);
}

const pool = require('./db');
const { chunkText } = require('./chunking');
const { embedBatch } = require('./embeddings');

// ================================================================
//  FICTIONAL SEED DATA — Nexus Dynamics Inc.
// ================================================================

const PROJECTS = [
  {
    title: 'Project Aurora – AI Customer Service Platform',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'PRJ-001',
    owner: 'Sarah Chen', status: 'active', tags: ['ai', 'customer-service', 'nlp'],
    content: `Project Aurora is building an AI-powered customer service platform that uses natural language processing to handle tier-1 support tickets automatically. The system integrates with our existing Zendesk and Salesforce infrastructure to provide seamless handoffs when human intervention is needed. Phase 1, which launched in January 2026, targets a 40% ticket deflection rate by automatically resolving common issues such as password resets, order status inquiries, and billing questions. The NLP pipeline uses a fine-tuned language model trained on 18 months of historical support tickets, achieving 92% intent classification accuracy in testing. Phase 2 will introduce multilingual support covering Spanish, French, and Mandarin, expected by Q3 2026. The total project budget is $450,000 over 18 months, with a projected annual savings of $1.2M in support costs once fully deployed. The core team consists of 6 engineers, 2 ML specialists, and 1 UX designer. Key technical components include a real-time sentiment analysis module that escalates frustrated customers to human agents within 30 seconds, and an adaptive learning system that improves responses based on agent feedback. The platform has already processed over 15,000 test interactions with a customer satisfaction score of 4.2 out of 5.`,
  },
  {
    title: 'Project Beacon – Internal Analytics Dashboard',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'PRJ-002',
    owner: 'Marcus Johnson', status: 'active', tags: ['analytics', 'dashboard', 'data'],
    content: `Project Beacon is creating a unified internal analytics dashboard that consolidates data from seven separate business systems into a single real-time view. Currently, managers spend an average of 3 hours per week manually pulling reports from Jira, Salesforce, NetSuite, Snowflake, Google Analytics, Greenhouse, and PagerDuty. The dashboard provides real-time KPIs for engineering velocity, customer satisfaction, sales pipeline, and operational metrics. The frontend is built with React and D3.js for interactive data visualizations, while the backend uses Snowflake as the data warehouse with dbt for transformations. The project launched its MVP in December 2025 with engineering metrics, and is currently in Phase 2 adding finance and sales dashboards. Key features include customizable alerting thresholds, executive summary reports auto-generated weekly, and role-based data visibility to ensure sensitive financial data is only visible to authorized personnel. The team has 4 full-stack engineers and 1 data engineer. Budget is $280,000 over 12 months. Early adoption has been strong with 85% of engineering managers using the dashboard daily. The next milestone is integration with our OKR tracking system by April 2026.`,
  },
  {
    title: 'Project Cipher – Security Infrastructure Overhaul',
    doc_type: 'PROJECT', access_level: 'EXEC', category: 'EXEC',
    department: 'ENG', source_ref: 'PRJ-003',
    owner: 'David Park', status: 'active', tags: ['security', 'encryption', 'zero-trust'],
    content: `Project Cipher is a comprehensive overhaul of Nexus Dynamics' security infrastructure, initiated in response to findings from the Q2 2025 security audit conducted by Deloitte. The project migrates the entire organization to a zero-trust security architecture, replacing our legacy VPN-based perimeter model. Key workstreams include implementing mutual TLS for all internal service-to-service communication, deploying hardware security modules for cryptographic key management, and upgrading all data-at-rest encryption to AES-256-GCM. The project has a board-approved budget of $1.2M over 24 months and is classified as executive-level confidential due to the sensitive nature of the vulnerability remediation. Phase 1 (completed) addressed the 3 critical findings from the audit, including patching an exposed internal API gateway and implementing mandatory multi-factor authentication for all privileged access accounts. Phase 2 (current) focuses on deploying CrowdStrike Falcon endpoint detection across all 1,200 corporate devices and implementing network micro-segmentation. Phase 3 will introduce automated security compliance monitoring and a bug bounty program. The security team has grown from 4 to 9 members to support this initiative.`,
  },
  {
    title: 'Project Delta – Employee Wellness Program',
    doc_type: 'PROJECT', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'PRJ-004',
    owner: 'Lisa Martinez', status: 'planning', tags: ['wellness', 'hr', 'benefits'],
    content: `Project Delta is designing a comprehensive employee wellness program to address increasing burnout indicators and improve retention. Analysis of our 2025 employee survey revealed that 42% of employees reported moderate to high stress levels, and voluntary turnover increased from 12% to 18% year-over-year. The program includes four pillars: mental health support through a partnership with Headspace providing all employees with free premium subscriptions and 12 annual therapy sessions via Lyra Health; physical wellness through subsidized gym memberships with ClassPass and on-site fitness classes at headquarters; flexible work arrangements including a formalized 4-day work week pilot for Q2 2026 and expanded remote work options; and financial wellness including student loan repayment assistance up to $5,000 per year and financial planning workshops. The annual program budget is $200,000, which is expected to pay for itself through reduced turnover costs estimated at $340,000 annually. The program is being developed in collaboration with our benefits broker, Mercer, and will launch in phases starting April 2026. Success metrics include employee satisfaction scores, turnover rates, sick day usage, and participation rates tracked quarterly.`,
  },
  {
    title: 'Project Echo – Revenue Forecasting System',
    doc_type: 'PROJECT', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'PRJ-005',
    owner: 'James Wilson', status: 'active', tags: ['finance', 'forecasting', 'ml'],
    content: `Project Echo replaces our manual Excel-based revenue forecasting process with a machine learning system that integrates directly with NetSuite and Salesforce pipeline data. The legacy process required 40 hours of analyst time per month and produced forecasts with only 73% accuracy at the 3-month horizon. The new system uses a gradient boosted ensemble model trained on 5 years of historical revenue data, deal pipeline stages, seasonal patterns, and macroeconomic indicators. Current 3-month forecast accuracy is 87%, with a target of 94% by Q3 2026 after incorporating additional features including customer health scores and market sentiment data. The system provides both 3-month and 12-month rolling forecasts, updated daily. It also generates scenario analyses for best-case, worst-case, and most-likely revenue outcomes to support financial planning. The platform includes an executive dashboard showing forecast confidence intervals, pipeline risk flags, and variance analysis against budget. Budget is $180,000 over 12 months. The team includes 2 data scientists and 1 finance analyst. A key upcoming milestone is integration with our board reporting package for the Q1 2026 earnings review. The system has already identified $2.3M in at-risk pipeline that was previously rated as committed.`,
  },
  {
    title: 'Project Forge – Manufacturing Process Automation',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'OPS', source_ref: 'PRJ-006',
    owner: 'Robert Kim', status: 'completed', tags: ['automation', 'manufacturing', 'iot', 'computer-vision'],
    content: `Project Forge automated the quality control process across all three Nexus Dynamics manufacturing facilities using computer vision and IoT sensors. Before the project, manual visual inspection caught only 97.7% of defects, resulting in a 2.3% defect rate that cost approximately $890,000 annually in warranty claims and rework. The system deploys high-resolution cameras at 12 inspection points along the assembly line, connected to edge computing devices running custom-trained YOLO v8 object detection models. The models were trained on 45,000 labeled images of both conforming and non-conforming products. After deployment, the defect detection rate improved to 99.6%, reducing the defect rate to 0.4%. The system processes 200 units per minute per inspection point with a false positive rate under 1.2%. Total project cost was $520,000 including hardware and development, with ROI achieved in just 8 months. The system has been in production since September 2025 and is now in maintenance mode with monthly model retraining cycles. It also provides real-time quality metrics dashboards for plant managers and has been recognized internally as a model for future automation initiatives. Lessons learned documentation has been shared with the ENG and OPS departments.`,
  },
  {
    title: 'Project Gateway – Partner Integration API',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'PRJ-007',
    owner: 'Emily Zhang', status: 'active', tags: ['api', 'integration', 'partners', 'graphql'],
    content: `Project Gateway provides a unified RESTful API platform enabling third-party partners to integrate with Nexus Dynamics' core services. The platform handles authentication via OAuth 2.0 with JWT tokens, enforces per-partner rate limiting, and supports webhook callbacks for asynchronous events. Currently, 12 active partners are integrated, processing an average of 2.4 million API calls per day with 99.95% uptime over the past 6 months. Key integrations include order management, inventory synchronization, and partner billing. The API documentation portal at partners.nexusdynamics.com provides interactive Swagger documentation, sandbox environments, and integration guides. The platform is built on Node.js with Express, backed by PostgreSQL and Redis for caching and rate limiting. Phase 2, planned for Q2 2026, will introduce a GraphQL tier to provide more flexible data querying for advanced integration scenarios, as well as a self-service partner onboarding portal that reduces integration time from 3 weeks to 3 days. The team consists of 3 backend engineers and 1 developer advocate. Budget is $195,000 annually. Monitoring is handled through Datadog with custom dashboards tracking latency, error rates, and partner-specific usage patterns.`,
  },
  {
    title: 'Project Horizon – Strategic Market Expansion',
    doc_type: 'PROJECT', access_level: 'EXEC', category: 'EXEC',
    department: 'EXEC', source_ref: 'PRJ-008',
    owner: 'Michael Torres', status: 'planning', tags: ['strategy', 'expansion', 'acquisition', 'apac'],
    content: `Project Horizon is a confidential strategic initiative for Nexus Dynamics' entry into the Asia-Pacific market. The board of directors approved a $15M budget in November 2025 for an 18-month execution timeline. The plan evaluates two primary acquisition targets: TechWave Solutions in Tokyo, a 50-person SaaS company with $8M ARR and strong enterprise relationships in the Japanese manufacturing sector, and DataPulse Pte Ltd in Singapore, a 30-person analytics firm with $4M ARR and government contracts across Southeast Asia. Due diligence on both targets is being conducted by Goldman Sachs and Morrison & Foerster under NDA. Key strategic partnerships are being explored with SoftBank Vision Fund for distribution in Japan and Temasek Holdings for market access in Singapore and Indonesia. The expansion is expected to add $25M in incremental annual revenue within 3 years. Risk factors include regulatory compliance in each jurisdiction, talent acquisition challenges in competitive APAC tech markets, and currency exposure. The project is managed by the CEO with a steering committee consisting of the CFO, CTO, and VP of Strategy. All communications related to this project are classified as executive-confidential, and access is restricted to the steering committee and board members only.`,
  },
];

const POLICIES = [
  // ── HR Policies (5) ──
  {
    title: 'Remote Work Policy',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-001', effective_date: '2025-06-01',
    content: `Nexus Dynamics Remote Work Policy. Effective June 1, 2025. Eligibility: All full-time employees who have completed their 90-day probationary period are eligible for remote work arrangements. Employees in manufacturing and facilities roles require on-site presence and are excluded. Schedule: Eligible employees may work remotely up to 3 days per week. Core collaboration hours are 10:00 AM to 3:00 PM local time, during which all remote employees must be available for meetings and synchronous communication. Equipment: The company provides a one-time $1,500 home office stipend for ergonomic desk setup, monitor, and peripherals. IT will ship a company laptop and provide VPN access within 5 business days of approval. Internet: Employees must maintain a minimum 50 Mbps internet connection. The company reimburses up to $75/month for internet costs. Performance: Remote employees are evaluated on the same performance criteria as on-site employees. Managers conduct monthly check-ins to ensure productivity and engagement. Revocation: Remote work privileges may be revoked with 2 weeks notice if performance declines or business needs require on-site presence. International remote work requires separate approval from HR and Legal.`,
  },
  {
    title: 'Compensation and Benefits Guide',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-002', effective_date: '2025-01-01',
    content: `Nexus Dynamics Compensation and Benefits Guide. Salary Structure: All positions are mapped to a standardized job leveling framework with 8 levels (L1 through L8). Each level has a defined salary band with a 20% spread from minimum to maximum. Salary bands are benchmarked annually against Radford survey data targeting the 65th percentile of the market. Equity: Employees at L4 and above are eligible for stock option grants. New hire grants vest over 4 years with a 1-year cliff. Annual refresh grants are awarded based on performance and level. Health Insurance: The company offers three medical plan options through Aetna: a PPO, an HMO, and an HDHP with HSA. The company covers 90% of employee premiums and 70% of dependent premiums. Dental and vision coverage is provided through Delta Dental and VSP respectively. Retirement: Nexus Dynamics matches 401(k) contributions up to 4% of base salary. Matching contributions vest over 3 years. Additional benefits include 20 days PTO annually, 10 paid holidays, 12 weeks paid parental leave, $2,000 annual learning and development budget, and commuter benefits through WageWorks.`,
  },
  {
    title: 'Performance Review Process',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-003', effective_date: '2025-03-15',
    content: `Nexus Dynamics Performance Review Process. Review Cycle: Performance reviews are conducted semi-annually in March and September. The review period covers the preceding 6 months of work. Objectives: At the start of each review period, employees set 3-5 objectives in collaboration with their manager using the OKR framework. Objectives should be specific, measurable, and aligned with team and company goals. Self-Assessment: Employees complete a self-assessment 2 weeks before the review meeting, documenting progress on objectives, key accomplishments, and areas for growth. Peer Feedback: Each employee selects 3-5 peers to provide feedback through a structured survey covering collaboration, communication, and technical competence. Rating Scale: Managers assign an overall rating on a 5-point scale: Exceptional (5), Exceeds Expectations (4), Meets Expectations (3), Needs Improvement (2), Unsatisfactory (1). Calibration: Department heads conduct calibration sessions to ensure consistency of ratings across teams. Outcomes: Ratings directly influence annual compensation adjustments and promotion decisions. Employees rated 2 or below are placed on a Performance Improvement Plan (PIP) with a 60-day improvement window. Development plans are required for all employees regardless of rating.`,
  },
  {
    title: 'Employee Onboarding Procedures',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-004', effective_date: '2025-01-15',
    content: `Nexus Dynamics Employee Onboarding Procedures. Pre-Start: HR sends a welcome package 1 week before the start date including laptop setup instructions, benefits enrollment forms, and a first-week schedule. A buddy is assigned from the new hire's team to provide guidance during the first 90 days. Week 1: Day 1 includes company orientation covering mission, values, org structure, and key policies. IT setup and security training are completed by Day 2. The new hire meets with their manager to discuss role expectations, 30/60/90 day goals, and team norms. Days 3-5 focus on team-specific onboarding including codebase walkthroughs for engineers, tool training, and shadowing sessions. 30-Day Check-In: Manager meets with new hire to review initial progress, address questions, and adjust goals if needed. HR conducts a brief survey to assess onboarding satisfaction. 60-Day Check-In: Focus on deeper integration into team processes, contribution to ongoing projects, and identification of training needs. 90-Day Review: Formal review marking the end of the probationary period. Manager and new hire discuss performance, cultural fit, and development plan. Successful completion triggers eligibility for remote work, equity grants, and full benefits enrollment.`,
  },
  {
    title: 'Diversity and Inclusion Policy',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-005', effective_date: '2025-04-01',
    content: `Nexus Dynamics Diversity and Inclusion Policy. Commitment: Nexus Dynamics is committed to fostering an inclusive workplace where all employees feel valued, respected, and empowered to contribute their best work. We believe diverse teams drive innovation and better business outcomes. Hiring: All job postings use gender-neutral language reviewed by our inclusion team. Interview panels must include at least one member from an underrepresented group. We partner with organizations including Code2040, Out in Tech, and Disability:IN to expand our talent pipeline. Employee Resource Groups: The company supports 5 ERGs: Women in Tech, PRIDE Alliance, Black Professionals Network, Veterans at Nexus, and Asian Pacific Islander Alliance. Each ERG receives $15,000 annual funding for events, speakers, and community initiatives. Training: All employees complete unconscious bias training annually. Managers complete additional inclusive leadership training covering equitable performance evaluations, accommodation processes, and conflict resolution. Metrics: We publish an annual diversity report tracking representation by gender, ethnicity, and level. Current goals include increasing women in technical roles from 31% to 40% by 2027, and increasing underrepresented minorities in leadership from 18% to 25% by 2027. Reporting: Employees can report inclusion concerns through an anonymous hotline managed by a third-party provider.`,
  },
  // ── Finance Policies (4) ──
  {
    title: 'Expense Reimbursement Policy',
    doc_type: 'POLICY', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'POL-FIN-001', effective_date: '2025-02-01',
    content: `Nexus Dynamics Expense Reimbursement Policy. Scope: This policy covers all business-related expenses incurred by employees in the course of their duties. Submission: All expenses must be submitted through Concur within 30 days of the transaction date. Original receipts are required for expenses over $25. Approval Thresholds: Expenses under $500 require manager approval only. Expenses between $500 and $2,500 require director approval. Expenses over $2,500 require VP approval. Any expense over $10,000 requires CFO approval. Categories and Limits: Meals during business travel are capped at $75 per day. Client entertainment is limited to $150 per person per event and requires pre-approval. Office supplies purchased for remote work are reimbursable up to $100 per quarter. Conference attendance requires manager pre-approval and is limited to 2 per employee per year. Non-Reimbursable: Personal expenses, alcohol beyond reasonable client entertainment, first-class travel, and expenses lacking proper documentation. Processing: Approved expenses are reimbursed within 10 business days via direct deposit. Late submissions beyond 60 days may be denied. Violations of this policy may result in repayment obligations and disciplinary action.`,
  },
  {
    title: 'Budget Approval Process',
    doc_type: 'POLICY', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'POL-FIN-002', effective_date: '2025-01-01',
    content: `Nexus Dynamics Budget Approval Process. Annual Planning: The annual budget cycle begins in October for the following fiscal year. Department heads submit initial budget proposals by November 15. Finance reviews and consolidates proposals by December 1. The executive team conducts budget hearings the first two weeks of December, and the board approves the final budget in the December board meeting. Quarterly Reviews: Budget-to-actual variance reports are prepared monthly by Finance and reviewed quarterly by the executive team. Departments with variance exceeding 10% must provide written explanations. Mid-year reforecast is conducted in June with adjustments approved by the CFO. New Budget Requests: Unplanned expenditures must be submitted as Budget Change Requests (BCRs). BCRs under $25,000 require department VP and Finance approval. BCRs between $25,000 and $100,000 require CFO approval. BCRs over $100,000 require CEO and board approval. Headcount: All new positions require an approved headcount requisition regardless of budget availability. Headcount requests include full cost modeling covering salary, benefits, equipment, and office space. Capital Expenditures: CapEx over $50,000 requires a business case with ROI analysis and a minimum 18-month payback period unless waived by the CFO.`,
  },
  {
    title: 'Vendor Payment Terms',
    doc_type: 'POLICY', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'POL-FIN-003', effective_date: '2025-03-01',
    content: `Nexus Dynamics Vendor Payment Terms. Standard Terms: The default payment term for all new vendors is Net 30 from invoice date. Vendors may negotiate Net 15 with a 2% early payment discount or Net 45 for strategic vendors with annual contracts exceeding $500,000. Purchase Orders: All purchases over $1,000 require an approved Purchase Order (PO) before goods or services are received. POs must reference an approved budget line item. Three-way matching (PO, receipt confirmation, and invoice) is required for payment processing. Invoice Requirements: Invoices must include the PO number, itemized description of goods or services, applicable tax, and payment terms. Invoices without PO numbers will be returned to the vendor. Payment Methods: Payments under $10,000 are processed via ACH transfer. Payments over $10,000 can be processed via wire transfer upon vendor request. Credit card payments are limited to purchases under $5,000 and require receipt upload within 5 business days. Vendor Onboarding: New vendors must complete a W-9 form, provide banking details for ACH setup, and pass a basic compliance screening. Vendors with annual contracts over $100,000 must carry minimum $2M general liability insurance.`,
  },
  {
    title: 'Revenue Recognition Policy',
    doc_type: 'POLICY', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'POL-FIN-004', effective_date: '2025-01-01',
    content: `Nexus Dynamics Revenue Recognition Policy. Standard: Revenue is recognized in accordance with ASC 606 (Revenue from Contracts with Customers). The five-step model is applied to all customer contracts. Contract Types: SaaS Subscriptions: Revenue recognized ratably over the subscription period. Professional Services: Recognized as services are delivered, measured by hours completed or milestones achieved. Hardware Sales: Recognized upon delivery and customer acceptance. Hybrid Contracts: Multi-element arrangements are separated into distinct performance obligations with standalone selling prices allocated using the adjusted market approach. Payment Terms: Standard payment terms are Net 30. Contracts with payment terms exceeding 12 months are evaluated for significant financing components. Deferred Revenue: Cash received before revenue recognition criteria are met is recorded as deferred revenue. The deferred revenue balance is reviewed monthly by the Controller. Commission Costs: Sales commissions on new contracts are capitalized as contract acquisition costs under ASC 340-40 and amortized over the estimated customer life of 36 months. Audit: Revenue recognition is subject to quarterly review by external auditors during the annual audit cycle. Any changes to revenue recognition estimates require Controller and CFO approval.`,
  },
  // ── General Policies (3) ──
  {
    title: 'Data Security Policy',
    doc_type: 'POLICY', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'POL-GEN-001', effective_date: '2025-05-01',
    content: `Nexus Dynamics Data Security Policy. Classification: All company data is classified into four tiers: Public (marketing materials, published content), Internal (general business documents, meeting notes), Confidential (customer data, financial records, HR data), and Restricted (trade secrets, security credentials, board materials). Handling: Internal data may be shared freely within the company. Confidential data requires need-to-know access and must be encrypted in transit and at rest. Restricted data requires explicit authorization from a VP or above and is subject to audit logging. Access Control: All systems use role-based access control (RBAC). Access reviews are conducted quarterly by IT Security. Terminated employee access is revoked within 4 hours of notification. Multi-factor authentication is required for all Confidential and Restricted systems. Encryption: All data at rest uses AES-256 encryption. Data in transit uses TLS 1.3 minimum. Encryption keys are managed through AWS KMS with annual rotation. Incident Response: Security incidents must be reported to security@nexusdynamics.com within 1 hour of discovery. The incident response team conducts triage within 4 hours and provides a root cause analysis within 72 hours. Data breaches involving customer PII trigger mandatory notification procedures under applicable privacy laws.`,
  },
  {
    title: 'Acceptable Use Policy',
    doc_type: 'POLICY', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'POL-GEN-002', effective_date: '2025-04-15',
    content: `Nexus Dynamics Acceptable Use Policy. Scope: This policy applies to all employees, contractors, and temporary workers who use company-provided devices, networks, or systems. Devices: Company laptops must have full-disk encryption enabled, automatic OS updates configured, and approved endpoint protection software installed. Personal devices may access company email and calendar only through approved MDM-enrolled applications. Internet Use: Company internet access is provided for business purposes. Limited personal use is permitted during breaks. Access to gambling, adult content, and file-sharing sites is blocked. All internet traffic is logged for security monitoring. Software: Only software approved by IT may be installed on company devices. Software requests are submitted through the IT service portal and reviewed within 3 business days. Use of generative AI tools requires completion of the AI Acceptable Use training module. Email: Company email should be used for business communications. Sensitive data must not be transmitted via email without encryption. Employees must not use personal email for business communications involving customer data. Monitoring: The company reserves the right to monitor all use of company systems and networks. Monitoring is conducted for security and compliance purposes. Violations of this policy may result in access revocation and disciplinary action up to termination.`,
  },
  {
    title: 'Intellectual Property Policy',
    doc_type: 'POLICY', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'POL-GEN-003', effective_date: '2025-02-15',
    content: `Nexus Dynamics Intellectual Property Policy. Ownership: All inventions, works of authorship, software code, designs, and documentation created by employees during the course of employment or using company resources are the exclusive property of Nexus Dynamics. This includes work created outside normal business hours if it relates to the company's current or planned business activities. Inventions: Employees must promptly disclose all inventions to the Legal department using the Invention Disclosure Form. The company will evaluate each disclosure and determine whether to file patent protection within 90 days. Employees are listed as inventors on any patent applications. Open Source: Contributions to open-source projects must be pre-approved by the CTO's office to ensure no proprietary code or trade secrets are disclosed. Use of open-source software in company products is permitted only for licenses approved by Legal, including MIT, Apache 2.0, and BSD. GPL-licensed software requires separate review. Confidentiality: Employees must not disclose trade secrets, proprietary algorithms, or confidential business information during or after employment. Non-disclosure obligations survive termination and are enforceable under the employment agreement. Third-Party IP: Employees must respect the intellectual property rights of third parties. Unauthorized use of copyrighted materials, patented technologies, or trade secrets is prohibited. Concerns about potential IP infringement should be reported to Legal immediately.`,
  },
];

const COMMS = [
  {
    title: 'Q3 2025 All-Hands Meeting Summary',
    doc_type: 'COMM', access_level: 'GENERAL', category: 'GENERAL',
    department: 'EXEC', source_ref: 'COMM-001',
    content: `Nexus Dynamics Q3 2025 All-Hands Meeting Summary. Date: October 15, 2025. Attendees: 340 employees (87% attendance). CEO Michael Torres opened with highlights: revenue grew 23% year-over-year to $142M, we added 45 new enterprise customers, and employee NPS increased from 62 to 71. Engineering VP highlighted Project Forge's successful completion, which reduced manufacturing defects by 82%. Product launched 3 new features based on the top customer requests from the annual survey. HR announced the upcoming wellness program (Project Delta) and reminded everyone about open enrollment starting November 1. Finance reported we are 3% under budget YTD with strong cash flow. Q&A highlights: employees asked about expansion plans, and the CEO confirmed international growth is a strategic priority for 2026 without sharing specifics. Multiple employees raised concerns about meeting overload, and the CEO committed to implementing no-meeting Wednesdays starting in November. The next all-hands is scheduled for January 2026.`,
  },
  {
    title: 'CEO Strategic Vision Update – FY2026',
    doc_type: 'COMM', access_level: 'EXEC', category: 'EXEC',
    department: 'EXEC', source_ref: 'COMM-002',
    content: `Confidential: CEO Strategic Vision Update for FY2026. To: Executive Team and Board of Directors. From: Michael Torres, CEO. Date: December 1, 2025. Our three strategic pillars for FY2026 are: International Expansion, AI-First Products, and Operational Excellence. On international expansion, Project Horizon is our highest priority initiative. We aim to close our first APAC acquisition by Q2 2026 and establish local operations in Tokyo and Singapore by year-end. The $15M budget is secured and Goldman Sachs is managing the process. On AI-first products, we will increase R&D spending by 30% to accelerate AI capabilities across all product lines. Project Aurora is the template for how we integrate AI into customer-facing products. I am asking the CTO to develop an AI Center of Excellence by March 2026. On operational excellence, we must scale our infrastructure and processes to support a projected 40% revenue increase. This means investing in Project Beacon for data-driven decision making and completing Project Cipher to ensure our security posture meets international compliance requirements. I expect each executive to develop their departmental OKRs aligned with these pillars by January 15, 2026.`,
  },
  {
    title: 'Open Enrollment Benefits Reminder',
    doc_type: 'COMM', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'COMM-003',
    content: `Nexus Dynamics Open Enrollment Reminder. From: HR Benefits Team. Date: November 1, 2025. Open enrollment for FY2026 benefits runs from November 1 through November 30, 2025. Key changes for 2026: Medical plan premiums remain unchanged for the third consecutive year thanks to favorable claims experience. A new HDHP option with enhanced HSA contributions is available, the company will contribute $1,000 for individual and $2,000 for family HSA accounts. Dental coverage now includes orthodontia for adults up to $2,500 lifetime maximum. Vision coverage adds a $200 frame allowance, up from $150. New benefit: Pet insurance through Nationwide is now available at group rates. The 401(k) match increases from 4% to 5% of base salary effective January 1. All elections must be completed in Workday by November 30 at 11:59 PM EST. Employees who do not make active elections will be enrolled in the same plans as the current year. Benefits information sessions are scheduled for November 10 and November 17 at noon in the main conference room and via Zoom. Contact benefits@nexusdynamics.com with questions.`,
  },
  {
    title: 'FY2026 Budget Planning Kickoff',
    doc_type: 'COMM', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'COMM-004',
    content: `FY2026 Budget Planning Kickoff Communication. From: Jennifer Adams, CFO. To: Department Heads and Budget Owners. Date: October 1, 2025. The FY2026 annual budget planning process begins today. Timeline: October 1-31: Department heads prepare initial budget proposals using the templates shared in the Finance SharePoint. November 1-15: Finance team reviews submissions and schedules one-on-one meetings with each department to discuss assumptions and priorities. December 1-12: Executive budget hearings, 90 minutes per department. December 18: Board approval at the Q4 board meeting. Guidelines: Total company revenue target for FY2026 is $185M, representing 30% growth. Operating expense growth should not exceed 25% to improve operating margins. Each department must identify at least one initiative for sunset or deprioritization. Headcount requests must include full cost modeling using the updated salary bands from HR. All capital expenditure requests over $50,000 require a business case with ROI analysis. New this year: we are introducing zero-based budgeting for all G&A categories. Please contact your Finance business partner with questions. The Finance team will host office hours every Tuesday from 2-4 PM during the planning period.`,
  },
  {
    title: 'Engineering Sprint 47 Retrospective',
    doc_type: 'COMM', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'COMM-005',
    content: `Engineering Sprint 47 Retrospective Summary. Sprint Dates: January 6-17, 2026. Team Size: 42 engineers across 6 squads. Velocity: 187 story points completed vs 195 planned (96% completion rate). Key Accomplishments: Project Aurora shipped the real-time sentiment analysis module and processed 5,000 beta interactions. Project Beacon completed the sales dashboard integration and received positive feedback from 3 pilot users in the sales team. Project Gateway deployed rate limiting v2, reducing API abuse incidents by 75%. Infrastructure team completed migration of 4 services from EC2 to EKS, reducing hosting costs by 22%. What Went Well: Cross-team collaboration between Aurora and Gateway teams for API integration was smooth. New CI/CD pipeline reduced build times from 12 to 4 minutes. What Needs Improvement: Sprint planning estimates for the Beacon team were consistently over-optimistic; recommend breaking stories into smaller chunks. Two P1 incidents during the sprint caused by insufficient staging environment testing. Action Items: Implement mandatory staging deployment checklist. Schedule estimation workshop for Beacon team. Upgrade monitoring alerts to catch memory leak patterns identified in postmortem.`,
  },
  {
    title: 'Office Relocation Announcement',
    doc_type: 'COMM', access_level: 'GENERAL', category: 'GENERAL',
    department: 'OPS', source_ref: 'COMM-006',
    content: `Nexus Dynamics Office Relocation Announcement. From: Operations Team. Date: February 1, 2026. We are excited to announce that Nexus Dynamics headquarters will be moving to a new state-of-the-art facility at 500 Innovation Drive, Building C, effective April 1, 2026. The new space is 40% larger than our current office and features an open floor plan with dedicated collaboration zones, 12 private phone booths, a fully equipped fitness center, an expanded cafeteria with subsidized meals, and electric vehicle charging stations. The building is LEED Gold certified and located 5 minutes from the Main Street transit station. Moving logistics: IT will begin shipping new desk equipment to the new office starting March 15. Employees should pack personal items using the boxes distributed on March 20. The last day at the current office is March 28. March 29-31 is a remote work period for the move. April 1 is the first day at the new location, with a welcome breakfast and office tours. Parking: The new facility has a parking garage with 300 spaces available on a first-come basis. Monthly parking passes are $75. Contact facilities@nexusdynamics.com with questions.`,
  },
];

// ================================================================

async function seed() {
  console.log('Starting seed process...');

  // 1. Truncate tables
  console.log('Truncating tables...');
  await pool.query('TRUNCATE document_chunks, documents, audit_logs RESTART IDENTITY CASCADE');

  // 2. Insert all documents
  const allDocs = [...PROJECTS, ...POLICIES, ...COMMS];
  const insertedDocs = [];

  console.log(`Inserting ${allDocs.length} documents...`);
  for (const doc of allDocs) {
    const result = await pool.query(
      `INSERT INTO documents (doc_type, title, content, category, department, effective_date, access_level, source_ref, owner, status, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        doc.doc_type,
        doc.title,
        doc.content,
        doc.category || null,
        doc.department || null,
        doc.effective_date || null,
        doc.access_level,
        doc.source_ref,
        doc.owner || null,
        doc.status || null,
        doc.tags || null,
      ]
    );
    insertedDocs.push({ id: result.rows[0].id, ...doc });
  }

  // 3. Chunk all documents
  console.log('Chunking documents...');
  const allChunks = [];
  for (const doc of insertedDocs) {
    const chunks = chunkText(doc.content);
    for (let i = 0; i < chunks.length; i++) {
      allChunks.push({ doc_id: doc.id, chunk_index: i, content: chunks[i] });
    }
  }
  console.log(`  Total chunks: ${allChunks.length}`);

  // 4. Embed all chunks
  console.log('Generating embeddings...');
  const chunkTexts = allChunks.map((c) => c.content);
  const embeddings = await embedBatch(chunkTexts);

  // 5. Insert chunks with embeddings
  console.log('Inserting chunks...');
  for (let i = 0; i < allChunks.length; i++) {
    const c = allChunks[i];
    const vectorStr = `[${embeddings[i].join(',')}]`;
    await pool.query(
      `INSERT INTO document_chunks (doc_id, chunk_index, content, embedding)
       VALUES ($1, $2, $3, $4::vector)`,
      [c.doc_id, c.chunk_index, c.content, vectorStr]
    );
  }

  // 6. Rebuild IVFFlat index and analyze
  console.log('Rebuilding IVFFlat index...');
  await pool.query('DROP INDEX IF EXISTS idx_chunks_embedding');
  await pool.query(
    'CREATE INDEX idx_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10)'
  );
  await pool.query('ANALYZE document_chunks');

  console.log('Seed complete!');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
