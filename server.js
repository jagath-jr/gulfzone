require('dotenv').config(); // Load environment variables
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURATION ---
// Credentials are now loaded from the .env file for security
const ADMIN_USER = { 
    username: process.env.ADMIN_USERNAME || 'admin', 
    password: process.env.ADMIN_PASSWORD // Ensure you set this in .env!
};
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

// --- MIDDLEWARE ---
app.set('view engine', 'ejs');
app.use(express.static(PUBLIC_DIR));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'gulfzone_secret_fallback',
    resave: false,
    saveUninitialized: true
}));

// Multer for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(PUBLIC_DIR, 'assets/images/uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Ensure upload directory exists
const uploadDir = path.join(PUBLIC_DIR, 'assets/images/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// --- HELPERS ---
const readJSON = (file) => {
    try {
        return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    } catch (err) {
        return {}; 
    }
};

// ** UPDATED WRITE FUNCTION (Safe Smart Cleanup) **
const writeJSON = (file, data) => {
    const filePath = path.join(DATA_DIR, file);
    const backupPath = path.join(DATA_DIR, file + '.bak');

    // 1. SMART CLEANUP
    // Only runs when we are about to overwrite an old backup
    if (file === 'services.json' && fs.existsSync(backupPath) && fs.existsSync(filePath)) {
        try {
            const oldBackup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            const currentLive = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            if (oldBackup.servicesPage && currentLive.servicesPage) {
                const currentImages = new Set(currentLive.servicesPage.map(s => s.image));

                oldBackup.servicesPage.forEach(service => {
                    // CRITICAL FIX: Only delete if it is in the 'uploads' folder!
                    // This prevents the system from deleting your template/default images.
                    if (service.image && 
                        service.image.includes('uploads') && 
                        !currentImages.has(service.image)) {
                        
                        const imgPath = path.join(PUBLIC_DIR, service.image);
                        if (fs.existsSync(imgPath)) {
                            fs.unlinkSync(imgPath);
                            console.log('Cleanup: Deleted old uploaded image ->', service.image);
                        }
                    }
                });
            }
        } catch (err) {
            console.error('Error during image cleanup:', err);
        }
    }

    // 2. CREATE NEW BACKUP
    if (fs.existsSync(filePath)) {
        const current = fs.readFileSync(filePath);
        fs.writeFileSync(backupPath, current);
    }

    // 3. WRITE NEW DATA
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Auth Middleware
const requireAuth = (req, res, next) => {
    if (req.session.isAuthenticated) return next();
    res.redirect('/admin/login');
};

// --- API ROUTES (For Frontend) ---
app.get('/api/content', (req, res) => res.json(readJSON('content.json')));
app.get('/api/services', (req, res) => res.json(readJSON('services.json')));

// --- ADMIN ROUTES ---

// Login
app.get('/admin/login', (req, res) => res.render('login', { error: null }));
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Check against Environment Variables
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        req.session.isAuthenticated = true;
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Invalid Credentials' });
    }
});
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Dashboard
app.get('/admin', requireAuth, (req, res) => {
    res.render('dashboard');
});

// 1. Global / Footer / Contact Info
app.get('/admin/global', requireAuth, (req, res) => {
    res.render('global', { data: readJSON('content.json').global });
});
app.post('/admin/global', requireAuth, (req, res) => {
    const content = readJSON('content.json');
    content.global = req.body;
    writeJSON('content.json', content);
    res.redirect('/admin/global');
});

// 2. Home Page
app.get('/admin/home', requireAuth, (req, res) => {
    res.render('home', { data: readJSON('content.json').home });
});
app.post('/admin/home', requireAuth, (req, res) => {
    const content = readJSON('content.json');
    content.home = req.body;
    writeJSON('content.json', content);
    res.redirect('/admin/home');
});

// 3. Services Management
app.get('/admin/services', requireAuth, (req, res) => {
    res.render('services', { services: readJSON('services.json').servicesPage });
});

// --- Add Service ---
app.post('/admin/services/add', requireAuth, upload.single('image'), (req, res) => {
    const servicesData = readJSON('services.json');
    const { title, description } = req.body;
    
    const newService = {
        id: Date.now().toString(),
        title: title,
        description: description,
        image: req.file ? `assets/images/uploads/${req.file.filename}` : 'assets/images/placeholder.png'
    };

    if (!servicesData.servicesPage) servicesData.servicesPage = [];
    servicesData.servicesPage.push(newService);

    writeJSON('services.json', servicesData);
    res.redirect('/admin/services');
});

// --- Delete Service (Simple) ---
// Note: We use the simple delete here. The image cleanup is handled automatically
// by the writeJSON helper when the NEXT action occurs.
app.post('/admin/services/delete', requireAuth, (req, res) => {
    const servicesData = readJSON('services.json');
    const { id } = req.body;

    if (servicesData.servicesPage) {
        servicesData.servicesPage = servicesData.servicesPage.filter(s => s.id !== id);
        writeJSON('services.json', servicesData);
    }
    res.redirect('/admin/services');
});

// Update specific service
app.post('/admin/services/update', requireAuth, upload.single('image'), (req, res) => {
    const servicesData = readJSON('services.json');
    const { id, title, description } = req.body;
    
    const serviceIndex = servicesData.servicesPage.findIndex(s => s.id === id);
    if (serviceIndex > -1) {
        servicesData.servicesPage[serviceIndex].title = title;
        servicesData.servicesPage[serviceIndex].description = description;
        if (req.file) {
            servicesData.servicesPage[serviceIndex].image = `assets/images/uploads/${req.file.filename}`;
        }
        writeJSON('services.json', servicesData);
    }
    res.redirect('/admin/services');
});

// Undo & Restore
app.post('/admin/undo', requireAuth, (req, res) => {
    const { file } = req.body; 
    if (fs.existsSync(path.join(DATA_DIR, file + '.bak'))) {
        const backup = fs.readFileSync(path.join(DATA_DIR, file + '.bak'));
        fs.writeFileSync(path.join(DATA_DIR, file), backup);
    }
    res.redirect('back');
});

app.post('/admin/restore', requireAuth, (req, res) => {
    const { file } = req.body;
    const defaultFile = file.replace('.json', '.default.json');
    if (fs.existsSync(path.join(DATA_DIR, defaultFile))) {
        const def = fs.readFileSync(path.join(DATA_DIR, defaultFile));
        fs.writeFileSync(path.join(DATA_DIR, file), def);
    }
    res.redirect('back');
});

// --- DYNAMIC EMAIL ROUTE WITH EMBEDDED LOGO ---
app.post('/api/send-email', async (req, res) => {
    const content = readJSON('content.json'); 
    const companyEmail = content.global.email; 

    const { name, email, phone, service, message, source_page } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`, 
        to: companyEmail,
        replyTo: email, 
        subject: `🌐 New Inquiry: ${service} from ${name}`,
        // --- ATTACHMENTS FOR EMBEDDED IMAGES ---
        attachments: [{
            filename: 'favicon.png',
            path: path.join(PUBLIC_DIR, 'assets/images/common/favicon.png'),
            cid: 'companylogo' // Same ID used in the <img> tag below
        }],
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #0d6efd; color: #ffffff; padding: 25px 20px; text-align: center;">
                    <img src="cid:companylogo" alt="Logo" style="width: 50px; height: 50px; margin-bottom: 10px; border-radius: 5px;">
                    <h2 style="margin: 0; font-size: 24px;">New Website Inquiry</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Received from ${source_page}</p>
                </div>

                <div style="padding: 30px; background-color: #ffffff;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555; width: 40%;">Customer Name</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #222222;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Email Address</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;"><a href="mailto:${email}" style="color: #0d6efd; text-decoration: none;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Phone Number</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #222222;">${phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Service Requested</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                                <span style="background-color: #e7f1ff; color: #0d6efd; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">${service}</span>
                            </td>
                        </tr>
                    </table>

                    <div style="margin-top: 25px;">
                        <h4 style="color: #555555; margin-bottom: 10px;">Message:</h4>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #0d6efd; color: #333333; line-height: 1.6;">
                            ${message}
                        </div>
                    </div>
                </div>

                <div style="background-color: #f1f1f1; padding: 15px; text-align: center; color: #888888; font-size: 12px;">
                    <p style="margin: 0;">This inquiry was sent automatically from the <strong>Gulf Zone</strong> website contact form.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});
// ** FIXED: Missing closing parenthesis for app.listen **
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));