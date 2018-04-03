# Contribution Guidelines

Ghostery welcomes your contributions! Please review this guide before contributing to the repository.

## Issues and Bugs

#### Broken Pages:

If a website is breaking because of Ghostery, please send an email to [support@ghostery.com](mailto:support@ghostery.com).

#### Bugs:

Before you submit an issue, search the [issue tracker](../../issues) for a duplicate problem. A fix may already be in development, or the comments may lead you to a solution.

#### Feature Requests

You can also submit feature requests to the [issue tracker](../../issues). Before you submit a request, search to make sure a duplicate feature hasn't already been proposed.

## Working With the Code

+ [Fork](https://help.github.com/articles/fork-a-repo/) the repository. Make sure to keep your fork [synced](https://help.github.com/articles/syncing-a-fork/) with the source repo
+ When you are ready to begin working on a new feature, cut a new branch from "develop" with the prefix "feature/" (e.g. "feature/name-of-new-feature"). Check out the [Gitflow branching model](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) for more information.
+ Code style should follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
+ There is an [.editorconfig](.editorconfig) file that you can use with your IDE
+ Refer to the [README](../../README.md) for details on how to install and build

### Submitting Pull Requests

+ Sync the develop branch in your fork with the develop branch from the source repo
+ Merge your feature branch into "develop"
+ Make your pull request from "develop" in your fork to "develop" in the source
+ Use short, meaningful commit messages
+ Lint your code before committing and making a pull request (`npm run lint`)
+ Write unit tests for new features and make sure all tests are passing (`npm run test.unit`)
+ If your pull request has multiple commits or commits that are not meaningful, consider [squashing](https://git-scm.com/docs/git-rebase#_interactive_mode) them

#### Submitting Patches via Email

If you are unable to submit pull requests on GitHub, we will also accept patches via [email](mailto:info@ghostery.com). For example, you can generate a patch from your last commit using `git format-patch HEAD^`. See [git-format-patch](https://git-scm.com/docs/git-format-patch) for more info.

### Code of Conduct

See [CODE OF CONDUCT](CODE-OF-CONDUCT.md)
