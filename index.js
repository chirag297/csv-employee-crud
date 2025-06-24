const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');//const { parse } = require('csv-parser');
const { Parser } = require('json2csv'); //const { json2csv } = require('json2csv');


const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(express.static('public'));

// Path to CSV file
const filePath = path.join(__dirname, 'employees.csv');

if (!fs.existsSync(filePath)) {
  const headers = 'name,mobile,address,dob\n';
  fs.writeFileSync(filePath, headers, 'utf-8');
}


// Utility function to read data from CSV file
function readCSV() {
  return new Promise((resolve, reject) => {
    const employees = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())//.pipe(parse())
      .on('data', (row) => employees.push(row))
      .on('end', () => resolve(employees))
      .on('error', (err) => reject(err));
  });
}

// Utility function to write data to CSV file
function writeCSV(data) {
    
    const { parse } = require('json2csv');
    const fields = ['name', 'mobile', 'address', 'dob'];
    const csvData = parse(data, { fields }); // ✅ fixed line
    fs.writeFileSync(filePath, csvData, 'utf-8');
    
}

// Endpoint to get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await readCSV();
    res.json(employees);
  } catch (error) {
    //console.error('🔥 CSV Read Error:', error);
    res.status(500).json({ error: 'Failed to load employees' });
  }
});

// Endpoint to add a new employee
app.post('/api/employees', async (req, res) => {
  const { name, mobile, address, dob } = req.body;

  if (!name || !mobile || !address || !dob) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const employees = await readCSV();
    const newEmployee = { name, mobile, address, dob };
    employees.push(newEmployee);

    //console.log('💾 Saving employee:', newEmployee);

    writeCSV(employees);
    res.status(201).json({ message: 'Employee added', employee: newEmployee });//res.status(201).json(newEmployee);
  } catch (error) {
    //console.error('🔥 Error in POST /api/employees:', error);
    res.status(500).json({ error: 'Error adding new employee' });//send('Error adding new employee');
  }
});

// Endpoint to edit an employee
app.put('/api/employees/:index', async (req, res) => {
  const { index } = req.params;
  const { name, mobile, address, dob } = req.body;

  try {
    const employees = await readCSV();
    const employee = employees[index];
    if (!employee) return res.status(404).send('Employee not found');

    employee.name = name;
    employee.mobile = mobile;
    employee.address = address;
    employee.dob = dob;
    writeCSV(employees);

    res.json(employee);
  } catch (error) {
    res.status(500).send('Error updating employee');
  }
});

// Endpoint to delete an employee
app.delete('/api/employees/:index', async (req, res) => {
  const { index } = req.params;
  //console.log('🗑️ Trying to delete employee at index:', index);//NEW
  try {
    const employees = await readCSV();
    console.log('📋 Current employees:', employees); // NEW
    if (employees[index]) {
      employees.splice(index, 1);
      writeCSV(employees);
      res.status(200).send('Employee deleted');
    } else {
      res.status(404).send('Employee not found');
    }
  } catch (error) {
    //console.error('❌ Error deleting employee:', error); // NEW
    res.status(500).send('Error deleting employee');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
