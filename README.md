# gitify-svn
CLI to export an SVN repository and generate equivalent Git projects for the purposes of migration

## Usage

```
Usage: gitify-svn [options] [<directory>]

Gitifies an SVN repository interactively. If directory is supplied then progress, etc will be saved there. Otherwise the current directory is used.

Options:
    --repository, -r      An SVN repository root URL to convert (can be specified multiple times
    --username, -u        The SVN username
    --password, -p        The SVN password
    --git-binary, -g      The Git binary to use (default: "git")
    --svn-binary, -s      The SVN binary to use (default: "svn")
    --help, -h            Show help
    --version, -v         Show version number
    --log-level, -l       Set the log level for the console and log file (default: "info")
```

## Development

Refer to the [development environment setup](setup/README.md) documentation to configure a development Ubuntu instance.

Install dependencies with:

```
npm install
```

Start watching folders for changes to test and build with:

```
npm start
```

To link the in development binary to the global path for testing use:

```
npm link
```

To run the end to end integration test:

```
./end-to-end-test.sh
```

The end to end tests work by importing some known SVN repository states, running the tool with known responses to prompts and then checking the checksums of the resulting Git repositories. New scenarios can be added by making new commits to the test SVN repositories and then running the tool again to record prompt responses using:

```
./end-to-end-continue.sh
```

Once finished, exit the tool with `ctrl-c` and run the following to save the SVN repository states, correct Git respository checksums and prompt file:

```
./end-to-end-save.sh
```
