import { app } from './server.js';

const port = 3000;
app.listen(port, () => {
    console.log(`Server is live on http://localhost:${port}`)
});