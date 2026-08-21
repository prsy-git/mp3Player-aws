import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

//Test
app.get('/api/ping', (req, res) => {
    res.json({status: 'ok', message: 'backend functioning'});
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})