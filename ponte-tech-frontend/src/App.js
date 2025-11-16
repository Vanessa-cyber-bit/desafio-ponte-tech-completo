import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

// Importando as Páginas
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import Dashboard from './pages/dashboard';
import CriarTarefa from './pages/criartarefa';

function App() {
  const token = localStorage.getItem('token');

  return (
    <div>
      {/* Removemos o 'bg="primary"' para o nosso CSS poder aplicar o vidro */}
      <Navbar variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">
            TaskBridge
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {!token && (
                <>
                  <Nav.Link as={Link} to="/login" eventKey="1">Login</Nav.Link>
                  <Nav.Link as={Link} to="/cadastro" eventKey="2">Cadastro</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* --- NOSSAS ROTAS --- */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/criar" element={<CriarTarefa />} />
        <Route path="/" element={<Dashboard />} /> 
      </Routes>
    </div>
  );
}

export default App;
