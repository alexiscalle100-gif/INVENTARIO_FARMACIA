import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { EmpleadoPayload } from '../types';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
      return;
    }

    const userResult = await query(
      `SELECT id_empleado, ci_dni, nombre_completo, cargo_rol, usuario, password_hash, estado
       FROM empleados WHERE usuario = $1`,
      [usuario]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      return;
    }

    const empleado = userResult.rows[0];

    if (!empleado.estado) {
      res.status(403).json({ success: false, message: 'Usuario inactivo. Contacte al administrador' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, empleado.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      return;
    }

    const payload: EmpleadoPayload = {
      id_empleado: empleado.id_empleado,
      nombre_completo: empleado.nombre_completo,
      usuario: empleado.usuario,
      cargo_rol: empleado.cargo_rol,
    };

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_farmacia_2026';
    const signOptions: SignOptions = { expiresIn: '8h' };
    const token = jwt.sign(payload, secret, signOptions);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: payload,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const userResult = await query(
      `SELECT id_empleado, ci_dni, nombre_completo, cargo_rol, usuario, estado, created_at
       FROM empleados WHERE id_empleado = $1`,
      [req.user.id_empleado]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Empleado no encontrado' });
      return;
    }

    res.json({ success: true, data: userResult.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
