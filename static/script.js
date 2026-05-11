const employeeForm = document.getElementById("employeeForm");
const employeeTable = document.getElementById("employeeTable");
const searchInput = document.getElementById("searchInput");
const submitBtn = document.getElementById("submitBtn");

let allEmployees = [];
let editId = null;
let deleteId = null;

async function loadEmployees() {
  try {
    const response = await fetch("/employees");
    const employees = await response.json();

    allEmployees = employees;

    updateStats(employees);
    renderEmployees(employees);
  } catch (error) {
    showToast("Something went wrong while loading employees");
  }
}

function renderEmployees(employees) {
  employeeTable.innerHTML = "";

  if (employees.length === 0) {
    employeeTable.innerHTML = `
      <tr>
        <td colspan="5" class="empty">No employee records found</td>
      </tr>
    `;
    return;
  }

  const rows = employees.map((employee) => {
    return `
      <tr>
        <td>EMP-${String(employee.id).padStart(3, "0")}</td>
        <td>${employee.name}</td>
        <td>${employee.department}</td>
        <td>₹${employee.salary}</td>
        <td>
          <button 
            class="edit-btn" 
            onclick="editEmployee(${employee.id}, '${employee.name}', '${employee.department}', ${employee.salary})">
            Edit
          </button>
          <button 
            class="delete-btn" 
            onclick="deleteEmployee(${employee.id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join("");

  employeeTable.innerHTML = rows;
}

employeeForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  submitBtn.disabled = true;

  const employee = {
    name: document.getElementById("name").value.trim(),
    department: document.getElementById("department").value.trim(),
    salary: document.getElementById("salary").value
  };

  try {
    if (editId === null) {
      await fetch("/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(employee)
      });

      showToast("Employee added successfully");
    } else {
      await fetch(`/employees/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(employee)
      });

      editId = null;
      submitBtn.textContent = "Add Employee";
      showToast("Employee updated successfully");
    }

    employeeForm.reset();
    searchInput.value = "";
    await loadEmployees();
  } catch (error) {
    showToast("Something went wrong");
  }

  submitBtn.disabled = false;
});

function editEmployee(id, name, department, salary) {
  editId = id;

  document.getElementById("name").value = name;
  document.getElementById("department").value = department;
  document.getElementById("salary").value = salary;

  submitBtn.textContent = "Update Employee";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function deleteEmployee(id) {
  deleteId = id;

  document
    .getElementById("deleteModal")
    .classList.add("show");
}

function updateStats(employees) {
  const totalEmployees = employees.length;

  const departments = new Set(
    employees.map((employee) => employee.department)
  );

  const totalSalary = employees.reduce(
    (sum, employee) => sum + Number(employee.salary),
    0
  );

  const averageSalary =
    totalEmployees === 0 ? 0 : Math.round(totalSalary / totalEmployees);

  document.getElementById("totalEmployees").textContent = totalEmployees;
  document.getElementById("totalDepartments").textContent = departments.size;
  document.getElementById("averageSalary").textContent = `₹${averageSalary}`;
}

function filterEmployees() {
  const searchValue = searchInput.value.toLowerCase();

  const filteredEmployees = allEmployees.filter((employee) => {

    const formattedId = `emp-${String(employee.id).padStart(3, "0")}`;

    return (
      employee.name.toLowerCase().includes(searchValue) ||
      employee.department.toLowerCase().includes(searchValue) ||
      formattedId.includes(searchValue) ||
      employee.id.toString().includes(searchValue)
    );
  });

  renderEmployees(filteredEmployees);
}

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

searchInput.addEventListener("input", filterEmployees);

function closeDeleteModal() {
  document
    .getElementById("deleteModal")
    .classList.remove("show");

  deleteId = null;
}

async function confirmDelete() {
  try {
    await fetch(`/employees/${deleteId}`, {
      method: "DELETE"
    });

    showToast("Employee deleted successfully");

    searchInput.value = "";
    await loadEmployees();

  } catch (error) {
    showToast("Something went wrong while deleting");
  }

  closeDeleteModal();
}

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("light-mode");

  if (document.body.classList.contains("light-mode")) {
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }
});

loadEmployees();