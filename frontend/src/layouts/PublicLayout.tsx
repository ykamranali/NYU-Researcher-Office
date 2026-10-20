import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';

const PublicLayout = () => {
    const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

    const megaMenus = {
        admissions: {
            title: 'Admissions',
            left: ["Undergraduate Admissions", "Postgraduate Admissions", "Scholarships", "International Students"],
            right: ["Tuition & Fees", "Visit Campus", "Contact Admissions", "Apply Now"]
        },
        academics: {
            title: 'Academics',
            left: ["Colleges", "Programs", "Academic Calendar", "Library"],
            right: ["Center for Teaching and Learning", "General Education Unit", "Accreditation", "Khazna Repository"]
        },
        research: {
            title: 'Research Office',
            left: ["Research Overview", "Research Offices", "R&D Facilities", "Research Centers"],
            right: ["Technology, Management & Innovation", "Research Groups & Labs", "University Research Council", "Grants & Funding"]
        },
        studentLife: {
            title: 'Student Life',
            left: ["Campus Life", "Resident Life", "Career And Alumni Services"],
            right: ["Student Success", "Clubs & Associations", "Student Events"]
        },
        news: {
            title: 'News & Events',
            left: ["Events Calendar", "News", "Press Kit"],
            right: ["Brand Guidelines", "Newsletters and Publications", "Hosted Conferences"]
        },
        outreach: {
            title: 'Outreach',
            left: ["Community Engagement", "Industry Partnerships", "Alumni Network"],
            right: ["Corporate Training", "Sponsorships", "Volunteer Programs"]
        },
        about: {
            title: 'About',
            left: [
                "Leadership",
                "Provost Office",
                "Research & Development Office",
                "Living in Abu Dhabi",
                "Strategic Partnerships",
                "Sustainability",
                "ISO Certificates"
            ],
            right: [
                "Achievements & Rankings",
                "Campus",
                "Ethics & Compliance",
                "FAQs",
                "Environment Health and Safety Campus",
                "Organizational Chart",
                "Risk Management @ NYU"
            ]
        }
    };

    const navKeys = Object.keys(megaMenus) as Array<keyof typeof megaMenus>;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white relative">
            
            {/* Top Bar with Search */}
            <div className="bg-white py-4 px-6 md:px-12 flex justify-between items-center border-b border-gray-200 relative z-20">
                <Link to="/" className="flex flex-col">
                    <span className="text-3xl font-heading font-black tracking-tight text-nyu-deep uppercase">NYU</span>
                    <span className="text-sm font-bold text-gray-500 tracking-widest uppercase">Office of Research</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <div className="relative hidden md:block">
                        <input type="text" placeholder="search here" className="pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-nyu-primary text-sm w-64" />
                        <button className="absolute right-3 top-2.5 text-gray-400 hover:text-nyu-primary">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                    <Link to="/login" className="hidden md:inline-flex px-6 py-2 bg-nyu-primary text-white font-bold rounded-full hover:bg-nyu-deep transition-colors text-sm uppercase tracking-wide">
                        Portal Login
                    </Link>
                    <button className="md:hidden text-gray-800">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Mega-Menu Navigation (KU Style) */}
            <nav className="bg-[#1f4c82] text-white relative z-50 shadow-md">
                <div className="container mx-auto px-4 md:px-8">
                    <ul className="flex flex-wrap items-center justify-between xl:justify-center xl:space-x-8 text-xs md:text-sm font-bold uppercase tracking-wider h-auto min-h-[3.5rem] w-full py-2 xl:py-0">
                        {navKeys.map((key, index) => (
                            <React.Fragment key={key}>
                                <li 
                                    className="h-full min-h-[3.5rem] flex items-center cursor-pointer hover:bg-nyu-deep/10"
                                    onMouseEnter={() => setActiveMegaMenu(key)}
                                    onMouseLeave={() => setActiveMegaMenu(null)}
                                >
                                    <Link 
                                        to={key === 'research' ? '/' : '#'} 
                                        className={`px-3 py-2 hover:text-gray-300 transition-colors ${activeMegaMenu === key ? 'text-gray-300' : ''}`}
                                    >
                                        {megaMenus[key].title}
                                    </Link>
                                    
                                    {/* Dropdown specific to the hovered item */}
                                    {activeMegaMenu === key && (
                                        <div className="absolute top-full left-0 w-full bg-[#0d2a4a] text-white shadow-2xl py-12 border-t border-white/10 cursor-default" 
                                             style={{ 
                                                backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')", 
                                                backgroundBlendMode: 'multiply' 
                                             }}
                                        >
                                            <div className="container mx-auto px-4 md:px-8 xl:max-w-6xl">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-0 w-full md:w-3/4">
                                                    
                                                    {/* Column 1 */}
                                                    <ul className="flex flex-col">
                                                        {megaMenus[key].left.map((link, idx) => (
                                                            <li key={idx} className="border-b border-dotted border-white/20">
                                                                <Link to="#" className="block py-4 hover:text-nyu-light hover:translate-x-1 transition-all text-[13px] capitalize tracking-normal text-left">
                                                                    {link}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    
                                                    {/* Column 2 */}
                                                    <ul className="flex flex-col">
                                                        {megaMenus[key].right.map((link, idx) => (
                                                            <li key={idx} className="border-b border-dotted border-white/20">
                                                                <Link to="#" className="block py-4 hover:text-nyu-light hover:translate-x-1 transition-all text-[13px] capitalize tracking-normal text-left">
                                                                    {link}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                                {index < navKeys.length - 1 && (
                                    <span className="text-white/30 hidden md:inline">|</span>
                                )}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="text-white mt-auto">
                {/* Main Footer Content */}
                <div className="bg-[#0b213b] py-16 px-6 md:px-12 relative overflow-hidden">
                    {/* Background Building Image Blend */}
                    <div className="absolute inset-0 right-0 opacity-20 bg-right bg-no-repeat bg-contain" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')", mixBlendMode: 'screen' }}></div>
                    
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
                        
                        {/* Left Column (Wider) */}
                        <div className="md:col-span-8 flex flex-col space-y-12">
                            
                            {/* Contact Info Row */}
                            <div className="flex flex-col md:flex-row justify-between text-sm items-start md:items-center space-y-4 md:space-y-0 md:pr-12">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 mt-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <div>
                                        <p>P.O. Box: 123456,</p>
                                        <p>New York, USA</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                                    <a href="#" className="hover:text-nyu-light transition-colors">Reach us</a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    <span>T: +1 (212) 998-1212</span>
                                </div>
                            </div>

                            {/* Newsletter */}
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-wider mb-6">Get The Latest News From New York University</h3>
                                <div className="flex border-b border-gray-500 pb-1 w-full max-w-2xl">
                                    <input 
                                        type="email" 
                                        placeholder="ENTER YOUR EMAIL ADDRESS" 
                                        className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-400 py-2"
                                    />
                                    <button className="bg-[#1f4c82] hover:bg-nyu-primary text-white text-xs font-bold px-6 py-2 uppercase tracking-wide transition-colors whitespace-nowrap">
                                        Subscribe
                                    </button>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-wider mb-4">Social Links</h3>
                                <div className="flex space-x-4">
                                    {/* SVG Icons for Socials */}
                                    <a href="#" className="hover:text-nyu-light transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z"/></svg></a>
                                    <a href="#" className="hover:text-nyu-light transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 6.186a2.668 2.668 0 00-1.879-1.889C18.043 3.843 12 3.843 12 3.843s-6.043 0-7.703.454a2.667 2.667 0 00-1.88 1.889C2.012 7.854 2.012 12 2.012 12s0 4.146.405 5.814a2.668 2.668 0 001.88 1.889c1.66.446 7.703.446 7.703.446s6.043 0 7.703-.446a2.667 2.667 0 001.879-1.889c.405-1.668.405-5.814.405-5.814s0-4.146-.405-5.814zM9.957 15.008V8.992L15.343 12l-5.386 3.008z"/></svg></a>
                                    <a href="#" className="hover:text-nyu-light transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                                    <a href="#" className="hover:text-nyu-light transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
                                    <a href="#" className="hover:text-nyu-light transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Links) */}
                        <div className="md:col-span-4">
                            <h3 className="text-xl font-bold uppercase tracking-wider mb-6">Other Links</h3>
                            <ul className="space-y-3 text-[13px] tracking-wide">
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">Colleges</Link></li>
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">Research</Link></li>
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">University Leadership</Link></li>
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">Partnership</Link></li>
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">Achievements & Rankings</Link></li>
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">General FAQ</Link></li>
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">Covid 19</Link></li>
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">Center For Teaching And Learning (CTL)</Link></li>
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">Technology, Management & Innovation</Link></li>
                                <li className="flex items-center"><span className="w-1 h-1 rounded-full bg-white mr-3"></span><Link to="#" className="hover:text-nyu-light transition-colors">Open Data</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom Strip */}
                <div className="bg-[#031326] py-6 px-6 md:px-12">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs tracking-wide">
                        <p className="mb-4 md:mb-0 uppercase">COPYRIGHT {new Date().getFullYear()} - NEW YORK UNIVERSITY | ALL RIGHTS RESERVED</p>
                        
                        <div className="flex items-center space-x-6">
                            {/* Dummy ISO Logos */}
                            <div className="flex items-center border border-white rounded-full px-4 py-2 space-x-4">
                                <div className="text-[10px] text-center border-r border-white/30 pr-4">
                                    <div className="font-bold">ISO 45001</div>
                                    <div className="text-gray-400">Occupational<br/>Health and Safety</div>
                                </div>
                                <div className="text-[10px] text-center border-r border-white/30 pr-4">
                                    <div className="font-bold">ISO 14001</div>
                                    <div className="text-gray-400">Environmental<br/>Management</div>
                                </div>
                                <div className="text-[10px] text-center border-r border-white/30 pr-4">
                                    <div className="font-bold">ISO 50001</div>
                                    <div className="text-gray-400">Energy<br/>Management</div>
                                </div>
                                <div className="font-bold text-lg">ISO</div>
                            </div>
                            
                            {/* Floating Chat Button */}
                            <button className="fixed bottom-6 right-6 bg-[#007bff] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-2xl z-50 transition-colors">
                                Chat with NYU
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
