const util = require('util');
const fs = require('fs');
const rimraf = require('rimraf');
const should = require('should');
const { run } = require('./core');

const asyncRimraf = util.promisify(rimraf);

const markdownFolder = 'tests/resources/mardown-folder';
const markdownFile = 'tests/resources/markdown-file.md';
const htmlTarget = 'tests/resources/html-target';
const htmlTargetFile = 'tests/resources/html-target-file.html';

describe('core', () => {
  beforeEach('remove html target folder', async () => {
    await asyncRimraf(htmlTarget);
    await asyncRimraf(htmlTargetFile);
  });

  after('remove html target folder', async () => {
    await asyncRimraf(htmlTarget);
    await asyncRimraf(htmlTargetFile);
  });

  it('should generate html content from markdown folder (relative path)', async () => {
    await run({ source: markdownFolder, target: htmlTarget });
    fs.existsSync(`${__dirname}/${htmlTarget}/index.html`).should.equal(true);
    fs.existsSync(`${__dirname}/${htmlTarget}/test.html`).should.equal(true);
    fs.existsSync(`${__dirname}/${htmlTarget}/folder/other.html`).should.equal(true);
  });

  it('should generate html content from markdown folder (absolute path)', async () => {
    await run({ source: `${__dirname}/${markdownFolder}`, target: `${__dirname}/${htmlTarget}` });
    fs.existsSync(`${__dirname}/${htmlTarget}/index.html`).should.equal(true);
    fs.existsSync(`${__dirname}/${htmlTarget}/test.html`).should.equal(true);
    fs.existsSync(`${__dirname}/${htmlTarget}/folder/other.html`).should.equal(true);
  });

  it('should generate html content from markdown file (relative path)', async () => {
    await run({ source: markdownFile, target: htmlTargetFile });
    fs.existsSync(`${__dirname}/${htmlTargetFile}`).should.equal(true);
  });

  it('should generate html content from markdown file (absolute path)', async () => {
    await run({ source: `${__dirname}/${markdownFile}`, target: `${__dirname}/${htmlTargetFile}` });
    fs.existsSync(`${__dirname}/${htmlTargetFile}`).should.equal(true);
  });

  it('should generate content with custom template', async () => {
    await run({ source: `${__dirname}/${markdownFile}`, target: `${__dirname}/${htmlTargetFile}`, userTemplate: `${__dirname}/tests/resources/templatecustom.js` });
    fs.existsSync(`${__dirname}/${htmlTargetFile}`).should.equal(true);
  });

  it('should get error with invalid custom template path', async () => {
    try {
      await run({ source: `${__dirname}/${markdownFile}`, target: `${__dirname}/${htmlTargetFile}`, userTemplate: `${__dirname}/tests/templatecustom.js` });
    } catch (error) {
      should.exist(error);
      should.exist(error.message);
      error.message.should.equal('Custom template does not exists.');
    }
  });

  it('should get error (unexisting source dir)', async () => {
    try {
      await run({ source: 'baddir', target: `${__dirname}/${htmlTarget}` });
    } catch (error) {
      should.exist(error);
      should.exist(error.message);
      error.message.should.equal('Fail to generate content from source.');
    }
  });

  it('should get error (target already exist)', async () => {
    try {
      await run({ source: markdownFolder, target: htmlTarget });
      await run({ source: markdownFolder, target: htmlTarget });
    } catch (error) {
      should.exist(error);
      should.exist(error.message);
      error.message.should.equal('Target already exist, please remove it before running.');
    }
  });

  it('should force generation (target already exist)', async () => {
    await run({ source: markdownFolder, target: htmlTarget });
    await run({ source: markdownFolder, target: htmlTarget, forceGeneration: true });
  });
});
