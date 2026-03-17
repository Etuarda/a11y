export class A11yController {
  constructor({ getRulesUseCase, evaluateAccessibilityUseCase }) {
    this.getRulesUseCase = getRulesUseCase;
    this.evaluateAccessibilityUseCase = evaluateAccessibilityUseCase;
  }

  health(request, response) {
    return response.status(200).json({ status: 'ok' });
  }

  rules(request, response, next) {
    try {
      const questionnaire = this.getRulesUseCase.execute();
      return response.status(200).json(questionnaire);
    } catch (error) {
      return next(error);
    }
  }

  evaluate(request, response, next) {
    try {
      const result = this.evaluateAccessibilityUseCase.execute(request.body ?? {});
      return response.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
