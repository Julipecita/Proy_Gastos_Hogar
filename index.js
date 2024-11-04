// Importación de módulos
const path = require('path');   // Para ejecutar desde index.html

const express = require('express');
const connection = require('./db');
const { error } = require('console');

// Inicialización de la aplicación Express
const app = express();
app.use(express.json());  // Middleware para parsear solicitudes con formato JSON

app.use(express.urlencoded({ extended: true }));
// Servir el archivo index.html
app.use(express.static(path.join(__dirname, 'template')));

// Ruta GET para verificar el estado de la API
app.get('/api/prueba', (req, res) => {
    res.send("La API esta funcionando bien....");
});

/** Ruta GET de prueba
 * Devuelve un mensaje y detalles adicionales como el puerto y el estado de la respuesta */
app.get('/api/prueba1', (req, res) => {  // Corrección de sintaxis en la ruta '/api/prueba1' (faltaba '/')
    const PORT = 3000;  // Definición del puerto utilizado para referenciarlo en la respuesta
    res.status(200).json({
        message: 'La API responde Correctamente',
        port: PORT,
        status: 'success'
    });
});

// Consultar los registros de la Tabla
app.get('/api/obtener', (req, res) => {
    const query = "SELECT * FROM  gastos";
    connection.query(query, (error, result) => {

        if (error) {
            res.status(500).json({
                success: false,
                message: "Error de recuperacion datos",
                datails: error.message
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Datos de la tabla",
                data: result
            });
            //res.json(result);
        }
    })
});
/* Crear api POST */
// Ruta POST para guardar un registro en la base de datos
app.post('/api/guardar', (req, res) => {  // Eliminación de la barra adicional en '/api/guardar/'
    const { item, concepto, monto, fecha } = req.body;

    // Consulta SQL para insertar un nuevo concepto en la tabla 'gastos'
    const sql = 'INSERT INTO gastos(item, concepto, monto, fecha) VALUES(?,?,?,?)';
    connection.query(sql, [item, concepto, monto, fecha], (error, result) => {  // Corrección de sintaxis al pasar parámetros a connection.query()

        if (error) {
            res.status(500).json({ error });
        } else {
            res.status(201).json({ id: result.insertId, item, concepto, monto, fecha });
        }
    });
});

// Nueva ruta PUT para actualizar un registro en la base de datos
app.put('/api/actualizar/:item', (req, res) => {
    const { item } = req.params;
    const { concepto, monto, fecha } = req.body;

    // Validación para asegurar que el campo 'item' esté presente
    if (!item) {
        return res.status(400).json({ error: "El campo 'item' es obligatorio para la actualización." });
    }
    const query = `
      UPDATE gastos 
      SET 
        concepto = COALESCE(?, concepto),
        monto = COALESCE(?, monto),
        fecha = COALESCE(?, fecha)
      WHERE item = ?
    `;
    //const sql = 'UPDATE gastos SET concepto = ?, monto = ?, fecha = ? WHERE item = ?';
    connection.query(query, [concepto, monto, fecha, item], (error, result) => {
        if (error) {
            res.status(500).json({ error });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: "No se encontró una concepto con ITEM proporcionada." });
        } else {
            res.status(200).json({ message: "Registro actualizado exitosamente", item, concepto, monto, fecha });
        }
    });
});

// Nueva ruta PUT para actualizar un registro en la base de datos
app.delete('/api/eliminar/:item', (req, res) => {
    const { item } = req.params;

    // Validación para asegurar que el campo 'item' esté presente
    if (!item) {
        return res.status(400).json({ error: "El campo 'item' es obligatorio para el borrado." });
    }

    const query = 'DELETE FROM gastos WHERE item = ?';
    connection.query(query, [item], (error, result) => {
        if (error) {
            res.status(500).json({ error });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: "No se encontró una concepto con ITEM proporcionada." });
        } else {
            res.status(200).json({ message: `Registro Borrado exitosamente: ${item}` });
        }
    });
});

// Configuración del puerto y mensaje de conexión
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en puerto ${PORT}`);
});
