import { Request, Response } from 'express';
import { query, withTransaction } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

const estadoReservaValido = ['pendiente', 'confirmada', 'preparada', 'entregada', 'cancelada'];

export const getConsultorios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM consultorios WHERE activo = TRUE ORDER BY nombre ASC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedicos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM medicos WHERE activo = TRUE ORDER BY nombre_completo ASC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPacientes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM pacientes WHERE activo = TRUE ORDER BY nombre_completo ASC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCatalogos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [consultorios, medicos, pacientes] = await Promise.all([
      query('SELECT * FROM consultorios WHERE activo = TRUE ORDER BY nombre ASC'),
      query('SELECT * FROM medicos WHERE activo = TRUE ORDER BY nombre_completo ASC'),
      query('SELECT * FROM pacientes WHERE activo = TRUE ORDER BY nombre_completo ASC'),
    ]);

    res.json({
      success: true,
      data: {
        consultorios: consultorios.rows,
        medicos: medicos.rows,
        pacientes: pacientes.rows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConsultorioMedicos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { consultorio_id, medico_id } = req.query;

    let sql = `
      SELECT
        cm.*,
        c.nombre AS consultorio_nombre,
        m.nombre_completo AS medico_nombre,
        m.especialidad,
        m.matricula_profesional
      FROM consultorio_medicos cm
      INNER JOIN consultorios c ON c.id_consultorio = cm.id_consultorio
      INNER JOIN medicos m ON m.id_medico = cm.id_medico
      WHERE cm.activo = TRUE
    `;
    const params: any[] = [];

    if (consultorio_id) {
      params.push(Number(consultorio_id));
      sql += ` AND cm.id_consultorio = $${params.length}`;
    }

    if (medico_id) {
      params.push(Number(medico_id));
      sql += ` AND cm.id_medico = $${params.length}`;
    }

    sql += ' ORDER BY c.nombre ASC, m.nombre_completo ASC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignMedicoToConsultorio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_consultorio, id_medico } = req.body;

    if (!id_consultorio || !id_medico) {
      res.status(400).json({
        success: false,
        message: 'Debe enviar id_consultorio e id_medico.',
      });
      return;
    }

    const result = await query(
      `
        INSERT INTO consultorio_medicos (id_consultorio, id_medico, activo)
        VALUES ($1, $2, TRUE)
        ON CONFLICT (id_consultorio, id_medico)
        DO UPDATE SET activo = TRUE
        RETURNING *
      `,
      [Number(id_consultorio), Number(id_medico)]
    );

    res.status(201).json({
      success: true,
      message: 'Médico asignado al consultorio correctamente.',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeMedicoFromConsultorio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `
        UPDATE consultorio_medicos
        SET activo = FALSE
        WHERE id_consultorio_medico = $1
        RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Relación no encontrada.' });
      return;
    }

    res.json({
      success: true,
      message: 'Médico desasignado del consultorio correctamente.',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMedico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_completo, especialidad, matricula_profesional, telefono, email } = req.body;

    if (!nombre_completo || !matricula_profesional) {
      res.status(400).json({
        success: false,
        message: 'Nombre completo y matrícula profesional son obligatorios.',
      });
      return;
    }

    const result = await query(
      `INSERT INTO medicos (nombre_completo, especialidad, matricula_profesional, telefono, email, activo)
       VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`,
      [nombre_completo, especialidad || null, matricula_profesional, telefono || null, email || null]
    );

    res.status(201).json({ success: true, message: 'Médico creado exitosamente.', data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPaciente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ci, nombre_completo, telefono, email, fecha_nacimiento } = req.body;

    if (!ci || !nombre_completo) {
      res.status(400).json({ success: false, message: 'CI y nombre completo son obligatorios.' });
      return;
    }

    const result = await query(
      `INSERT INTO pacientes (ci, nombre_completo, telefono, email, fecha_nacimiento, activo)
       VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`,
      [ci, nombre_completo, telefono || null, email || null, fecha_nacimiento || null]
    );

    res.status(201).json({ success: true, message: 'Paciente creado exitosamente.', data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReservas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estado, consultorio_id, medico_id, paciente_id } = req.query;

    let sql = `
      SELECT
        r.*,
        c.nombre AS consultorio_nombre,
        m.nombre_completo AS medico_nombre,
        p.nombre_completo AS paciente_nombre,
        e.nombre_completo AS empleado_nombre
      FROM reservas_medicamentos r
      INNER JOIN consultorios c ON c.id_consultorio = r.id_consultorio
      INNER JOIN medicos m ON m.id_medico = r.id_medico
      INNER JOIN pacientes p ON p.id_paciente = r.id_paciente
      INNER JOIN empleados e ON e.id_empleado = r.id_empleado
      WHERE 1 = 1
    `;
    const params: any[] = [];

    if (estado) {
      params.push(String(estado));
      sql += ` AND r.estado = $${params.length}`;
    }

    if (consultorio_id) {
      params.push(Number(consultorio_id));
      sql += ` AND r.id_consultorio = $${params.length}`;
    }

    if (medico_id) {
      params.push(Number(medico_id));
      sql += ` AND r.id_medico = $${params.length}`;
    }

    if (paciente_id) {
      params.push(Number(paciente_id));
      sql += ` AND r.id_paciente = $${params.length}`;
    }

    sql += ' ORDER BY r.fecha_solicitud DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReservaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const reserva = await query(
      `
        SELECT
          r.*,
          c.nombre AS consultorio_nombre,
          m.nombre_completo AS medico_nombre,
          m.matricula_profesional,
          p.nombre_completo AS paciente_nombre,
          p.ci AS paciente_ci,
          e.nombre_completo AS empleado_nombre
        FROM reservas_medicamentos r
        INNER JOIN consultorios c ON c.id_consultorio = r.id_consultorio
        INNER JOIN medicos m ON m.id_medico = r.id_medico
        INNER JOIN pacientes p ON p.id_paciente = r.id_paciente
        INNER JOIN empleados e ON e.id_empleado = r.id_empleado
        WHERE r.id_reserva = $1
      `,
      [id]
    );

    if (reserva.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Reserva no encontrada' });
      return;
    }

    const detalle = await query(
      `
        SELECT
          dr.*,
          pm.id_producto,
          pm.nombre_comercial,
          pm.nombre_generico,
          pm.concentracion,
          pm.forma_farmaceutica
        FROM detalle_reservas_medicamentos dr
        INNER JOIN productos_medicamentos pm ON pm.id_producto = dr.id_producto
        WHERE dr.id_reserva = $1
        ORDER BY dr.created_at ASC
      `,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...reserva.rows[0],
        items: detalle.rows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReserva = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      id_consultorio,
      id_medico,
      id_paciente,
      id_empleado,
      fecha_hora_retiro,
      observaciones,
      items,
    } = req.body;

    if (!id_consultorio || !id_medico || !id_paciente || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios para crear la reserva: consultorio, médico, paciente e ítems.',
      });
      return;
    }

    const empleadoId = Number(id_empleado ?? req.user?.id_empleado);
    if (!empleadoId || Number.isNaN(empleadoId)) {
      res.status(400).json({ success: false, message: 'No se pudo identificar al empleado responsable.' });
      return;
    }

    const itemsValidos = items.every(
      (item: any) => item && Number(item.id_producto) && Number(item.cantidad) > 0
    );

    if (!itemsValidos) {
      res.status(400).json({
        success: false,
        message: 'Cada ítem debe incluir id_producto y cantidad mayor a cero.',
      });
      return;
    }

    const nuevaReserva = await withTransaction(async (client) => {
      const reservaResult = await client.query(
        `
          INSERT INTO reservas_medicamentos (
            id_consultorio,
            id_medico,
            id_paciente,
            id_empleado,
            fecha_hora_retiro,
            observaciones,
            estado
          )
          VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
          RETURNING *
        `,
        [
          Number(id_consultorio),
          Number(id_medico),
          Number(id_paciente),
          empleadoId,
          fecha_hora_retiro || null,
          observaciones || null,
        ]
      );

      const idReserva = reservaResult.rows[0].id_reserva;

      for (const item of items) {
        await client.query(
          `
            INSERT INTO detalle_reservas_medicamentos (
              id_reserva,
              id_producto,
              cantidad_solicitada,
              cantidad_confirmada,
              estado_detalle,
              observaciones
            )
            VALUES ($1, $2, $3, $4, 'pendiente', $5)
          `,
          [
            idReserva,
            Number(item.id_producto),
            Number(item.cantidad),
            Number(item.cantidad) || 0,
            item.observaciones || null,
          ]
        );
      }

      return reservaResult.rows[0];
    });

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente.',
      data: nuevaReserva,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReservaEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    if (!estado || !estadoReservaValido.includes(estado)) {
      res.status(400).json({
        success: false,
        message: 'Estado inválido. Valores permitidos: pendiente, confirmada, preparada, entregada, cancelada.',
      });
      return;
    }

    const result = await query(
      `
        UPDATE reservas_medicamentos
        SET estado = $1,
            observaciones = COALESCE($2, observaciones)
        WHERE id_reserva = $3
        RETURNING *
      `,
      [estado, observaciones || null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Reserva no encontrada' });
      return;
    }

    await query(
      `
        UPDATE detalle_reservas_medicamentos
        SET estado_detalle = $1
        WHERE id_reserva = $2
      `,
      [estado, id]
    );

    res.json({ success: true, message: 'Estado actualizado correctamente.', data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
