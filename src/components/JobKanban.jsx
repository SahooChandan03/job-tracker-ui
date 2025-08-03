import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { jobsAPI } from '../utils/api';

const JobKanban = ({ jobs, onDelete, onRefresh }) => {
  const [columns, setColumns] = useState({
    applied: {
      title: 'Applied',
      color: 'blue',
      jobs: jobs.filter(job => job.status === 'applied')
    },
    interview: {
      title: 'Interview',
      color: 'orange',
      jobs: jobs.filter(job => job.status === 'interview')
    },
    offer: {
      title: 'Offer',
      color: 'green',
      jobs: jobs.filter(job => job.status === 'offer')
    },
    rejected: {
      title: 'Rejected',
      color: 'red',
      jobs: jobs.filter(job => job.status === 'rejected')
    }
  });

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    if (sourceColumn === destColumn) {
      // Moving within the same column
      const newJobs = Array.from(sourceColumn.jobs);
      const [removed] = newJobs.splice(source.index, 1);
      newJobs.splice(destination.index, 0, removed);

      const newColumn = {
        ...sourceColumn,
        jobs: newJobs
      };

      setColumns({
        ...columns,
        [source.droppableId]: newColumn
      });
    } else {
      // Moving between columns
      const sourceJobs = Array.from(sourceColumn.jobs);
      const destJobs = Array.from(destColumn.jobs);
      const [removed] = sourceJobs.splice(source.index, 1);
      destJobs.splice(destination.index, 0, removed);

      const newSourceColumn = {
        ...sourceColumn,
        jobs: sourceJobs
      };

      const newDestColumn = {
        ...destColumn,
        jobs: destJobs
      };

      setColumns({
        ...columns,
        [source.droppableId]: newSourceColumn,
        [destination.droppableId]: newDestColumn
      });

      // Update job status in backend
      try {
        const job = jobs.find(j => j.id.toString() === draggableId);
        if (job) {
          await jobsAPI.update(job.id, {
            ...job,
            status: destination.droppableId
          });
        }
      } catch (error) {
        console.error('Error updating job status:', error);
        // Revert the change if update fails
        onRefresh();
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

  const JobCard = ({ job, index }) => (
    <Draggable draggableId={job.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3 ${
            snapshot.isDragging ? 'shadow-lg transform rotate-2' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              {job.company_name}
            </h3>
            <div className="flex items-center space-x-1">
              <Link
                to={`/job/${job.id}`}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="View Details"
              >
                <EyeIcon className="h-3 w-3" />
              </Link>
              <Link
                to={`/edit-job/${job.id}`}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Edit Job"
              >
                <PencilIcon className="h-3 w-3" />
              </Link>
              <button
                onClick={() => onDelete(job.id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete Job"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {job.position}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(job.applied_date), 'MMM dd, yyyy')}
            </span>
            {getStatusBadge(job.status)}
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {column.title}
              </h3>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                {column.jobs.length}
              </span>
            </div>
            
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] ${
                    snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {column.jobs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 dark:text-gray-500 mb-2">
                        <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No jobs in this status
                      </p>
                    </div>
                  ) : (
                    column.jobs.map((job, index) => (
                      <JobCard key={job.id} job={job} index={index} />
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default JobKanban; 