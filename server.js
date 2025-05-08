const express = require('express');
const connectDb = require('./config/db');
require('dotenv').config();
const app = express();
const port = 3001;
const authRoutes = require('./routes/authRoutes');
const passport = require('passport');
require('./config/passport');
const cors = require('cors');
const tripRoutes = require('./routes/tripRoutes');
const aiRoutes = require('./routes/aiRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const profileRoutes = require('./routes/profileRoutes');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('./middleware/authMiddleware');
const User = require('./models/User'); 
const Trip = require('./models/Trip');
const Expense = require('./models/Expense');
  
connectDb(); 

app.use(cors({
  origin:  'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

const ensureUploadDirs = ()  => {
  const dirs = [
    'public/uploads',
    'public/uploads/avatars',
    'public/uploads/receipts'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};
ensureUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/receipts');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/avatars');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images are allowed'));
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter
});
 
const avatarUpload = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter
});    

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/profile', profileRoutes);

app.post('/api/upload', upload.single('receipt'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = `/uploads/receipts/${req.file.filename}`;
    res.json({ filePath });
  } catch (error) {
    console.error('Receipt upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

app.post('/api/upload-avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const relativeFilePath = `avatars/${req.file.filename}`;
    const fullFilePath = `/uploads/${relativeFilePath}`;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 'profile.avatar': fullFilePath },
      { new: true }
    ).select('-password -__v');

    res.json({
      success: true,
      filePath: fullFilePath,
      user: updatedUser
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload avatar',
      error: error.message 
    });
  }
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

  
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find({ createdBy: req.user._id });
    console.log('Found trips:', trips.length); 
    
    const expenses = await Expense.find({ user: req.user._id });
    
    const totalTrips = trips.length;
    const activeTrips = trips.filter(trip => 
      new Date(trip.endDate) > new Date()
    ).length;
    
    const totalBudget = trips.reduce((sum, trip) => sum + trip.totalBudget, 0);
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const recentTrips = trips
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    const budgetData = [
      { name: 'Transport', value: 0 },
      { name: 'Accommodation', value: 0 },
      { name: 'Food', value: 0 },
      { name: 'Activities', value: 0 }
    ];
    
    trips.forEach(trip => {
      budgetData[0].value += trip.totalBudget * 0.3;
      budgetData[1].value += trip.totalBudget * 0.4;
      budgetData[2].value += trip.totalBudget * 0.2;
      budgetData[3].value += trip.totalBudget * 0.1;
    });
    
    res.json({
      totalTrips,
      activeTrips,
      totalBudget,
      totalSpent,
      recentTrips,
      budgetData
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});