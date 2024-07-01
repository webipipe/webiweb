const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 3000;

// Configuración de conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'zapatillas_base'
});

// Conectar a MySQL
db.connect((err) => {
    if (err) {
        console.error('Error al conectar con MySQL:', err);
        throw err;
    }
    console.log('Conexión a la base de datos MySQL establecida.');
});

// Middleware para gestionar la carga de archivos (multer)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/zapatillas/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware para procesar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para sesiones
app.use(session({
    secret: 'secret-key-for-session',
    resave: false,
    saveUninitialized: true
}));

// Ruta para registrar un nuevo usuario
app.post('/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // Encriptar la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
        const sql = "INSERT INTO usuarios (nombre, email, password, role) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, email, hashedPassword, role], (err, result) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                res.status(500).send('Error al registrar usuario.');
            } else {
                console.log('Usuario registrado correctamente.');
                res.status(200).json({ message: 'Usuario registrado correctamente.' });
            }
        });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        res.status(500).send('Error al registrar usuario.');
    }
});

// Ruta para iniciar sesión
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            res.status(500).send('Error al buscar usuario.');
        } else {
            if (results.length > 0) {
                const user = results[0];
                try {
                    // Comparar la contraseña encriptada
                    const match = await bcrypt.compare(password, user.password);
                    if (match) {
                        req.session.user = user;
                        res.status(200).json({ message: 'Inicio de sesión exitoso.' });
                    } else {
                        res.status(401).send('Credenciales incorrectas.');
                    }
                } catch (error) {
                    console.error('Error al comparar contraseñas:', error);
                    res.status(500).send('Error al iniciar sesión.');
                }
            } else {
                res.status(404).send('Usuario no encontrado.');
            }
        }
    });
});

// Ruta para agregar zapatillas
app.post('/admin/agregar_zapatillas', upload.single('imagenZapatillas'), (req, res) => {
    const { nombre, precio, descripcion } = req.body;
    const imagenZapatillas = req.file.filename;

    const sql = "INSERT INTO zapatillas (nombre, precio, descripcion, imagen) VALUES (?, ?, ?, ?)";
    db.query(sql, [nombre, precio, descripcion, imagenZapatillas], (err, result) => {
        if (err) {
            console.error('Error al agregar zapatillas:', err);
            res.status(500).send('Error al agregar zapatillas.');
        } else {
            console.log('Zapatillas agregadas correctamente.');
            res.status(200).json({ message: 'Zapatillas agregadas correctamente.' });
        }
    });
});

// Ruta para obtener todas las zapatillas
app.get('/admin/zapatillas', (req, res) => {
    const sql = "SELECT * FROM zapatillas";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener zapatillas:', err);
            res.status(500).send('Error al obtener zapatillas.');
        } else {
            res.status(200).json(results);
        }
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor Node.js ejecutándose en http://localhost:${port}`);
});
