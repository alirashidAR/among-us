import express from 'express';

const router = express.Router();



router.get('/', (req, res) => {
    // req is declared but its value is never read
    res.send('Server is up and running');
});

export default router