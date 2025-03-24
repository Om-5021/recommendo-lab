
import React from 'react';
import Navbar from '@/components/Navbar';
import CSVImporter from '@/components/CSVImporter';

const CourseImport = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8">Course Import</h1>
        <div className="grid gap-8 md:grid-cols-1">
          <CSVImporter />
        </div>
      </main>
    </div>
  );
};

export default CourseImport;
