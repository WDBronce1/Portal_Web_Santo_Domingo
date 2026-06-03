const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PUERTO = process.env.PUERTO || 3264;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_municipal_2026';

// Middlewares globales
app.use(cors()); // Conexión con el frontend
app.use(express.json()); // Recibir datos en formato JSON

/* ---------------------------------------------------------------------------------------
    Middlewares de Seguridad (EP 2.5 / 2.6)
*/

// Middleware para verificar la validez del token JWT
const autenticarJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Formato "Bearer <token>"
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Token inválido o expirado' });
            }
            req.user = user; // Guarda el usuario decodificado { rut, rol, nombre }
            next();
        });
    } else {
        res.status(401).json({ error: 'Acceso no autorizado: Token faltante' });
    }
};

// Middleware para verificar si el usuario tiene rol de administrador
const requiereAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado: Se requiere rol de administrador' });
    }
};

/* ---------------------------------------------------------------------------------------
    Rutas de Autenticación (EP 2.5 / 2.6)
*/

app.post('/api/auth/register', async (req, res) => {
    try {
        const { rut, nombre, email, region, comuna, password } = req.body;
        
        // Validación básica
        if (!rut || !nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        
        // Comprobar si el usuario existe en BD
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { rut: rut }
        });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Este RUT ya se encuentra registrado' });
        }
        
        // Hash seguro con bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Asignación de rol: '11.111.111-1' es admin de prueba, el resto ciudadanos
        const rol = (rut === '11.111.111-1') ? 'admin' : 'ciudadano';
        
        // En la base de datos solo guardamos los campos que existen en schema.prisma
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                rut,
                password: passwordHash,
                rol
            }
        });
        
        // Generación de JWT (incluyendo campos adicionales que se suministraron en el registro)
        const token = jwt.sign(
            { rut: nuevoUsuario.rut, rol: nuevoUsuario.rol, nombre: nombre },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            token,
            usuario: {
                rut: nuevoUsuario.rut,
                nombre: nombre,
                email: email,
                region: region,
                comuna: comuna,
                rol: nuevoUsuario.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { rut, password } = req.body;
        
        if (!rut || !password) {
            return res.status(400).json({ error: 'El RUT y la contraseña son requeridos' });
        }
        
        const usuario = await prisma.usuario.findUnique({
            where: { rut: rut }
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no registrado' });
        }
        
        // Comprobación segura de contraseña
        const coincide = await bcrypt.compare(password, usuario.password);
        if (!coincide) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Generación de JWT y campos adaptados para el frontend
        const esAdmin = usuario.rol === 'admin';
        const nombre = esAdmin ? 'Funcionario Municipal' : 'Vecino/a';
        const email = esAdmin ? 'admin@santodomingo.cl' : 'ciudadano@santodomingo.cl';
        const region = 'Valparaíso';
        const comuna = 'Santo Domingo';

        const token = jwt.sign(
            { rut: usuario.rut, rol: usuario.rol, nombre: nombre },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            token,
            usuario: {
                rut: usuario.rut,
                nombre,
                email,
                region,
                comuna,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

/* ---------------------------------------------------------------------------------------
    Rutas para Proyectos
*/ 
app.get('/api/proyectos', async (req, res) => {
    try {
        const proyectos = await prisma.proyecto.findMany();
        res.status(200).json(proyectos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
});

app.post('/api/proyectos', autenticarJWT, requiereAdmin, async (req, res) => {
    try {
        const { nombre, rutEmpresa, ubicacion, fechaInicio, duracionMeses, estado } = req.body;
        const nuevoProyecto = await prisma.proyecto.create({
            data: { nombre, rutEmpresa, ubicacion, fechaInicio: new Date(fechaInicio), duracionMeses, estado }
        });
        res.status(201).json(nuevoProyecto); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el proyecto' });
    }
});

app.put('/api/proyectos/:id', autenticarJWT, requiereAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, rutEmpresa, ubicacion, estado } = req.body;
        const proyectoActualizado = await prisma.proyecto.update({
            where: { id: parseInt(id) },
            data: { nombre, rutEmpresa, ubicacion, estado }
        });
        res.status(200).json(proyectoActualizado);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Proyecto no encontrado' });
    }
});

app.delete('/api/proyectos/:id', autenticarJWT, requiereAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proyecto.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ mensaje: 'Proyecto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Proyecto no encontrado o ya eliminado' });
    }
});

/* ---------------------------------------------------------------------------------------
    Rutas para Noticias
*/ 
app.get('/api/noticias', async(req, res) =>{
    try {
        const noticias = await prisma.noticia.findMany({ orderBy: { fechaPublicacion: 'desc' } });
        res.status(200).json(noticias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las noticias' });
    }
});

app.post('/api/noticias', autenticarJWT, requiereAdmin, async(req, res) =>{
    try {
        const { titulo, contenido, nombrePeriodista } = req.body;
        const nuevaNoticia = await prisma.noticia.create({ data: { titulo, contenido, nombrePeriodista } });
        res.status(201).json(nuevaNoticia);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la noticia' });
    }
});

app.put('/api/noticias/:id', autenticarJWT, requiereAdmin, async(req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, nombrePeriodista } = req.body;
        const noticiaActualizada = await prisma.noticia.update({
            where: { id: parseInt(id) },
            data: { titulo, contenido, nombrePeriodista }
        });
        res.status(200).json(noticiaActualizada);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Noticia no encontrada' });
    }
});

app.delete('/api/noticias/:id', autenticarJWT, requiereAdmin, async(req, res) => {
    try {
        const { id } = req.params;
        await prisma.noticia.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ mensaje: 'Noticia eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Noticia no encontrada' });
    }
});

/* ---------------------------------------------------------------------------------------
    Rutas para Actividades
*/ 
app.get('/api/actividades', async(req, res) =>{
    try {
        const actividades = await prisma.actividad.findMany();
        res.status(200).json(actividades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las actividades' });
    }
});

app.post('/api/actividades', autenticarJWT, requiereAdmin, async(req, res) =>{
    try {
        const { titulo, descripcion, ubicacion, fecha, cuposTotales } = req.body;
        const nuevaActividad = await prisma.actividad.create({
            data: { titulo, descripcion, ubicacion, fecha: new Date(fecha), cuposTotales }
        });
        res.status(201).json(nuevaActividad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la actividad' });
    }
});

app.put('/api/actividades/:id', autenticarJWT, requiereAdmin, async(req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, ubicacion, fecha, cuposTotales, cuposOcupados } = req.body;
        const actividadActualizada = await prisma.actividad.update({
            where: { id: parseInt(id) },
            data: { titulo, descripcion, ubicacion, fecha: new Date(fecha), cuposTotales, cuposOcupados }
        });
        res.status(200).json(actividadActualizada);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Actividad no encontrada' });
    }
});

app.delete('/api/actividades/:id', autenticarJWT, requiereAdmin, async(req, res) => {
    try {
        const { id } = req.params;
        await prisma.actividad.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ mensaje: 'Actividad eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Actividad no encontrada' });
    }
});

/* ---------------------------------------------------------------------------------------
    Rutas para Opiniones
*/ 
app.get('/api/opiniones', async(req, res) =>{
    try {
        const opiniones = await prisma.opinion.findMany({ include: { proyecto: true } });
        res.status(200).json(opiniones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las opiniones' });
    }
});

app.post('/api/opiniones', autenticarJWT, async(req, res) =>{
    try {
        const { calificacion, comentario, proyectoId, usuarioRut } = req.body;
        const nuevaOpinion = await prisma.opinion.create({
            data: { calificacion, comentario, proyectoId, usuarioRut }
        });
        res.status(201).json(nuevaOpinion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la opinión' });
    }
});

app.put('/api/opiniones/:id', autenticarJWT, async(req, res) => {
    try {
        const { id } = req.params;
        const { calificacion, comentario } = req.body;
        const opinionActualizada = await prisma.opinion.update({
            where: { id: parseInt(id) },
            data: { calificacion, comentario }
        });
        res.status(200).json(opinionActualizada);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Opinión no encontrada' });
    }
});

app.delete('/api/opiniones/:id', autenticarJWT, async(req, res) => {
    try {
        const { id } = req.params;
        await prisma.opinion.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ mensaje: 'Opinión eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Opinión no encontrada' });
    }
});

/* ---------------------------------------------------------------------------------------
    Rutas para Servicios
*/ 
app.post('/api/servicios/recoleccion', autenticarJWT, async(req, res) => {
    try {
        const { tipoBasura, ubicacion, motivo, usuarioRut } = req.body;
        const nuevaRecoleccion = await prisma.recoleccionDomicilio.create({
            data: { tipoBasura, ubicacion, motivo, usuarioRut }
        });
        res.status(201).json(nuevaRecoleccion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al solicitar recolección' });
    }
});

app.get('/api/servicios/zonas-verdes', async(req, res) => {
    try {
        const zonas = await prisma.zonaVerde.findMany();
        res.status(200).json(zonas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las zonas verdes' });
    }
});

/* ---------------------------------------------------------------------------------------
    Inicialización de Usuarios Semilla (EP 2.5 / 2.6)
*/
async function sembrarUsuariosSemilla() {
    try {
        const conteo = await prisma.usuario.count();
        if (conteo === 0) {
            console.log('🌱 [Seed] Base de datos vacía. Sembrando usuarios iniciales...');
            const salt = await bcrypt.genSalt(10);
            
            // Administrador
            const adminHash = await bcrypt.hash('admin1234', salt);
            await prisma.usuario.create({
                data: {
                    rut: '11.111.111-1',
                    rol: 'admin',
                    password: adminHash
                }
            });

            // Ciudadano
            const ciudadanoHash = await bcrypt.hash('clave1234', salt);
            await prisma.usuario.create({
                data: {
                    rut: '12.345.678-5',
                    rol: 'ciudadano',
                    password: ciudadanoHash
                }
            });
            console.log('✅ [Seed] Usuarios de prueba creados satisfactoriamente.');
        }
    } catch (err) {
        console.error('❌ [Seed] Error al inicializar usuarios en PostgreSQL:', err.message);
    }
}

/* -------------------------------------------------------
    Iniciar el servidor
*/
app.listen(PUERTO, async () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PUERTO}`);
    await sembrarUsuariosSemilla();
});