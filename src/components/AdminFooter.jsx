import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Zombie API Discovery & Defense Platform.
        </p>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
          Defense Console v2.0
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
