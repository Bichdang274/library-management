const expressRef = require('express');
const router = expressRef.Router(); 


const authController = require('../controllers/authController');
const readerController = require('../controllers/readerController');
const bookController = require('../controllers/bookController'); // <-- Controller mới cho sách
const verifyToken = require('../utils/authMiddleware');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);


router.get('/readers', verifyToken, readerController.getReaders);
router.post('/readers', verifyToken, readerController.createReader);
router.put('/readers/:id', verifyToken, readerController.updateReader);
router.delete('/readers/:id', verifyToken, readerController.deleteReader);


router.get('/books', verifyToken, bookController.getBooks); 


export default router;