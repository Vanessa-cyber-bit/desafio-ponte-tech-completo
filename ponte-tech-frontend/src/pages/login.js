import React, { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios'; 

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !senha) {
      setError('Email e senha são obrigatórios.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: email,
        senha: senha,
      });

      console.log('Token recebido:', response.data.token);
      localStorage.setItem('token', response.data.token);
      window.location.href = '/';

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); 
      } else {
        setError('Falha no login. O servidor backend está ligado?');
      }
      console.error('Erro no login:', err);
    }
  };

  return (
    // Layout de Centralização
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6} lg={5}>
          {/* O Card que vai pegar nosso CSS "Glassmorphism" */}
          <Card>
            <Card.Body className="p-4 p-md-5"> {/* Mais padding */}
              <h2 className="text-center mb-4">Entrar no Sistema</h2>
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Entrar
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;