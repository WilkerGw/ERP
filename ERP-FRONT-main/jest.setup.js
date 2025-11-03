// --- PASSO 1: POLYFILLS PRIMEIRO ---
// Carrega as funcionalidades de navegador que faltam, como fetch, Request, Response, etc.
import 'whatwg-fetch';

// Carrega TextEncoder e TextDecoder do Node.js e os torna globais.
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextDecoder, TextEncoder });


// --- PASSO 2: SETUP DO JEST-DOM ---
import '@testing-library/jest-dom';


// --- PASSO 3: SETUP DO SERVIDOR DE MOCK (MSW) ---
// Agora que os polyfills estão carregados, podemos importar e configurar o msw.
import { server } from './src/__mocks__/server.js';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());


// --- PASSO 4: MOCKS ADICIONAIS ---
// Mock para a função alert, que não existe no JSDOM.
global.alert = jest.fn();