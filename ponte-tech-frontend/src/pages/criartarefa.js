import React, { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom'; 
import axios from 'axios';

function CriarTarefa() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('Media'); 
  
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState(''); 
  const [token] = useState(localStorage.getItem('token'));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!titulo || !descricao) {
      setError('Título e Descrição são obrigatórios.');
      return;
    }
    if (titulo.length < 3) {
      setError('Título precisa de no mínimo 3 caracteres.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/tasks', 
        { titulo: titulo, descricao: descricao, prioridade: prioridade },
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      setSuccess('Tarefa criada com sucesso!');
      setTitulo('');
      setDescricao('');
      setPrioridade('Media');

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Falha ao criar tarefa.');
      }
    }
  };

  return (
    // NOVO LAYOUT DE CENTRALIZAÇÃO
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8} lg={7}> {/* Um pouco mais largo para o form de tarefas */}
          <Card>
            <Card.Body className="p-4 p-md-5">
              <Row className="mb-4 align-items-center">
                <Col>
                  <h2 className="text-center mb-0">Criar Nova Tarefa</h2>
                </Col>
                <Col xs="auto">
                  <Button as={Link} to="/" variant="secondary">
                    Voltar
                  </Button>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form.Group className="mb-3" controlId="formTarefaTitulo">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: Corrigir bug no login"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTarefaDescricao">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Ex: O usuário não consegue logar..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTarefaPrioridade">
                  <Form.Label>Prioridade</Form.Label>
                  <Form.Select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value)}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Media">Média</option>
                    <option value="Alta">Alta</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Salvar Tarefa
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CriarTarefa;