export class GetRulesUseCase {
  constructor(ruleRepository) {
    this.ruleRepository = ruleRepository;
  }

  execute() {
    return this.ruleRepository.getQuestionnaire();
  }
}
