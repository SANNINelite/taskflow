import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LogOut, Plus, Search, Filter, CheckCircle, Clock, Play, Trash2, Edit,
  Shield, CheckSquare, ClipboardList, AlertCircle, X, Users, RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  
  // State variables
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Create New Task');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('pending');
  const [editingTaskId, setEditingTaskId] = useState(null);

  // General message alerts
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Fetch all tasks
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data);
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Could not fetch tasks.');
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch all registered users (Admin only)
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve users. Access restricted.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const triggerAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setModalTitle('Create New Task');
    setTaskTitle('');
    setTaskDesc('');
    setTaskStatus('pending');
    setEditingTaskId(null);
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (task) => {
    setModalTitle('Edit Task');
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskStatus(task.status);
    setEditingTaskId(task._id);
    setIsModalOpen(true);
  };

  // Handle Submit (Create or Update)
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      triggerAlert('error', 'Task title is required.');
      return;
    }

    try {
      if (editingTaskId) {
        // Update task
        const response = await api.put(`/tasks/${editingTaskId}`, {
          title: taskTitle,
          description: taskDesc,
          status: taskStatus
        });
        triggerAlert('success', response.data.message);
      } else {
        // Create task
        const response = await api.post('/tasks', {
          title: taskTitle,
          description: taskDesc,
          status: taskStatus
        });
        triggerAlert('success', response.data.message);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to process task request.');
    }
  };

  // Quick toggle status button
  const handleQuickStatusChange = async (taskId, currentStatus) => {
    const nextStatusMap = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending'
    };
    
    try {
      await api.put(`/tasks/${taskId}`, {
        status: nextStatusMap[currentStatus]
      });
      triggerAlert('success', 'Task status updated!');
      fetchTasks();
    } catch (err) {
      triggerAlert('error', 'Failed to update status.');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      triggerAlert('success', response.data.message);
      fetchTasks();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Access denied to delete this task.');
    }
  };

  // Filter and search computation
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate task counts for stats metrics
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const progressCount = tasks.filter(t => t.status === 'in-progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', position: 'relative' }}>
      <div className="bg-gradient-mesh"></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation Bar */}
        <header className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 28px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🚀</span>
            <div>
              <h1 style={{ fontSize: '1.4rem', color: '#fff', lineHeight: 1.2 }}>TaskFlow Dashboard</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Connected: <strong>{user?.name}</strong></span>
                {isAdmin ? (
                  <span className="badge badge-role-admin" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    <Shield size={10} style={{ marginRight: '3px' }} /> Admin
                  </span>
                ) : (
                  <span className="badge badge-role-user" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>User</span>
                )}
              </div>
            </div>
          </div>
          
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </header>

        {/* Global floating alerts */}
        {alert.show && (
          <div className={`alert alert-${alert.type}`} style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            margin: 0,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
        )}

        {/* Statistics Metric Bar */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
              <ClipboardList size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Total Tasks</p>
              <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>{totalTasks}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--warning-glow)', color: '#fbbf24' }}>
              <Clock size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Pending</p>
              <h3 style={{ fontSize: '1.8rem', color: '#fbbf24' }}>{pendingCount}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--primary-glow)', color: '#818cf8' }}>
              <Play size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>In Progress</p>
              <h3 style={{ fontSize: '1.8rem', color: '#818cf8' }}>{progressCount}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--success-glow)', color: '#34d399' }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Completed</p>
              <h3 style={{ fontSize: '1.8rem', color: '#34d399' }}>{completedCount}</h3>
            </div>
          </div>
        </section>

        {/* Dashboard Workspace */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isAdmin ? '3fr 1.2fr' : '1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* Main Tasks Hub */}
          <main className="glass-panel" style={{ padding: '24px 28px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={20} className="text-primary" /> Task Console
              </h2>
              
              <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Plus size={16} /> Create Task
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingTop: '8px', paddingBottom: '8px', fontSize: '0.85rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                <select
                  className="form-input"
                  style={{
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    background: 'var(--bg-tertiary) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%239ca3af\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E") no-repeat right 8px center',
                    backgroundSize: '16px',
                    appearance: 'none',
                    paddingRight: '28px'
                  }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Task Cards Grid */}
            {loadingTasks ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                <RefreshCw size={24} className="spin-icon" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '8px' }} />
                <p style={{ fontSize: '0.9rem' }}>Retrieving your tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '56px 20px',
                border: '1px dashed var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-secondary)'
              }}>
                <ClipboardList size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '4px' }}>No tasks found</h4>
                <p style={{ fontSize: '0.85rem' }}>Create a new task to begin organizing your workflow</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px'
              }}>
                {filteredTasks.map(task => (
                  <div key={task._id} className="glass-card" style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <span onClick={() => handleQuickStatusChange(task._id, task.status)} className={`badge badge-${task.status}`} style={{ cursor: 'pointer', fontSize: '0.65rem' }}>
                          {task.status}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleOpenEditModal(task)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}>
                            <Edit size={14} />
                          </button>
                          
                          {/* Admins can delete any, standard users own */}
                          <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', padding: '2px' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '0.975rem', color: '#fff', fontWeight: 600, marginBottom: '6px', wordBreak: 'break-word' }}>
                        {task.title}
                      </h3>
                      
                      <p style={{
                        fontSize: '0.825rem',
                        color: 'var(--text-secondary)',
                        wordBreak: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '12px'
                      }}>
                        {task.description || 'No description provided.'}
                      </p>
                    </div>

                    <div style={{
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '10px',
                      marginTop: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      <span>By: {task.createdBy?.name || 'Unknown'}</span>
                      <span>{new Date(task.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Admin Platform Users Section (RBAC requirement) */}
          {isAdmin && (
            <aside className="glass-panel" style={{ padding: '24px 20px', minHeight: '350px' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} className="text-secondary" /> Registered Users ({users.length})
              </h2>

              {loadingUsers ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={18} className="spin-icon" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.8rem' }}>Loading platform users...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {users.map(u => (
                    <div key={u._id} style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {u.name}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {u.email}
                        </p>
                      </div>
                      
                      <span className={`badge badge-role-${u.role}`} style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Modal: Create/Edit Task */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '500px',
              padding: '32px',
              position: 'relative',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              
              {/* Close Button */}
              <button onClick={() => setIsModalOpen(false)} style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}>
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '24px' }}>
                {modalTitle}
              </h2>

              <form onSubmit={handleSubmitTask}>
                <div className="form-group">
                  <label className="form-label" htmlFor="task-title">Task Title</label>
                  <input
                    id="task-title"
                    type="text"
                    className="form-input"
                    placeholder="E.g. Update SSL certificates"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-desc">Task Description</label>
                  <textarea
                    id="task-desc"
                    className="form-input"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Provide details about the task..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '28px' }}>
                  <label className="form-label" htmlFor="task-status">Status</label>
                  <select
                    id="task-status"
                    className="form-input"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    style={{
                      cursor: 'pointer',
                      background: 'var(--bg-tertiary) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%239ca3af\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E") no-repeat right 12px center',
                      backgroundSize: '20px',
                      appearance: 'none',
                      paddingRight: '40px'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTaskId ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
