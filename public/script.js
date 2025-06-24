const employeeTable = document.getElementById('employeeTable').getElementsByTagName('tbody')[0];
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const employeeFormPopup = document.getElementById('employeeFormPopup');
const closePopupBtn = document.getElementById('closePopupBtn');
const employeeForm = document.getElementById('employeeForm');

let editingIndex = -1;

// Fetch and display employees
async function loadEmployees() {
  const response = await fetch('/api/employees');
  const employees = await response.json();
  employeeTable.innerHTML = '';
  employees.forEach((emp, index) => {
    const row = employeeTable.insertRow();
    row.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.mobile}</td>
      <td>${emp.address}</td>
      <td>${emp.dob}</td>
      <td>
        <button onclick="editEmployee(${index})">Edit</button>
        <button onclick="deleteEmployee(${index})">Delete</button>
      </td>
    `;
  });
}

// Add employee
addEmployeeBtn.addEventListener('click', () => {
  editingIndex = -1;
  employeeForm.reset();
  employeeFormPopup.style.display = 'flex';
});

// Close popup
closePopupBtn.addEventListener('click', () => {
  employeeFormPopup.style.display = 'none';
});

// Save employee (Add/Edit)
employeeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const mobile = document.getElementById('mobile').value;
  const address = document.getElementById('address').value;
  const dob = document.getElementById('dob').value;

  const data = { name, mobile, address, dob };
  if (editingIndex === -1) {
    // Add new employee
    await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } else {
    // Edit existing employee
    await fetch(`/api/employees/${editingIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  employeeFormPopup.style.display = 'none';
  loadEmployees();
});

// Edit employee
async function editEmployee(index) {
  const response = await fetch(`/api/employees`);
  const employees = await response.json();
  const emp = employees[index];

  document.getElementById('name').value = emp.name;
  document.getElementById('mobile').value = emp.mobile;
  document.getElementById('address').value = emp.address;
  document.getElementById('dob').value = emp.dob;

  editingIndex = index;
  employeeFormPopup.style.display = 'flex';
}

// Delete employee
async function deleteEmployee(index) {
  await fetch(`/api/employees/${index}`, { method: 'DELETE' });
  loadEmployees();
}

// Initial load
loadEmployees();
