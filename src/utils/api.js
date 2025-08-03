import axios from 'axios';
import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const REST_API_URL = import.meta.env.VITE_REST_API_URL; // REST API URL
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL; // GraphQL URL

// Create axios instance for REST API
const api = axios.create({
  baseURL: REST_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// GraphQL HTTP Link
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
});

// Auth Link for GraphQL
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Apollo Client for future GraphQL APIs
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Helper function to update jobs cache
const updateJobsCache = (newJob, operation = 'add') => {
  try {
    const cache = client.cache;
    const existingData = cache.readQuery({ query: GET_JOBS_QUERY });
    
    if (existingData) {
      let updatedJobs;
      if (operation === 'add') {
        // Add new job to the beginning of the list
        updatedJobs = [newJob, ...existingData.jobs];
      } else if (operation === 'update') {
        // Update existing job
        updatedJobs = existingData.jobs.map(job => 
          job.id === newJob.id ? newJob : job
        );
      } else if (operation === 'delete') {
        // Remove job
        updatedJobs = existingData.jobs.filter(job => job.id !== newJob.id);
      }
      
      cache.writeQuery({
        query: GET_JOBS_QUERY,
        data: { jobs: updatedJobs }
      });
    }
  } catch (error) {
    console.error('Error updating cache:', error);
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// GraphQL Queries and Mutations
const GET_JOBS_QUERY = gql`
  query GetJobs {
    jobs {
      id
      companyName
      position
      status
      appliedOn
      createdAt
    }
  }
`;

const GET_JOB_BY_ID_QUERY = gql`
  query GetJobById($id: String!) {
    job(id: $id) {
      id
      companyName
      position
      status
      appliedOn
      createdAt
    }
  }
`;

const CREATE_JOB_MUTATION = gql`
  mutation CreateJob($job_data: JobInput!) {
    createJob(jobData: $job_data) {
      job {
        id
        companyName
        position
        status
        appliedOn
        createdAt
      }
      success
      message
    }
  }
`;

const UPDATE_JOB_MUTATION = gql`
  mutation UpdateJob($id: String!, $job_data: JobUpdateInput!) {
    updateJob(id: $id, jobData: $job_data) {
      success
      message
      job {
        id
        companyName
        position
        status
        appliedOn
      }
    }
  }
`;

const DELETE_JOB_MUTATION = gql`
  mutation DeleteJob($id: String!) {
    deleteJob(id: $id) {
      success
      message
    }
  }
`;

const GET_JOB_NOTES_QUERY = gql`
  query GetJobNotes($jobId: String!) {
    jobNotes(jobId: $jobId) {
      id
      content
      reminderTime
      createdAt
    }
  }
`;

const CREATE_NOTE_MUTATION = gql`
  mutation CreateNote($noteData: NoteInput!) {
    createNote(noteData: $noteData) {
      success
      message
      note {
        id
        content
        reminderTime
        createdAt
      }
    }
  }
`;

const DELETE_NOTE_MUTATION = gql`
  mutation DeleteNote($id: String!) {
    deleteNote(id: $id) {
      success
      message
    }
  }
`;

// Auth API calls (REST)
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forget-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Jobs API calls (GraphQL)
export const jobsAPI = {
  getAll: async () => {
    try {
      const { data } = await client.query({
        query: GET_JOBS_QUERY,
        fetchPolicy: 'network-only', // Always fetch from network, not cache
      });
      
      // Transform GraphQL response to match expected field names
      const transformedJobs = data.jobs.map(job => ({
        id: job.id,
        company_name: job.companyName,
        position: job.position,
        status: job.status,
        applied_date: job.appliedOn,
        created_at: job.createdAt,
      }));
      
      return { data: transformedJobs };
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const { data } = await client.query({
        query: GET_JOB_BY_ID_QUERY,
        variables: { id },
      });
      
      // Transform GraphQL response to match expected field names
      const job = data.job;
      const transformedJob = {
        id: job.id,
        company_name: job.companyName,
        position: job.position,
        status: job.status,
        applied_date: job.appliedOn,
        created_at: job.createdAt,
      };
      
      return { data: transformedJob };
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  },
  create: async (jobData) => {
    try {
      // Transform job data to match GraphQL input format
      const graphqlJobData = {
        companyName: jobData.company_name,
        position: jobData.position,
        status: jobData.status,
        appliedOn: jobData.applied_date.split('T')[0], // Convert ISO date to YYYY-MM-DD format
      };
      
      const { data } = await client.mutate({
        mutation: CREATE_JOB_MUTATION,
        variables: { job_data: graphqlJobData },
      });
      
      if (data.createJob.success) {
        // Transform the created job to match expected format
        const createdJob = data.createJob.job;
        const transformedJob = {
          id: createdJob.id,
          company_name: createdJob.companyName,
          position: createdJob.position,
          status: createdJob.status,
          applied_date: createdJob.appliedOn,
          created_at: createdJob.createdAt,
        };
        
        // Update the cache with the new job
        updateJobsCache(transformedJob, 'add');
        
        return { data: transformedJob };
      } else {
        throw new Error(data.createJob.message || 'Failed to create job');
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  },
  update: async (id, jobData) => {
    try {
      // Transform job data to match GraphQL input format
      const graphqlJobData = {};
      
      // Only include fields that are provided (for partial updates)
      if (jobData.company_name !== undefined) {
        graphqlJobData.companyName = jobData.company_name;
      }
      if (jobData.position !== undefined) {
        graphqlJobData.position = jobData.position;
      }
      if (jobData.status !== undefined) {
        graphqlJobData.status = jobData.status;
      }
      if (jobData.applied_date !== undefined) {
        graphqlJobData.appliedOn = jobData.applied_date.split('T')[0]; // Convert ISO date to YYYY-MM-DD format
      }
      
      const { data } = await client.mutate({
        mutation: UPDATE_JOB_MUTATION,
        variables: { 
          id,
          job_data: graphqlJobData 
        },
      });
      
      if (data.updateJob.success) {
        // Transform the updated job to match expected format
        const updatedJob = data.updateJob.job;
        const transformedJob = {
          id: updatedJob.id,
          company_name: updatedJob.companyName,
          position: updatedJob.position,
          status: updatedJob.status,
          applied_date: updatedJob.appliedOn,
          // Note: createdAt is not returned by the update mutation
        };
        
        // Update the cache with the updated job
        updateJobsCache(transformedJob, 'update');
        
        return { data: transformedJob };
      } else {
        throw new Error(data.updateJob.message || 'Failed to update job');
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const { data } = await client.mutate({
        mutation: DELETE_JOB_MUTATION,
        variables: { id },
      });
      
      if (data.deleteJob.success) {
        // Update the cache by removing the deleted job
        updateJobsCache({ id }, 'delete');
        return { data: { success: true, message: data.deleteJob.message } };
      } else {
        throw new Error(data.deleteJob.message || 'Failed to delete job');
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  },
};

// Notes API calls (GraphQL)
export const notesAPI = {
  getByJobId: async (jobId) => {
    try {
      const { data } = await client.query({
        query: GET_JOB_NOTES_QUERY,
        variables: { jobId },
        fetchPolicy: 'network-only', // Always fetch fresh notes
      });
      
      return { data: data.jobNotes };
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  },
  create: async (jobId, noteData) => {
    try {
      // Transform note data to match GraphQL input format
      const graphqlNoteData = {
        jobId: jobId,
        content: noteData.content,
        reminderTime: noteData.reminder_time || null,
      };
      
      const { data } = await client.mutate({
        mutation: CREATE_NOTE_MUTATION,
        variables: { noteData: graphqlNoteData },
      });
      
      if (data.createNote.success) {
        return { data: data.createNote.note };
      } else {
        throw new Error(data.createNote.message || 'Failed to create note');
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  },
  delete: async (jobId, noteId) => {
    try {
      const { data } = await client.mutate({
        mutation: DELETE_NOTE_MUTATION,
        variables: { id: noteId },
      });
      
      if (data.deleteNote.success) {
        return { data: { success: true, message: data.deleteNote.message } };
      } else {
        throw new Error(data.deleteNote.message || 'Failed to delete note');
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  },
};

export default api; 