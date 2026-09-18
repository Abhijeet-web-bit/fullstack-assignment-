if (!getToken()) {
  window.location.href = 'login.html';
}

const user = getUser();
document.getElementById('userInfo').textContent = user ? `Hi, ${user.username}` : '';

let editingTaskId = null;

const taskGrid = document.getElementById('taskGrid');
const modalOverlay = document.getElementById('modalOverlay');
const taskForm = document.getElementById('taskForm');
const statusFilter = document.getElementById('statusFilter');

document.getElementById('logoutBtn').addEventListener('click', () => {
  clearSession();
  window.location.href = 'login.html';
});

document.getElementById('addTaskBtn').addEventListener('click', () => openModal());
document.getElementById('cancelBtn').addEventListener('click', closeModal);
statusFilter.addEventListener('change', loadTasks);

function openModal(task = null) {
  editingTaskId = task ? task.id : null;
  document.getElementById('modalTitle').textContent = task ? 'Edit Task' : 'New Task';
  document.getElementById('title').value = task ? task.title : '';
  document.getElementById('description').value = task ? task.description : '';
  document.getElementById('status').value = task ? task.status : 'pending';
  document.getElementById('priority').value = task ? task.priority : 'medium';
  document.getElementById('due_date').value = task && task.due_date ? task.due_date : '';
  modalOverlay.classList.add('show');
}

function closeModal() {
  modalOverlay.classList.remove('show');
  taskForm.reset();
  editingTaskId = null;
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    status: document.getElementById('status').value,
    priority: document.getElementById('priority').value,
    due_date: document.getElementById('due_date').value || null
  };

  try {
    if (editingTaskId) {
      await apiRequest(`/tasks/${editingTaskId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await apiRequest('/tasks', { method: 'POST', body: JSON.stringify(payload) });
    }
    closeModal();
    loadTasks();
  } catch (err) {
    alert(err.message);
  }
});

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  try {
    await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderTasks(tasks) {
  if (!tasks.length) {
    taskGrid.innerHTML = `<div class="empty-state">No tasks yet. Tap + to add one.</div>`;
    return;
  }

  taskGrid.innerHTML = tasks.map(task => `
    <div class="task-card">
      <h3>${escapeHtml(task.title)}</h3>
      ${task.description ? `<p class="desc">${escapeHtml(task.description)}</p>` : ''}
      <div class="badges">
        <span class="badge status-${task.status}">${task.status.replace('-', ' ')}</span>
        <span class="badge priority-${task.priority}">${task.priority}</span>
      </div>
      ${task.due_date ? `<div class="due-date">Due: ${formatDate(task.due_date)}</div>` : ''}
      <div class="task-actions">
        <button class="btn btn-small btn-secondary" onclick='editTaskById(${task.id})'>Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let currentTasks = [];

function editTaskById(id) {
  const task = currentTasks.find(t => t.id === id);
  if (task) openModal(task);
}

async function loadTasks() {
  try {
    const filter = statusFilter.value;
    const query = filter ? `?status=${filter}` : '';
    const data = await apiRequest(`/tasks${query}`);
    currentTasks = data.tasks;
    renderTasks(currentTasks);
  } catch (err) {
    if (err.message.includes('token')) {
      clearSession();
      window.location.href = 'login.html';
    } else {
      alert(err.message);
    }
  }
}

loadTasks();
