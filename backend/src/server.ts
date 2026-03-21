import app from './app';
import config from './config';

app.listen(config.port, () => {
    console.log(`🚀 Same IT API server running on http://localhost:${config.port}`);
    console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
});
