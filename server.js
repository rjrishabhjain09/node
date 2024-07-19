const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const cors = require("cors");

const app = express();
const port = 3000;
const dbFilePath = path.join(__dirname, 'data.json');

// Set up CORS options to allow requests from any origin
var corsOptions = {
  origin: '*'
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Function to read database from file
async function readDb() {
  try {
    if (!await fs.pathExists(dbFilePath)) {
      await fs.writeJson(dbFilePath, []);
    }
    return await fs.readJson(dbFilePath);
  } catch (error) {
    console.log("error in logging", error);
    throw new Error('Failed to read database file');
  }
}

// Function to write database to file
async function writeDb(data) {
  try {
    await fs.writeJson(dbFilePath, data, { spaces: 2 });
  } catch (error) {
    // console.log("error in writing", error);
    throw new Error('Failed to write to database file');
  }
}

// GET all products
app.get('/products', async (req, res) => {
  try {
    const data = await readDb();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ message: 'Error retrieving products' });
  }
});

// POST a new product
app.post('/products', async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Validation to ensure all fields are provided
    if (!name || !description || price == null || !category || stock == null) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const data = await readDb();
    const newProduct = { id: Date.now(), name, description, price, category, stock };
    data.push(newProduct);
    await writeDb(data);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product' });
  }
});

// PUT (update) a product
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    // Validation to ensure all fields are provided
    if (!name || !description || price == null || !category || stock == null) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const data = await readDb();
    const productIndex = data.findIndex(product => product.id == id);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    data[productIndex] = { id: Number(id), name, description, price, category, stock };
    await writeDb(data);
    res.json(data[productIndex]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// DELETE a product
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const data = await readDb();
    const productIndex = data.findIndex(product => product.id == id);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    data.splice(productIndex, 1);
    await writeDb(data);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
