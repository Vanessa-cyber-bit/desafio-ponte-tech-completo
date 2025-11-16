import React, { useEffect, useState, useCallback } from 'react';
import { Container, Card, Button, Row, Col, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [tarefas, setTarefas] = useState([]);
  const [error, setError] = useState('');
  const [token] = useState(localStorage.getItem('token'));
  
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');

  const fetchTarefas = useCallback(async () => {
    // ... (O código de buscar tarefas continua o mesmo)
    if (!token) {
      window.location.href = '/login';
      return;
    }
    try {
      const params = new URLSearchParams();
      if (filtroStatus) params.append('status', filtroStatus);
      if (filtroPrioridade) params.append('prioridade', filtroPrioridade);
      
      const response = await axios.get(`http://localhost:3000/api/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTarefas(response.data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError('Erro ao carregar tarefas.');
      }
    }
  }, [token, filtroStatus, filtroPrioridade]); 

  useEffect(() => {
    fetchTarefas();
  }, [fetchTarefas]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleUpdateStatus = async (id, novoStatus) => {
    // ... (O código de atualizar status continua o mesmo)
    try {
      await axios.put(`http://localhost:3000/api/tasks/${id}`, { status: novoStatus }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTarefas(); 
    } catch (err) {
      setError('Não foi possível atualizar o status da tarefa.');
    }
  };

  const handleDelete = async (id) => {
    // ... (O código de deletar continua o mesmo)
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTarefas();
    } catch (err) {
      setError('Não foi possível excluir a tarefa.');
    }
  };

  const formatarStatus = (status) => {
    if (status === 'Em_Progresso') return 'Em Progresso';
    if (status === 'Concluida') return 'Concluída';
    return status;
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4 align-items-center">
        {/* ... (O cabeçalho continua o mesmo) ... */}
        <Col xs={12} md={6}>
          <h2>Minhas Tarefas</h2>
        </Col>
        <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
          <Button as={Link} to="/criar" variant="primary" className="me-2 mb-2 mb-md-0">
            + Criar Nova Tarefa
          </Button>
          <Button variant="danger" onClick={handleLogout} className="mb-2 mb-md-0">
            Sair
          </Button>
        </Col>
      </Row>

      {/* --- 6. FILTROS (COM A CORREÇÃO DE LAYOUT!) --- */}
      {/* Agora os filtros estão dentro de um Card, assim como as tarefas */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row>
                <Col md={5}>
                  <Form.Group controlId="filtroStatus">
                    <Form.Label>Filtrar por Status</Form.Label>
                    <Form.Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} >
                      <option value="">Todos os Status</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Em_Progresso">Em Progresso</option>
                      <option value="Concluida">Concluída</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group controlId="filtroPrioridade">
                    <Form.Label>Filtrar por Prioridade</Form.Label>
                    <Form.Select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)} >
                      <option value="">Todas as Prioridades</option>
                      <option value="Baixa">Baixa</option>
                      <option value="Media">Média</option>
                      <option value="Alta">Alta</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end mt-3 mt-md-0">
                  <Button variant="outline-secondary" className="w-100" onClick={() => { setFiltroStatus(''); setFiltroPrioridade(''); }}>
                    Limpar
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>


      {error && <Alert variant="danger">{error}</Alert>}

      {/* --- 7. LISTA DE TAREFAS (COM LAYOUT DE 2 COLUNAS) --- */}
      <Row>
        {tarefas.length > 0 ? (
          tarefas.map((tarefa) => (
            <Col md={6} key={tarefa.id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{tarefa.titulo}</Card.Title>
                  <Card.Text>{tarefa.descricao}</Card.Text>
                  <Row>
                    <Col>
                      <small className="text-muted">Status: {formatarStatus(tarefa.status)}</small>
                    </Col>
                    <Col>
                      <small className="text-muted">Prioridade: {tarefa.prioridade}</small>
                    </Col>
                  </Row>
                  
                  {tarefa.status === 'Pendente' && (
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleUpdateStatus(tarefa.id, 'Em_Progresso')}>
                      Iniciar
                    </Button>
                  )}
                  {tarefa.status !== 'Concluida' && (
                    <Button variant="success" size="sm" className="me-2" onClick={() => handleUpdateStatus(tarefa.id, 'Concluida')}>
                      Concluir
                    </Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(tarefa.id)}>
                    Excluir
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Alert variant="info">Nenhuma tarefa encontrada. Tente criar uma!</Alert>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default Dashboard;