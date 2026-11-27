# 🚀 DevPilot — AI-Powered GitHub Repository Assistant

DevPilot is an AI-powered GitHub repository assistant designed to help developers understand, explore, and analyze codebases using **Retrieval-Augmented Generation (RAG)** and locally hosted Large Language Models (LLMs).

Import a GitHub repository, explore its structure, search code semantically, and ask AI questions about your codebase — all powered by local AI without relying on paid AI APIs.

---

## ✨ Features

- 🔐 User Authentication with JWT
- 📂 GitHub Repository Import
- 🌳 Repository Structure Explorer
- 📄 Source Code Exploration
- 🧠 AI-Powered Repository Chat
- 🔎 Semantic Code Search
- 📚 Retrieval-Augmented Generation (RAG)
- 🧩 Code Chunking & Embeddings
- 🗄️ Vector Storage with PostgreSQL & pgvector
- 🤖 Local AI inference using Ollama
- 🔒 Password hashing and secure authentication
- 🐳 Docker-based database setup

---

## 🏗️ Architecture

```text
Frontend (Next.js + TypeScript)
          │
          ▼
Backend REST API
(Java 21 + Spring Boot)
          │
          ├── Authentication (JWT)
          ├── GitHub Repository Integration
          ├── Repository Scanner
          ├── Code Chunking
          ├── Embedding Generation
          ├── Semantic Search
          └── RAG Chat Engine
                    │
                    ▼
          PostgreSQL + pgvector
                    │
                    ▼
              Ollama (Local AI)
          ├── Llama 3.2 (Chat)
          └── Nomic Embeddings
```

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- TypeScript
- React
- CSS

### Backend
- Java 21
- Spring Boot
- Spring AI
- REST APIs
- JWT Authentication

### Database
- PostgreSQL 16
- pgvector
- Flyway

### AI & Machine Learning
- Ollama
- Llama 3.2
- Nomic Embeddings
- Retrieval-Augmented Generation (RAG)

### Infrastructure & Tools
- Docker
- Docker Compose
- Maven
- Git
- GitHub

---

## ⚙️ How DevPilot Works

1. **Import Repository** — Import a GitHub repository into DevPilot.
2. **Repository Scanning** — Analyze the repository structure and source files.
3. **Code Chunking** — Split source code into manageable chunks.
4. **Embedding Generation** — Generate vector embeddings using Nomic.
5. **Vector Storage** — Store embeddings and code chunks in PostgreSQL with pgvector.
6. **Semantic Search** — Retrieve relevant code based on the user's query.
7. **AI Response** — Llama 3.2 uses the retrieved context to generate an answer.

---

## 📋 Prerequisites

Before running DevPilot, install:

- [Java 21](https://adoptium.net/)
- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.com/)
- [Git](https://git-scm.com/)

---

## 🧠 Local AI Setup

Install Ollama and download the required models:

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

Start Ollama:

```bash
ollama serve
```

---

## 🗄️ Database Setup

Start PostgreSQL with pgvector using Docker Compose:

```bash
docker compose up -d
```

Verify containers:

```bash
docker ps
```

---

## 🚀 Running DevPilot

### 1. Clone the repository

```bash
git clone https://github.com/aditya-gadekar/DevPilot.git
cd DevPilot
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Start Ollama

```bash
ollama serve
```

### 4. Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

### 5. Run the Frontend

```bash
cd frontend-github-staging
npm install
npm run dev
```

---

## 🔑 Environment Configuration

Configure environment variables before running the application.

Example:

```env
JWT_SECRET=your_secure_secret_key
DB_PASSWORD=your_database_password
```

Never commit actual secrets, passwords, tokens, or `.env` files to GitHub.

---

## 📁 Project Structure

```text
DevPilot/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── devPilot/backend/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │ │   ├── dto/
│   │   │ │   ├── entity/
│   │   │ │   ├── repository/
│   │   │ │   ├── security/
│   │   │ │   └── service/
│   │   │ └── resources/
│   │   │     ├── application.properties
│   │   │     └── db/migration/
│   │   └── test/
│   └── pom.xml
│
├── frontend-github-staging/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
│
├── docker/
│   └── postgres/
│       └── init-extensions.sql
│
├── docker-compose.yml
└── .gitignore
```

---

## 🔒 Security

- JWT-based authentication
- Password hashing using BCrypt
- Environment-based secret configuration
- Protected API endpoints
- Local AI inference

---

## 🎯 Project Goals

DevPilot aims to simplify repository understanding and developer productivity by combining:

- AI-powered code understanding
- Semantic code retrieval
- Repository context-aware conversations
- Local AI privacy

---

## 🔮 Future Enhancements

- Support for multiple repositories
- Improved code-aware retrieval
- AI-generated code explanations
- Repository dependency visualization
- Advanced code analysis
- GitHub OAuth integration
- Code debugging assistant
- Automated documentation generation

---

## 👨‍💻 Author

**Aditya Gadekar**

GitHub: [@aditya-gadekar](https://github.com/aditya-gadekar)

---

⭐ If you find DevPilot interesting, consider starring the repository!
