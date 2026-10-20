import React from 'react';
import { Construction } from 'lucide-react';

const ComingSoon = ({ title = "Feature Coming Soon" }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-gray-500">
      <Construction className="w-16 h-16 text-nyu-primary mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md text-center">
        This section of the Research Office Portal is currently under development. 
        Please check back later in the next phase of deployment.
      </p>
    </div>
  );
};

export default ComingSoon;
