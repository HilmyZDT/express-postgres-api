// Load environment variables from specified path or default
const path = require('path');
const envPath = process.env.ENV_PATH || '.env';
require('dotenv').config({ path: envPath });

console.log(`🔧 Loading environment from: ${envPath}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

const express = require('express');
const db = require('./src/models');
const routes = require('./src/routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/', (req, res) => {
	res.json({
		success: true,
		message: 'Welcome to Express PostgreSQL API',
		version: '1.0.0',
		features: [
			'Auto-discovery routes',
			'PostgreSQL with Sequelize',
			'Environment variables with dotenv',
			'MVC Architecture'
		],
		endpoints: {
			api_info: '/api',
			health: '/api/health',
			users: '/api/users',
			auth: '/api/auth',
			posts: '/api/posts'
		}
	});
});

// API Routes
app.use('/api', routes);

// Uji koneksi database
async function testDbConnection() {
	try {
		await db.sequelize.authenticate();
		console.log('✅ Koneksi ke database berhasil terkoneksi.');
	} catch (error) {
		console.error('❌ Tidak dapat terhubung ke database:', error);
	}
}

testDbConnection();

app.listen(port, () => {
	console.log(`🚀 Server berjalan di http://localhost:${port}`);
});