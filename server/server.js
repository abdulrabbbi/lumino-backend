import { configDotenv } from 'dotenv';
configDotenv();
import app from './app.js'

const PORT = process.env.PORT || 4008;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
