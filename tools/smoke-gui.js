const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const requiredFiles = [
  'gui/index.html',
  'gui/styles.css',
  'gui/learning-engine.js',
  'gui/app.js',
  'tools/serve-gui.js',
  'content-plans/pdfs/harish-vlogs.pdf',
  'content-plans/pdfs/harish-tiny-kitchen.pdf',
  'content-plans/pdfs/priyacreatives-fashion.pdf',
  'content-plans/harish-vlogs-plan.md',
  'content-plans/harish-tiny-kitchen-plan.md',
  'content-plans/priyacreatives-fashion-plan.md',
];

for (const relative of requiredFiles) {
  const absolute = path.join(ROOT, relative);
  assert.ok(fs.existsSync(absolute), `missing required file: ${relative}`);
  assert.ok(fs.statSync(absolute).size > 0, `empty required file: ${relative}`);
}

const html = fs.readFileSync(path.join(ROOT, 'gui/index.html'), 'utf8');
const engine = fs.readFileSync(path.join(ROOT, 'gui/learning-engine.js'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'gui/app.js'), 'utf8');
const server = fs.readFileSync(path.join(ROOT, 'tools/serve-gui.js'), 'utf8');
const { generateLearningExperience } = require(path.join(ROOT, 'gui', 'learning-engine.js'));

assert.match(html, /\/gui\/styles\.css/, 'HTML must reference the local stylesheet');
assert.match(html, /\/gui\/learning-engine\.js/, 'HTML must reference the local learning engine');
assert.match(html, /\/gui\/app\.js/, 'HTML must reference the local application script');
assert.match(engine, /generateLearningExperience/, 'learning engine should expose curriculum generation');
assert.match(engine, /question_bank/, 'learning engine should generate a question bank');
assert.match(engine, /coach_insights/, 'learning engine should generate coach insights');
assert.match(app, /generator-form/, 'GUI should expose the adaptive topic generator');
assert.match(app, /show-json/, 'GUI should expose clean JSON output');
assert.match(app, /check-question/, 'GUI should support interactive assessment checks');
assert.match(server, /127\.0\.0\.1/, 'server should document a local URL');
assert.doesNotMatch(html, /https?:\/\//, 'HTML should not require an external network resource');
assert.doesNotMatch(app, /fetch\s*\(/, 'prototype should not require a remote API to render');
assert.doesNotMatch(engine, /fetch\s*\(/, 'learning engine should remain offline-capable');

const generated = generateLearningExperience({
  topic: 'Python Programming',
  level: 'Intermediate',
  goal: 'build a small CLI tool',
  schedule: '3 sessions per week',
  learnerName: 'Sam Lee',
});
assert.deepStrictEqual(Object.keys(generated), ['topic_metadata', 'study_plan', 'question_bank', 'coach_insights'], 'generated output should match the public JSON contract');
assert.strictEqual(generated.topic_metadata.target_audience_level, 'Intermediate', 'profile level should be preserved');
assert.strictEqual(generated.study_plan.length, 4, 'adaptive plan should include progressive modules');
assert.strictEqual(generated.question_bank.length, 8, 'adaptive plan should include a varied question bank');
assert.ok(generated.question_bank.some((question) => question.question_type === 'scenario'), 'question bank should include scenario practice');
assert.ok(generated.coach_insights.suggested_intervention_trigger, 'coach insights should include an intervention trigger');

console.log(`GUI smoke test passed (${requiredFiles.length} required files, offline seed data present)`);
