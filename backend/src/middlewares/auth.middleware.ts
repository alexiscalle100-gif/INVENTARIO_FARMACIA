import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { EmpleadoPayload, RolEmpleado } from '../types';

export interface AuthRequest extends Request {
  user?: EmpleadoPayload;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Acceso no autorizado: Token no proporcionado' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_farmacia_2026';
    const decoded = jwt.verify(token, secret) as EmpleadoPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};

export const requireRoles = (rolesPermitidos: RolEmpleado[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    if (!rolesPermitidos.includes(req.user.cargo_rol)) {
      res.status(403).json({
        success: false,
        message: `Acceso denegado: Se requiere rol [${rolesPermitidos.join(', ')}]`,
      });
      return;
    }

    next();
  };
};
