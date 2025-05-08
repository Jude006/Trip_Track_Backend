const User = require('../models/User');


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v -createdAt -updatedAt');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'profile.firstName',
      'profile.lastName',
      'profile.bio',
      'profile.avatar',
      'profile.location',
      'profile.website',
      'profile.socialMedia',
      'preferences.theme',
      'preferences.currency'
    ];
    
    const isValidOperation = updates.every(update => 
      allowedUpdates.some(allowed => update.startsWith(allowed))
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    updates.forEach(update => {
      const keys = update.split('.');
      if (keys.length === 2) {
        user[keys[0]][keys[1]] = req.body[update];
      } else if (keys.length === 3) {
        user[keys[0]][keys[1]][keys[2]] = req.body[update];
      }
    });

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};