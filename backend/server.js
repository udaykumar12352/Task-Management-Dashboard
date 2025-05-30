const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const url = 'mongodb://localhost:27017';
const dbName = 'taskDB';
let db;

MongoClient.connect(url, { useUnifiedTopology: true })
    .then(client => {
        console.log("Connected to MongoDB");
        db = client.db(dbName);
    })
    .catch(err => console.error("Failed to connect to MongoDB:", err));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const users = db.collection('users');

    const existingUser = await users.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    await users.insertOne({ username, password });
    res.json({ message: 'Registration successful' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = db.collection('users');

    const user = await users.findOne({ username, password });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful' });
});

app.post('/tasks', async (req, res) => {
    const { title, description, dueDate } = req.body;
    const task = { title, description, dueDate, status: 'Pending' };
    const result = await db.collection('tasks').insertOne(task);

    res.json({ ...task, id: result.insertedId });
});

app.get('/tasks', async (req, res) => {
    const tasks = await db.collection('tasks').find().toArray();
    const today = new Date().toISOString().split('T')[0];

    tasks.forEach(async task => {
        if (task.status === 'Pending' && task.dueDate < today) {
            await db.collection('tasks').updateOne(
                { _id: task._id },
                { $set: { status: 'Overdue' } }
            );
        }
    });

    res.json(tasks);
});

app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    await db.collection('tasks').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'Completed' } }
    );

    res.json({ message: 'Task marked as completed' });
});

app.delete('/tasks/:id', async (req, res) => {
    await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Task deleted' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
