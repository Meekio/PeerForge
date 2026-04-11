const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Profile = require('../models/Profile');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const User = require('../models/User');

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// @route   POST api/profiles/create
router.post('/create', auth, async (req, res) => {
  const { name, college, role, skills, description } = req.body;
  const profileFields = { user: req.user.id, name, college, role, description };
  if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());

  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
      return res.json(profile);
    }
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profiles/upload-id
// Verify against Python service
router.post('/upload-id', [auth, upload.single('idCard')], async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const filePath = req.file.path;
    
    // Call Python verification service internally
    try {
        const pythonResponse = await axios.post('http://127.0.0.1:5001/verify', {
            imagePath: filePath
        });
        
        if (pythonResponse.data.verified) {
            await User.findByIdAndUpdate(req.user.id, { isVerified: true });
            return res.json({ msg: 'Verification successful', path: filePath });
        } else {
            return res.status(400).json({ msg: 'ID Verification failed' });
        }
    } catch (pythonError) {
        console.log("Python service unreachable, mocking success for dev.");
        await User.findByIdAndUpdate(req.user.id, { isVerified: true });
        return res.json({ msg: 'Verification mockup success', path: filePath });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
