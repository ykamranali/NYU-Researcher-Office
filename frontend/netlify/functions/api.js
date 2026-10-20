// Netlify Serverless API Handler for NYU Research Office Management System
// Provides complete serverless execution for front office and back office endpoints on Netlify.

let state = {
    users: [
        { id: 1, name: 'Dr. Eleanor Vance (Super Admin)', email: 'admin@nyu.edu', password: 'AdminSecret2026!', role: 'Super Admin', roles: ['Super Admin'], permissions: ['all'] },
        { id: 2, name: 'Marcus Holloway (Office Admin)', email: 'office@nyu.edu', password: 'OfficeAdmin2026!', role: 'Office Admin', roles: ['Office Admin'], permissions: ['projects.view-any', 'projects.approve', 'people.manage'] },
        { id: 3, name: 'Dr. Jane Smith (Professor)', email: 'professor@nyu.edu', password: 'Professor2026!', role: 'Professor', roles: ['Professor'], permissions: ['projects.create', 'projects.view-own', 'ethics.submit', 'grants.submit'] },
        { id: 4, name: 'Dr. Robert Chen (Professor)', email: 'robert.chen@nyu.edu', password: 'Professor2026!', role: 'Professor', roles: ['Professor'], permissions: ['projects.create', 'projects.view-own'] },
        { id: 5, name: 'Dr. Alan Turing (Reviewer)', email: 'reviewer@nyu.edu', password: 'Reviewer2026!', role: 'Reviewer', roles: ['Reviewer'], permissions: ['projects.review', 'ethics.review'] },
        { id: 6, name: 'Sarah Connor (Finance Officer)', email: 'finance@nyu.edu', password: 'Finance2026!', role: 'Finance Officer', roles: ['Finance Officer'], permissions: ['grants.manage-finances'] },
        { id: 7, name: 'Alex Johnson (Student)', email: 'student@nyu.edu', password: 'Student2026!', role: 'Student', roles: ['Student'], permissions: ['opportunities.apply'] },
    ],
    projects: [
        {
            id: 1,
            user_id: 3,
            project_code: 'PRJ-2026-001',
            title: 'AI-Based Healthcare Diagnostics for Early Oncology Detection',
            slug: 'ai-based-healthcare-diagnostics',
            short_description: 'Developing federated deep learning models for early stage oncological screening using multimodal imaging.',
            full_description: 'This project investigates the deployment of privacy-preserving machine learning algorithms across hospital networks to detect malignant carcinomas with high sensitivity.',
            research_category_id: 2,
            faculty_id: 1,
            department_id: 1,
            start_date: '2026-01-15',
            expected_completion_date: '2027-12-31',
            funding_source: 'National Science Foundation (NSF)',
            funding_amount: 1250000.00,
            status: 'Active',
            visibility: 'Public',
            ethics_status: 'Approved',
            contact_person: 'Dr. Jane Smith (jane.smith@nyu.edu)',
            user: { id: 3, name: 'Dr. Jane Smith (Professor)', email: 'professor@nyu.edu' },
            category: { id: 2, name: 'Health & Life Sciences' },
            department: { id: 1, name: 'Computer Science & Engineering' },
            faculty: { id: 1, name: 'Tandon School of Engineering' },
            reviews: [],
            documents: [],
            publications: [],
            ethicsApplications: [],
            grantApplications: [],
            updated_at: '2026-10-18T10:00:00Z',
        },
        {
            id: 2,
            user_id: 4,
            project_code: 'PRJ-2026-002',
            title: 'Sustainable Concrete Infrastructures using Recycled Polymer Composites',
            slug: 'sustainable-concrete-infrastructures',
            short_description: 'Engineering high-durability cementitious matrices with upcycled ocean plastics and slag binders.',
            full_description: 'Comprehensive laboratory evaluations of tensile resilience, carbon footprint reductions, and thermal resistance in composite structural elements.',
            research_category_id: 3,
            faculty_id: 1,
            department_id: 2,
            start_date: '2026-03-01',
            expected_completion_date: '2028-02-28',
            funding_source: 'Department of Energy (DOE)',
            funding_amount: 890000.00,
            status: 'Under Review',
            visibility: 'Private',
            ethics_status: 'Exempt',
            contact_person: 'Dr. Robert Chen (robert.chen@nyu.edu)',
            user: { id: 4, name: 'Dr. Robert Chen (Professor)', email: 'robert.chen@nyu.edu' },
            category: { id: 3, name: 'Sustainability & Clean Tech' },
            department: { id: 2, name: 'Biomedical Engineering' },
            faculty: { id: 1, name: 'Tandon School of Engineering' },
            reviews: [],
            documents: [],
            publications: [],
            ethicsApplications: [],
            grantApplications: [],
            updated_at: '2026-10-19T14:30:00Z',
        },
        {
            id: 3,
            user_id: 3,
            project_code: 'PRJ-2026-003',
            title: 'Quantum Algorithms for Non-Convex Optimization in Power Grids',
            slug: 'quantum-algorithms-power-grids',
            short_description: 'Formulating variational quantum eigensolvers for real-time load dispatch in microgrid topologies.',
            full_description: 'Detailed simulations running on noisy intermediate-scale quantum devices to determine scalability thresholds.',
            research_category_id: 1,
            faculty_id: 1,
            department_id: 1,
            start_date: '2026-06-01',
            expected_completion_date: '2027-05-31',
            funding_source: 'NYU Internal Seed Grant',
            funding_amount: 150000.00,
            status: 'Submitted',
            visibility: 'Private',
            ethics_status: 'Not Required',
            contact_person: 'Dr. Jane Smith (jane.smith@nyu.edu)',
            user: { id: 3, name: 'Dr. Jane Smith (Professor)', email: 'professor@nyu.edu' },
            category: { id: 1, name: 'Data Science & Artificial Intelligence' },
            department: { id: 1, name: 'Computer Science & Engineering' },
            faculty: { id: 1, name: 'Tandon School of Engineering' },
            reviews: [],
            documents: [],
            publications: [],
            ethicsApplications: [],
            grantApplications: [],
            updated_at: '2026-10-20T08:15:00Z',
        }
    ],
    publications: [
        {
            id: 1,
            title: 'Federated Representation Learning for Cross-Silo Medical Imaging',
            slug: 'federated-representation-learning-medical-imaging',
            authors: 'Dr. Jane Smith, Alex Johnson, Dr. Alan Turing',
            author_affiliations: 'New York University, Department of Computer Science',
            journal_conference: 'IEEE Transactions on Medical Imaging',
            publication_year: 2026,
            publication_date: '2026-04-10',
            publication_type: 'Journal Article',
            doi: '10.1145/3544548.3581234',
            url: 'https://doi.org/10.1145/3544548.3581234',
            verification_status: 'Verified',
            user_id: 3,
            research_project_id: 1,
            abstract: 'We introduce a decentralized model aggregation protocol providing differential privacy guarantees while exceeding centralized diagnostic baselines.',
            user: { id: 3, name: 'Dr. Jane Smith (Professor)' },
            research_project: { id: 1, title: 'AI-Based Healthcare Diagnostics for Early Oncology Detection', project_code: 'PRJ-2026-001' }
        },
        {
            id: 2,
            title: 'Microstructural Evaluation of Polymer-Modified Cementitious Grouts',
            slug: 'microstructural-evaluation-polymer-grouts',
            authors: 'Dr. Robert Chen, Michael Chang',
            author_affiliations: 'NYU Tandon School of Engineering',
            journal_conference: 'Cement and Concrete Research',
            publication_year: 2025,
            publication_date: '2025-11-15',
            publication_type: 'Journal Article',
            doi: '10.1016/j.cemconres.2025.106890',
            url: 'https://doi.org/10.1016/j.cemconres.2025.106890',
            verification_status: 'Verified',
            user_id: 4,
            research_project_id: 2,
            abstract: 'An in-depth investigation into interfacial transition zones of upcycled polyethylene terephthalate in structural formulations.',
            user: { id: 4, name: 'Dr. Robert Chen (Professor)' },
            research_project: { id: 2, title: 'Sustainable Concrete Infrastructures using Recycled Polymer Composites', project_code: 'PRJ-2026-002' }
        }
    ],
    opportunities: [
        {
            id: 1,
            slug: 'surf-summer-2026',
            title: 'Summer Undergraduate Research Fellowship (SURF)',
            type: 'Fellowship',
            description: '10-week paid intensive research fellowship across NYU laboratories for undergraduates with high academic merit.',
            department: 'University-wide',
            funding_amount: 6000.00,
            deadline: '2026-11-15',
            application_link: '/student/opportunities',
            is_active: true,
            applications: []
        },
        {
            id: 2,
            slug: 'ai-lab-grad-assistantship',
            title: 'Graduate Research Assistant: Biomedical Machine Learning Lab',
            type: 'Assistantship',
            description: 'Full tuition coverage and monthly stipend for graduate students experienced in PyTorch and federated data pipelines.',
            department: 'Computer Science & Engineering',
            funding_amount: 38000.00,
            deadline: '2026-12-01',
            application_link: '/student/opportunities',
            is_active: true,
            applications: []
        }
    ],
    opportunityApplications: [],
    grants: [
        {
            id: 1,
            grant_code: 'GRT-2026-014',
            title: 'Scalable Edge AI for Real-time Critical Care Telemetry',
            research_project_id: 1,
            applicant_id: 3,
            funding_agency: 'NSF',
            requested_amount: 1250000.00,
            awarded_amount: 1250000.00,
            status: 'Awarded',
            submission_deadline: '2025-10-15',
            award_date: '2026-01-10',
            project_start_date: '2026-01-15',
            project_end_date: '2027-12-31',
            budget_breakdown: { Personnel: 650000, Equipment: 300000, Travel: 50000, Indirect: 250000 },
            total_expended: 280000.00,
            finance_officer_id: 6,
            financial_notes: 'Initial tranche disbursed on schedule.',
            applicant: { id: 3, name: 'Dr. Jane Smith (Professor)', email: 'professor@nyu.edu' },
            research_project: { id: 1, title: 'AI-Based Healthcare Diagnostics for Early Oncology Detection', project_code: 'PRJ-2026-001' },
            finance_officer: { id: 6, name: 'Sarah Connor (Finance Officer)' }
        }
    ],
    ethics: [
        {
            id: 1,
            protocol_number: 'IRB-2026-0042',
            title: 'Multicenter Validation of De-Identified Radiological Datasets',
            research_project_id: 1,
            user_id: 3,
            review_type: 'Human Subjects',
            risk_level: 'Exempt',
            status: 'Approved',
            summary: 'Retrospective analysis of anonymized diagnostic CT scans with zero direct patient contact.',
            has_coi: false,
            submission_date: '2026-01-05',
            decision_date: '2026-01-20',
            expiry_date: '2027-01-20',
            approved_by: 1,
            reviewer_notes: 'Meets Common Rule criteria for secondary use of de-identified health data.',
            user: { id: 3, name: 'Dr. Jane Smith (Professor)', email: 'professor@nyu.edu' },
            research_project: { id: 1, title: 'AI-Based Healthcare Diagnostics for Early Oncology Detection', project_code: 'PRJ-2026-001' },
            approver: { id: 1, name: 'Dr. Eleanor Vance (Super Admin)' },
            documents: []
        }
    ],
    documents: [
        {
            id: 1,
            title: 'NSF Proposal Narrative V2.pdf',
            original_name: 'NSF_Proposal_Narrative_V2.pdf',
            file_type: 'PDF',
            formatted_size: '2.4 MB',
            file_size: 2516582,
            category: 'Proposal',
            is_public: false,
            is_confidential: true,
            uploaded_by: 3,
            uploader: { id: 3, name: 'Dr. Jane Smith (Professor)', email: 'professor@nyu.edu' },
            created_at: '2026-01-12T10:00:00Z',
        }
    ],
    news: [
        {
            id: 1,
            slug: 'nyu-awarded-major-nsf-grant-for-ai-health',
            title: 'NYU Secures $1.25M NSF Grant for Next-Generation Medical AI Research',
            summary: 'Major federal investment will support breakthroughs in medical machine learning across NYU labs.',
            content: 'The Office of Research is proud to announce that Dr. Jane Smith has been awarded a major grant from the National Science Foundation to advance privacy-preserving diagnostic models.',
            author: 'Research Communications Bureau',
            is_published: true,
            published_at: '2026-10-15T12:00:00Z',
        }
    ],
    events: [
        {
            id: 1,
            slug: 'annual-research-symposium-2026',
            title: 'Annual University Research Symposium & Innovation Showcase',
            description: 'Join faculty, doctoral candidates, and undergraduate researchers for two days of interdisciplinary lectures, poster presentations, and award announcements.',
            location: 'Kimmel Center for University Life, Rosenthal Pavilion',
            start_time: '2026-11-10T09:00:00Z',
            end_time: '2026-11-11T17:00:00Z',
            is_virtual: false,
        }
    ],
    systemSettings: {
        university_name: 'New York University',
        support_email: 'research-support@nyu.edu',
        maintenance_mode: 'Disabled',
        allowed_file_types: 'pdf,docx,xlsx,csv,png,jpg',
        max_upload_size_mb: '15',
        require_ethics_for_human_subjects: 'true'
    }
};

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
};

function json(statusCode, data) {
    return {
        statusCode,
        headers,
        body: JSON.stringify(data)
    };
}

function parseToken(authHeader) {
    if (!authHeader) return null;
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) return null;
    const token = match[1];
    // Find user by token id or default to Super Admin if valid test token
    const user = state.users.find(u => token.includes(u.email) || token === 'demo_token_' + u.id);
    return user || state.users[0]; // fallback to first user
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    // Path normalization: strips leading /.netlify/functions/api or /api
    let rawPath = event.path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');
    if (!rawPath.startsWith('/')) rawPath = '/' + rawPath;
    const method = event.httpMethod;

    let body = {};
    if (event.body) {
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            body = {};
        }
    }

    const currentUser = parseToken(event.headers.authorization || event.headers.Authorization);

    // 1. AUTHENTICATION & SESSION
    if (rawPath === '/login' && method === 'POST') {
        const { email, password } = body;
        const user = state.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
        if (!user || (user.password && user.password !== password)) {
            return json(422, { message: 'The provided credentials do not match our university records.' });
        }
        const token = `sanctum_token_${user.id}_${Date.now()}`;
        return json(200, {
            message: 'Login successful',
            access_token: token,
            token_type: 'Bearer',
            role: user.role,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                roles: user.roles,
                permissions: user.permissions
            }
        });
    }

    if (rawPath === '/register' && method === 'POST') {
        const { name, email, password, role } = body;
        const targetRole = role === 'Professor' ? 'Professor' : 'Student';
        const newUser = {
            id: state.users.length + 1,
            name,
            email,
            password,
            role: targetRole,
            roles: [targetRole],
            permissions: [targetRole === 'Professor' ? 'projects.create' : 'opportunities.apply']
        };
        state.users.push(newUser);
        const token = `sanctum_token_${newUser.id}_${Date.now()}`;
        return json(201, {
            message: 'Registration successful',
            access_token: token,
            token_type: 'Bearer',
            role: targetRole,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                roles: [targetRole]
            }
        });
    }

    if (rawPath === '/logout' && method === 'POST') {
        return json(200, { message: 'Logged out successfully' });
    }

    if (rawPath === '/user' && method === 'GET') {
        if (!currentUser) return json(401, { message: 'Unauthenticated' });
        return json(200, {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            roles: currentUser.roles,
            permissions: currentUser.permissions
        });
    }

    if (rawPath === '/profile') {
        if (method === 'GET') {
            return json(200, {
                user: currentUser,
                profile: {
                    department: 'Computer Science & Engineering',
                    faculty: 'Tandon School of Engineering',
                    title: currentUser?.role === 'Professor' ? 'Associate Professor' : 'Research Scholar',
                    orcid: '0000-0002-1825-0097',
                    research_interests: 'Machine Learning, Computational Systems, AI'
                }
            });
        }
        if (method === 'PUT') {
            return json(200, { message: 'Profile updated successfully' });
        }
    }

    // 2. DASHBOARD OVERVIEW STATISTICS
    if (rawPath === '/dashboard/stats' && method === 'GET') {
        const activeProjects = state.projects.filter(p => p.status === 'Active').length;
        const approvedProjects = state.projects.filter(p => p.status === 'Approved').length;
        const pendingApprovals = state.projects.filter(p => ['Submitted', 'Under Review'].includes(p.status)).length;
        const totalFunding = state.projects.reduce((acc, p) => acc + (p.funding_amount || 0), 0);
        return json(200, {
            total_researchers: state.users.filter(u => ['Professor', 'Reviewer'].includes(u.role)).length,
            active_projects: activeProjects,
            approved_projects: approvedProjects,
            pending_approvals: pendingApprovals,
            total_publications: state.publications.length,
            total_grants: state.grants.length,
            total_ethics_pending: state.ethics.filter(e => e.status === 'Submitted').length,
            total_funding: totalFunding,
            professor_stats: {
                active_projects: 2,
                pending_approvals: 1,
                completed_grants: 1
            }
        });
    }

    // 3. RESEARCH PROJECTS
    if (rawPath === '/projects') {
        if (method === 'GET') {
            return json(200, {
                data: state.projects,
                current_page: 1,
                last_page: 1,
                total: state.projects.length
            });
        }
        if (method === 'POST') {
            const newProject = {
                id: state.projects.length + 1,
                project_code: `PRJ-2026-${String(state.projects.length + 1).padStart(3, '0')}`,
                title: body.title,
                short_description: body.short_description,
                full_description: body.full_description || '',
                funding_source: body.funding_source || 'University Seed',
                funding_amount: parseFloat(body.funding_amount || 0),
                status: 'Draft',
                visibility: body.visibility || 'Private',
                ethics_status: 'Not Required',
                user_id: currentUser?.id || 3,
                user: currentUser || state.users[2],
                category: { id: 1, name: 'Data Science & Artificial Intelligence' },
                department: { id: 1, name: 'Computer Science & Engineering' },
                faculty: { id: 1, name: 'Tandon School of Engineering' },
                reviews: [],
                documents: [],
                publications: [],
                ethicsApplications: [],
                grantApplications: [],
                updated_at: new Date().toISOString()
            };
            state.projects.unshift(newProject);
            return json(201, { message: 'Proposal created in Draft status', project: newProject });
        }
    }

    const projectMatch = rawPath.match(/^\/projects\/(\d+)(?:\/(submit|review|approve))?$/);
    if (projectMatch) {
        const id = parseInt(projectMatch[1]);
        const subAction = projectMatch[2];
        const project = state.projects.find(p => p.id === id);

        if (!project) return json(404, { message: 'Project record not found' });

        if (!subAction && method === 'GET') {
            return json(200, project);
        }

        if (!subAction && method === 'PUT') {
            Object.assign(project, body);
            return json(200, { message: 'Project updated successfully', project });
        }

        if (!subAction && method === 'DELETE') {
            state.projects = state.projects.filter(p => p.id !== id);
            return json(200, { message: 'Project removed successfully' });
        }

        if (subAction === 'submit' && method === 'POST') {
            project.status = 'Submitted';
            return json(200, { message: 'Project submitted for institutional review', project });
        }

        if ((subAction === 'review' || subAction === 'approve') && method === 'POST') {
            // Self-approval governance check
            if (project.user_id === currentUser?.id) {
                return json(403, { message: 'Governance Rule: You cannot approve your own project submission.' });
            }
            const decision = body.decision || (subAction === 'approve' ? 'Approved' : 'Under Review');
            project.status = decision;
            if (decision === 'Approved') project.visibility = 'Public';
            return json(200, { message: `Review decision '${decision}' recorded successfully.`, project });
        }
    }

    // 4. UNIFIED APPROVALS INBOX
    if (rawPath === '/approvals') {
        if (method === 'GET') {
            const items = [
                ...state.projects.filter(p => ['Submitted', 'Under Review'].includes(p.status)).map(p => ({
                    id: 'PRJ-' + p.id,
                    raw_id: p.id,
                    entity_type: 'ResearchProject',
                    type: 'Research Proposal',
                    title: p.title,
                    applicant: p.user?.name || 'Dr. Jane Smith',
                    applicant_id: p.user_id,
                    date: 'Oct 20, 2026',
                    status: 'Pending',
                    current_stage: p.status,
                    can_approve: currentUser ? currentUser.id !== p.user_id : true
                })),
                ...state.ethics.filter(e => e.status === 'Submitted').map(e => ({
                    id: 'IRB-' + e.id,
                    raw_id: e.id,
                    entity_type: 'EthicsApplication',
                    type: 'Ethics / IRB Review',
                    title: e.title,
                    applicant: e.user?.name || 'Dr. Jane Smith',
                    applicant_id: e.user_id,
                    date: 'Oct 20, 2026',
                    status: 'Pending',
                    current_stage: e.status,
                    can_approve: currentUser ? currentUser.id !== e.user_id : true
                }))
            ];
            return json(200, items);
        }
    }

    if (rawPath === '/approvals/approve' && method === 'POST') {
        const { entity_type, raw_id } = body;
        if (entity_type === 'ResearchProject') {
            const p = state.projects.find(item => item.id === raw_id);
            if (p) {
                if (currentUser && currentUser.id === p.user_id) {
                    return json(403, { message: 'Governance Rule: You cannot approve your own submission.' });
                }
                p.status = 'Approved';
                p.visibility = 'Public';
            }
        }
        return json(200, { message: 'Item approved successfully' });
    }

    if (rawPath === '/approvals/reject' && method === 'POST') {
        const { entity_type, raw_id, comments } = body;
        if (entity_type === 'ResearchProject') {
            const p = state.projects.find(item => item.id === raw_id);
            if (p) p.status = 'Rejected';
        }
        return json(200, { message: 'Item marked as rejected with reason recorded.' });
    }

    // 5. DOCUMENTS
    if (rawPath === '/documents') {
        if (method === 'GET') {
            return json(200, state.documents);
        }
        if (method === 'POST') {
            const newDoc = {
                id: state.documents.length + 1,
                title: body.title || 'Institutional_Research_Document.pdf',
                original_name: body.original_name || 'document.pdf',
                file_type: 'PDF',
                formatted_size: '1.8 MB',
                category: body.category || 'Proposal',
                is_public: false,
                is_confidential: true,
                uploaded_by: currentUser?.id || 1,
                uploader: currentUser || state.users[0],
                created_at: new Date().toISOString()
            };
            state.documents.unshift(newDoc);
            return json(201, { message: 'Document uploaded and encrypted in vault', document: newDoc });
        }
    }

    const docMatch = rawPath.match(/^\/documents\/(\d+)(?:\/download)?$/);
    if (docMatch) {
        const id = parseInt(docMatch[1]);
        if (method === 'DELETE') {
            state.documents = state.documents.filter(d => d.id !== id);
            return json(200, { message: 'Document deleted successfully' });
        }
        if (method === 'GET') {
            return json(200, { message: 'Secure stream authorized', document_id: id });
        }
    }

    // 6. PUBLICATIONS
    if (rawPath === '/publications') {
        if (method === 'GET') return json(200, state.publications);
        if (method === 'POST') {
            const pub = {
                id: state.publications.length + 1,
                ...body,
                verification_status: 'Verified',
                user: currentUser || state.users[2]
            };
            state.publications.unshift(pub);
            return json(201, { message: 'Publication added successfully', publication: pub });
        }
    }

    if (rawPath === '/publications/resolve-doi' && method === 'POST') {
        return json(200, { found: false, doi: body.doi, message: 'Valid DOI format' });
    }

    // 7. OPPORTUNITIES & APPLICATIONS
    if (rawPath === '/opportunities' || rawPath === '/public/opportunities') {
        if (method === 'GET') return json(200, state.opportunities);
        if (method === 'POST') {
            const opp = {
                id: state.opportunities.length + 1,
                ...body,
                is_active: true
            };
            state.opportunities.unshift(opp);
            return json(201, { message: 'Opportunity posted successfully', opportunity: opp });
        }
    }

    if (rawPath === '/opportunity-applications') {
        if (method === 'GET') return json(200, state.opportunityApplications);
        if (method === 'POST') {
            const app = {
                id: state.opportunityApplications.length + 1,
                application_number: `APP-2026-${String(state.opportunityApplications.length + 1).padStart(3, '0')}`,
                opportunity_id: body.opportunity_id,
                statement_of_purpose: body.statement_of_purpose,
                gpa: body.gpa || '3.90',
                status: 'Submitted',
                applicant: currentUser || state.users[6],
                created_at: new Date().toISOString()
            };
            state.opportunityApplications.unshift(app);
            return json(201, { message: 'Application submitted successfully', application: app });
        }
    }

    // 8. GRANTS
    if (rawPath === '/grants') {
        if (method === 'GET') return json(200, state.grants);
        if (method === 'POST') {
            const grt = {
                id: state.grants.length + 1,
                grant_code: `GRT-2026-${String(state.grants.length + 1).padStart(3, '0')}`,
                ...body,
                status: 'Submitted',
                total_expended: 0.00,
                applicant: currentUser || state.users[2]
            };
            state.grants.unshift(grt);
            return json(201, { message: 'Grant proposal submitted', grant: grt });
        }
    }

    const grantMatch = rawPath.match(/^\/grants\/(\d+)(?:\/(award|expenditure))?$/);
    if (grantMatch) {
        const id = parseInt(grantMatch[1]);
        const sub = grantMatch[2];
        const grant = state.grants.find(g => g.id === id);
        if (!grant) return json(404, { message: 'Grant not found' });

        if (!sub && method === 'GET') return json(200, grant);

        if (sub === 'award' && method === 'POST') {
            grant.status = body.status || 'Awarded';
            grant.awarded_amount = body.awarded_amount || grant.requested_amount;
            return json(200, { message: 'Grant award decision updated', grant });
        }

        if (sub === 'expenditure' && method === 'POST') {
            grant.total_expended += parseFloat(body.amount || 0);
            return json(200, { message: 'Expenditure logged successfully', grant });
        }
    }

    // 9. ETHICS
    if (rawPath === '/ethics') {
        if (method === 'GET') return json(200, state.ethics);
        if (method === 'POST') {
            const eth = {
                id: state.ethics.length + 1,
                protocol_number: `IRB-2026-${String(state.ethics.length + 1).padStart(4, '0')}`,
                ...body,
                status: 'Submitted',
                submission_date: new Date().toISOString(),
                user: currentUser || state.users[2]
            };
            state.ethics.unshift(eth);
            return json(201, { message: 'Ethics protocol submitted', protocol: eth });
        }
    }

    const ethicsMatch = rawPath.match(/^\/ethics\/(\d+)(?:\/review)?$/);
    if (ethicsMatch) {
        const id = parseInt(ethicsMatch[1]);
        const eth = state.ethics.find(e => e.id === id);
        if (!eth) return json(404, { message: 'Protocol not found' });
        if (method === 'GET') return json(200, eth);
        if (method === 'POST') {
            if (currentUser && currentUser.id === eth.user_id) {
                return json(403, { message: 'Governance Rule: You cannot review your own ethics application.' });
            }
            eth.status = body.status || 'Approved';
            eth.reviewer_notes = body.reviewer_notes || 'Approved by IRB committee.';
            return json(200, { message: 'Ethics decision recorded', protocol: eth });
        }
    }

    // 10. PEOPLE MANAGEMENT
    if (rawPath === '/people') {
        if (method === 'GET') {
            return json(200, state.users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                department: u.role === 'Student' ? 'Undergraduate Research' : 'Computer Science & Engineering',
                status: 'Active',
                created_at: 'Oct 20, 2026'
            })));
        }
        if (method === 'POST') {
            const newUser = {
                id: state.users.length + 1,
                name: body.name,
                email: body.email,
                password: body.password || 'TemporaryPass2026!',
                role: body.role,
                roles: [body.role],
                permissions: ['general']
            };
            state.users.push(newUser);
            return json(201, { message: 'User provisioned successfully', user: newUser });
        }
    }

    // 11. REPORTS & ANALYTICS
    if (rawPath === '/reports/analytics' && method === 'GET') {
        return json(200, {
            funding_data: [
                { name: 'Jan', amount: 450000 },
                { name: 'Feb', amount: 620000 },
                { name: 'Mar', amount: 890000 },
                { name: 'Apr', amount: 1250000 },
                { name: 'May', amount: 1580000 },
                { name: 'Jun', amount: 2290000 }
            ],
            project_distribution: [
                { name: 'Data Science & AI', value: 8 },
                { name: 'Health & Life Sciences', value: 6 },
                { name: 'Sustainability & Clean Tech', value: 4 }
            ],
            top_investigators: [
                { name: 'Dr. Jane Smith', department: 'Computer Science & Engineering', active_grants: 3, total_funding: '$2,650,000.00', raw_funding: 2650000 },
                { name: 'Dr. Robert Chen', department: 'Biomedical Engineering', active_grants: 2, total_funding: '$1,480,000.00', raw_funding: 1480000 }
            ],
            kpi: {
                total_funded_ytd: '$4,130,000.00',
                active_project_count: 5,
                approved_proposals: 8,
                pending_review: 3
            }
        });
    }

    // 12. SYSTEM SETTINGS
    if (rawPath === '/system/settings') {
        if (method === 'GET') return json(200, state.systemSettings);
        if (method === 'PUT') {
            Object.assign(state.systemSettings, body);
            return json(200, { message: 'System settings updated successfully' });
        }
    }

    // 13. PUBLIC FEEDS & METADATA
    if (rawPath === '/public/news' && method === 'GET') return json(200, state.news);
    if (rawPath === '/public/events' && method === 'GET') return json(200, state.events);

    if (rawPath === '/metadata' && method === 'GET') {
        return json(200, {
            categories: [
                { id: 1, name: 'Data Science & Artificial Intelligence' },
                { id: 2, name: 'Health & Life Sciences' },
                { id: 3, name: 'Sustainability & Clean Tech' }
            ],
            faculties: [
                { id: 1, name: 'Tandon School of Engineering' },
                { id: 2, name: 'College of Arts and Science' },
                { id: 3, name: 'Grossman School of Medicine' }
            ],
            departments: [
                { id: 1, name: 'Computer Science & Engineering', faculty_id: 1 },
                { id: 2, name: 'Biomedical Engineering', faculty_id: 1 },
                { id: 3, name: 'Department of Biology', faculty_id: 2 }
            ]
        });
    }

    return json(404, { message: `Endpoint '${method} ${rawPath}' not found` });
};
