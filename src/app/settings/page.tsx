'use client';

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function SettingsPage(): JSX.Element {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    try {
      setIsImporting(true);
      setImportResult(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setImportResult(result);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to import contacts');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import contacts');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      
      const response = await fetch('/api/contacts/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export contacts');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export contacts');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAll = async (): Promise<void> => {
    try {
      setIsDeleting(true);
      
      // This would need to be implemented as an API endpoint
      // For now, just close the dialog
      alert('Delete all functionality would be implemented here');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete contacts');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const downloadSampleCSV = (): void => {
    const csvContent = 'name,email,phone,company,job_title,group,notes\nJohn Doe,john@example.com,555-0123,Acme Corp,Manager,Customer,Sample contact';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-contacts.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1">
      <Header 
        title="Settings" 
        subtitle="Manage your ContactHub preferences and data"
      />

      <div className="p-6 max-w-4xl">
        {/* Tab-like header */}
        <div className="border-b border-border-light mb-8">
          <div className="flex space-x-8">
            <button className="py-2 px-1 border-b-2 border-primary text-primary font-medium text-sm">
              Data Management
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Import Section */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <h2 className="text-lg font-semibold text-text-main mb-4">Import Contacts</h2>
            <p className="text-text-muted mb-6">Upload a CSV file to import multiple contacts at once.</p>
            
            <div 
              onClick={handleFileSelect}
              className="border-2 border-dashed border-border-light rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-slate-400 text-xl">upload_file</span>
              </div>
              <p className="text-text-main font-medium mb-1">
                {isImporting ? 'Importing...' : 'Upload a file or drag and drop'}
              </p>
              <p className="text-text-muted text-sm">CSV up to 10MB</p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={isImporting}
            />
            
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={downloadSampleCSV}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                Download sample CSV template
              </button>
            </div>
            
            {importResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  Successfully imported {importResult.imported} contacts
                </p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-orange-700 text-sm font-medium">Errors:</p>
                    <ul className="text-orange-600 text-sm mt-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <h2 className="text-lg font-semibold text-text-main mb-4">Export Contacts</h2>
            <p className="text-text-muted mb-6">Download all your contacts as a CSV file.</p>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">download</span>
              {isExporting ? 'Exporting...' : 'Export All Contacts'}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
            <p className="text-red-700 mb-6">Permanently delete all contacts and groups. This action cannot be undone.</p>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete All Data'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAll}
        title="Delete All Data"
        message="Are you sure you want to delete all contacts and groups? This action cannot be undone and will permanently remove all your data."
        confirmText="Delete All"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}