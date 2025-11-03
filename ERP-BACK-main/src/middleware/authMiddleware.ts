import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Adicionamos uma propriedade 'userId' à interface Request do Express
interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ error: 'Nenhum token fornecido' });
  }

  // O token vem no formato "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).send({ error: 'Erro no formato do token' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ error: 'Token mal formatado' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
    if (err) {
      return res.status(401).send({ error: 'Token inválido' });
    }

    req.userId = decoded.id;
    return next();
  });
};