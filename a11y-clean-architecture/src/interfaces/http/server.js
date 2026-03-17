import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { ArtifactBuilder } from '../../domain/services/ArtifactBuilder.js';
import { RuleMatcher } from '../../domain/services/RuleMatcher.js';
import { EvaluateAccessibilityUseCase } from '../../application/use-cases/EvaluateAccessibilityUseCase.js';
import { GetRulesUseCase } from '../../application/use-cases/GetRulesUseCase.js';
import { JsonRuleRepository } from '../../infrastructure/repositories/JsonRuleRepository.js';
import { A11yController } from './controllers/A11yController.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { createA11yRoutes } from './routes/a11yRoutes.js';

const app = express();
const port = process.env.PORT ?? 3000;

const ruleRepository = new JsonRuleRepository();
const ruleMatcher = new RuleMatcher();
const artifactBuilder = new ArtifactBuilder();

const getRulesUseCase = new GetRulesUseCase(ruleRepository);
const evaluateAccessibilityUseCase = new EvaluateAccessibilityUseCase({
  ruleRepository,
  ruleMatcher,
  artifactBuilder
});

const controller = new A11yController({
  getRulesUseCase,
  evaluateAccessibilityUseCase
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.resolve(__dirname, '../../../public');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '200kb' }));
app.use(express.static(publicDirectory));
app.use('/api', createA11yRoutes(controller));

app.get('*', (request, response) => {
  response.sendFile(path.join(publicDirectory, 'index.html'));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
