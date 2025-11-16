import React, { useState } from 'react';
// IMPORTANDO Row, Col e Card
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios'; 

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!nome || !email || !senha) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    if (nome.length < 3) {
      setError('O nome precisa ter no mínimo 3 caracteres.');
      return;
    }
    if (senha.length < 8) {
      setError('A senha precisa ter no mínimo 8 caracteres.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        nome: nome,
        email: email,
        senha: senha,
      });

      console.log('Usuário cadastrado:', response.data);
      setError('');
      setSuccess('Cadastro realizado com sucesso! Você já pode fazer o login.');
      
      setNome('');
      setEmail('');
      setSenha('');

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); 
      } else {
        setError('Falha no cadastro. O servidor backend está ligado?');
      }
      console.error('Erro no cadastro:', err);
    }
  };

  return (
    // NOVO LAYOUT DE CENTRALIZAÇÃO
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6} lg={5}> {/* Define o tamanho do formulário */}
          <Card>
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center mb-4">Criar Conta</h2>
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form.Group className="mb-3" controlId="formBasicNome">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </Form.Group>

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
                    placeholder="Mínimo 8 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Cadastrar
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Cadastro;