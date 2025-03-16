// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 20px;
`;

const ChatContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 500px;
  padding: 10px;
  overflow-y: auto;
  margin-bottom: 20px;
  background-color: #f9f9f9;
`;

const MessageContainer = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
  margin-bottom: 5px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isUser ? '#0084ff' : '#e4e6eb'};
  color: ${props => props.isUser ? 'white' : 'black'};
`;

const InputContainer = styled.div`
  display: flex;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #0084ff;
  color: white;
  border: none;
  border-radius: 4px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0066cc;
  }
`;

const ModelSelector = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
  font-size: 16px;
`;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama2');
  const [availableModels, setAvailableModels] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Fetch available models from Ollama
    const fetchModels = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/tags');
        setAvailableModels(response.data.models || []);
      } catch (error) {
        console.error('Error fetching models:', error);
        setMessages(prev => [...prev, {
          text: "Error connecting to Ollama. Make sure the server is running on localhost:11434",
          isUser: false
        }]);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/generate', {
        model: selectedModel,
        prompt: input,
        stream: false
      });

      const aiMessage = { text: response.data.response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        text: "Error generating response. Make sure Ollama is running correctly.",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <h1>Ollama Chat</h1>
        <div>
          <label htmlFor="model">Model: </label>
          <ModelSelector
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {availableModels.map(model => (
              <option key={model.name} value={model.name}>
                {model.name}
              </option>
            ))}
          </ModelSelector>
        </div>
      </Header>

      <ChatContainer>
        {messages.map((message, index) => (
          <MessageContainer key={index} isUser={message.isUser}>
            <Message isUser={message.isUser}>
              {message.text}
            </Message>
          </MessageContainer>
        ))}
        {isLoading && (
          <MessageContainer>
            <Message isUser={false}>
              Thinking...
            </Message>
          </MessageContainer>
        )}
        <div ref={chatEndRef} />
      </ChatContainer>

      <form onSubmit={handleSubmit}>
        <InputContainer>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </InputContainer>
      </form>
    </Container>
  );
};

export default App;