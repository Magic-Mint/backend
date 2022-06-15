const cloudinary = require('cloudinary').v2;

const uploadToCloudinary = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, options, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}

module.exports = {
  uploadToCloudinary,
};
