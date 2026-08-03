import { Router } from 'express';
import healthCheck from './health-check.js';
import integratedAiRouter from './integrated-ai.js';
import chatRouter from './chat.js';
import servicesRouter from './services.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/integrated-ai', integratedAiRouter);
    router.use('/chat', chatRouter);
    router.use('/services', servicesRouter);

    return router;
};