import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const offices = [
    {
      title: 'Research Operations',
      description: 'The Research Operations Department at NYU supports the full lifecycle of research activities, from securing funding to ensuring compliance for successful project execution. The department manages pre- and post-award processes, sponsored research agreements, non-disclosure...',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      link: '/login'
    },
    {
      title: 'Research Excellence and Impact',
      description: 'The Research Excellence and Impact Department plays a vital role in shaping NYU\'s research direction and measuring its impact. By guiding strategic initiatives and delivering a strategic grants portfolio, the Department assists faculty in maximizing their research footprint.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      link: '/login'
    },
    {
      title: 'Research Computing',
      description: 'The Research Computing department provides advanced stable and reliable computing services and resources to NYU researchers across all disciplines. In addition to managing high-performing computational infrastructure, the department offers expert advice, training, and...',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      link: '/login'
    },
    {
      title: 'Research Labs',
      description: 'NYU\'s Research Laboratories Office provides an environment for increased alignment of research infrastructure investment to the University\'s strategic research priorities for its centers as well as individual faculty. The office oversees many specialized shared and...',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      link: '/login'
    },
    {
      title: 'Technology, Management & Innovation',
      description: 'The Office of Technology Management & Innovation is responsible for the protection, management and commercialization of the University\'s research discoveries. We work closely with faculty, researchers and students to identify transformational inventions and translate these...',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      link: '/login'
    },
    {
      title: 'Research Administrative Support',
      description: 'The Research Administration Office plays a key role in supporting NYU\'s research ecosystem. The team works closely with the Associate Provost for Research, directors of R&D departments and the research centres\', ensuring a smooth...',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      link: '/login'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-white">
      
      {/* Banner Section matching KU's exact structure */}
      <div 
        className="relative w-full h-[400px] md:h-[500px] bg-cover bg-center flex flex-col justify-end"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')` }}
      >
        <div className="absolute inset-0 bg-nyu-deep/60 mix-blend-multiply"></div>
        
        <div className="relative z-10 w-full">
          <div className="container mx-auto px-4 md:px-8 xl:max-w-6xl pb-10">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">Research Offices</h1>
          </div>
          
          <div className="bg-black/50 backdrop-blur-sm border-t border-white/20 py-3">
            <div className="container mx-auto px-4 md:px-8 xl:max-w-6xl">
              <div className="text-sm font-medium text-white flex items-center space-x-2">
                <Link to="/" className="hover:text-nyu-light transition-colors">Home</Link>
                <span>|</span>
                <Link to="/" className="hover:text-nyu-light transition-colors">Research Office</Link>
                <span>|</span>
                <span className="text-nyu-very-light">Research Offices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container for the blocks */}
      <div className="container mx-auto px-4 md:px-8 xl:max-w-6xl py-16">
        <div className="flex flex-col gap-12 md:gap-16">
          
          {offices.map((office, index) => {
            // KU alternates images left/right conceptually, or puts them side-by-side. 
            // We will alternate them for a premium look, or keep them consistent. Let's alternate.
            const isEven = index % 2 === 0;
            
            return (
              <div key={index} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
                
                {/* Text Details */}
                <div className="w-full md:w-1/2 flex flex-col items-start justify-center">
                  <h4 className="text-3xl font-heading font-bold text-gray-900 mb-4 pb-2 border-b-2 border-nyu-primary inline-block">
                    {office.title}
                  </h4>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    {office.description}
                  </p>
                  <Link 
                    to={office.link} 
                    className="px-6 py-3 bg-nyu-primary text-white font-bold rounded hover:bg-nyu-deep transition-colors text-sm tracking-wide uppercase"
                  >
                    View more
                  </Link>
                </div>

                {/* Image */}
                <div className="w-full md:w-1/2">
                  <div className="overflow-hidden rounded-lg shadow-lg aspect-video md:aspect-[4/3]">
                    <img 
                      src={office.image} 
                      alt={office.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
                
              </div>
            );
          })}
          
        </div>
      </div>
      
    </div>
  );
};

export default Home;
