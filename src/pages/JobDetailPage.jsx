import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { jobsAPI, notesAPI } from '../utils/api';
import AddNoteModal from '../components/AddNoteModal';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    fetchJobAndNotes();
  }, [id]);

  const fetchJobAndNotes = async () => {
    try {
      setLoading(true);
      const [jobResponse, notesResponse] = await Promise.all([
        jobsAPI.getById(id),
        notesAPI.getByJobId(id)
      ]);
      setJob(jobResponse.data);
      setNotes(notesResponse.data);
    } catch (error) {
      setError('Failed to fetch job details');
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        const result = await jobsAPI.delete(id);
        if (result.data.success) {
          navigate('/dashboard', { state: { refreshJobs: true } });
        } else {
          setError(result.data.message || 'Failed to delete job');
        }
      } catch (error) {
        setError('Failed to delete job');
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleAddNote = async (noteData) => {
    try {
      const response = await notesAPI.create(id, noteData);
      setNotes([...notes, response.data]);
      setShowAddNote(false);
    } catch (error) {
      setError('Failed to add note');
      console.error('Error adding note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const result = await notesAPI.delete(id, noteId);
        if (result.data.success) {
          setNotes(notes.filter(note => note.id !== noteId));
        } else {
          setError(result.data.message || 'Failed to delete note');
        }
      } catch (error) {
        setError('Failed to delete note');
        console.error('Error deleting note:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      applied: 'status-applied',
      interview: 'status-interview',
      offer: 'status-offer',
      rejected: 'status-rejected',
    };

    return (
      <span className={`${statusClasses[status]} capitalize`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Job not found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The job you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {job.position}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {job.company_name}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Link
                to={`/edit-job/${id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDeleteJob}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Job Details
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</p>
                      <p className="text-sm text-gray-900 dark:text-white">{job.company_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</p>
                      <p className="text-sm text-gray-900 dark:text-white">{job.position}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applied Date</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(job.applied_date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5 text-gray-400 mt-0.5 flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notes
                  </h2>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      No notes yet
                    </p>
                    <button
                      onClick={() => setShowAddNote(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Note
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white mb-1">
                              {note.content}
                            </p>
                            {note.reminder && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Reminder: {format(new Date(note.reminder), 'MMM dd, yyyy HH:mm')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="ml-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNote && (
        <AddNoteModal
          onClose={() => setShowAddNote(false)}
          onSubmit={handleAddNote}
        />
      )}
    </div>
  );
};

export default JobDetailPage; 