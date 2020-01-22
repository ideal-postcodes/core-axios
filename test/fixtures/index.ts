import nock from "nock";
import { resolve, basename } from "path";
import { writeFile } from "fs";

/**
 * loadHttpFixtures
 *
 * Loads nock fixtures given a test file name `file`
 *
 * If RECORD=true - triggers a re-record of HTTP fixtures
 */
export const loadHttpFixtures = (file: string): void => {
  // If RECORD=1, write http fixtures to test/fixtures
  const { RECORD } = process.env;
  if (RECORD !== undefined) return record(file);

  const fixtureFile = resolve(__dirname, toFixtureFileName(file));

  before(() => {
    nock.load(fixtureFile);
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
    nock.isDone();
    nock.cleanAll();
  });
};

const toFixtureFileName = (file: string): string => {
  return `${basename(file, ".ts")}.nock.json`;
};

const record = (file: string): void => {
  const outputFile = resolve(__dirname, toFixtureFileName(file));

  before(() => {
    nock.recorder.rec({ dont_print: true, output_objects: true });
  });

  after(done => {
    const nockCalls = nock.recorder.play();
    writeFile(outputFile, JSON.stringify(nockCalls), done);
  });
};
