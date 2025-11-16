# 🚀 Desafio Full Stack - PonteTech (Sistema de Tarefas)

Este é um sistema de gerenciamento de tarefas simples, desenvolvido como parte do processo seletivo da PonteTech.

O projeto foi construído com foco em um backend sólido, um frontend funcional e código limpo, seguindo os requisitos da [VERSÃO SIMPLIFICADA - 7 DIAS](DESAFIO_SIMPLIFICADO.md).

---

## 🛠️ Tecnologias Utilizadas

* **Backend:** Node.js, Express, JWT (Autenticação), Bcrypt (Hash de Senhas)
* **Banco de Dados:** MySQL
* **ORM:** Prisma
* **Testes (Backend):** Jest & Supertest
* **Frontend:** React, React Router, Axios
* **Design:** React-Bootstrap & CSS Customizado (Dark Mode "Glassmorphism")
* **Containerização:** Docker & Docker Compose

---

## 🚦 Como Rodar o Projeto

O projeto é dividido em dois microsserviços (Backend e Frontend) e requer o **Docker Desktop** para rodar.

### 1. Rodando o Backend (API + Banco de Dados)

O Backend (API Node.js) e o Banco de Dados (MySQL) estão 100% containerizados com Docker.

**Pré-requisitos:**
* Ter o **Docker Desktop** instalado e rodando.

**Instruções:**
1.  Clone este repositório (`ponte-tech-desafio`).
2.  Abra um terminal na raiz desta pasta (`ponte-tech-desafio`).
3.  Execute o seguinte comando:

```bash
docker-compose up --build