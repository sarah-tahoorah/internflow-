import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import TaskSubmissionModal from './TaskSubmissionModal';
import './TaskList.css';
const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const [tasksRes, submissionsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/submissions/my-submissions')
      ]);
      setTasks(tasksRes.data);
      setSubmissions(submissionsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };
  const getSubmissionStatus = (taskId) => {
    const submission = submissions.find(s => s.taskId._id === taskId);
    return submission?.status || null;
  };
  const handleSubmitClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };
  const handleSubmissionSuccess = () => {
    setShowModal(false);
    fetchData();
  };
  if (loading) return <div>Loading tasks...</div>;
  return (
    <div className="task-list-container">
      <h2>My Tasks</h2>
      {tasks.length === 0 ? (
        <p className="no-data">No tasks assigned yet.</p>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => {
            const submissionStatus = getSubmissionStatus(task._id);
            const isOverdue = new Date(task.deadline) < new Date() && !submissionStatus;
            return (
              <div key={task._id} className={`task-card ${isOverdue ? 'overdue' : ''}`}>
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="task-description">{task.description}</p>
                <div className="task-meta">
                  <span>📅 Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                </div>
                {submissionStatus ? (
                  <div className={`submission-status ${submissionStatus}`}>
                    Status: {submissionStatus.toUpperCase()}
                  </div>
                ) : (
                  <button 
                    className="btn-submit"
                    onClick={() => handleSubmitClick(task)}
                  >
                    Submit Task
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <TaskSubmissionModal
          task={selectedTask}
          onClose={() => setShowModal(false)}
          onSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};
export default TaskList;