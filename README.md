# 📌 Task Manager Application

## 🌐 Live Demo
🔗 [View Live Application]([https://your-app-link](https://taskmanager-shreyasbk.netlify.app/))

---
A full-stack **Task Management System** built using **Spring Boot** and **React** that allows users to manage tasks with priority and status tracking.

---

## 🚀 Features

- Create, update, and delete tasks  
- Track task status (e.g., pending, completed)  
- Assign priority levels to tasks  
- RESTful API integration  
- Global exception handling  
- Clean layered architecture  

---

## 🛠️ Tech Stack

### Backend
- Java  
- Spring Boot  
- Spring Data JPA  
- Maven  

### Frontend
- React  
- JavaScript  
- CSS  

---

## 📂 Project Structure

```
Task-Manager
│
├── backend
│   ├── controller
│   ├── serviceimpl
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── mapper
│   ├── exception
│   └── config
│
├── frontend
│   ├── components
│   ├── hooks
│   ├── services
│   ├── utils
│   └── App.jsx
```

---

## ⚙️ Setup Instructions

### Backend

```
cd backend
./mvnw spring-boot:run
```

Runs on: `http://localhost:8080`

---

### Frontend

```
cd frontend
npm install
npm start
```

Runs on: `http://localhost:3000`

---

## 🔗 API Endpoints

| Method | Endpoint      | Description        |
|--------|-------------|--------------------|
| GET    | /tasks      | Get all tasks      |
| POST   | /tasks      | Create a task      |
| PUT    | /tasks/{id} | Update a task      |
| DELETE | /tasks/{id} | Delete a task      |

---

