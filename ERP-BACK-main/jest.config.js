/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  forceExit: true,
  setupFiles: ['dotenv/config'],
  
  // --- LINHA ADICIONADA AQUI ---
  // Aumenta o tempo de espera para 30 segundos (30000 ms)
  testTimeout: 30000,
};