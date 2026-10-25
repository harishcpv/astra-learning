(function attachLearningEngine(global) {
  const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

  const DOMAIN_RULES = [
    { keys: ['python', 'javascript', 'typescript', 'programming', 'coding', 'software'], label: 'technical', artifact: 'a small working project', verbs: ['model', 'implement', 'test', 'debug'] },
    { keys: ['quantum', 'physics', 'chemistry', 'biology', 'organic', 'calculus', 'statistics'], label: 'science', artifact: 'a worked explanation with evidence', verbs: ['observe', 'model', 'calculate', 'interpret'] },
    { keys: ['finance', 'corporate finance', 'accounting', 'investing', 'economics'], label: 'business', artifact: 'a decision memo with assumptions', verbs: ['frame', 'calculate', 'compare', 'recommend'] },
    { keys: ['culinary', 'cooking', 'baking', 'nutrition', 'food'], label: 'practical', artifact: 'a repeatable practice routine', verbs: ['prepare', 'sequence', 'adjust', 'reflect'] },
    { keys: ['history', 'literature', 'writing', 'language', 'design', 'art', 'marketing'], label: 'humanities', artifact: 'a clear portfolio-ready explanation', verbs: ['notice', 'analyze', 'create', 'revise'] },
  ];

  const MODULE_BLUEPRINTS = [
    { title: 'Orient', objective: 'Build a useful mental model and vocabulary.', takeaway: 'Know what the important parts are and how they relate.' },
    { title: 'Build', objective: 'Practice the core moves in a guided sequence.', takeaway: 'Use the basic process without relying on memorized steps alone.' },
    { title: 'Apply', objective: 'Transfer the ideas to a realistic problem or task.', takeaway: 'Choose a method because it fits the situation, not by guesswork.' },
    { title: 'Integrate', objective: 'Review, explain, and extend the skill independently.', takeaway: 'Spot gaps, request feedback, and decide what to learn next.' },
  ];

  function clean(value, fallback) {
    const text = String(value ?? '').trim().replace(/\s+/g, ' ');
    return text || fallback;
  }

  function titleCase(value) {
    return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function normalizeProfile(profile) {
    const topic = clean(profile?.topic, 'a topic of your choice');
    const level = LEVELS.includes(profile?.level) ? profile.level : 'Beginner';
    const goal = clean(profile?.goal, `build a confident foundation in ${topic}`);
    const schedule = clean(profile?.schedule, '3 sessions per week');
    const learnerName = clean(profile?.learnerName, 'Alex Morgan');
    return { topic, level, goal, schedule, learnerName };
  }

  function getDomain(topic) {
    const lower = topic.toLowerCase();
    return DOMAIN_RULES.find((rule) => rule.keys.some((key) => lower.includes(key))) || {
      label: 'general',
      artifact: 'a practical demonstration of the skill',
      verbs: ['define', 'connect', 'practice', 'explain'],
    };
  }

  function estimateWeeks(level, schedule) {
    const lower = schedule.toLowerCase();
    const highFrequency = /daily|every day|5|6|7/.test(lower);
    const lowFrequency = /once|1 session|weekly/.test(lower);
    if (level === 'Advanced') return highFrequency ? 2 : lowFrequency ? 5 : 4;
    if (level === 'Intermediate') return highFrequency ? 2 : lowFrequency ? 5 : 3;
    return highFrequency ? 2 : lowFrequency ? 6 : 4;
  }

  function levelPhrase(level) {
    if (level === 'Advanced') return 'You will start with nuance, trade-offs, and independent judgment.';
    if (level === 'Intermediate') return 'You will connect familiar ideas to more demanding decisions and practice.';
    return 'You will start with plain-language foundations before adding complexity.';
  }

  function domainExample(domain, topic) {
    if (domain.label === 'technical') return `a tiny ${topic} exercise that runs end to end`;
    if (domain.label === 'science') return `a worked ${topic} example where every assumption is visible`;
    if (domain.label === 'business') return `a ${topic} decision with a short assumption table`;
    if (domain.label === 'practical') return `a repeatable ${topic} routine you can observe and improve`;
    return `a short ${topic} explanation supported by a concrete example`;
  }

  function moduleContent(topic, profile, domain, blueprint, index) {
    const example = domainExample(domain, topic);
    const verb = domain.verbs[index];
    const depth = index === 0 ? 'first principles and a small set of durable terms' : index === 1 ? 'a repeatable sequence, checks for understanding, and deliberate practice' : index === 2 ? 'a realistic constraint, a worked example, and a chance to make a choice' : 'retrieval, reflection, feedback, and a next-step challenge';
    return `### ${blueprint.title}: make ${topic} usable\n\n**Purpose.** ${blueprint.objective} ${levelPhrase(profile.level)}\n\n**Core ideas**\n- Start with ${depth}.\n- Use the ${verb} lens: ask what is happening, why it matters, and what evidence would change your mind.\n- Connect each new term to ${example}.\n\n**Practice move**\n1. Explain the idea without looking at your notes.\n2. Apply it to one small example.\n3. Compare your result with the expected reasoning, not only the final answer.\n\n**Transfer prompt.** How would your approach change if the goal were “${profile.goal}” rather than simply finishing an exercise?`;
  }

  function buildModules(profile, domain) {
    return MODULE_BLUEPRINTS.map((blueprint, offset) => ({
      module_id: offset + 1,
      module_title: `${blueprint.title}: ${titleCase(profile.topic)}`,
      learning_objectives: [blueprint.objective, `Use ${profile.topic} to move one step closer to ${profile.goal}.`],
      core_content_summary: moduleContent(profile.topic, profile, domain, blueprint, offset),
      key_takeaways: [blueprint.takeaway, `A good ${profile.topic} decision includes a reason, an example, and a way to check the result.`],
    }));
  }

  function genericQuestions(profile, domain) {
    const topic = profile.topic;
    const artifact = domain.artifact;
    return [
      { question_type: 'multiple_choice', difficulty: 'Easy', prompt: `Which first move creates the strongest foundation when learning ${topic}?`, options: ['Memorize isolated facts before seeing the whole picture', `Define the core terms and connect each one to a simple ${topic} example`, 'Skip practice until you feel ready for advanced work', 'Copy an expert solution without explaining it'], correct_answer: `Define the core terms and connect each one to a simple ${topic} example`, explanation: `A mental model turns vocabulary into something usable. The example gives the learner a way to test whether the definition is understood.` },
      { question_type: 'short_answer', difficulty: 'Easy', prompt: `In your own words, why does a mental model matter in ${topic}?`, options: [], correct_answer: 'It connects the important parts to their purpose so you can reason about a new example.', explanation: 'A strong answer links parts, purpose, and transfer. Repeating a definition without that connection does not show understanding.' },
      { question_type: 'multiple_choice', difficulty: 'Medium', prompt: `You are practicing ${topic}. Which routine is most likely to build durable skill?`, options: ['Read everything once and never retrieve it', 'Switch methods every few minutes to avoid discomfort', 'Attempt a small example, check the reasoning, then revise', 'Only study the easiest examples'], correct_answer: 'Attempt a small example, check the reasoning, then revise', explanation: 'Attempting, checking, and revising exposes gaps while the task is still small enough to correct.' },
      { question_type: 'short_answer', difficulty: 'Medium', prompt: `Name one concrete example that would show you understand the core process of ${topic}.`, options: [], correct_answer: `A clear example that uses the core process and explains why each step was chosen.`, explanation: 'The best evidence is observable: a learner can show the process, explain the choices, and check the result.' },
      { question_type: 'scenario', difficulty: 'Medium', prompt: `You have 30 minutes to make progress in ${topic}. What should you do first, and why?`, options: [], correct_answer: 'Choose one small, realistic task, state the success check, and use feedback before expanding the scope.', explanation: 'A bounded task makes progress visible. A success check and feedback loop keep practice focused instead of turning into passive consumption.' },
      { question_type: 'multiple_choice', difficulty: 'Hard', prompt: `When a ${topic} result looks wrong, which response is most useful?`, options: ['Change several variables at once', 'Assume the topic is too difficult', 'Trace the assumptions and isolate one step at a time', 'Hide the result and start a different topic'], correct_answer: 'Trace the assumptions and isolate one step at a time', explanation: 'Debugging or analysis works best when the learner preserves evidence and changes one meaningful variable at a time.' },
      { question_type: 'short_answer', difficulty: 'Hard', prompt: `How would you explain a ${topic} idea to someone who is one level earlier than you?`, options: [], correct_answer: 'Use plain language, one concrete example, and a quick check for understanding.', explanation: 'Explaining simply reveals whether the learner can separate the core idea from unnecessary jargon.' },
      { question_type: 'scenario', difficulty: 'Hard', prompt: `Your first attempt at ${artifact} is incomplete. What would you do next to learn rather than just finish?`, options: [], correct_answer: 'Review the evidence, identify the largest bottleneck, ask for targeted feedback, and revise one part.', explanation: 'Human coaching is most useful when the learner can name the bottleneck and bring a specific question or artifact to review.' },
    ].map((question, index) => ({ ...question, question_id: `q${index + 1}`, module_id: Math.floor(index / 2) + 1 }));
  }

  function tailoredQuestions(profile, domain) {
    const lower = profile.topic.toLowerCase();
    if (domain.label === 'technical' && lower.includes('python')) {
      const questions = genericQuestions(profile, domain);
      questions[0] = { ...questions[0], prompt: 'In Python, what is the clearest reason to wrap repeated logic in a function?', options: ['To make every line global', 'To give a reusable name to a focused behavior', 'To avoid testing the behavior', 'To guarantee the code never changes'], correct_answer: 'To give a reusable name to a focused behavior', explanation: 'A function names and packages a behavior so it can be reused, tested, and changed in one place.' };
      questions[2] = { ...questions[2], prompt: 'Which debugging loop is most reliable for a small Python program?', options: ['Guess, rewrite everything, and hope', 'Run a small test, inspect the error, change one thing, and rerun', 'Remove all checks to make the script shorter', 'Only read documentation without executing code'], correct_answer: 'Run a small test, inspect the error, change one thing, and rerun', explanation: 'Small feedback loops preserve evidence and make the cause of a change visible.' };
      return questions;
    }
    if (domain.label === 'science' && lower.includes('quantum')) {
      const questions = genericQuestions(profile, domain);
      questions[0] = { ...questions[0], prompt: 'What is the most useful beginner mental model for a quantum state?', options: ['A hidden classical bit that is always either 0 or 1', 'A mathematical description that predicts measurement probabilities', 'A faster version of every classical algorithm', 'A physical object that can be copied perfectly'], correct_answer: 'A mathematical description that predicts measurement probabilities', explanation: 'A state encodes the probabilities of possible measurement outcomes; it is not simply a classical bit with an unknown value.' };
      questions[4] = { ...questions[4], prompt: 'You are explaining superposition to a skeptical teammate. What should you do first?', options: ['Promise a speedup for every problem', 'Separate the mathematical model from a classical coin analogy and show a measurement example', 'Skip measurement because it is confusing', 'Use only advanced notation'], correct_answer: 'Separate the mathematical model from a classical coin analogy and show a measurement example', explanation: 'A careful explanation names where an analogy helps and where it breaks, then grounds the concept in observable measurement.' };
      return questions;
    }
    if (domain.label === 'business' && lower.includes('finance')) {
      const questions = genericQuestions(profile, domain);
      questions[0] = { ...questions[0], prompt: 'Before recommending a corporate finance decision, what should you make explicit?', options: ['Only the most optimistic outcome', 'The assumptions, cash-flow timing, and decision criteria', 'A guarantee that risk is absent', 'The format of the spreadsheet'], correct_answer: 'The assumptions, cash-flow timing, and decision criteria', explanation: 'A decision is only as transparent as the assumptions and criteria behind it. Cash-flow timing often changes the recommendation.' };
      questions[5] = { ...questions[5], prompt: 'If two finance scenarios have different timing of cash flows, what is the best next step?', options: ['Compare their totals without dates', 'Ignore the smaller cash flow', 'Put the cash flows on a timeline and use a consistent valuation method', 'Choose the scenario with the larger first number'], correct_answer: 'Put the cash flows on a timeline and use a consistent valuation method', explanation: 'Timing affects value. A timeline and consistent method make the comparison auditable.' };
      return questions;
    }
    return genericQuestions(profile, domain);
  }

  function coachInsights(profile, domain) {
    return {
      recommended_focus_areas: [
        `Build the ${profile.topic} mental model before adding advanced terminology.`,
        `Use ${domain.artifact} as the capstone evidence of transfer.`,
        'Practice retrieval and explain your reasoning before checking the answer.',
      ],
      potential_student_struggle_points: [
        `Confusing ${profile.topic} vocabulary with being able to use the process.`,
        'Skipping the feedback loop when an answer feels almost correct.',
        'Expanding scope too quickly instead of isolating one bottleneck.',
      ],
      suggested_intervention_trigger: 'Flag for coach review after 2 consecutive incorrect practice answers, or when a short/scenario response is still unclear after one revision.',
    };
  }

  function generateLearningExperience(profile) {
    const normalized = normalizeProfile(profile);
    const domain = getDomain(normalized.topic);
    const modules = buildModules(normalized, domain);
    return {
      topic_metadata: {
        topic_title: normalized.topic,
        target_audience_level: normalized.level,
        estimated_total_duration: `${estimateWeeks(normalized.level, normalized.schedule)} weeks`,
      },
      study_plan: modules,
      question_bank: tailoredQuestions(normalized, domain),
      coach_insights: coachInsights(normalized, domain),
    };
  }

  const api = { generateLearningExperience, normalizeProfile, LEVELS };
  global.LearningEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
