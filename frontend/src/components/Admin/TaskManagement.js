import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import CreateTaskModal from './CreateTaskModal';
import './TaskManagement.css';
const TaskManagement = ({ onUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTasks();
  }, []);
  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };
  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await API.delete(`/tasks/${taskId}`);
        fetchTasks();
        onUpdate();
      } catch (error) {
        alert('Failed to delete task');
      }
    }
  };
  const handleEdit = (task) => {
    setEditTask(task);
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false);
    setEditTask(null);
  };
  const handleSuccess = () => {
    fetchTasks();
    onUpdate();
    handleModalClose();
  };
  if (loading) return <div>Loading tasks...</div>;
  return (
    <div className="task-management">
      <div className="section-header">
        <h2>Task Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Create Task
        </button>
      </div>
      {tasks.length === 0 ? (
        <p className="no-data">No tasks created yet.</p>
      ) : (
        <div className="admin-tasks-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Deadline</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td className="description-cell">{task.description}</td>
                  <td>{new Date(task.deadline).toLocaleDateString()}</td>
                  <td>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>{task.assignedTo?.length || 0} interns</td>
                  <td>
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(task._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <CreateTaskModal
          task={editTask}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};
export default TaskManagement;