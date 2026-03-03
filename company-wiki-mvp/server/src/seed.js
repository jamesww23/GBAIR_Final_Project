require('dotenv').config();

if (!process.env.OPENAI_API_KEY) {
  console.error('FATAL: OPENAI_API_KEY is required for seeding (embedding generation).');
  process.exit(1);
}

const pool = require('./db');
const { chunkText } = require('./chunking');
const { embedBatch } = require('./embeddings');

// ================================================================
//  SEED DATA — LG Electronics Inc.
//  Based on publicly available information from LG Newsroom,
//  press releases, and public filings.
// ================================================================

const PROJECTS = [
  {
    title: 'OLED evo Display Technology Program',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'PRJ-001',
    owner: 'Media Entertainment Solution Company', status: 'active', tags: ['oled', 'display', 'tv', 'ai-processor'],
    content: `The OLED evo Display Technology Program drives LG Electronics' premium display innovation across TVs, monitors, and signage products. The program centers on the Alpha 11 AI Processor, which powers features like AI Super Upscaling, AI Picture Pro, and personalized viewing recommendations. The 2025 lineup introduced Brightness Booster Ultimate technology delivering up to three times the brightness of conventional OLED panels, along with the M5 wireless OLED and the G5 Gallery series. For 2026, the program is launching the W6 Wallpaper OLED with True Wireless connectivity and Micro RGB evo technology, along with Hyper Radiant Color Technology for enhanced color volume. The flagship "In Tune" Monument installation at CES 2026 used 38 W6 OLED panels to demonstrate the ultra-thin form factor. The program also encompasses the LG QNED and NanoCell product lines that serve as volume tiers below OLED. Manufacturing is centered at the LG Display Paju and Guangzhou OLED fabrication facilities. The MS Company oversees all display product development and has expanded the product range to include lifestyle products like StanbyME portable screens and Gallery TV art displays. This program is foundational to LG's premium brand positioning and is a key contributor to the company's record revenue performance.`,
  },
  {
    title: 'webOS Smart Platform Expansion',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'PRJ-002',
    owner: 'Media Entertainment Solution Company', status: 'active', tags: ['webos', 'platform', 'software', 'content'],
    content: `The webOS Smart Platform Expansion project is evolving LG's proprietary operating system from a TV-centric platform into a unified content and services ecosystem spanning monitors, digital signage, and in-vehicle infotainment systems. webOS 25, rolled out starting Q4 2025, introduced 1440p at 120Hz support, AI Sound Mode for spatial audio simulation, an AI Art feature integrated with LG Gallery+, and enhanced Home Hub functionality connecting with the ThinQ ecosystem and Google Home. The webOS Re:New program guarantees five years of OS updates for supported TV models, which has become a key competitive differentiator. The platform generates recurring revenue through content licensing, advertising, and app partnerships. AI-powered features include AI Search for content discovery across streaming services, AI Concierge for personalized recommendations, and AI Voice Control for hands-free navigation. The project is also piloting webOS integration into LG's automotive infotainment systems through the Vehicle Solution Company, creating a consistent software experience across home and vehicle environments. The content strategy emphasizes exclusive partnerships with major streaming services and the LG Channels free ad-supported streaming offering.`,
  },
  {
    title: 'ThinQ AI Home Ecosystem',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'PRJ-003',
    owner: 'Home Appliance Solution Company', status: 'active', tags: ['thinq', 'iot', 'smart-home', 'ai'],
    content: `The ThinQ AI Home Ecosystem project manages LG's IoT smart home platform that connects and controls appliances, TVs, robots, and computing devices. The ThinQ app serves as the central hub, with ThinQ UP enabling proactive and personalized appliance management through over-the-air updates, and ThinQ Care providing predictive maintenance alerts and usage analytics. A standout feature is ThinQ Food, which uses internal refrigerator cameras and AI to track food inventory, suggest recipes based on available ingredients, and recommend grocery orders through retail partnerships. The platform integrates with the Google Home ecosystem and supports Matter protocol for third-party device interoperability. The Platform Business Center, now housed within the Home Appliance Solution Company following the 2025 organizational restructuring, is responsible for the platform's development and ecosystem expansion. ThinQ AI service launched in Europe at IFA 2025 with localized features for the European market. The platform also extends to LG Gram laptops, allowing remote device management, security features like remote lock and erase, and seamless file sharing between LG devices. The ecosystem now connects over 100 million devices globally and represents a core pillar of LG's subscription and recurring revenue strategy.`,
  },
  {
    title: 'Vehicle Solution AI Cabin Platform',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'PRJ-004',
    owner: 'Eun Seok-hyun, VS Company', status: 'active', tags: ['automotive', 'infotainment', 'ev', 'telematics'],
    content: `The Vehicle Solution AI Cabin Platform is LG's next-generation automotive cockpit system powered by the Qualcomm Snapdragon Cockpit Elite processor with integrated generative AI capabilities including vision-language models and large language models. The VS Company holds the number one worldwide market share in telematics at 23 percent as of 2025, and the platform extends this leadership into the software-defined vehicle era. Key components include the in-vehicle infotainment system with webOS integration, advanced telematics with a next-generation smart module combining TCU and antenna into a single unit (debuted at MWC Barcelona 2026), and advanced driver-assistance systems. The subsidiary portfolio includes ZKW Group (acquired 2018) for next-generation automotive lighting systems, Cybellum for vehicle cybersecurity, and LG Magna e-Powertrain, a joint venture with Magna International for EV motors, inverters, and on-board chargers. A new production facility in Hungary covering 284,000 square feet is scheduled for European production starting 2026. The platform's evolution concept has moved from software-defined vehicles to AI-defined vehicles, emphasizing the cabin as a personalized living space with the "Life's Good on the Road" brand positioning.`,
  },
  {
    title: 'AX (AI Transformation) Enterprise Initiative',
    doc_type: 'PROJECT', access_level: 'EXEC', category: 'EXEC',
    department: 'EXEC', source_ref: 'PRJ-005',
    owner: 'CEO Lyu Jae-cheol', status: 'active', tags: ['ai', 'transformation', 'exaone', 'strategy'],
    content: `The AX (AI Transformation) Enterprise Initiative is LG Electronics' company-wide strategic program to embed artificial intelligence across all products, services, and internal operations. Led directly by the CEO, the initiative operates under the "Affectionate Intelligence" brand philosophy with a "Sense-Think-Act" operating model. The technical foundation is the EXAONE large language model developed by LG AI Research, which powers both internal tools and customer-facing AI features. The LGenie internal AI assistant, initially deployed for employee productivity, is being expanded into an enterprise AI agent platform. The initiative has partnerships with Microsoft Azure AI, OpenAI for ChatGPT integration, and Google for Gemini capabilities. The program targets a 30 percent productivity improvement across the organization within two to three years. Total investment in future-growth areas including AI increased by over 40 percent in 2026 compared to the prior year. The foundational phase spanning 2021 to 2024 focused on AI research and model development, while the current commercialization phase starting in 2025 focuses on deploying AI across all four business divisions. The initiative was showcased as the centerpiece theme at CES 2026 under the banner "AI in Action." All division heads report AI integration progress quarterly to the CEO steering committee. This is classified as an executive-level strategic initiative due to competitive sensitivity around AI capabilities and investment levels.`,
  },
  {
    title: 'CLOi Robotics and Bear Robotics Integration',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'OPS', source_ref: 'PRJ-006',
    owner: 'Home Appliance Solution Company', status: 'active', tags: ['robotics', 'cloi', 'automation', 'bear-robotics'],
    content: `The CLOi Robotics program encompasses LG's expanding portfolio of commercial service robots and home robotics, significantly bolstered by the acquisition of a 51 percent majority stake in Bear Robotics in January 2025. Bear Robotics, a Silicon Valley-based AI robotics startup, specializes in autonomous indoor delivery robots deployed in restaurants, hotels, and retail environments, and is now being integrated with the existing CLOi commercial robot lineup. The CLOi series includes robots deployed for guiding, serving, and cleaning in commercial settings including hotels, airports, and retail stores. At CES 2026, LG unveiled the CLOiD humanoid home robot featuring dual seven-degree-of-freedom arms with five-fingered hands, designed for the "Zero Labor Home" vision where autonomous robots handle household tasks. Strategic robotics investments also include stakes in Figure AI, Agibot, and Dyna Robotics. The HS Robotics Lab, established within the Home Appliance Solution Company, coordinates robotics R&D across the organization. In smart factory applications, the CLOi CarryBot with 5G connectivity handles autonomous material transport. The program represents a core growth vector in LG's Future Vision 2030 strategy, bridging consumer home robotics and commercial service automation.`,
  },
  {
    title: 'Smart Factory Solutions Commercialization',
    doc_type: 'PROJECT', access_level: 'GENERAL', category: 'GENERAL',
    department: 'OPS', source_ref: 'PRJ-007',
    owner: 'Production Engineering Research Institute', status: 'active', tags: ['smart-factory', 'manufacturing', 'automation', 'ai-inspection'],
    content: `The Smart Factory Solutions Commercialization project transforms LG's internal manufacturing expertise into an external business offering. The flagship implementation at the Clarksville, Tennessee facility produces one home appliance every 11 seconds using over 200 mobile robots and 130 fixed articulated robots. Key technologies include the Autonomous Vertical Articulated Robot equipped with cameras, radar, and LiDAR for flexible manufacturing tasks, and AI-powered defect inspection systems that use computer vision for real-time quality control. The program booked over 500 billion Korean won in external orders in 2025, primarily from automakers and other manufacturers seeking to modernize their production lines. The offering includes consultation, system design, robot deployment, AI model training for defect detection, and ongoing optimization services. The Production Engineering Research Institute, which developed these capabilities for LG's own factories, now leads the commercialization effort. The Clarksville facility has become a showcase site for prospective customers, demonstrating the end-to-end smart factory concept including autonomous logistics, predictive maintenance, and real-time production analytics dashboards for plant managers. This represents LG's strategy of monetizing operational excellence as a B2B revenue stream.`,
  },
  {
    title: 'Future Vision 2030 Strategic Roadmap',
    doc_type: 'PROJECT', access_level: 'EXEC', category: 'EXEC',
    department: 'EXEC', source_ref: 'PRJ-008',
    owner: 'CEO Lyu Jae-cheol', status: 'active', tags: ['strategy', 'vision-2030', 'reorganization', 'qualitative-growth'],
    content: `Future Vision 2030 is LG Electronics' overarching corporate strategy driving the company's transformation from a hardware manufacturer to a smart life solutions provider. The strategy triggered a major organizational restructuring effective January 2025, reshaping the company from product-focused divisions into four solutions-oriented companies: Home Appliance Solution (HS), Media Entertainment Solution (MS), Vehicle Solution (VS), and the newly created Eco Solution (ES) Company for HVAC and EV charging. The strategy prioritizes qualitative growth over volume, shifting revenue mix toward high-margin B2B solutions, subscription services, and platform businesses. By 2025, these non-hardware revenue streams accounted for nearly half of total revenue. Key financial targets include the subscription business approaching 2.5 trillion Korean won (growing 29 percent year-over-year) and D2C online sales expansion through LG's brand shop. The 2025 leadership transition from CEO William Cho to Lyu Jae-cheol in December 2025 was designed to accelerate execution. LG achieved record revenue of 89.2 trillion Korean won in 2025 with operating profit of 2.48 trillion won for the second consecutive record year. The Eco Solution Company was created specifically to capture the growing B2B opportunity in AI data center cooling using liquid and immersion cooling technologies, partnering with GRC and Flex. This strategic document is classified executive-confidential as it contains forward-looking competitive positioning and acquisition pipeline details.`,
  },
];

const POLICIES = [
  {
    title: 'Global Workforce Flexibility Policy',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-001', effective_date: '2025-06-01',
    content: `LG Electronics Global Workforce Flexibility Policy. Effective June 1, 2025. This policy establishes guidelines for flexible work arrangements across all LG Electronics global offices. Eligibility: All full-time employees in corporate, R&D, and administrative roles who have completed their probationary period are eligible. Manufacturing, laboratory, and facility operations roles require on-site presence. Hybrid Schedule: Eligible employees may work remotely up to two days per week, with core in-office days on Tuesday through Thursday to ensure collaboration. Managers may adjust based on team and project needs. Equipment: LG provides company laptops and monitors for home office setup. Employees in Korea receive a home office allowance as part of the welfare benefits program. Global offices follow local equipment policies. Core Hours: All employees must be available during core collaboration hours of 10 AM to 4 PM local time regardless of location. International teams may adjust for time zone coordination with manager approval. Performance: Flexible work does not change performance expectations. The semi-annual review process applies equally to remote and on-site employees. Facility Access: LG Twin Towers in Seoul and all regional headquarters operate hot-desking systems for hybrid workers. Desk reservations are managed through the internal facilities portal.`,
  },
  {
    title: 'Compensation Structure and Benefits Overview',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-002', effective_date: '2025-01-01',
    content: `LG Electronics Compensation Structure and Benefits Overview. Salary Framework: LG uses a global job grading system aligned across all subsidiaries and regional offices. Compensation is benchmarked annually against peer companies in each market, targeting competitive positioning within the electronics and technology industry. Performance Bonuses: Annual performance incentives are tied to both individual performance ratings and company-wide financial results. The bonus pool is determined by operating profit achievement against targets. Long-term incentives for senior leadership are linked to multi-year strategic goals. Benefits (Korea HQ): National Health Insurance supplemented by LG group medical plan, company cafeteria and meal subsidies, childcare support including on-site daycare at LG Science Park, tuition support for employees' children, congratulatory and condolence payments, and comprehensive welfare points system for flexible benefits selection. Benefits (North America): Medical, dental, and vision insurance, 401(k) with company match, paid parental leave, employee purchase programs for LG products at discounted rates, and wellness programs. Employee Development: Annual learning budget per employee, access to LG Academy programs, cross-functional rotation opportunities, and language training programs for international assignments. LG's total rewards philosophy emphasizes long-term career development alongside competitive compensation.`,
  },
  {
    title: 'Performance Management and Review Process',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-003', effective_date: '2025-03-01',
    content: `LG Electronics Performance Management and Review Process. Review Cycle: Performance reviews are conducted semi-annually aligned with the fiscal calendar. The first half review covers January through June with evaluations in July, and the second half covers July through December with evaluations in January. Goal Setting: Employees set objectives at the start of each review period using the Management by Objectives framework, aligned with their division's annual targets and the company's Future Vision 2030 strategic goals. Goals are categorized as business performance, innovation contribution, and leadership or collaboration. Self-Assessment: Employees submit self-assessments two weeks before the review meeting, documenting achievements, challenges, and development areas. Multi-Source Feedback: For manager-level and above, 360-degree feedback is collected from peers, direct reports, and cross-functional collaborators. Rating System: A five-tier rating scale is used across the global organization to ensure consistency. Calibration sessions are held at the division level led by each Company head to ensure fairness across teams. Outcomes: Ratings directly inform annual salary adjustments, bonus calculations, promotion readiness assessments, and international assignment opportunities. Employees identified as high-potential are enrolled in accelerated leadership development tracks through LG Academy. Development plans are mandatory for all employees regardless of rating.`,
  },
  {
    title: 'Global Employee Onboarding Program',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-004', effective_date: '2025-01-15',
    content: `LG Electronics Global Employee Onboarding Program. Pre-Arrival: HR sends a digital welcome package one week before the start date containing IT setup instructions, organizational overview, and first-week schedule. A buddy from the same team is assigned to every new hire for the first 90 days. Week 1 Orientation: Day 1 includes a corporate orientation session covering LG's history from GoldStar to present, the Future Vision 2030 strategy, company values centered on "Life's Good," and organizational structure including the four solution companies (HS, MS, VS, ES). IT setup and information security training are completed by Day 2, including EXAONE and LGenie AI tool access provisioning. Days 3 through 5 focus on division-specific onboarding, product demonstrations, and introductions to key stakeholders. 30-Day Review: Manager check-in to assess initial integration, clarify role expectations, and address any questions. New hires also complete the LG product and technology fundamentals course through LG Academy. 60-Day Review: Deeper integration assessment including contribution to team projects and identification of skill development needs. 90-Day Milestone: Formal end of probationary period with manager evaluation. Successful completion enables eligibility for flexible work arrangements, international assignment consideration, and full benefits access.`,
  },
  {
    title: 'Diversity, Equity, and Inclusion Framework',
    doc_type: 'POLICY', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'POL-HR-005', effective_date: '2025-04-01',
    content: `LG Electronics Diversity, Equity, and Inclusion Framework. This policy is aligned with the "3Ds" pillar (Decent workplace, Diversity and inclusion, Design for all) of LG's ESG sustainability strategy. Commitment: LG Electronics is committed to building an inclusive global workplace reflecting the diversity of the 128 countries where we operate. The company's ESG framework explicitly includes diversity as a core sustainability metric. Hiring Practices: All job postings use inclusive language and are reviewed for bias. Interview panels include diverse representation. LG partners with organizations focused on underrepresented groups in technology across all major markets. Global Employee Resource Groups are supported with dedicated budgets and executive sponsorship. Accessibility: Under the "Design for all" principle, LG ensures products and workplace environments are accessible to people with disabilities. Internal facilities meet or exceed local accessibility requirements. Training: Annual unconscious bias and inclusive leadership training is mandatory for all people managers globally. Metrics and Reporting: Diversity metrics are tracked and reported in LG's annual Sustainability Report, which follows GRI and SASB standards. The Sustainability Management Council, chaired by the CEO, reviews DEI progress quarterly. LG has maintained a Top 1 percent ranking in the S&P Global Corporate Sustainability Assessment and an MSCI ESG rating of "A" for five consecutive years.`,
  },
  {
    title: 'Global Expense and Travel Reimbursement Policy',
    doc_type: 'POLICY', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'POL-FIN-001', effective_date: '2025-02-01',
    content: `LG Electronics Global Expense and Travel Reimbursement Policy. Scope: This policy covers all business-related expenses incurred by employees across global operations. Submission: All expenses must be submitted through the corporate expense management system within 30 days of the transaction. Receipts are required for all expenses. Approval Hierarchy: Expenses follow the standard approval chain based on amount thresholds set by each regional office. Cross-border travel requires both the local manager and destination country HR approval. Travel Classes: Domestic flights under 4 hours are economy class. International flights over 6 hours permit premium economy for all employees and business class for director level and above. Accommodation: Standard business hotels are booked through the corporate travel portal. Per diem rates follow local market guidelines updated annually. Entertainment and Client Meetings: Client entertainment requires pre-approval from the department head. All entertainment expenses must include attendee names, business purpose, and relationship to LG business. Non-Reimbursable Items: Personal expenses, upgrades not authorized by policy, alcohol at non-client events, and expenses without proper documentation. Currency: International expenses are reimbursed in the employee's home currency using the corporate exchange rate on the transaction date. Processing time is 10 business days after approval.`,
  },
  {
    title: 'Annual Budget Planning and Approval Process',
    doc_type: 'POLICY', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'POL-FIN-002', effective_date: '2025-01-01',
    content: `LG Electronics Annual Budget Planning and Approval Process. Fiscal Calendar: LG's fiscal year runs January through December. Annual Planning Cycle: Budget planning begins in September for the following fiscal year. Each of the four solution companies (HS, MS, VS, ES) submits comprehensive budget proposals through their CFO representatives to the corporate finance team by October 31. Budget hearings are conducted in November with the CEO and CFO reviewing each division's plans against the Future Vision 2030 strategic targets. The Board of Directors approves the consolidated budget at the December board meeting. Quarterly Business Reviews: Actual-versus-budget variance reports are prepared monthly and reviewed quarterly by the executive committee. Divisions with variance exceeding 5 percent must provide corrective action plans. Investment Approval: Capital expenditure requests above 10 billion Korean won require Board approval. R&D investment proposals are reviewed by the CTO office and prioritized against the AI transformation and core technology roadmaps. Revenue Targets: Each division sets revenue and operating profit targets aligned with the company's qualitative growth strategy, with increasing weight given to subscription revenue, B2B solutions, and platform income versus hardware unit sales. Headcount: Workforce planning is integrated into the budget process with each division head responsible for headcount justification against productivity metrics.`,
  },
  {
    title: 'Global Vendor and Procurement Policy',
    doc_type: 'POLICY', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'POL-FIN-003', effective_date: '2025-03-01',
    content: `LG Electronics Global Vendor and Procurement Policy. Vendor Selection: All vendor relationships above 500 million Korean won annually require a competitive bidding process with a minimum of three qualified suppliers. Vendor evaluations include quality capability, financial stability, ESG compliance, and alignment with LG's supply chain sustainability standards. Purchase Orders: All purchases require approved purchase orders referencing budget line items. Three-way matching of purchase order, goods receipt, and invoice is required for payment processing across all global operations. Payment Terms: Standard payment terms are Net 30 from invoice date for domestic suppliers and Net 45 for international suppliers. Strategic suppliers with multi-year contracts may negotiate Net 60 terms with CFO approval. Early payment discounts of 2 percent for Net 10 are offered where cash flow permits. Supplier Diversity: LG actively promotes supplier diversity and tracks spending with minority-owned, women-owned, and small business enterprises as part of ESG commitments. Compliance: All vendors must acknowledge LG's Supplier Code of Conduct, which covers labor rights, environmental standards, anti-corruption, and conflict mineral policies. Annual supplier audits are conducted for top-tier vendors. Risk Management: Supply chain risk assessments are performed quarterly, with particular focus on semiconductor and display component suppliers, geopolitical risk factors, and single-source dependencies.`,
  },
  {
    title: 'Revenue Recognition and Financial Reporting Standards',
    doc_type: 'POLICY', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'POL-FIN-004', effective_date: '2025-01-01',
    content: `LG Electronics Revenue Recognition and Financial Reporting Standards. Accounting Framework: LG Electronics reports consolidated financial statements under Korean International Financial Reporting Standards (K-IFRS). Revenue recognition follows IFRS 15 (Revenue from Contracts with Customers). Product Revenue: Hardware revenue for consumer electronics and home appliances is recognized upon delivery and transfer of control to the customer or distributor. Subscription Revenue: The growing subscription business, approaching 2.5 trillion Korean won in 2025, is recognized ratably over the subscription period for services including ThinQ UP, appliance care plans, and webOS content services. B2B Solutions: Vehicle Solution and Smart Factory contracts often involve multi-element arrangements. Revenue is allocated to distinct performance obligations based on standalone selling prices and recognized as obligations are satisfied, either at a point in time for hardware delivery or over time for ongoing service and support contracts. Platform Revenue: Advertising and content licensing revenue from webOS and LG Channels is recognized as advertisements are served or content is consumed. Segment Reporting: Financial results are reported by the four solution companies plus corporate functions, with additional disclosure of key growth metrics including subscription revenue, B2B revenue share, and platform revenue. External audits are conducted quarterly by the appointed external auditor in accordance with Korean securities regulations.`,
  },
  {
    title: 'Information Security and Data Protection Policy',
    doc_type: 'POLICY', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'POL-GEN-001', effective_date: '2025-05-01',
    content: `LG Electronics Information Security and Data Protection Policy. Classification: All company data is classified into four tiers: Public (press releases, marketing content), Internal (general business documents, meeting notes), Confidential (customer data, financial records, trade secrets, AI model weights), and Top Secret (strategic plans, M&A activities, unreleased product specifications). Handling Requirements: Confidential and Top Secret data must be encrypted in transit using TLS 1.3 and at rest using AES-256. Access requires role-based authorization and is subject to audit logging. AI and Model Security: EXAONE model weights and training data are classified as Confidential. LGenie usage logs are retained for 90 days for security monitoring. Employees must not input Confidential or Top Secret information into external AI services without CISO approval. Access Control: All systems use enterprise identity management with single sign-on. Multi-factor authentication is mandatory for all employees accessing internal systems. Quarterly access reviews are conducted by IT Security. Terminated employee access is revoked within 2 hours of notification. Incident Response: Security incidents must be reported to the Global Security Operations Center within 1 hour of discovery. The GSOC operates on a 24/7 basis across Seoul, Englewood Cliffs, and European offices. Data breaches involving customer personal information trigger mandatory notification procedures under GDPR, PIPA, and other applicable privacy laws. All employees complete annual cybersecurity awareness training.`,
  },
  {
    title: 'Acceptable Use and IT Equipment Policy',
    doc_type: 'POLICY', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'POL-GEN-002', effective_date: '2025-04-15',
    content: `LG Electronics Acceptable Use and IT Equipment Policy. Scope: This policy applies to all employees, contractors, and temporary staff who use LG-provided devices, networks, or systems globally. Device Standards: Company-issued devices must have full-disk encryption enabled, automatic OS updates configured, and approved endpoint protection software installed. LG Gram laptops are the standard-issue corporate device with ThinQ remote management enabled. Personal Device Policy: Personal devices may access company email and collaboration tools only through approved mobile device management enrollment. Personal devices are prohibited from accessing Confidential or Top Secret systems. Software: Only software approved by IT and available through the internal software catalog may be installed. Use of AI tools including external LLMs requires completion of the AI Responsible Use training module. Approved internal AI tools include LGenie and EXAONE-based applications. Network Security: Company internet access is monitored for security purposes. VPN is required for all remote access to internal systems. Public Wi-Fi use requires VPN activation. Intellectual Property Protection: Employees must not transfer company data to personal devices, cloud storage, or external parties without authorization. Source code, design files, and product specifications require additional data loss prevention controls. Violations of this policy may result in access revocation and disciplinary action up to and including termination.`,
  },
  {
    title: 'Intellectual Property and Innovation Policy',
    doc_type: 'POLICY', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'POL-GEN-003', effective_date: '2025-02-15',
    content: `LG Electronics Intellectual Property and Innovation Policy. Ownership: All inventions, designs, software, and works created by employees during employment or using company resources are the property of LG Electronics Inc. This includes innovations in AI, display technology, robotics, and any other field related to LG's business activities. Patent Program: LG maintains one of the largest patent portfolios in the global electronics industry. Employees must disclose all potentially patentable inventions to the IP department using the internal invention disclosure system. The company evaluates each disclosure and determines filing strategy within 60 days. Inventors receive recognition bonuses for filed patents and additional compensation for patents generating licensing revenue. Open Source: Contributions to open-source projects require pre-approval from the CTO office and IP department. Use of open-source components in products must comply with the approved license list maintained by Legal. GPL and AGPL-licensed code requires separate legal review before integration. Trade Secrets: LG's proprietary technologies including OLED manufacturing processes, EXAONE model architecture, and smart factory algorithms are classified as trade secrets. Unauthorized disclosure constitutes grounds for immediate termination and legal action. Competitive Intelligence: Employees must respect third-party intellectual property. Reverse engineering of competitor products must follow the approved clean room protocol supervised by the IP department.`,
  },
];

const COMMS = [
  {
    title: 'FY2025 Annual Results All-Hands Summary',
    doc_type: 'COMM', access_level: 'GENERAL', category: 'GENERAL',
    department: 'EXEC', source_ref: 'COMM-001',
    content: `LG Electronics FY2025 Annual Results All-Hands Meeting Summary. Date: January 28, 2026. New CEO Lyu Jae-cheol addressed the global organization following the announcement of record financial results for the second consecutive year. Revenue reached 89.2 trillion Korean won with operating profit of 2.48 trillion won. Key highlights: the subscription business grew 29 percent year-over-year approaching 2.5 trillion won; B2B solutions, non-hardware platform businesses, and D2C channels now account for nearly half of total revenue, demonstrating the success of the qualitative growth strategy. The Home Appliance Solution Company delivered strong results driven by premium product mix and ThinQ ecosystem growth. The Media Entertainment Solution Company saw OLED market share gains and webOS platform revenue expansion. The Vehicle Solution Company maintained its number one global position in telematics. CEO Lyu outlined 2026 priorities: accelerating AI integration across all product lines, expanding the Eco Solution Company's data center cooling business, growing the robotics portfolio following the Bear Robotics acquisition, and increasing investment in future growth areas by over 40 percent. The town hall concluded with a Q&A session where employees asked about the organizational changes, international expansion plans, and the CLOiD home robot timeline.`,
  },
  {
    title: 'CEO Strategy Memo – Future Vision 2030 Acceleration',
    doc_type: 'COMM', access_level: 'EXEC', category: 'EXEC',
    department: 'EXEC', source_ref: 'COMM-002',
    content: `Confidential: CEO Strategy Memo to Executive Leadership. From: CEO Lyu Jae-cheol. Date: February 2026. Subject: Accelerating Future Vision 2030 Execution. Following our record 2025 results, we must accelerate execution on three fronts. First, AI Commercialization: The EXAONE foundation model and LGenie platform must move from internal productivity tools to customer-facing revenue generators by Q3 2026. Each division head must present an AI monetization roadmap by March 15. The total future-growth investment increase of over 40 percent must be allocated with clear ROI milestones. Second, Eco Solution Scaling: The newly established ES Company must achieve profitability within 18 months. The AI data center cooling opportunity with liquid and immersion cooling is time-sensitive given hyperscaler capex cycles. Partnerships with GRC and Flex must be expanded. Third, Robotics Integration: Bear Robotics integration must be completed by Q2 2026 with a unified commercial robotics offering. The CLOiD humanoid robot development must hit its milestone targets for the Zero Labor Home vision. I am establishing a monthly CEO review cadence for these three priorities. Division heads will present progress at the first review on March 10. Our competitive window in AI-defined products is narrow, and the organizational restructuring we completed in January 2025 was specifically designed to enable faster execution. I expect each of you to leverage the new structure fully.`,
  },
  {
    title: 'Global HR Benefits Update for FY2026',
    doc_type: 'COMM', access_level: 'HR', category: 'HR',
    department: 'HR', source_ref: 'COMM-003',
    content: `LG Electronics Global HR Benefits Update for FY2026. From: Global Human Resources. Date: January 15, 2026. Key updates to employee benefits effective January 1, 2026. Korea Operations: Enhanced childcare support with expanded on-site daycare capacity at LG Science Park. Increased welfare points allocation by 10 percent to support flexible benefits selection. New mental health support program including counseling services and stress management workshops. North America: Medical plan premiums held flat for the second consecutive year. Enhanced parental leave policy now covering 16 weeks. New employee assistance program with 24/7 counseling access. Expanded LG product employee purchase program with additional discount tiers. Europe: Alignment with updated EU work-life balance directive requirements. Enhanced family leave provisions across all European subsidiaries. New sustainable commuting benefit supporting public transit and EV charging subsidies. Global Programs: All employees now receive access to the expanded LG Academy digital learning platform with over 5,000 courses including AI literacy modules. The annual learning budget has been increased to support upskilling aligned with the AX (AI Transformation) initiative. Cross-functional rotation program expanded to include ES Company positions. International assignment policies updated to reflect the four-company organizational structure.`,
  },
  {
    title: 'FY2026 Financial Planning and Investment Priorities',
    doc_type: 'COMM', access_level: 'FINANCE', category: 'FINANCE',
    department: 'FINANCE', source_ref: 'COMM-004',
    content: `FY2026 Financial Planning and Investment Priorities. From: CFO Office. To: Division CFOs and Budget Owners. Date: February 2026. Following our record FY2025 results of 89.2 trillion won revenue and 2.48 trillion won operating profit, the FY2026 plan emphasizes continued qualitative growth with improved margins. Revenue Target: The consolidated revenue target reflects continued growth in high-margin segments. The subscription business target is set at 3 trillion won, up from 2.5 trillion won in FY2025. Investment Priorities: Future-growth investment increases by over 40 percent year-over-year, directed primarily at AI capabilities (EXAONE development, AI product features), robotics (Bear Robotics integration, CLOiD development), and the Eco Solution Company's data center cooling business. Capital Expenditure: Major capex items include the VS Company Hungary production facility, smart factory upgrades for the Clarksville Tennessee plant, and OLED production capacity expansion. Margin Improvement: Each division must identify operational efficiency gains to offset investment increases. The qualitative growth mix shift (subscription, B2B, platform) should contribute to margin expansion. Operating expense growth must trail revenue growth. Budget Submissions: Division-level plans are due March 15. Quarterly business review cadence remains monthly reporting with quarterly executive reviews. Zero-based budgeting applies to all SGA categories for the second consecutive year.`,
  },
  {
    title: 'CES 2026 Showcase Recap and Product Roadmap Update',
    doc_type: 'COMM', access_level: 'GENERAL', category: 'GENERAL',
    department: 'ENG', source_ref: 'COMM-005',
    content: `CES 2026 Showcase Recap and Product Roadmap Update. From: Product Strategy Office. Date: January 20, 2026. LG Electronics' CES 2026 presence under the "Affectionate Intelligence in Action" theme generated significant media coverage and partner interest. Key showcase highlights: The CLOiD humanoid home robot was the top media story, with over 500 press mentions in the first week. The OLED evo W6 Wallpaper TV with True Wireless and Micro RGB evo technology received multiple Best of CES awards. The AI Cabin Platform demonstration with Qualcomm partnership drew strong interest from automotive OEMs. The 2026 LG Gram laptop line featuring the new Aerominum design and AI-powered productivity features was well received by enterprise buyers. The expanded xboom audio lineup targeting younger demographics performed well in social media engagement. The "In Tune" Monument installation using 38 OLED W6 panels was a centerpiece attraction. For the product roadmap: the W6 and G6 OLED models begin production in Q1 for Q2 retail availability. The AI Cabin Platform enters customer validation with three major automakers in Q1. CLOiD development continues with planned limited availability in late 2026. The Eco Solution Company's data center cooling products are scheduled for commercial launch in Q2. Teams should align their Q1 priorities with the CES momentum and customer follow-up activities.`,
  },
  {
    title: 'Sustainability Progress and 2030 ESG Targets Update',
    doc_type: 'COMM', access_level: 'GENERAL', category: 'GENERAL',
    department: 'OPS', source_ref: 'COMM-006',
    content: `LG Electronics Sustainability Progress and 2030 ESG Targets Update. From: Sustainability Management Council. Date: February 2026. LG's sustainability program under the "3Cs and 3Ds" framework continues to make strong progress toward 2030 targets. Carbon Neutrality: Scope 1 and 2 greenhouse gas emissions have decreased 40 percent since 2017, reaching 910,000 metric tons of CO2 equivalent in 2024 against a 2030 target of 878,000. The Tennessee manufacturing facility has operated on 100 percent renewable energy since 2021. LG's targets are validated by the Science Based Targets initiative. Circularity: The company achieved a 97.4 percent waste recycling rate, exceeding the 2030 target ahead of schedule. E-waste collection reached 532,630 metric tons in 2024. Product design increasingly incorporates recycled materials and designs for disassembly. Clean Technology: Investment in eco-friendly refrigerants for heat pump systems and energy-efficient product designs continues to grow through the Eco Solution Company. Recognition: LG ranks in the Top 1 percent of the S&P Global Corporate Sustainability Assessment and has maintained an MSCI ESG rating of "A" for five consecutive years. All employees are encouraged to participate in local sustainability initiatives and to consider environmental impact in product development and operational decisions. The next Sustainability Report will be published in June 2026 following GRI and SASB standards.`,
  },
];

// ================================================================

async function seed() {
  console.log('Starting seed process...');

  console.log('Truncating tables...');
  await pool.query('TRUNCATE document_chunks, documents, audit_logs RESTART IDENTITY CASCADE');

  const allDocs = [...PROJECTS, ...POLICIES, ...COMMS];
  const insertedDocs = [];

  console.log(`Inserting ${allDocs.length} documents...`);
  for (const doc of allDocs) {
    const result = await pool.query(
      `INSERT INTO documents (doc_type, title, content, category, department, effective_date, access_level, source_ref, owner, status, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        doc.doc_type, doc.title, doc.content,
        doc.category || null, doc.department || null, doc.effective_date || null,
        doc.access_level, doc.source_ref,
        doc.owner || null, doc.status || null, doc.tags || null,
      ]
    );
    insertedDocs.push({ id: result.rows[0].id, ...doc });
  }

  console.log('Chunking documents...');
  const allChunks = [];
  for (const doc of insertedDocs) {
    const chunks = chunkText(doc.content);
    for (let i = 0; i < chunks.length; i++) {
      allChunks.push({ doc_id: doc.id, chunk_index: i, content: chunks[i] });
    }
  }
  console.log(`  Total chunks: ${allChunks.length}`);

  console.log('Generating embeddings...');
  const chunkTexts = allChunks.map((c) => c.content);
  const embeddings = await embedBatch(chunkTexts);

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
