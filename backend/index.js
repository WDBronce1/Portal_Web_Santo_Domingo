const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const xss = require('xss');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PUERTO = process.env.PUERTO || 3264;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_municipal_2026';

// Middlewares globales
app.use(helmet({
    contentSecurityPolicy: false, // Permitir carga de recursos externos en desarrollo/Ionic
}));

const whitelist = ['http://localhost:5173', 'https://portal-santo-domingo.vercel.app', 'http://localhost:8100'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por políticas CORS de la Municipalidad de Santo Domingo'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Sanitizar entradas para evitar XSS en req.body
const sanitizarEntrada = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
};
app.use(sanitizarEntrada);

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
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        if (page && limit) {
            const skip = (page - 1) * limit;
            const [proyectos, total] = await Promise.all([
                prisma.proyecto.findMany({
                    skip,
                    take: limit
                }),
                prisma.proyecto.count()
            ]);
            return res.status(200).json({
                data: proyectos,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        }

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
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        if (page && limit) {
            const skip = (page - 1) * limit;
            const [noticias, total] = await Promise.all([
                prisma.noticia.findMany({
                    orderBy: { fechaPublicacion: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.noticia.count()
            ]);
            return res.status(200).json({
                data: noticias,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        }

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
    Rutas para Servicios y Solicitudes
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

app.post('/api/servicios/reciclaje', autenticarJWT, async (req, res) => {
    try {
        const { ubicacionPropuesta, motivo, usuarioRut } = req.body;
        const nuevaPeticion = await prisma.peticionReciclaje.create({
            data: { ubicacionPropuesta, motivo, usuarioRut }
        });
        res.status(201).json(nuevaPeticion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al solicitar punto de reciclaje' });
    }
});

app.get('/api/servicios/solicitudes', autenticarJWT, requiereAdmin, async (req, res) => {
    try {
        const recolecciones = await prisma.recoleccionDomicilio.findMany({
            include: { usuario: { select: { rut: true } } }
        });
        const peticiones = await prisma.peticionReciclaje.findMany({
            include: { usuario: { select: { rut: true } } }
        });

        // Combinar en formato estandarizado
        const combinadas = [
            ...recolecciones.map(r => ({
                id: r.id,
                tipo: 'recoleccion',
                nombre: 'Retiro de voluminosos / escombros',
                direccion: r.ubicacion,
                detalle: r.motivo,
                usuarioRut: r.usuarioRut,
                estado: r.estado,
                fecha: new Date().toISOString().slice(0, 10)
            })),
            ...peticiones.map(p => ({
                id: p.id,
                tipo: 'tacho',
                nombre: 'Solicitar tacho de reciclaje',
                direccion: p.ubicacionPropuesta,
                detalle: p.motivo,
                usuarioRut: p.usuarioRut,
                estado: p.estado,
                fecha: new Date().toISOString().slice(0, 10)
            }))
        ];

        // Ordenar por ID descendente
        combinadas.sort((a, b) => b.id - a.id);
        res.status(200).json(combinadas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las solicitudes' });
    }
});

app.put('/api/servicios/solicitudes/:tipo/:id', autenticarJWT, requiereAdmin, async (req, res) => {
    try {
        const { tipo, id } = req.params;
        const { estado } = req.body; // PENDIENTE, EN PROCESO, RESUELTO, RECHAZADO

        if (tipo === 'recoleccion') {
            const actualizada = await prisma.recoleccionDomicilio.update({
                where: { id: parseInt(id) },
                data: { estado }
            });
            return res.status(200).json(actualizada);
        } else if (tipo === 'tacho' || tipo === 'reciclaje') {
            const actualizada = await prisma.peticionReciclaje.update({
                where: { id: parseInt(id) },
                data: { estado }
            });
            return res.status(200).json(actualizada);
        } else {
            return res.status(400).json({ error: 'Tipo de solicitud inválido' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el estado de la solicitud' });
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
    Integración Externa: API Clima Santo Domingo (EF 5)
*/
app.get('/api/clima', async (req, res) => {
    try {
        const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=-33.6366&longitude=-71.6186&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=America%2FSantiago'
        );
        if (response.ok) {
            const data = await response.json();
            const current = data.current;
            
            let descripcion = 'Despejado';
            let icon = 'sunny';
            const code = current.weather_code;
            if (code >= 1 && code <= 3) {
                descripcion = 'Parcialmente Nublado';
                icon = 'cloudy';
            } else if (code >= 45 && code <= 48) {
                descripcion = 'Neblina';
                icon = 'fog';
            } else if (code >= 51 && code <= 67) {
                descripcion = 'Llovizna / Lluvia';
                icon = 'rainy';
            } else if (code >= 71 && code <= 86) {
                descripcion = 'Nieve';
                icon = 'snow';
            } else if (code >= 95 && code <= 99) {
                descripcion = 'Tormenta Eléctrica';
                icon = 'thunderstorm';
            }

            return res.status(200).json({
                temperatura: current.temperature_2m,
                sensacion: current.apparent_temperature,
                humedad: current.relative_humidity_2m,
                viento: current.wind_speed_10m,
                descripcion,
                icon,
                fecha: new Date().toISOString()
            });
        }
    } catch (err) {
        console.warn('[Weather API] Error al conectar con Open-Meteo, usando datos de contingencia:', err.message);
    }

    // Fallback de contingencia (Santo Domingo, Chile)
    res.status(200).json({
        temperatura: 16.5,
        sensacion: 16.0,
        humedad: 75,
        viento: 12.0,
        descripcion: 'Parcialmente Nublado (Caché local)',
        icon: 'cloudy',
        fecha: new Date().toISOString(),
        contingencia: true
    });
});

/* ---------------------------------------------------------------------------------------
    Inicialización de Datos Semilla (EP 2.5 / 2.6 / EF 1)
*/
async function sembrarDatosSemilla() {
    try {
        // 1. Usuarios
        const conteoUsuarios = await prisma.usuario.count();
        if (conteoUsuarios === 0) {
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
            console.log('✅ [Seed] Usuarios de prueba creados.');
        }

        // 2. Proyectos
        const conteoProyectos = await prisma.proyecto.count();
        if (conteoProyectos === 0) {
            console.log('🌱 [Seed] Sembrando proyectos iniciales...');
            await prisma.proyecto.createMany({
                data: [
                    { nombre: 'Extensión de Ciclovía Costera', rutEmpresa: '76.123.456-7', ubicacion: 'Borde Costero', fechaInicio: new Date('2026-06-01'), duracionMeses: 8, estado: 'En Planificación' },
                    { nombre: 'Mejoramiento Plaza de Armas', rutEmpresa: '76.987.654-3', ubicacion: 'Centro', fechaInicio: new Date('2026-03-15'), duracionMeses: 5, estado: 'En Ejecución' },
                    { nombre: 'Centro Comunitario Ecológico', rutEmpresa: '77.555.444-2', ubicacion: 'Sector Sur', fechaInicio: new Date('2026-08-01'), duracionMeses: 12, estado: 'Licitación' },
                    { nombre: 'Restauración de Fachadas Patrimoniales', rutEmpresa: '78.222.111-9', ubicacion: 'Casco Histórico', fechaInicio: new Date('2026-07-01'), duracionMeses: 10, estado: 'Evaluación Ambiental' }
                ]
            });
        }

        // 3. Noticias
        const conteoNoticias = await prisma.noticia.count();
        if (conteoNoticias === 0) {
            console.log('🌱 [Seed] Sembrando noticias iniciales...');
            await prisma.noticia.createMany({
                data: [
                    { titulo: 'Gran Limpieza del Borde Costero', contenido: 'La jornada reunió a juntas de vecinos, colegios y agrupaciones ecológicas en una limpieza colaborativa que retiró cerca de 1,2 toneladas de residuos del litoral.', nombrePeriodista: 'Dirección de Medio Ambiente', fechaPublicacion: new Date('2026-05-05') },
                    { titulo: 'Nuevo programa de compostaje domiciliario', contenido: 'El programa busca reducir la fracción orgánica que llega al relleno sanitario y promover huertos urbanos en los hogares de la comuna.', nombrePeriodista: 'Oficina de Reciclaje', fechaPublicacion: new Date('2026-05-02') },
                    { titulo: 'Luminarias solares en plazas principales', contenido: 'La inversión permitirá un ahorro energético anual estimado del 35% en alumbrado público de áreas verdes.', nombrePeriodista: 'Dirección de Obras', fechaPublicacion: new Date('2026-04-28') }
                ]
            });
        }

        // 4. Actividades
        const conteoActividades = await prisma.actividad.count();
        if (conteoActividades === 0) {
            console.log('🌱 [Seed] Sembrando actividades iniciales...');
            await prisma.actividad.createMany({
                data: [
                    { titulo: 'Taller de Huertos Urbanos', descripcion: 'Aprende a cultivar tus propios vegetales en espacios reducidos usando materiales reciclados.', ubicacion: 'Invernadero Municipal', fecha: new Date('2026-05-10T10:00:00Z'), cuposTotales: 30, cuposOcupados: 18 },
                    { titulo: 'Caminata de Observación de Aves', descripcion: 'Recorrido guiado para identificar especies endémicas y proteger los humedales.', ubicacion: 'Humedal Costero', fecha: new Date('2026-05-15T08:00:00Z'), cuposTotales: 25, cuposOcupados: 9 },
                    { titulo: 'Feria de Emprendimiento Sustentable', descripcion: 'Stands de artesanos y pymes locales que trabajan con economía circular.', ubicacion: 'Plaza Principal', fecha: new Date('2026-05-22T11:00:00Z'), cuposTotales: 50, cuposOcupados: 31 }
                ]
            });
        }
        console.log('✅ [Seed] Sembrado de base de datos finalizado con éxito.');
    } catch (err) {
        console.error('❌ [Seed] Error al inicializar datos en PostgreSQL:', err.message);
    }
}

/* -------------------------------------------------------
    Iniciar el servidor
*/
app.listen(PUERTO, async () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PUERTO}`);
    await sembrarDatosSemilla();
});