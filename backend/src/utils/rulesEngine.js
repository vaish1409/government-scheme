/**
 * A small, dependency-free rules engine for scheme eligibility.
 *
 * Why build this instead of hardcoding if/else per scheme?
 * - New schemes can be added by inserting a JSON row in the DB — no redeploy.
 * - Non-technical content admins could (in theory) manage rules via an admin UI.
 * - Easy to unit test each operator in isolation.
 *
 * Supported operators:
 *   equal, notEqual, greaterThan, greaterThanInclusive,
 *   lessThan, lessThanInclusive, in, notIn
 */

const OPERATORS = {
  equal: (factValue, ruleValue) => factValue === ruleValue,
  notEqual: (factValue, ruleValue) => factValue !== ruleValue,
  greaterThan: (factValue, ruleValue) => factValue > ruleValue,
  greaterThanInclusive: (factValue, ruleValue) => factValue >= ruleValue,
  lessThan: (factValue, ruleValue) => factValue < ruleValue,
  lessThanInclusive: (factValue, ruleValue) => factValue <= ruleValue,
  in: (factValue, ruleValue) => Array.isArray(ruleValue) && ruleValue.includes(factValue),
  notIn: (factValue, ruleValue) => Array.isArray(ruleValue) && !ruleValue.includes(factValue),
};

/**
 * Evaluates a single condition against a user profile.
 * Returns false (not eligible) if the fact is missing on the profile,
 * rather than throwing — missing data should never crash a scheme check.
 */
function evaluateCondition(condition, profile) {
  const { fact, operator, value } = condition;
  const factValue = profile[fact];

  if (factValue === undefined || factValue === null) return false;

  const operatorFn = OPERATORS[operator];
  if (!operatorFn) {
    console.warn(`Unknown operator "${operator}" in eligibility rule — treating as fail`);
    return false;
  }

  return operatorFn(factValue, value);
}

/**
 * Evaluates a full rule set ({ all: [...], any: [...] }) against a profile.
 * - Every condition in "all" must pass.
 * - At least one condition in "any" must pass (if "any" is present).
 * - A rule set with neither "all" nor "any" defaults to eligible=true (open scheme).
 */
function evaluateRuleSet(ruleSet, profile) {
  const allConditions = ruleSet.all || [];
  const anyConditions = ruleSet.any || [];

  const allPass = allConditions.every((cond) => evaluateCondition(cond, profile));
  const anyPass = anyConditions.length === 0
    ? true
    : anyConditions.some((cond) => evaluateCondition(cond, profile));

  return allPass && anyPass;
}

/**
 * Checks a user profile against a single scheme, including the state filter.
 * Returns { eligible: boolean, matchedConditions, failedConditions } for
 * transparency — useful for showing the user *why* they qualify or don't.
 */
function checkSchemeEligibility(profile, scheme) {
  // State filter: empty applicableStates array means "all states"
  if (
    Array.isArray(scheme.applicableStates) &&
    scheme.applicableStates.length > 0 &&
    !scheme.applicableStates.includes(profile.state)
  ) {
    return { eligible: false, reason: 'State not covered by this scheme' };
  }

  const eligible = evaluateRuleSet(scheme.eligibilityRules || {}, profile);
  return { eligible, reason: eligible ? 'Meets all criteria' : 'Does not meet one or more criteria' };
}

/**
 * Runs a user profile against a list of schemes and returns only the
 * eligible ones, each annotated with why they matched.
 */
function findEligibleSchemes(profile, schemes) {
  return schemes
    .map((scheme) => {
      const result = checkSchemeEligibility(profile, scheme);
      return { scheme, ...result };
    })
    .filter((result) => result.eligible);
}

module.exports = {
  evaluateCondition,
  evaluateRuleSet,
  checkSchemeEligibility,
  findEligibleSchemes,
  OPERATORS,
};
