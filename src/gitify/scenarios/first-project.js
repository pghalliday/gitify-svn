import inquirer from 'inquirer';

export default async function run({
  progress,
  revision,
}) {
  if (progress.projectCount === 0 ) {
    const answers = await inquirer.prompt([{
      type: 'confirm',
      name: 'createProjectFromRoot',
      message: 'There are no projects currently defined, would you like to create a project from the root of the repository',
      default: false,
    }, {
      type: 'confirm',
      name: 'useStandardLayout',
      message: 'Does this project use the standard layout (trunk, branches, tags)',
      when: (answers) => answers.createProjectFromRoot,
      default: false,
    }, {
      type: 'confirm',
      name: 'useBranchesAndTags',
      message: 'Does this project have branches and tags',
      when: (answers) => answers.createProjectFromRoot && !answers.useStandardLayout,
      default: false,
    }, {
      type: 'input',
      name: 'trunkPath',
      message: 'What is the relative path to the project trunk',
      when: (answers) => answers.useBranchesAndTags,
      default: false,
    }, {
      type: 'input',
      name: 'branchesPath',
      message: 'What is the relative path to the project branches',
      when: (answers) => answers.useBranchesAndTags,
      default: false,
    }, {
      type: 'input',
      name: 'tagsPath',
      message: 'What is the relative path to the project tags',
      when: (answers) => answers.useBranchesAndTags,
      default: false,
    }]);
    return true;
  }
  return false;
}
