import { Router } from 'express';

export function createA11yRoutes(controller) {
  const router = Router();

  router.get('/health', controller.health.bind(controller));
  router.get('/rules', controller.rules.bind(controller));
  router.post('/evaluate', controller.evaluate.bind(controller));

  return router;
}
