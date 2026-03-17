import questions from '../config/questions.json' with { type: 'json' };
import wcag from '../config/wcag.json' with { type: 'json' };
import gaia from '../config/gaia.json' with { type: 'json' };
import mappings from '../config/mappings.json' with { type: 'json' };

export class JsonRuleRepository {
  getQuestionnaire() {
    return { questions };
  }

  getRuleSet() {
    return {
      questions,
      wcag,
      gaia,
      mappings
    };
  }
}
