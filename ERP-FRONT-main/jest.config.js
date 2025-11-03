const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  // Garante que o setup seja executado antes de cada teste
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Define o ambiente de simulação de navegador como padrão para todos os testes
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)