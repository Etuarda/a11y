import { validateAndCreateAnswers } from '../validators/answerValidator.js';

export class EvaluateAccessibilityUseCase {
  constructor({ ruleRepository, ruleMatcher, artifactBuilder }) {
    this.ruleRepository = ruleRepository;
    this.ruleMatcher = ruleMatcher;
    this.artifactBuilder = artifactBuilder;
  }

  execute(rawAnswers) {
    const answers = validateAndCreateAnswers(rawAnswers);
    const ruleSet = this.ruleRepository.getRuleSet();
    const matched = this.ruleMatcher.match(ruleSet.mappings, answers);

    const wcag = matched.wcagIds.map((id) => ({
      id,
      ...ruleSet.wcag.successCriteria[id]
    }));

    const gaia = matched.gaiaIds.map((id) => ({
      id,
      ...ruleSet.gaia.principles[id]
    }));

    return {
      answers,
      recommendations: {
        wcag,
        gaia,
        techniques: matched.techniques
      },
      artifacts: {
        userStory: this.artifactBuilder.buildUserStory(answers),
        bdd: this.artifactBuilder.buildBdd(answers)
      }
    };
  }
}
