// Caminho: ERP-BACK-main/src/middleware/validationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodIssue } from 'zod'; // Importa o tipo ZodIssue

// Este middleware recebe um schema Zod e o usa para validar o corpo da requisição
export const validate = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // CORREÇÃO 1: A propriedade correta é 'issues', não 'errors'
        // CORREÇÃO 2: Adicionamos o tipo 'ZodIssue' para o parâmetro 'issue'
        const errorMessages = error.issues.map((issue: ZodIssue) => ({
            message: `${issue.path.join('.')} is ${issue.message.toLowerCase()}`,
        }));
        res.status(400).json({ error: 'Dados de entrada inválidos', details: errorMessages });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  };
};