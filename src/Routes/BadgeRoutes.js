import express from 'express'
import {
  
    createBadge,
  getAllBadges,
  updateBadge,
  deleteBadge
} from '../Controllers/BadgeController.js'
import upload from '../Middleware/Upload.js'

const router = express.Router()

router.post('/create-badge', (req, res, next) => {
    upload.single('icon')(req, res, function(err) {
        // console.log('File upload:', req.file); 

      if (err) {
        console.error('Upload Error:', err);
        return res.status(400).json({ message: "File upload failed", error: err.message });
      }
      next();
    });
  }, createBadge);

router.get('/get-all-badges', getAllBadges)
router.put('/update-badge/:id', updateBadge)
router.delete('/delete-badge/:id', deleteBadge)

export default router
