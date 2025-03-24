
/**
 * Utility for parsing CSV files and converting them to course objects
 */

import { Course } from '@/types/database';
import { transformCourseData } from './courseTransforms';

/**
 * Parse CSV text content into array of objects with headers as keys
 */
export const parseCSV = (csvText: string): Record<string, string>[] => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
  // Extract headers from the first line
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Parse data rows
  const results: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',').map(cell => cell.trim());
    
    // Skip if line has fewer values than headers
    if (currentLine.length < headers.length) continue;
    
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = currentLine[index];
    });
    
    results.push(obj);
  }
  
  return results;
};

/**
 * Convert CSV data to Course objects
 */
export const csvToCourses = (csvData: Record<string, string>[]): Course[] => {
  return csvData.map((row, index) => {
    // Map CSV fields to course properties
    const courseData = {
      course_id: parseInt(row.course_id || String(Date.now() + index), 10),
      course_title: row.course_title || row.title || 'Untitled Course',
      subject: row.subject || row.category || row.description || '',
      url: row.url || row.thumbnail || '',
      level: row.level || 'Beginner',
      price: row.price || '0',
      num_lectures: parseInt(row.num_lectures || '0', 10),
      num_subscribers: parseInt(row.num_subscribers || '0', 10),
      num_reviews: parseInt(row.num_reviews || '0', 10),
      is_paid: row.is_paid === 'true' || false,
      content_duration: parseFloat(row.content_duration || '0'),
      published_timestamp: row.published_timestamp || new Date().toISOString()
    };
    
    // Transform to standardized Course object
    return transformCourseData(courseData);
  });
};

/**
 * Validate if CSV has required headers for courses
 */
export const validateCourseCSV = (headers: string[]): boolean => {
  const requiredHeaders = ['course_id', 'course_title'];
  return requiredHeaders.every(header => 
    headers.some(h => h.toLowerCase() === header.toLowerCase())
  );
};

/**
 * Process a CSV file and return Course objects
 */
export const processCSVFile = (file: File): Promise<Course[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedData = parseCSV(csvText);
        
        if (parsedData.length === 0) {
          reject(new Error('CSV file is empty or improperly formatted'));
          return;
        }
        
        // Validate headers
        const headers = Object.keys(parsedData[0]);
        if (!validateCourseCSV(headers)) {
          reject(new Error('CSV file missing required columns: course_id, course_title'));
          return;
        }
        
        const courses = csvToCourses(parsedData);
        resolve(courses);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading CSV file'));
    };
    
    reader.readAsText(file);
  });
};
