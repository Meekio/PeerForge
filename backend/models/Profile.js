const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  college: { type: String, required: true },
  role: { type: String, default: 'Developer' },
  skills: [{ type: String }],
  techStack: [{ type: String }],
  interests: [{ type: String }],
  githubUrl: { type: String },
  linkedinUrl: { type: String },
  profilePicturePath: { type: String },
  idCardPath: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
