import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon, 
  TableCellsIcon, 
  ViewColumnsIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import { format } from 'date-fns';
import { jobsAPI } from '../utils/api';
import JobTable from '../components/JobTable';
import JobKanban from '../components/JobKanban';

const DashboardPage = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'applied_date',
    sortOrder: 'desc',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  // Check for refresh flag from navigation
  useEffect(() => {
    if (location.state?.refreshJobs) {
      fetchJobs();
      // Clear the state to prevent infinite refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll();
      setJobs(response.data);
    } catch (error) {
      setError('Failed to fetch jobs');
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        job =>
          job.company_name.toLowerCase().includes(searchTerm) ||
          job.position.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === 'applied_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredJobs(filtered);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const result = await jobsAPI.delete(jobId);
        if (result.data.success) {
          // Refresh the jobs list to ensure consistency
          fetchJobs();
        } else {
          setError(result.data.message || 'Failed to delete job');
        }
      } catch (error) {
        setError('Failed to delete job');
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusCount = (status) => {
    return jobs.filter(job => job.status === status).length;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Job Applications
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track your job applications and interviews
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/add-job"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Job
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Applied</div>
              <div className="mt-1 text-2xl font-semibold text-blue-600">{getStatusCount('applied')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Interview</div>
              <div className="mt-1 text-2xl font-semibold text-orange-600">{getStatusCount('interview')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Offer</div>
              <div className="mt-1 text-2xl font-semibold text-green-600">{getStatusCount('offer')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</div>
              <div className="mt-1 text-2xl font-semibold text-red-600">{getStatusCount('rejected')}</div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Status Filter */}
                <Menu as="div" className="relative">
                  <Menu.Button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    {filters.status || 'All Status'}
                    <ChevronDownIcon className="h-4 w-4 ml-2" />
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleFilterChange('status', '')}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        >
                          All Status
                        </button>
                      )}
                    </Menu.Item>
                    {['applied', 'interview', 'offer', 'rejected'].map((status) => (
                      <Menu.Item key={status}>
                        {({ active }) => (
                          <button
                            onClick={() => handleFilterChange('status', status)}
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-700' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 capitalize`}
                          >
                            {status}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Menu>

                {/* Sort */}
                <Menu as="div" className="relative">
                  <Menu.Button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Sort by {filters.sortBy === 'applied_date' ? 'Date' : 'Company'}
                    <ChevronDownIcon className="h-4 w-4 ml-2" />
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleFilterChange('sortBy', 'applied_date')}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        >
                          Date Applied
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleFilterChange('sortBy', 'company_name')}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        >
                          Company Name
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <TableCellsIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-md ${
                      viewMode === 'kanban'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <ViewColumnsIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        {viewMode === 'table' ? (
          <JobTable 
            jobs={filteredJobs} 
            onDelete={handleDeleteJob}
            onRefresh={fetchJobs}
          />
        ) : (
          <JobKanban 
            jobs={filteredJobs} 
            onDelete={handleDeleteJob}
            onRefresh={fetchJobs}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 