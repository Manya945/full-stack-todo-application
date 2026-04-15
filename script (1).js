const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ====== MongoDB Connection ======
mongoose.connect("mongodb://127.0.0.1:27017/todoDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ====== Schema ======
const taskSchema = new mongoose.Schema({
  title: String,
  is_completed: { type: Boolean, default: false }
});

const Task = mongoose.model("Task", taskSchema);

// ====== API ROUTES ======

// GET all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// ADD task
app.post("/tasks", async (req, res) => {
  const task = new Task({ title: req.body.title });
  await task.save();
  res.json(task);
});

// UPDATE task
app.put("/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(task);
});

// DELETE task
app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ====== FRONTEND (HTML UI) ======
app.get("/", (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Todo App</title>
    </head>Ctrl + C
node script.js
    <body style="text-align:center;font-family:sans-serif">
      <h1>Todo App</h1>

      <input id="taskInput" placeholder="Enter task"/>
      <button onclick="addTask()">Add</button>

      <ul id="list"></ul>

      <script>
        const API = "/tasks";

        async function loadTasks() {
          const res = await fetch(API);
          const data = await res.json();

          const list = document.getElementById("list");
          list.innerHTML = "";

          data.forEach(task => {
            const li = document.createElement("li");

            li.innerHTML = \`
              <span onclick="toggleTask('\${task._id}', \${task.is_completed})"
                style="cursor:pointer;text-decoration:\${task.is_completed ? 'line-through' : 'none'}">
                \${task.title}
              </span>
              <button onclick="deleteTask('\${task._id}')">❌</button>
            \`;

            list.appendChild(li);
          });
        }

        async function addTask() {
          const input = document.getElementById("taskInput");

          await fetch(API, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ title: input.value })
          });

          input.value = "";
          loadTasks();
        }

        async function deleteTask(id) {
          await fetch(API + "/" + id, { method: "DELETE" });
          loadTasks();
        }

        async function toggleTask(id, status) {
          await fetch(API + "/" + id, {
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ is_completed: !status })
          });
          loadTasks();
        }

        loadTasks();
      </script>
    </body>
    </html>
  `);
});

// ====== SERVER ======
app.listen(3001, () => {
  console.log("Server running on http://127.0.0.1:3001");
});
