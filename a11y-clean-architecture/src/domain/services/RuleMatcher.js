function matchesCondition(ruleWhen, answers) {
  return Object.entries(ruleWhen).every(([fieldName, allowedValues]) => {
    return allowedValues.includes(answers[fieldName]);
  });
}

function unique(values) {
  return [...new Set(values)];
}

export class RuleMatcher {
  match(mappings, answers) {
    const matchedMappings = mappings.filter((mapping) => {
      return matchesCondition(mapping.when, answers);
    });

    return {
      matchedMappings,
      wcagIds: unique(matchedMappings.flatMap((mapping) => mapping.wcag)),
      gaiaIds: unique(matchedMappings.flatMap((mapping) => mapping.gaia)),
      techniques: unique(matchedMappings.flatMap((mapping) => mapping.techniques))
    };
  }
}
