
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { processCSVFile } from '@/utils/csvParser';
import { Course } from '@/types/database';
import { supabase } from '@/lib/supabase';

const CSVImporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
    courses?: Course[];
  }>({ status: null, message: '' });
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResult({ status: null, message: '' });
    } else {
      setFile(null);
      setUploadResult({
        status: 'error',
        message: 'Please select a valid CSV file'
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a CSV file to import',
      });
      return;
    }

    setIsUploading(true);
    setUploadResult({ status: null, message: '' });

    try {
      // Process the CSV file and convert to course objects
      const courses = await processCSVFile(file);
      
      // Store imported courses in supabase
      let successCount = 0;
      let failCount = 0;
      
      // Process each course sequentially to avoid rate limiting
      for (const course of courses) {
        try {
          const { error } = await supabase
            .from('courses')
            .upsert({
              course_id: course.course_id,
              course_title: course.course_title,
              subject: course.subject,
              url: course.url,
              level: course.level,
              price: course.price,
              num_lectures: course.num_lectures,
              num_subscribers: course.num_subscribers,
              num_reviews: course.num_reviews,
              is_paid: course.is_paid,
              content_duration: course.content_duration,
              published_timestamp: course.published_timestamp
            });

          if (error) {
            console.error('Error inserting course:', error);
            failCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Error processing course:', err);
          failCount++;
        }
      }

      // Show results
      setUploadResult({
        status: 'success',
        message: `Successfully imported ${successCount} courses. Failed: ${failCount}`,
        courses
      });
      
      toast({
        title: 'Import completed',
        description: `Successfully imported ${successCount} courses. Failed: ${failCount}`,
      });
    } catch (error) {
      console.error('Error processing CSV:', error);
      setUploadResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border shadow-sm">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight">Import Courses from CSV</h3>
        <p className="text-sm text-muted-foreground">
          Upload a CSV file with course data to import into the database.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label htmlFor="csv-file" className="text-sm font-medium">
            CSV File
          </label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Required columns: course_id, course_title
          </p>
        </div>
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className="w-full max-w-sm"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload and Import
            </>
          )}
        </Button>
      </div>
      
      {uploadResult.status && (
        <Alert variant={uploadResult.status === 'error' ? 'destructive' : 'default'}>
          {uploadResult.status === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertTitle>
            {uploadResult.status === 'error' ? 'Error' : 'Success'}
          </AlertTitle>
          <AlertDescription>{uploadResult.message}</AlertDescription>
          
          {uploadResult.status === 'success' && uploadResult.courses && (
            <div className="mt-2">
              <p className="text-sm font-medium mt-2">Imported {uploadResult.courses.length} courses</p>
              <div className="mt-2 max-h-40 overflow-y-auto text-xs bg-muted p-2 rounded">
                {uploadResult.courses.slice(0, 5).map((course, idx) => (
                  <div key={idx} className="pb-1">
                    {course.course_title} (ID: {course.course_id})
                  </div>
                ))}
                {uploadResult.courses.length > 5 && (
                  <div className="italic">...and {uploadResult.courses.length - 5} more</div>
                )}
              </div>
            </div>
          )}
        </Alert>
      )}
      
      <div className="text-xs text-muted-foreground border-t pt-4">
        <p className="font-medium">CSV Format Example:</p>
        <pre className="mt-1 bg-muted p-2 rounded overflow-x-auto">
          course_id,course_title,subject,level,url,price,num_lectures,content_duration,is_paid
          1001,Introduction to React,Web Development,Beginner,https://example.com/image.jpg,29.99,12,120,true
        </pre>
      </div>
    </div>
  );
};

export default CSVImporter;
