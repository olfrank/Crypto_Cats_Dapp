#!/usr/bin/env node

exports.id = 903;
exports.ids = [903];
exports.modules = {

/***/ 115021:
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 115021;
module.exports = webpackEmptyContext;

/***/ }),

/***/ 641912:
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 641912;
module.exports = webpackEmptyContext;

/***/ }),

/***/ 522539:
/***/ ((module) => {

const options = {
  network: {
    option: "--network <name>",
    description:
      "Specify the network to use. Network name must exist in the configuration."
  },
  config: {
    option: "--config <file>",
    description:
      "Specify configuration file to be used. The default is truffle-config.js"
  }
};
 module.exports = options;


/***/ }),

/***/ 651017:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const TaskError = __webpack_require__(699079);
const yargs = __webpack_require__(564968);
const { bundled, core } = __webpack_require__(64146).info();
const OS = __webpack_require__(712087);
const analytics = __webpack_require__(795614);
const { extractFlags } = __webpack_require__(54708); // Contains utility methods
const commandOptions = __webpack_require__(522539);

class Command {
  constructor(commands) {
    this.commands = commands;

    let args = yargs();

    Object.keys(this.commands).forEach(function (command) {
      args = args.command(commands[command]);
    });

    this.args = args;
  }

  getCommand(inputStrings, noAliases) {
    const argv = this.args.parse(inputStrings);

    if (argv._.length === 0) {
      return null;
    }

    const firstInputString = argv._[0];
    let chosenCommand = null;

    // If the command wasn't specified directly, go through a process
    // for inferring the command.
    if (this.commands[firstInputString]) {
      chosenCommand = firstInputString;
    } else if (noAliases !== true) {
      let currentLength = 1;
      const availableCommandNames = Object.keys(this.commands);

      // Loop through each letter of the input until we find a command
      // that uniquely matches.
      while (currentLength <= firstInputString.length) {
        // Gather all possible commands that match with the current length
        const possibleCommands = availableCommandNames.filter(
          possibleCommand => {
            return (
              possibleCommand.substring(0, currentLength) ===
              firstInputString.substring(0, currentLength)
            );
          }
        );

        // Did we find only one command that matches? If so, use that one.
        if (possibleCommands.length === 1) {
          chosenCommand = possibleCommands[0];
          break;
        }

        currentLength += 1;
      }
    }

    if (chosenCommand == null) {
      return null;
    }

    const command = this.commands[chosenCommand];

    return {
      name: chosenCommand,
      argv,
      command
    };
  }

  async run(inputStrings, options) {
    const result = this.getCommand(inputStrings, options.noAliases);

    if (result == null) {
      throw new TaskError(
        "Cannot find command based on input: " + JSON.stringify(inputStrings)
      );
    }

    if (typeof result.command.help === "function") {
      result.command.help = await result.command.help(options);
    }

    const argv = result.argv;

    // Remove the task name itself.
    if (argv._) argv._.shift();

    // We don't need this.
    delete argv["$0"];

    // Some options might throw if options is a Config object. If so, let's ignore those options.
    const clone = {};
    Object.keys(options).forEach(key => {
      try {
        clone[key] = options[key];
      } catch (e) {
        // Do nothing with values that throw.
      }
    });

    // while in `console` & `develop`, input is passed as a string, not as an array
    if (!Array.isArray(inputStrings)) inputStrings = inputStrings.split(" ");
    // Method `extractFlags(args)` : Extracts the `--option` flags from arguments
    const inputOptions = extractFlags(inputStrings);

    //adding allowed global options as enumerated in each command
    const allowedGlobalOptions = result.command.help.allowedGlobalOptions.filter(tag=> tag in commandOptions).map(tag => commandOptions[tag]);

    const allValidOptions = [...result.command.help.options, ...allowedGlobalOptions];

    const validOptions = allValidOptions.reduce((a, item) => {
      // we split the options off from the arguments
      // and then we split to handle options of the form --<something>|-<s>
      let options = item.option.split(" ")[0].split("|");
      return [
        ...a,
        ...(options.filter(
          option => option.startsWith("--") || option.startsWith("-")
        ))
      ];
    }, []);

    let invalidOptions = inputOptions.filter(
      opt => !validOptions.includes(opt)
    );

    // TODO: Remove exception for 'truffle run' when plugin options support added.
    if (invalidOptions.length > 0 && result.name !== "run") {
      if (options.logger) {
        const log = options.logger.log || options.logger.debug;
        log(
          "> Warning: possible unsupported (undocumented in help) command line option(s): " +
            invalidOptions
        );
      }
    }

    const newOptions = Object.assign({}, clone, argv);

    analytics.send({
      command: result.name ? result.name : "other",
      args: result.argv._,
      version: bundled || "(unbundled) " + core
    });

    const unhandledRejections = new Map();

    process.on('unhandledRejection', (reason, promise) => {
      unhandledRejections.set(promise, reason);
    });

    process.on('rejectionHandled', (promise) => {
      unhandledRejections.delete(promise);
    });

    process.on('exit', (_) => {
      const log = options.logger ? (options.logger.log || options.logger.debug): console.log;
      if (unhandledRejections.size) {
        log('UnhandledRejections detected');
        unhandledRejections.forEach((reason, promise) => {
          log(promise, reason);
        });
      }
    });

    return await result.command.run(newOptions);
  }

  displayGeneralHelp() {
    this.args
      .usage(
        "Truffle v" +
          (bundled || core) +
          " - a development framework for Ethereum" +
          OS.EOL +
          OS.EOL +
          "Usage: truffle <command> [options]"
      )
      .epilog("See more at http://trufflesuite.com/docs")
      .showHelp();
  }
}

module.exports = Command;


/***/ }),

/***/ 797701:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "build",
  description: "Execute build pipeline (if configuration present)",
  builder: {},
  help: {
    usage: "truffle build",
    options: [],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const OS = __webpack_require__(712087);
    const colors = __webpack_require__(183196);
    const deprecationMessage = colors.yellow(
      `> The build command is planned ` +
        `for deprecation in version 6 of Truffle.${OS.EOL}> See ` +
        `https://github.com/trufflesuite/truffle/issues/3226 for more ` +
        `information.`
    );
    console.log(deprecationMessage);
    const Config = __webpack_require__(120553);
    const Build = __webpack_require__(160627);
    const config = Config.detect(options);

    return await Build.build(config);
  }
};

module.exports = command;


/***/ }),

/***/ 947582:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const format = JSON.stringify;
const path = __webpack_require__(385622);
const fse = __webpack_require__(655674);

const command = {
  command: "compile",
  description: "Compile contract source files",
  builder: {
    all: {
      type: "boolean",
      default: false
    },
    compiler: {
      type: "string",
      default: null
    },
    list: {
      type: "string"
    },
    help: {
      type: "boolean",
      default: "false"
    }
  },
  help: {
    usage:
      "truffle compile [--list <filter>] [--all] [--quiet]",
    options: [
      {
        option: "--all",
        description:
          "Compile all contracts instead of only the contracts changed since last compile."
      },
      {
        option: "--list <filter>",
        description:
          "List all recent stable releases from solc-bin.  If filter is specified then it will display only " +
          "that\n                    type of release or docker tags. The filter parameter must be one of the following: " +
          "prereleases,\n                    releases, latestRelease or docker."
      },
      {
        option: "--quiet",
        description: "Suppress all compilation output."
      },
      {
        option: "--compiler <compiler-name>",
        description:
          "Specify a single compiler to use (e.g. `--compiler=solc`). Specify `none` to skip compilation."
      },
      {
        option: "--save-intermediate <output-file>",
        internal: true,
        description:
          "Save the raw compiler results into <output-file>, overwriting any existing content."
      },
    ],
    allowedGlobalOptions: ["config"]
  },
  run: async function (options) {
    const TruffleError = __webpack_require__(673321);
    const WorkflowCompile = __webpack_require__(577135);
    const Config = __webpack_require__(120553);
    const config = Config.detect(options);

    if (config.list !== undefined) {
      return await command.listVersions(config);
    }

    if (
      options.saveIntermediate === true ||
      (typeof options.saveIntermediate === "string" &&
        options.saveIntermediate.trim() === "")
    ) {
      // user asked to save the intermediate compilation results
      // but didn't provide the file to save the results to
      throw new TruffleError(
        "You must provide a file to save compilation results to."
      );
    }

    const compilationOutput = await WorkflowCompile.compile(config);
    if (options.saveIntermediate) {
      // Get the filename the user provided to save the compilation results to
      const compilationOutputFile = path.resolve(options.saveIntermediate);

      await fse.writeFile(
        compilationOutputFile,
        JSON.stringify(compilationOutput),
        {encoding: "utf8"}
      );
    }

    const result = await WorkflowCompile.save(config, compilationOutput);
    await WorkflowCompile.assignNames(config, result);
    return result;
  },

  listVersions: async function (options) {
    const {CompilerSupplier} = __webpack_require__(611105);
    const supplier = new CompilerSupplier({
      solcConfig: options.compilers.solc,
      events: options.events
    });

    const log = options.logger.log;
    options.list = options.list.length ? options.list : "releases";

    // Docker tags
    if (options.list === "docker") {
      const tags = await supplier.getDockerTags();
      tags.push("See more at: hub.docker.com/r/ethereum/solc/tags/");
      log(format(tags, null, " "));
      return;
    }

    // Solcjs releases
    const releases = await supplier.getReleases();
    const shortener = options.all ? null : command.shortener;
    const list = format(releases[options.list], shortener, " ");
    log(list);
    return;
  },

  shortener: function (key, val) {
    const defaultLength = 10;

    if (Array.isArray(val) && val.length > defaultLength) {
      const length = val.length;
      const remaining = length - defaultLength;
      const more =
        ".. and " + remaining + " more. Use `--all` to see full list.";
      val.length = defaultLength;
      val.push(more);
    }

    return val;
  }
};

module.exports = command;


/***/ }),

/***/ 962722:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "config",
  description: "Set user-level configuration options",
  help: {
    usage:
      "truffle config [--enable-analytics|--disable-analytics] [[<get|set> <key>] [<value-for-set>]]",
    options: [
      {
        option: "--enable-analytics",
        description: "Enable Truffle to send usage data to Google Analytics."
      },
      {
        option: "--disable-analytics",
        description:
          "Disable Truffle's ability to send usage data to Google Analytics."
      },
      {
        option: "get",
        description: "Get a Truffle config option value."
      },
      {
        option: "set",
        description: "Set a Truffle config option value."
      }
    ],
    allowedGlobalOptions: []
  },
  userLevelSettings: ["analytics"],
  builder: {
    _: {
      type: "string"
    }
  },
  /**
   * run config commands to get/set Truffle config options
   * @param {Object} options
   */
  run: async function (options) {
    const googleAnalytics = __webpack_require__(902860);
    const Config = __webpack_require__(120553);
    const OS = __webpack_require__(712087);

    let command;
    if (options.enableAnalytics || options.disableAnalytics) {
      // TODO: Deprecate the --(en|dis)able-analytics flag in favor of `set analytics true`
      command = {
        set: true,
        userLevel: true,
        key: "analytics",
        value: options.enableAnalytics || false
      };
      const message =
        `> WARNING: The --enable-analytics and ` +
        `--disable-analytics flags have been deprecated.${OS.EOL}> Please ` +
        `use 'truffle config set analytics <boolean>'.`;
      console.warn(OS.EOL + message + OS.EOL);
    } else {
      command = parse(options._);
    }

    if (command === null) {
      return await googleAnalytics.setUserConfigViaPrompt();
    } else if (command.userLevel) {
      switch (command.key) {
        case "analytics": {
          if (command.set) {
            googleAnalytics.setAnalytics(command.value);
          } else {
            options.logger.log(googleAnalytics.getAnalytics());
          }
          break;
        }
      }

      return;
    } else {
      const config = Config.detect(options);

      if (command.set) {
        options.logger.log(
          "Setting project-level parameters is not supported yet."
        );
        // TODO: add support for writing project-level settings to the truffle config file
        // config[command.key] = command.value;
      } else {
        options.logger.log(config[command.key]);
      }
      return;
    }
  }
};

const parse = function (args) {
  if (args.length === 0) {
    return null;
  }

  let option = args[0];

  if (typeof option !== "string") {
    // invalid option
    throw new Error(`Invalid config option "${option}"`);
  }
  option = option.toLowerCase();

  let set = false;
  let key = args[1];
  let value = args[2];

  switch (option) {
    case "get": {
      set = false;
      if (typeof key === "undefined" || key === null || key === "") {
        // invalid key
        throw new Error("Must provide a <key>");
      }

      break;
    }
    case "set": {
      set = true;
      if (typeof key === "undefined" || key === null || key === "") {
        // invalid key
        throw new Error("Must provide a <key>");
      }

      if (typeof value !== "string" || value === "") {
        // invalid value
        throw new Error("Must provide a <value-for-set>");
      }

      switch (value.toLowerCase()) {
        case "null": {
          value = null;
          break;
        }
        case "undefined": {
          value = undefined;
          break;
        }
        case "true": {
          value = true;
          break;
        }
        case "false": {
          value = false;
          break;
        }
        default: {
          // check if number, otherwise leave as string
          const float = parseFloat(value);
          if (!isNaN(float) && value === float.toString()) {
            value = float;
          }
          break;
        }
      }

      break;
    }
    default: {
      if (
        option !== "--enable-analytics" &&
        option !== "--disable-analytics" &&
        option !== ""
      ) {
        // TODO: Deprecate the --(en|dis)able-analytics flag in favor for `enable analytics`
        // invalid command!
        throw new Error(`Invalid config option "${option}"`);
      } else {
        // we should not have gotten here
        return null;
      }
    }
  }

  return {
    set,
    userLevel: command.userLevelSettings.includes(key),
    key,
    value
  };
};

module.exports = command;


/***/ }),

/***/ 806345:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "console",
  description:
    "Run a console with contract abstractions and commands available",
  builder: {},
  help: {
    usage: "truffle console [--verbose-rpc] [(--require|-r) <file>]",
    options: [
      {
        option: "--verbose-rpc",
        description:
          "Log communication between Truffle and the Ethereum client."
      },
      {
        option: "(--require|-r) <file>",
        description: "Preload console environment from required JavaScript " +
          "file. The default export must be an object with named keys that " +
          "will be used\n                    to populate the console environment."
      },
      {
        option: "--require-none",
        description: "Do not load any user-defined JavaScript into the " +
          "console environment. This option takes precedence over --require, " +
          "-r, and\n                    values provided for console.require " +
          "in your project's truffle-config.js."
      }
    ],
    allowedGlobalOptions: ["network", "config"]
  },
  run: async function (options) {
    const Config = __webpack_require__(120553);
    const Console = __webpack_require__(968303);
    const { Environment } = __webpack_require__(376765);

    const config = Config.detect(options);

    // This require a smell?
    const commands = __webpack_require__(591559);
    const excluded = new Set(["console", "init", "watch", "develop"]);

    const consoleCommands = Object.keys(commands).reduce((acc, name) => {
      return !excluded.has(name)
        ? Object.assign(acc, {[name]: commands[name]})
        : acc;
    }, {});

    await Environment.detect(config);
    const c = new Console(consoleCommands, config.with({noAliases: true}));
    return await c.start();
  }
};

module.exports = command;


/***/ }),

/***/ 942957:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "create",
  description: "Helper to create new contracts, migrations and tests",
  builder: {
    all: {
      type: "boolean",
      default: false
    },
    force: {
      type: "boolean",
      default: false
    }
  },
  help: {
    usage: "truffle create <artifact_type> <ArtifactName>",
    options: [
      {
        option: "<artifact_type>",
        description:
          "Create a new artifact where artifact_type is one of the following: " +
          "contract, migration,\n                    test or all. The new artifact is created " +
          "along with one (or all) of the following\n                    files: `contracts/ArtifactName.sol`, " +
          "`migrations/####_artifact_name.js` or\n                    `tests/artifact_name.js`. (required)"
      },
      {
        option: "<ArtifactName>",
        description: "Name of new artifact. (required)"
      }
    ],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const Config = __webpack_require__(120553);
    const ConfigurationError = __webpack_require__(48937);
    const create = __webpack_require__(789664);

    const config = Config.detect(options);

    let type = config.type;

    if (type == null && config._.length > 0) {
      type = config._[0];
    }

    let name = config.name;

    if (name == null && config._.length > 1) {
      name = config._[1];
    }

    if (type == null) {
      throw new ConfigurationError(
        "Please specify the type of item to create. Example: truffle create contract MyContract"
      );
    }

    if (name == null) {
      throw new ConfigurationError(
        "Please specify the name of item to create. Example: truffle create contract MyContract"
      );
    }

    if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(name)) {
      throw new ConfigurationError(
        `The name ${name} is invalid. Please enter a valid name using alpha-numeric characters.`
      );
    }

    const fn = create[type];

    const destinations = {
      contract: config.contracts_directory,
      migration: config.migrations_directory,
      test: config.test_directory
    };

    if (type === "all") {
      for (const key of Object.keys(destinations)) {
        await create[key](destinations[key], name, options);
      }
      return;
    } else if (fn == null) {
      throw new ConfigurationError(`Cannot find creation type: ${type}`);
    } else {
      return await create[type](destinations[type], name, options);
    }
  }
};

module.exports = command;


/***/ }),

/***/ 317809:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "query",
  description: "Query @truffle/db",
  builder: {},
  help: {
    usage: "truffle db query <query>",
    options: [],
    allowedGlobalOptions: []
  },

  /* This command does starts an express derived server that invokes
   * `process.exit()` on SIGINT. As a result there is no need to invoke
   * truffle's own `process.exit()` which is triggered by invoking the `done`
   * callback.
   *
   * Todo: blacklist this command for REPLs
   */
  run: async function (argv) {
    const Config = __webpack_require__(120553);
    const { connect } = __webpack_require__(168060);

    const config = Config.detect(argv);
    const [_, query] = config._;

    if (!query) {
      throw new Error(
        "Query not provided. Please run `truffle db query <query>`"
      );
    }

    const db = connect(config.db);

    const result = await db.execute(query, {});
    console.log(JSON.stringify(result, null, 2));
  }
};

module.exports = command;


/***/ }),

/***/ 983591:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "serve",
  description: "Start Truffle's GraphQL UI playground",
  builder: {},
  help: {
    usage: "truffle db serve",
    options: [],
    allowedGlobalOptions: []
  },

  /* This command does starts an express derived server that invokes
   * `process.exit()` on SIGINT. As a result there is no need to invoke
   * truffle's own `process.exit()` which is triggered by invoking the `done`
   * callback.
   *
   * Todo: blacklist this command for REPLs
   */
  run: async function (argv) {
    const Config = __webpack_require__(120553);
    const { serve } = __webpack_require__(168060);

    const config = Config.detect(argv);
    const port = (config.db && config.db.port) || 4444;
    const host = (config.db && config.db.host) || "127.0.0.1";

    const { url } = await serve(config.db).listen({ host, port });

    console.log(`🚀 Playground listening at ${url}`);
    console.log(`ℹ  Press Ctrl-C to exit`);

    await new Promise(() => {});
  }
};

module.exports = command;


/***/ }),

/***/ 149797:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const OS = __webpack_require__(712087);
const serveCommand = __webpack_require__(983591);
const queryCommand = __webpack_require__(317809);

const usage =
  "truffle db <sub-command> [options]" +
  OS.EOL +
  "  Available sub-commands: " +
  OS.EOL +
  "                serve \tStart the GraphQL server";

const command = {
  command: "db",
  description: "Database interface commands",
  builder: function (yargs) {
    return yargs.command(serveCommand).demandCommand();
  },

  subCommands: {
    serve: {
      help: serveCommand.help,
      description: serveCommand.description
    },
    query: {
      help: queryCommand.help,
      description: queryCommand.description
    }
  },

  help: {
    usage,
    options: [],
    allowedGlobalOptions: []
  },

  run: async function (args) {
    const [subCommand] = args._;
    switch (subCommand) {
      case "serve":
        await serveCommand.run(args);
        break;

      case "query":
        await queryCommand.run(args);
        break;

      default:
        console.log(`Unknown command: ${subCommand}`);
    }
  }
};

module.exports = command;


/***/ }),

/***/ 967775:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const OS = __webpack_require__(712087);
const command = {
  command: "debug",
  description: "Interactively debug any transaction on the blockchain",
  builder: {
    "_": {
      type: "string"
    },
    "fetch-external": {
      describe: "Allow debugging of external contracts",
      alias: "x",
      type: "boolean",
      default: false
    },
    "compile-tests": {
      describe: "Allow debugging of Solidity test contracts",
      type: "boolean",
      default: false
    },
    "compile-all": {
      describe: "Force debugger to compile all contracts for extra safety",
      type: "boolean",
      default: false
    },
    "compile-none": {
      describe: "Force debugger to skip compilation (dangerous!)",
      type: "boolean",
      default: false
    }
  },
  help: {
    usage:
      "truffle debug [<transaction_hash>] [--fetch-external]" + OS.EOL +
      "                             [--compile-tests|--compile-all|--compile-none]",
    options: [
      {
        option: "<transaction_hash>",
        description:
          "Transaction ID to use for debugging.  Mandatory if --fetch-external is passed."
      },
      {
        option: "--fetch-external",
        description:
          "Allows debugging of external contracts with verified sources.  Alias: -x"
      },
      {
        option: "--compile-tests",
        description:
          "Allows debugging of Solidity test contracts from the test directory.  Implies --compile-all."
      },
      {
        option: "--compile-all",
        description:
          "Forces the debugger to recompile all contracts even if it detects that it can use the artifacts."
      },
      {
        option: "--compile-none",
        description:
          "Forces the debugger to use artifacts even if it detects a problem.  Dangerous; may cause errors."
      },
    ],
    allowedGlobalOptions: ["network", "config"]
  },
  run: async function (options) {
    const { promisify } = __webpack_require__(431669);
    const debugModule = __webpack_require__(354686);
    const debug = debugModule("lib:commands:debug");

    const {Environment} = __webpack_require__(376765);
    const Config = __webpack_require__(120553);

    const {CLIDebugger} = __webpack_require__(209941);

    const config = Config.detect(options);
    await Environment.detect(config);

    const txHash = config._[0]; //may be undefined
    if (config.fetchExternal && txHash === undefined) {
      throw new Error(
        "Fetch-external mode requires a specific transaction to debug"
      );
    }
    if (config.compileTests) {
      config.compileAll = true;
    }
    if (config.compileAll && config.compileNone) {
      throw new Error(
        "Incompatible options passed regarding what to compile"
      );
    }
    const interpreter = await new CLIDebugger(config, {txHash}).run();
    return await promisify(interpreter.start.bind(interpreter))();
  }
};

module.exports = command;


/***/ }),

/***/ 491456:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const migrate = __webpack_require__(325300);

const command = {
  command: "deploy",
  description: "(alias for migrate)",
  builder: migrate.builder,
  help: {
    usage:
      "truffle deploy [--reset] [-f <number>] [--compile-all] [--verbose-rpc]",
    options: migrate.help.options,
    allowedGlobalOptions: ["network", "config"]
  },
  run: migrate.run
};

module.exports = command;


/***/ }),

/***/ 946564:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const emoji = __webpack_require__(858445);
const mnemonicInfo = __webpack_require__(225603);

const command = {
  command: "develop",
  description: "Open a console with a local development blockchain",
  builder: {
    log: {
      type: "boolean",
      default: false
    }
  },
  help: {
    usage: "truffle develop [--log] [(--require|-r) <file>]",
    options: [
      {
        option: `--log`,
        description:
          `Start/Connect to a Truffle develop session and log all ` +
          `rpc activity. You will\n                    need to open a ` +
          `different Truffle develop or console session to interact via the repl.`
      },
      {
        option: "(--require|-r) <file>",
        description: "Preload console environment from required JavaScript " +
          "file. The default export must be an object with named keys that " +
          "will be used\n                    to populate the console environment."
      },
      {
        option: "--require-none",
        description: "Do not load any user-defined JavaScript into the " +
          "console environment. This option takes precedence over --require, " +
          "-r, and\n                    values provided for console.require " +
          "in your project's truffle-config.js."
      }
    ],
    allowedGlobalOptions: ["config"]
  },
  runConsole: async (config, ganacheOptions) => {
    const Console = __webpack_require__(968303);
    const {Environment} = __webpack_require__(376765);

    const commands = __webpack_require__(591559);
    const excluded = new Set(["console", "develop", "unbox", "init"]);

    const consoleCommands = Object.keys(commands).reduce((acc, name) => {
      return !excluded.has(name)
        ? Object.assign(acc, {[name]: commands[name]})
        : acc;
    }, {});

    await Environment.develop(config, ganacheOptions);
    const c = new Console(consoleCommands, config.with({noAliases: true}));
    c.on("exit", () => process.exit());
    return await c.start();
  },
  run: async options => {
    const {Develop} = __webpack_require__(376765);
    const Config = __webpack_require__(120553);

    const config = Config.detect(options);
    const customConfig = config.networks.develop || {};

    const {mnemonic, accounts, privateKeys} = mnemonicInfo.getAccountsInfo(
      customConfig.accounts || 10
    );

    const onMissing = () => "**";

    const warning =
      ":warning:  Important :warning:  : " +
      "This mnemonic was created for you by Truffle. It is not secure.\n" +
      "Ensure you do not use it on production blockchains, or else you risk losing funds.";

    const ipcOptions = {log: options.log};

    const ganacheOptions = {
      host: customConfig.host || "127.0.0.1",
      port: customConfig.port || 9545,
      network_id: customConfig.network_id || 5777,
      total_accounts: customConfig.accounts || 10,
      default_balance_ether: customConfig.defaultEtherBalance || 100,
      blockTime: customConfig.blockTime || 0,
      fork: customConfig.fork,
      mnemonic,
      gasLimit: customConfig.gas || 0x6691b7,
      gasPrice: customConfig.gasPrice || 0x77359400,
      noVMErrorsOnRPCResponse: true,
      time: config.genesis_time,
      _chainId: 1337 //temporary until Ganache v3!
    };

    if (customConfig.hardfork !== null && customConfig.hardfork !== undefined) {
      ganacheOptions["hardfork"] = customConfig.hardfork;
    }

    function sanitizeNetworkID(network_id) {
      if (network_id !== "*") {
        if (!parseInt(network_id, 10)) {
          const error =
            `The network id specified in the truffle config ` +
            `(${network_id}) is not valid. Please properly configure the network id as an integer value.`;
          throw new Error(error);
        }
        return network_id;
      } else {
        // We have a "*" network. Return the default.
        return 5777;
      }
    }

    ganacheOptions.network_id = sanitizeNetworkID(ganacheOptions.network_id);

    const {started} = await Develop.connectOrStart(ipcOptions, ganacheOptions);
    const url = `http://${ganacheOptions.host}:${ganacheOptions.port}/`;

    if (started) {
      config.logger.log(`Truffle Develop started at ${url}`);
      config.logger.log();

      config.logger.log(`Accounts:`);
      accounts.forEach((acct, idx) => config.logger.log(`(${idx}) ${acct}`));
      config.logger.log();

      config.logger.log(`Private Keys:`);
      privateKeys.forEach((key, idx) => config.logger.log(`(${idx}) ${key}`));
      config.logger.log();

      config.logger.log(`Mnemonic: ${mnemonic}`);
      config.logger.log();
      config.logger.log(emoji.emojify(warning, onMissing));
      config.logger.log();
    } else {
      config.logger.log(
        `Connected to existing Truffle Develop session at ${url}`
      );
      config.logger.log();
    }

    if (options.log) {
      // leave the process open so that logging can take place
      return new Promise(() => {});
    }
    return await command.runConsole(config, ganacheOptions);
  }
};

module.exports = command;


/***/ }),

/***/ 615090:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "exec",
  description: "Execute a JS module within this Truffle environment",
  builder: {
    file: {
      type: "string"
    },
    c: {
      type: "boolean",
      default: false
    },
    compile: {
      type: "boolean",
      default: false
    }
  },
  help: {
    usage: "truffle exec <script.js> [--compile]",
    options: [
      {
        option: "<script.js>",
        description:
          "JavaScript file to be executed. Can include path information if the script" +
          " does not exist in the current\n                    directory. (required)"
      },
      {
        option: "--compile",
        description: "Compile contracts before executing the script."
      }
    ],
    allowedGlobalOptions: ["network", "config"]
  },
  run: async function (options) {
    const Config = __webpack_require__(120553);
    const WorkflowCompile = __webpack_require__(577135);
    const ConfigurationError = __webpack_require__(48937);
    const Require = __webpack_require__(868992);
    const {Environment} = __webpack_require__(376765);
    const path = __webpack_require__(385622);
    const OS = __webpack_require__(712087);
    const {promisify} = __webpack_require__(431669);

    const config = Config.detect(options);

    let file = options.file;

    if (file == null && options._.length > 0) {
      file = options._[0];
    }

    if (file == null) {
      throw new ConfigurationError(
        "Please specify a file, passing the path of the script you'd like the run. Note that all scripts *must* call process.exit() when finished."
      );
    }

    if (path.isAbsolute(file) === false) {
      file = path.join(process.cwd(), file);
    }

    await Environment.detect(config);
    if (config.networkHint !== false) {
      config.logger.log("Using network '" + config.network + "'." + OS.EOL);
    }

    // `--compile`
    let compilationOutput;
    if (options.c || options.compile) {
      compilationOutput = await WorkflowCompile.compile(config);
    }
    // save artifacts if compilation took place
    if (compilationOutput) {
      await WorkflowCompile.save(config, compilationOutput);
    }
    return await promisify(Require.exec.bind(Require))(config.with({file}));
  }
};

module.exports = command;


/***/ }),

/***/ 689664:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "help",
  description:
    "List all commands or provide information about a specific command",
  help: {
    usage: "truffle help [<command>]",
    options: [
      {
        option: "<command>",
        description: "Name of the command to display information for."
      }
    ],
    allowedGlobalOptions: []
  },
  builder: {},
  run: async function (options) {
    const commands = __webpack_require__(591559);
    if (options._.length === 0) {
      await this.displayCommandHelp("help", options);
      return;
    }
    const selectedCommand = options._[0];
    const subCommand = options._[1];

    if (commands[selectedCommand]) {
      await this.displayCommandHelp(selectedCommand, subCommand, options);
      return;
    } else {
      console.log(`\n  Cannot find the given command '${selectedCommand}'`);
      console.log("  Please ensure your command is one of the following: ");
      Object.keys(commands)
        .sort()
        .forEach(command => console.log(`      ${command}`));
      console.log("");
      return;
    }
  },
  displayCommandHelp: async function (selectedCommand, subCommand, options) {
    const commands = __webpack_require__(591559);
    const commandOptions = __webpack_require__(522539);

    let commandHelp, commandDescription;

    const chosenCommand = commands[selectedCommand];

    if (subCommand && chosenCommand.subCommands[subCommand]) {
      commandHelp = chosenCommand.subCommands[subCommand].help;
      commandDescription = chosenCommand.subCommands[subCommand].description;
    } else {
      commandHelp = chosenCommand.help;
      commandDescription = chosenCommand.description;
    }

    if (typeof commandHelp === "function") {
      commandHelp = await commandHelp(options);
    }

    const allowedGlobalOptions = commandHelp.allowedGlobalOptions.filter(tag=> tag in commandOptions).map(tag => commandOptions[tag]);
    const validOptionsUsage = allowedGlobalOptions
      .map(({ option }) => `[${option}]`)
      .join(" ");

    const commandHelpUsage = commandHelp.usage + " " + validOptionsUsage;

    console.log(`\n  Usage:        ${commandHelpUsage}`);
    console.log(`  Description:  ${commandDescription}`);

    if (commandHelp.options.length > 0) {
      const allValidOptions = [...commandHelp.options, ...allowedGlobalOptions];

      console.log(`  Options: `);
      for (const option of allValidOptions) {
        if (option.internal) {
          continue;
        }

        console.log(`                ${option.option}`);
        console.log(`                    ${option.description}`);
      }
    }
    console.log("");
  }
};

module.exports = command;


/***/ }),

/***/ 344062:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const path = __webpack_require__(385622);
const fse = __webpack_require__(655674);
const { promptOverwrites } = __webpack_require__(169751);

const copyFiles = async (destination, options) => {
  fse.ensureDirSync(destination);
  const { force, logger, events } = options;
  const sourcePath = path.join(__dirname, "initSource");
  const projectFiles = fse.readdirSync(sourcePath);
  const destinationContents = fse.readdirSync(destination);

  const newContents = projectFiles.filter(
    filename => !destinationContents.includes(filename)
  );

  const contentCollisions = projectFiles.filter(filename =>
    destinationContents.includes(filename)
  );

  let shouldCopy;
  if (force) {
    shouldCopy = boxContents;
  } else {
    const overwriteContents = await promptOverwrites(contentCollisions, logger);
    shouldCopy = [...newContents, ...overwriteContents];
  }

  await events.emit("init:copyingProjectFiles", {
    destinationPath: destination,
  });
  for (const file of shouldCopy) {
    fse.copySync(path.join(sourcePath, file), path.join(destination, file));
  }
};

module.exports = { copyFiles };


/***/ }),

/***/ 429287:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "init",
  description: "Initialize new and empty Ethereum project",
  builder: {},
  help: {
    usage: "truffle init [--force]",
    options: [
      {
        option: "--force",
        description:
          "Initialize project in the current directory regardless of its " +
          "state. Be careful, this\n                    will potentially overwrite files " +
          "that exist in the directory.",
      },
    ],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const {copyFiles} = __webpack_require__(344062);
    const fse = __webpack_require__(655674);
    const Config = __webpack_require__(120553);
    const config = Config.default();

    let destinationPath;
    if (options._ && options._.length > 0) {
      destinationPath = options._[0];
      fse.ensureDirSync(destinationPath);
    } else {
      destinationPath = config.working_directory;
    }

    const {events} = config;
    events.emit("init:start");

    try {
      await copyFiles(destinationPath, config);
      await events.emit("init:succeed");
    } catch (error) {
      await events.emit("init:fail", {error});
      throw error;
    }
    return;
  }
};

module.exports = command;


/***/ }),

/***/ 169751:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const fse = __webpack_require__(655674);
const inquirer = __webpack_require__(496062);

const promptOverwrites = async (contentCollisions, logger = console) => {
  const overwriteContents = [];

  for (const file of contentCollisions) {
    logger.log(`${file} already exists in this directory...`);
    const overwriting = [
      {
        type: "confirm",
        name: "overwrite",
        message: `Overwrite ${file}?`,
        default: false,
      },
    ];

    const { overwrite } = await inquirer.prompt(overwriting);
    if (overwrite) {
      fse.removeSync(file);
      overwriteContents.push(file);
    }
  }

  return overwriteContents;
};

module.exports = { promptOverwrites };


/***/ }),

/***/ 283709:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "install",
  description: "Install a package from the Ethereum Package Registry",
  builder: {},
  help: {
    usage: "truffle install <package_name>[@<version>]",
    options: [
      {
        option: "package_name",
        description:
          "Name of the package as listed in the Ethereum Package Registry. (required)"
      },
      {
        option: "<@version>",
        description:
          "When specified, will install a specific version of the package, otherwise " +
          "will install\n                    the latest version."
      }
    ],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const Config = __webpack_require__(120553);
    const Package = __webpack_require__(883513);

    if (options._ && options._.length > 0) options.packages = options._;

    const config = Config.detect(options);
    return await Package.install(config);
  }
};

module.exports = command;


/***/ }),

/***/ 325300:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "migrate",
  description: "Run migrations to deploy contracts",
  builder: {
    "reset": {
      type: "boolean",
      default: false
    },
    "compile-all": {
      describe: "Recompile all contracts",
      type: "boolean",
      default: false
    },
    "compile-none": {
      describe: "Do not compile contracts",
      type: "boolean",
      default: false
    },
    "dry-run": {
      describe: "Run migrations against an in-memory fork, for testing",
      type: "boolean",
      default: false
    },
    "skip-dry-run": {
      describe: "Skip the test or 'dry run' migrations",
      type: "boolean",
      default: false
    },
    "f": {
      describe: "Specify a migration number to run from",
      type: "number"
    },
    "to": {
      describe: "Specify a migration number to run to",
      type: "number"
    },
    "interactive": {
      describe: "Manually authorize deployments after seeing a preview",
      type: "boolean",
      default: false
    },
    "describe-json": {
      describe: "Adds extra verbosity to the status of an ongoing migration",
      type: "boolean",
      default: false
    }
  },
  help: {
    usage:
      "truffle migrate [--reset] [--f <number>] [--to <number>]\n" +
      "                                " + // spacing to align with previous line
      "[--compile-all] [--compile-none] [--verbose-rpc] [--interactive]\n" +
      "                                " + // spacing to align with previous line
      "[--skip-dry-run] [--describe-json] [--dry-run]",
    options: [
      {
        option: "--reset",
        description:
          "Run all migrations from the beginning, instead of running from the last " +
          "completed migration."
      },
      {
        option: "--f <number>",
        description:
          "Run contracts from a specific migration. The number refers to the prefix of " +
          "the migration file."
      },
      {
        option: "--to <number>",
        description:
          "Run contracts to a specific migration. The number refers to the prefix of the migration file."
      },
      {
        option: "--compile-all",
        description:
          "Compile all contracts instead of intelligently choosing which contracts need to " +
          "be compiled."
      },
      {
        option: "--compile-none",
        description: "Do not compile any contracts before migrating."
      },
      {
        option: "--verbose-rpc",
        description:
          "Log communication between Truffle and the Ethereum client."
      },
      {
        option: "--interactive",
        description:
          "Prompt to confirm that the user wants to proceed after the dry run."
      },
      {
        option: "--dry-run",
        description: "Only perform a test or 'dry run' migration."
      },
      {
        option: "--skip-dry-run",
        description: "Do not run a test or 'dry run' migration."
      },
      {
        option: "--describe-json",
        description:
          "Adds extra verbosity to the status of an ongoing migration"
      },
    ],
    allowedGlobalOptions: ["network", "config"]
  },

  determineDryRunSettings: function (config, options) {
    // Source: ethereum.stackexchange.com/questions/17051
    const networkWhitelist = [
      1, // Mainnet (ETH & ETC)
      2, // Morden (ETC)
      3, // Ropsten
      4, // Rinkeby
      5, // Goerli
      8, // Ubiq
      42, // Kovan (Parity)
      77, // Sokol
      99, // Core

      7762959, // Musiccoin
      61717561 // Aquachain
    ];

    let dryRunOnly, skipDryRun;
    const networkSettingsInConfig = config.networks[config.network];
    if (networkSettingsInConfig) {
      dryRunOnly =
        options.dryRun === true ||
        networkSettingsInConfig.dryRun === true ||
        networkSettingsInConfig["dry-run"] === true;
      skipDryRun =
        options.skipDryRun === true ||
        networkSettingsInConfig.skipDryRun === true ||
        networkSettingsInConfig["skip-dry-run"] === true;
    } else {
      dryRunOnly = options.dryRun === true;
      skipDryRun = options.skipDryRun === true;
    }
    const production =
      networkWhitelist.includes(parseInt(config.network_id)) ||
      config.production;
    const dryRunAndMigrations = production && !skipDryRun;
    return {dryRunOnly, dryRunAndMigrations};
  },

  prepareConfigForRealMigrations: async function (buildDir, options) {
    const Artifactor = __webpack_require__(529463);
    const Resolver = __webpack_require__(648511);
    const Migrate = __webpack_require__(523459);
    const {Environment} = __webpack_require__(376765);
    const Config = __webpack_require__(120553);

    let accept = true;

    if (options.interactive) {
      accept = await Migrate.acceptDryRun();
    }

    if (accept) {
      const config = Config.detect(options);

      config.contracts_build_directory = buildDir;
      config.artifactor = new Artifactor(buildDir);
      config.resolver = new Resolver(config);

      try {
        await Environment.detect(config);
      } catch (error) {
        throw new Error(error);
      }

      config.dryRun = false;
      return {config, proceed: true};
    } else {
      return {proceed: false};
    }
  },

  run: async function (options) {
    const Artifactor = __webpack_require__(529463);
    const Resolver = __webpack_require__(648511);
    const Migrate = __webpack_require__(523459);
    const WorkflowCompile = __webpack_require__(577135);
    const {Environment} = __webpack_require__(376765);
    const Config = __webpack_require__(120553);
    const {promisify} = __webpack_require__(431669);
    const promisifiedCopy = promisify(__webpack_require__(712415));
    const tmp = __webpack_require__(336276);
    tmp.setGracefulCleanup();

    const conf = Config.detect(options);
    if (conf.compileNone || conf["compile-none"]) {
      conf.compiler = "none";
    }

    const result = await WorkflowCompile.compileAndSave(conf);
    await WorkflowCompile.assignNames(conf, result);
    await Environment.detect(conf);

    const {dryRunOnly, dryRunAndMigrations} = command.determineDryRunSettings(
      conf,
      options
    );

    if (dryRunOnly) {
      conf.dryRun = true;
      await setupDryRunEnvironmentThenRunMigrations(conf);
    } else if (dryRunAndMigrations) {
      const currentBuild = conf.contracts_build_directory;
      conf.dryRun = true;

      await setupDryRunEnvironmentThenRunMigrations(conf);

      let {config, proceed} = await command.prepareConfigForRealMigrations(
        currentBuild,
        options
      );
      if (proceed) await runMigrations(config);
    } else {
      await runMigrations(conf);
    }

    async function setupDryRunEnvironmentThenRunMigrations(config) {
      await Environment.fork(config);
      // Copy artifacts to a temporary directory
      const temporaryDirectory = tmp.dirSync({
        unsafeCleanup: true,
        prefix: "migrate-dry-run-"
      }).name;

      await promisifiedCopy(
        config.contracts_build_directory,
        temporaryDirectory
      );

      config.contracts_build_directory = temporaryDirectory;
      // Note: Create a new artifactor and resolver with the updated config.
      // This is because the contracts_build_directory changed.
      // Ideally we could architect them to be reactive of the config changes.
      config.artifactor = new Artifactor(temporaryDirectory);
      config.resolver = new Resolver(config);

      return await runMigrations(config);
    }

    async function runMigrations(config) {
      Migrate.launchReporter(config);

      if (options.f) {
        return await Migrate.runFrom(options.f, config);
      } else {
        const needsMigrating = await Migrate.needsMigrating(config);

        if (needsMigrating) {
          return await Migrate.run(config);
        } else {
          config.logger.log("Network up to date.");
          return;
        }
      }
    }
  }
};

module.exports = command;


/***/ }),

/***/ 186289:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var command = {
  command: "networks",
  description: "Show addresses for deployed contracts on each network",
  builder: {
    clean: {
      describe:
        "Remove network artifacts that don't belong to any configuration",
      type: "boolean",
      default: false
    }
  },
  help: {
    usage: "truffle networks [--clean]",
    options: [
      {
        option: "--clean",
        description:
          "Remove all network artifacts that aren't associated with a named network."
      }
    ],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const Config = __webpack_require__(120553);
    const Networks = __webpack_require__(478979);

    const config = Config.detect(options);

    if (options.clean) {
      return await Networks.clean(config);
    }
    return await Networks.display(config);
  }
};

module.exports = command;


/***/ }),

/***/ 450073:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
  command: "obtain",
  description: "Fetch and cache a specified compiler",
  help: {
    usage: "truffle obtain [--solc <version>]",
    options: [
      {
        option: "--solc <version>",
        description: `Download and cache a version of the solc compiler. (required)`
      }
    ],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const SUPPORTED_COMPILERS = ["--solc"];
    const Config = __webpack_require__(120553);
    const config = Config.default().with(options);
    const CompilerSupplier = __webpack_require__(611105).CompilerSupplier;
    const supplierOptions = {
      events: config.events,
      solcConfig: config.compilers.solc
    };
    const supplier = new CompilerSupplier(supplierOptions);

    config.events.emit("obtain:start");

    if (options.solc) {
      return await this.downloadAndCacheSolc({config, options, supplier});
    }

    const message =
      `You have specified a compiler that is unsupported by ` +
      `Truffle.\nYou must specify one of the following ` +
      `compilers as well as a version as arguments: ` +
      `${SUPPORTED_COMPILERS.join(", ")}\nSee 'truffle help ` +
      `obtain' for more information and usage.`;
    throw new Error(message);
  },

  downloadAndCacheSolc: async ({config, options, supplier}) => {
    const {events} = config;
    const version = options.solc;
    try {
      const solc = await supplier.downloadAndCacheSolc(version);
      events.emit("obtain:succeed", {
        compiler: {
          version: solc.version(),
          name: "Solidity"
        }
      });
      return;
    } catch (error) {
      events.emit("obtain:fail");
      return;
    }
  }
};


/***/ }),

/***/ 904731:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "opcode",
  description: "Print the compiled opcodes for a given contract",
  builder: {
    all: {
      type: "boolean",
      default: false
    }
  },
  help: {
    usage: "truffle opcode <contract_name>",
    options: [
      {
        option: "<contract_name>",
        description:
          "Name of the contract to print opcodes for. Must be a contract name, not a file name. (required)"
      }
    ],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const Config = __webpack_require__(120553);
    const TruffleError = __webpack_require__(673321);
    const WorkflowCompile = __webpack_require__(577135);
    const CodeUtils = __webpack_require__(908135);

    if (options._.length === 0) {
      throw new TruffleError("Please specify a contract name.");
    }

    const config = Config.detect(options);
    await WorkflowCompile.compileAndSave(config);
    const contractName = options._[0];
    let Contract;
    try {
      Contract = config.resolver.require(contractName);
    } catch (e) {
      throw new TruffleError(
        'Cannot find compiled contract with name "' + contractName + '"'
      );
    }

    let bytecode = Contract.deployedBytecode;
    let numInstructions = Contract.deployedSourceMap.split(";").length;

    if (options.creation) {
      bytecode = Contract.bytecode;
      numInstructions = Contract.sourceMap.split(";").length;
    }
    const opcodes = CodeUtils.parseCode(bytecode, numInstructions);

    const indexLength = (opcodes.length + "").length;

    opcodes.forEach((opcode, index) => {
      let strIndex = index + ":";

      while (strIndex.length < indexLength + 1) {
        strIndex += " ";
      }

      console.log(strIndex + " " + opcode.name + " " + (opcode.pushData || ""));
    });
  }
};

module.exports = command;


/***/ }),

/***/ 796112:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
  command: "preserve",
  description:
    "Save data to decentralized storage platforms like IPFS and Filecoin",
  help: async options => {
    const TruffleError = __webpack_require__(673321);
    const { Plugins } = __webpack_require__(342113);
    const { getConfig } = __webpack_require__(361914);
    const semver = __webpack_require__(627029);

    if (!semver.satisfies(process.version, ">=12")) {
      throw new TruffleError(`The current version of Node (${process.version}) does not support \`truffle preserve\`, please update to Node >=12`);
    }

    const config = getConfig(options);

    const recipes = Plugins.listAllRecipes(config);

    // If a recipe does not define a tag, it is not an end-user recipe
    const recipeFlags = recipes.filter(recipe => recipe.tag !== undefined)
      .map(recipe => ({
        option: `--${recipe.tag}`,
        description: recipe.loadRecipe().help
      }));

    const flags = [
      {
        option: "--environment",
        description:
          "Environment name, as defined in truffle-config `environments` object"
      },
      ...recipeFlags
    ];

    return {
      usage:
        "truffle preserve [--environment=<environment>] <target-path>... --<recipe-tag>",
      options: flags,
      allowedGlobalOptions: []
    };
  },
  run: async options => {
    const TruffleError = __webpack_require__(673321);
    const { Plugins } = __webpack_require__(342113);
    const { getConfig, constructRecipes } = __webpack_require__(361914);
    const { preserve, ConsoleReporter } = __webpack_require__(63370);
    const semver = __webpack_require__(627029);

    if (!semver.satisfies(process.version, ">=12")) {
      throw new TruffleError(`The current version of Node (${process.version}) does not support \`truffle preserve\`, please update to Node >=12`);
    }

    const config = getConfig(options);

    const environments = config.environments || {};

    if (config.environment && !(config.environment in environments)) {
      throw new TruffleError(
        `Unknown environment: ${config.environment}. Check your truffle-config.js?`
      );
    }

    const plugins = Plugins.listAllRecipes(config);
    const environment = environments[config.environment || "development"];
    const recipes = constructRecipes(plugins, environment);

    // check for tag in options (instead of config, for maybe extra safety)
    const recipePlugin = plugins.find(plugin => plugin.tag in options);

    if (!recipePlugin) {
      throw new TruffleError("No (valid) recipe specified");
    }

    const [recipe] = constructRecipes([recipePlugin], environment);

    if (config._.length === 0) {
      throw new TruffleError("No preserve target specified");
    }

    for (const path of config._) {
      config.logger.log();
      const message = `Preserving target: ${path}`;
      config.logger.log(message);
      config.logger.log("=".repeat(message.length));

      const reporter = new ConsoleReporter({ console: config.logger });

      // The specified path and the truffle config are passed as initial inputs
      // that can be used by any recipe.
      const inputs = { path, config };

      await reporter.report(
        preserve({
          recipes,
          request: { recipe, inputs }
        })
      );

      config.logger.log();
    }
  }
};


/***/ }),

/***/ 361914:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Config = __webpack_require__(120553);

const defaultPlugins = [
  "@truffle/preserve-fs",
  "@truffle/preserve-to-ipfs",
  "@truffle/preserve-to-filecoin",
  "@truffle/preserve-to-buckets"
];

const getConfig = options => {
  let config;
  try {
    config = Config.detect(options);
  } catch (_) {
    config = Config.default().with(options);
  }

  config.plugins = [...(config.plugins || []), ...defaultPlugins];

  return config;
};

const constructRecipes = (plugins, environment) => {
  return plugins.map(plugin => {
    const options = (environment || {})[plugin.tag] || {};
    const Recipe = plugin.loadRecipe();
    const recipe = new Recipe(options);
    return recipe;
  });
};

module.exports = {
  getConfig,
  constructRecipes
};


/***/ }),

/***/ 455896:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "publish",
  description: "Publish a package to the Ethereum Package Registry",
  builder: {},
  help: {
    usage: "truffle publish",
    options: [],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const Config = __webpack_require__(120553);
    const Package = __webpack_require__(883513);

    const config = Config.detect(options);
    return await Package.publish(config);
  }
};

module.exports = command;


/***/ }),

/***/ 443736:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const TruffleError = __webpack_require__(673321);

const checkPluginConfig = ({ plugins }) => {
  if (!plugins) {
    throw new TruffleError(
      "\nError: No plugins detected in the configuration file.\n"
    );
  }

  if (!Array.isArray(plugins) || plugins.length === 0) {
    throw new TruffleError("\nError: Plugins configured incorrectly.\n");
  }
};

module.exports = {
  checkPluginConfig
};


/***/ }),

/***/ 190512:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "run",
  description: "Run a third-party command",
  builder: {},
  help: {
    usage: "truffle run [<command>]",
    options: [
      {
        option: "<command>",
        description: "Name of the third-party command to run."
      }
    ],
    allowedGlobalOptions: []
  },
  async run(options) {
    const { promisify } = __webpack_require__(431669);
    const Config = __webpack_require__(120553);
    const { checkPluginConfig } = __webpack_require__(443736);
    const Run = __webpack_require__(14864);
    const config = Config.detect(options);

    if (options._.length === 0) {
      const help = __webpack_require__(689664);
      help.displayCommandHelp("run");
      return;
    }

    const customCommand = options._[0];

    checkPluginConfig(config);

    return await promisify(Run.run.bind(Run))(customCommand, config);
  }
};

module.exports = command;


/***/ }),

/***/ 14864:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const TruffleError = __webpack_require__(673321);
const { Plugins } = __webpack_require__(342113);

const Run = {
  // executes command or throws user helpful error
  run(customCommand, config, done) {
    const [foundPlugin] = Plugins.findPluginsForCommand(config, customCommand);

    if (!foundPlugin) {
      throw new TruffleError(
        `\nError: "${customCommand}" command not supported by any currently configured plugins. Please make sure:
  – plugins are correctly configured in truffle-config.js
  – the plugin supporting the command you want to use is installed\n`
      );
    }

    // Will throw an error if loading fails, indicating misconfiguration
    const runCommand = foundPlugin.loadCommand(customCommand);

    const commandResult = runCommand(config, done);
    if (commandResult && typeof commandResult.then === "function") {
      commandResult.then(() => done()).catch(err => done(err));
    }
  }
};

module.exports = Run;


/***/ }),

/***/ 193622:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const copyArtifactsToTempDir = async config => {
  const {promisify} = __webpack_require__(431669);
  const copy = __webpack_require__(712415);
  const fs = __webpack_require__(935747);
  const OS = __webpack_require__(712087);
  const tmp = __webpack_require__(336276);
  tmp.setGracefulCleanup();

  // Copy all the built files over to a temporary directory, because we
  // don't want to save any tests artifacts. Only do this if the build directory
  // exists.
  const temporaryDirectory = tmp.dirSync({
    unsafeCleanup: true,
    prefix: "test-"
  }).name;
  try {
    fs.statSync(config.contracts_build_directory);
  } catch (_error) {
    return {temporaryDirectory};
  }

  await promisify(copy)(config.contracts_build_directory, temporaryDirectory);
  if (config.runnerOutputOnly !== true) {
    config.logger.log("Using network '" + config.network + "'." + OS.EOL);
  }
  return {temporaryDirectory};
};

module.exports = {
  copyArtifactsToTempDir
};


/***/ }),

/***/ 613799:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const determineTestFilesToRun = ({ inputFile, inputArgs = [], config }) => {
  const path = __webpack_require__(385622);
  const fs = __webpack_require__(935747);
  const glob = __webpack_require__(312884);
  let filesToRun = [];

  if (inputFile) {
    filesToRun.push(inputFile);
  } else if (inputArgs.length > 0) {
    inputArgs.forEach(inputArg => filesToRun.push(inputArg));
  }

  if (filesToRun.length === 0) {
    const directoryContents = glob.sync(
      `${config.test_directory}${path.sep}**${path.sep}*`
    );
    filesToRun =
      directoryContents.filter(item => fs.statSync(item).isFile()) || [];
  }
  return filesToRun.filter(file => {
    return file.match(config.test_file_extension_regexp) !== null;
  });
};

module.exports = {
  determineTestFilesToRun
};


/***/ }),

/***/ 86067:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const OS = __webpack_require__(712087);
const command = {
  command: "test",
  description: "Run JavaScript and Solidity tests",
  builder: {
    "show-events": {
      describe: "Show all test logs",
      type: "boolean",
      default: false
    },
    "compile-all-debug": {
      describe: "Compile in debug mode",
      type: "boolean",
      default: false
    },
    "debug": {
      describe: "Enable in-test debugging",
      type: "boolean",
      default: false
    },
    "debug-global": {
      describe: "Specify debug global function name",
      default: "debug"
    },
    "runner-output-only": {
      describe: "Suppress all output except for test runner output.",
      type: "boolean",
      default: false
    },
    "bail": {
      alias: "b",
      describe: "Bail after first test failure",
      type: "boolean",
      default: false
    },
    "stacktrace": {
      alias: "t",
      describe: "Produce Solidity stacktraces",
      type: "boolean",
      default: false
    },
    "stacktrace-extra": {
      describe: "Produce Solidity stacktraces and compile in debug mode",
      type: "boolean",
      default: false
    }
  },
  help: {
    usage:
      `truffle test [<test_file>] [--compile-all[-debug]] [--compile-none] ` +
      `[--network <name>]${OS.EOL}                             ` +
      `[--verbose-rpc] [--show-events] [--debug] ` +
      `[--debug-global <identifier>] [(--bail)]${OS.EOL}                      ` +
      `       [--stacktrace[-extra]] [(--grep|-g) <regex>]`,
    options: [
      {
        option: "<test_file>",
        description:
          "Name of the test file to be run. Can include path information if the file " +
          "does not exist in the\n                    current directory."
      },
      {
        option: "--compile-all",
        description:
          "Compile all contracts instead of intelligently choosing which contracts need " +
          "to be compiled."
      },
      {
        option: "--compile-none",
        description: "Do not compile any contracts before running the tests"
      },
      {
        option: "--compile-all-debug",
        description:
          "Compile all contracts and do so in debug mode for extra revert info.  May " +
          "cause errors on large\n                    contracts."
      },
      {
        option: "--verbose-rpc",
        description:
          "Log communication between Truffle and the Ethereum client."
      },
      {
        option: "--show-events",
        description: "Log all contract events."
      },
      {
        option: "--debug",
        description:
          "Provides global debug() function for in-test debugging. " +
          "JS tests only; implies --compile-all."
      },
      {
        option: "--debug-global <identifier>",
        description:
          'Specify global identifier for debug function. Default: "debug"'
      },
      {
        option: "--runner-output-only",
        description: "Suppress all output except for test runner output."
      },
      {
        option: "(--bail|-b)",
        description: "Bail after first test failure."
      },
      {
        option: "--stacktrace",
        description:
          "Allows for mixed JS/Solidity stacktraces when a Truffle Contract transaction " +
          "or deployment\n                    reverts.  Does not apply to calls or gas estimates.  " +
          "Implies --compile-all.  Experimental.  Alias: -t"
      },
      {
        option: "--stacktrace-extra",
        description: "Shortcut for --stacktrace --compile-all-debug."
      },
      {
        option: "(--grep|-g)",
        description: "Use mocha's \"grep\" option while running tests. This " +
          "option only runs tests that match the supplied regex/string."
      }
    ],
    allowedGlobalOptions: ["network", "config"]
  },
  parseCommandLineFlags: options => {
    // parse out command line flags to merge in to the config
    const grep = options.grep || options.g;
    const bail = options.bail || options.b;
    return {
      mocha: {
        grep,
        bail
      }
    };
  },
  run: async function (options) {
    const Config = __webpack_require__(120553);
    const { Environment, Develop } = __webpack_require__(376765);
    const { copyArtifactsToTempDir } = __webpack_require__(193622);
    const { determineTestFilesToRun } = __webpack_require__(613799);
    const { prepareConfigAndRunTests } = __webpack_require__(955472);

    const optionsToMerge = this.parseCommandLineFlags(options);
    const config = Config.detect(options).merge(optionsToMerge);

    // if "development" exists, default to using that for testing
    if (!config.network && config.networks.development) {
      config.network = "development";
    }

    if (!config.network) {
      config.network = "test";
    } else {
      await Environment.detect(config);
    }

    if (config.stacktraceExtra) {
      config.stacktrace = true;
      config.compileAllDebug = true;
    }
    // enables in-test debug() interrupt, or stacktraces, forcing compileAll
    if (config.debug || config.stacktrace || config.compileAllDebug) {
      config.compileAll = true;
    }

    const {file} = options;
    const inputArgs = options._;
    const files = determineTestFilesToRun({
      config,
      inputArgs,
      inputFile: file
    });

    if (config.networks[config.network]) {
      await Environment.detect(config);
      const {temporaryDirectory} = await copyArtifactsToTempDir(config);
      const numberOfFailures = await prepareConfigAndRunTests({
        config,
        files,
        temporaryDirectory
      });
      return numberOfFailures;
    } else {
      const ipcOptions = {network: "test"};
      const port = await __webpack_require__(715959)();

      const ganacheOptions = {
        host: "127.0.0.1",
        port,
        network_id: 4447,
        mnemonic:
          "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
        gasLimit: config.gas,
        time: config.genesis_time,
        _chainId: 1337 //temporary until Ganache v3!
      };
      const { disconnect } = await Develop.connectOrStart(
        ipcOptions,
        ganacheOptions
      );
      const ipcDisconnect = disconnect;
      await Environment.develop(config, ganacheOptions);
      const { temporaryDirectory } = await copyArtifactsToTempDir(config);
      const numberOfFailures = await prepareConfigAndRunTests({
        config,
        files,
        temporaryDirectory
      });
      ipcDisconnect();
      return numberOfFailures;
    }
  }
};

module.exports = command;


/***/ }),

/***/ 955472:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const prepareConfigAndRunTests = ({ config, temporaryDirectory, files }) => {
  const Artifactor = __webpack_require__(529463);
  const Test = __webpack_require__(952422);
  // Set a new artifactor; don't rely on the one created by Environments.
  // TODO: Make the test artifactor configurable.
  config.artifactor = new Artifactor(temporaryDirectory);

  const testConfig = config.with({
    test_files: files,
    contracts_build_directory: temporaryDirectory
  });
  return Test.run(testConfig);
};

module.exports = {
  prepareConfigAndRunTests
};


/***/ }),

/***/ 126242:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const normalizeDestination = (destination, workingDirectory) => {
  if (!destination) {
    return workingDirectory;
  }
  const path = __webpack_require__(385622);
  if (path.isAbsolute(destination)) return destination;
  return path.join(workingDirectory, destination);
};

const command = {
  command: "unbox",
  description: "Download a Truffle Box, a pre-built Truffle project",
  builder: {},
  help: {
    usage: "truffle unbox [<box_name>] [destination] [--force]",
    options: [
      {
        option: "destination",
        description:
          "Path to the directory in which you would like " +
          "to unbox the project files. If destination is\n                  " +
          "  not provided, this defaults to the current directory.",
      },
      {
        option: "<box_name>",
        description:
          "Name of the truffle box. If no box_name is specified, a default " +
          "truffle box will be downloaded.",
      },
      {
        option: "--force",
        description:
          "Unbox project in the current directory regardless of its " +
          "state. Be careful, this\n                    will potentially overwrite files " +
          "that exist in the directory.",
      },
    ],
    allowedGlobalOptions: []
  },
  async run(options) {
    const Config = __webpack_require__(120553);
    const { default: Box } = __webpack_require__(221579);
    const fse = __webpack_require__(655674);

    const config = Config.default().with({logger: console});
    // we merge in the options so that options passed on the command line
    // (for example --quiet) make it to the EventManager
    config.merge(options);

    let [url, destination] = options._;

    const normalizedDestination = normalizeDestination(
      destination,
      config.working_directory
    );

    fse.ensureDirSync(normalizedDestination);

    const unboxOptions = Object.assign({}, options, {logger: config.logger});

    config.events.emit("unbox:start");

    const boxConfig = await Box.unbox(
      url,
      normalizedDestination,
      unboxOptions,
      config
    );
    await config.events.emit("unbox:succeed", { boxConfig });
  }
};

module.exports = command;


/***/ }),

/***/ 473787:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const command = {
  command: "version",
  description: "Show version number and exit",
  builder: {},
  help: {
    usage: "truffle version",
    options: [],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const version = __webpack_require__(64146);
    const {logger} = options;
    const Config = __webpack_require__(120553);

    let config;
    try {
      config = Config.detect(options);
    } catch (error) {
      // Suppress error when truffle can't find a config
      if (error.message === "Could not find suitable configuration file.") {
        config = Config.default();
      } else {
        throw error;
      }
    }

    version.logAll(logger, config);
    return;
  }
};

module.exports = command;


/***/ }),

/***/ 975732:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const colors = __webpack_require__(183196);
const commandExistsSync = __webpack_require__(905497).sync;

const command = {
  command: "watch",
  description:
    "Watch filesystem for changes and rebuild the project automatically",
  builder: {},
  help: {
    usage: "truffle watch",
    options: [],
    allowedGlobalOptions: []
  },
  run: async function (options) {
    const OS = __webpack_require__(712087);
    const deprecationMessage = colors.yellow(
      `> The watch command is planned ` +
        `for deprecation in version 6 of Truffle.${OS.EOL}` +
        `> See https://github.com/trufflesuite/truffle/issues/3227 for more ` +
        `information.`
    );
    console.log(deprecationMessage);
    const Config = __webpack_require__(120553);
    const sane = __webpack_require__(252817);
    const path = __webpack_require__(385622);

    const config = Config.detect(options);

    const watchOptions = {
      ignored: [
        "build/**/**",
        /[/\\]\./ // Ignore files prefixed with .
      ]
    };
    // Certain large codebases have trouble with the watch command.
    // Installing watchman resolves some of these issues.
    if (commandExistsSync("watchman")) {
      watchOptions.watchman = true;
    } else {
      config.logger.log(
        "If you have trouble using watch, try installing watchman."
      );
    }

    const watchCallback = filePath => {
      const displayPath = path.join(
        "./",
        filePath.replace(config.working_directory, "")
      );
      config.logger.log(colors.cyan(">> File " + displayPath + " changed."));

      build(config);
    };

    const watcher = sane(config.working_directory, watchOptions);
    watcher.on("change", watchCallback);
    watcher.on("add", watchCallback);
    watcher.on("delete", watchCallback);

    config.logger.log(
      colors.green("Watching for a change in project files...")
    );
    return new Promise(() => {});
  }
};

const build = config => {
  const Build = __webpack_require__(160627);

  config.logger.log("Rebuilding...");

  Build.build(config, function(error) {
    printSummary(config, error);
  });
};

const printSummary = (config, error) => {
  if (error) {
    const TruffleError = __webpack_require__(673321);
    if (error instanceof TruffleError) {
      console.log(error.message);
    } else {
      // Bubble up all other unexpected errors.
      console.log(error.stack || error.toString());
    }
  } else {
    config.logger.log(
      colors.green("Completed without errors on " + new Date().toString())
    );
  }
};

module.exports = command;


/***/ }),

/***/ 968303:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const repl = __webpack_require__(868027);
const Command = __webpack_require__(651017);
const provision = __webpack_require__(207702);
const {
  Web3Shim,
  createInterfaceAdapter
} = __webpack_require__(936339);
const contract = __webpack_require__(378883);
const vm = __webpack_require__(492184);
const expect = __webpack_require__(414096);
const TruffleError = __webpack_require__(673321);
const fse = __webpack_require__(655674);
const path = __webpack_require__(385622);
const EventEmitter = __webpack_require__(128614);
const spawnSync = __webpack_require__(63129).spawnSync;
const originalRequire = __webpack_require__(588277);

const processInput = input => {
  const inputComponents = input.trim().split(" ");
  if (inputComponents.length === 0) return input;

  if (inputComponents[0] === "truffle") {
    return inputComponents.slice(1).join(" ");
  }
  return input.trim();
};

class Console extends EventEmitter {
  constructor(tasks, options) {
    super();
    EventEmitter.call(this);

    expect.options(options, [
      "working_directory",
      "contracts_directory",
      "contracts_build_directory",
      "migrations_directory",
      "networks",
      "network",
      "network_id",
      "provider",
      "resolver",
      "build_directory"
    ]);

    this.options = options;

    this.command = new Command(tasks);

    this.repl = null;

    this.interfaceAdapter = createInterfaceAdapter({
      provider: options.provider,
      networkType: options.networks[options.network].type
    });
    this.web3 = new Web3Shim({
      provider: options.provider,
      networkType: options.networks[options.network].type
    });
  }

  async start() {
    try {
      this.repl = repl.start({
        prompt: "truffle(" + this.options.network + ")> ",
        eval: this.interpret.bind(this)
      });

      await this.setUpEnvironment();
      this.provision();

      //want repl to exit when it receives an exit command
      this.repl.on("exit", () => {
        process.exit();
      });

      // ensure that `await`-ing this method never resolves. (we want to keep
      // the console open until it exits on its own)
      return new Promise(() => {});
    } catch (error) {
      this.options.logger.log(
        "Unexpected error setting up the environment or provisioning " +
        "contracts while instantiating the console."
      );
      this.options.logger.log(error.stack || error.message || error);
    }
  }

  hydrateUserDefinedVariables() {
    // exit if feature should be disabled
    if (this.options["require-none"]) return;

    // exit if no hydrate options are set
    if (
      (!this.options.console || !this.options.console.require) &&
      !this.options.require &&
      !this.options.r
    ) return;

    const requireFromPath = target => {
      return path.isAbsolute(target) ?
        originalRequire(target) :
        originalRequire(path.join(this.options.working_directory, target));
    };
    const addToContext = (userData, namespace) => {
      for (const key in userData) {
        if (namespace) {
          if (typeof this.repl.context[namespace] === "undefined") {
            this.repl.context[namespace] = {};
          }
          this.repl.context[namespace][key] = userData[key];
        } else {
          this.repl.context[key] = userData[key];
        }
      }
    };
    const errorMessage = "You must specify the console.require property as " +
      "either a string or an array. If you specify an array, its members " +
      "must be paths or objects containing at least a `path` property.";

    const requireValue = this.options.r || this.options.require || this.options.console.require;

    if (typeof requireValue === "string") {
      addToContext(requireFromPath(requireValue));
    } else if (Array.isArray(requireValue)) {
      this.options.console.require.forEach(item => {
        if (typeof item === "string") {
          addToContext(requireFromPath(item));
        } else if (typeof item === "object" && item.path) {
          addToContext(requireFromPath(item.path), item.as);
        } else {
          throw new Error(errorMessage);
        }
      });
    } else {
      throw new Error(errorMessage);
    }
  }

  async setUpEnvironment() {
    let accounts;
    try {
      accounts = await this.interfaceAdapter.getAccounts();
    } catch {
      // don't prevent Truffle from working if user doesn't provide some way
      // to sign transactions (e.g. no reason to disallow debugging)
      accounts = [];
    }
    // we load user variables first so as to not clobber ours
    this.hydrateUserDefinedVariables();

    this.repl.context.web3 = this.web3;
    this.repl.context.interfaceAdapter = this.interfaceAdapter;
    this.repl.context.accounts = accounts;
  }

  provision() {
    let files;
    try {
      const unfilteredFiles = fse.readdirSync(
        this.options.contracts_build_directory
      );
      files = unfilteredFiles.filter(file => file.endsWith(".json"));
    } catch (error) {
      // Error reading the build directory? Must mean it doesn't exist or we don't have access to it.
      // Couldn't provision the contracts if we wanted. It's possible we're hiding very rare FS
      // errors, but that's better than showing the user error messages that will be "build folder
      // doesn't exist" 99.9% of the time.
    }

    let jsonBlobs = [];
    files = files || [];

    files.forEach(file => {
      try {
        const body = fse.readFileSync(
          path.join(this.options.contracts_build_directory, file),
          "utf8"
        );
        jsonBlobs.push(JSON.parse(body));
      } catch (error) {
        throw new Error(`Error parsing or reading ${file}: ${error.message}`);
      }
    });

    const abstractions = jsonBlobs.map(json => {
      const abstraction = contract(json);
      provision(abstraction, this.options);
      return abstraction;
    });

    this.resetContractsInConsoleContext(abstractions);
    return abstractions;
  }

  resetContractsInConsoleContext(abstractions) {
    abstractions = abstractions || [];

    const contextVars = {};

    abstractions.forEach(abstraction => {
      contextVars[abstraction.contract_name] = abstraction;
    });

    // make sure the repl gets the new contracts in its context
    Object.keys(contextVars || {}).forEach(key => {
      this.repl.context[key] = contextVars[key];
    });
  }

  runSpawn(inputStrings, options) {
    let childPath;
    if (true) {
      childPath = path.join(__dirname, "consoleChild.bundled.js");
    } else {}

    // stderr is piped here because we don't need to repeatedly see the parent
    // errors/warnings in child process - specifically the error re: having
    // multiple config files
    const spawnOptions = { stdio: ["inherit", "inherit", "pipe"] };
    const settings = ["config", "network"]
      .filter(setting => options[setting])
      .map(setting => `--${setting} ${options[setting]}`)
      .join(" ");

    const spawnInput = `${settings} -- ${inputStrings}`;

    const spawnResult = spawnSync(
      "node",
      ["--no-deprecation", childPath, spawnInput],
      spawnOptions
    );

    if (spawnResult.stderr) {
      // Theoretically stderr can contain multiple errors.
      // So let's just print it instead of throwing through
      // the error handling mechanism. Bad call?
      console.log(spawnResult.stderr.toString());
    }

    // re-provision to ensure any changes are available in the repl
    this.provision();

    //display prompt when child repl process is finished
    this.repl.displayPrompt();
  }

  interpret(input, context, filename, callback) {
    const processedInput = processInput(input);
    if (
      this.command.getCommand(processedInput, this.options.noAliases) != null
    ) {
      try {
        this.runSpawn(processedInput, this.options);
      } catch (error) {
        // Perform error handling ourselves.
        if (error instanceof TruffleError) {
          console.log(error.message);
        } else {
          // Bubble up all other unexpected errors.
          console.log(error.stack || error.toString());
        }
        return callback();
      }

      // Reprovision after each command as it may change contracts.
      try {
        this.provision();
        return callback();
      } catch (error) {
        // Don't pass abstractions to the callback if they're there or else
        // they'll get printed in the repl.
        return callback(error);
      }
    }

    // Much of the following code is from here, though spruced up:
    // https://github.com/nfcampos/await-outside

    /*
    - allow whitespace before everything else
    - optionally capture `var|let|const <varname> = `
      - varname only matches if it starts with a-Z or _ or $
        and if contains only those chars or numbers
      - this is overly restrictive but is easier to maintain
    - capture `await <anything that follows it>`
    */
    let includesAwait = /^\s*((?:(?:var|const|let)\s+)?[a-zA-Z_$][0-9a-zA-Z_$]*\s*=\s*)?(\(?\s*await[\s\S]*)/;

    const match = processedInput.match(includesAwait);
    let source = processedInput;
    let assignment = null;

    // If our code includes an await, add special processing to ensure it's evaluated properly.
    if (match) {
      let assign = match[1];

      const expression =
        match[2] && match[2].endsWith(";")
          ? // strip off trailing ";" to prevent the expression below from erroring
            match[2].slice(0, -1)
          : match[2];

      const RESULT = "__await_outside_result";

      // Wrap the await inside an async function.
      // Strange indentation keeps column offset correct in stack traces
      source = `(async function() { try { ${
        assign ? `global.${RESULT} =` : "return"
      } (
  ${expression.trim()}
  ); } catch(e) { global.ERROR = e; throw e; } }())`;

      assignment = assign
        ? `${assign.trim()} global.${RESULT}; void delete global.${RESULT};`
        : null;
    }

    const runScript = script => {
      const options = {
        displayErrors: true,
        breakOnSigint: true,
        filename: filename
      };

      vm.createContext(context);
      return script.runInContext(context, options);
    };

    let script;
    try {
      const options = { displayErrors: true, lineOffset: -1 };
      script = vm.createScript(source, options);
    } catch (error) {
      // If syntax error, or similar, bail.
      return callback(error);
    }

    // Ensure our script returns a promise whether we're using an
    // async function or not. If our script is an async function,
    // this will ensure the console waits until that await is finished.
    Promise.resolve(runScript(script))
      .then(value => {
        // If there's an assignment to run, run that.
        if (assignment) return runScript(vm.createScript(assignment));
        return value;
      })
      .then(value => {
        // All good? Return the value (e.g., eval'd script or assignment)
        callback(null, value);
      })
      .catch(callback);
  }
}

module.exports = Console;


/***/ }),

/***/ 209941:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { CLIDebugger } = __webpack_require__(900458);

module.exports = {
  CLIDebugger
};


/***/ }),

/***/ 48937:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var TruffleError = __webpack_require__(673321);

class ConfigurationError extends TruffleError {
  constructor(message) {
    super(message);
  }
}

module.exports = ConfigurationError;


/***/ }),

/***/ 699079:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var TruffleError = __webpack_require__(673321);

class TaskError extends TruffleError {
  constructor(message) {
    super(message);
  }
}

module.exports = TaskError;


/***/ }),

/***/ 225603:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * @module mnemonic;
 * @requires module:@truffle/config
 * @requires module:seedrandom
 * @requires module:ethereum-cryptography
 * @requires module:ethereumjs-wallet/hdkey
 * @requires module:crypto
 */

const Config = __webpack_require__(120553);
const defaultUserConfig = Config.getUserConfig();
const bip39 = __webpack_require__(168380);
const { wordlist } = __webpack_require__(355476);
const { hdkey } = __webpack_require__(938427);
const crypto = __webpack_require__(676417);

const mnemonic = {
  /**
   * gets user-level mnemonic from user config, and if missing generates a new mnemonic
   * @returns {String} mnemonic
   */
  getOrGenerateMnemonic: function() {
    let mnemonic;
    const userMnemonicExists = defaultUserConfig.get("mnemonic");
    if (!userMnemonicExists) {
      mnemonic = bip39.entropyToMnemonic(crypto.randomBytes(16), wordlist);
      defaultUserConfig.set({ mnemonic: mnemonic });
    } else {
      mnemonic = userMnemonicExists;
    }

    return mnemonic;
  },

  /**
   * gets accounts object using mnemonic
   * @param {String}
   * @returns {Object} mnemonicObject
   */
  getAccountsInfo: function(numAddresses) {
    let mnemonic = this.getOrGenerateMnemonic();
    let accounts = [];
    let privateKeys = [];

    let hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic));
    let addressIndex = 0;
    let walletHdpath = "m/44'/60'/0'/0/";

    for (let i = addressIndex; i < addressIndex + numAddresses; i++) {
      let wallet = hdwallet.derivePath(walletHdpath + i).getWallet();
      let addr = "0x" + wallet.getAddress().toString("hex");
      let privKey = wallet.getPrivateKey().toString("hex");
      accounts.push(addr);
      privateKeys.push(privKey);
    }

    return {
      mnemonic,
      accounts,
      privateKeys
    };
  }
};

module.exports = mnemonic;


/***/ }),

/***/ 902860:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * @module googleAnalytics;
 * @requires module:@truffle/config
 * @requires module:universal-analytics
 * @requires module:uuid
 * @requires module:inquirer
 * @requires module:../version
 */

const Config = __webpack_require__(120553);
const userConfig = Config.getUserConfig();
const ua = __webpack_require__(340387);
const uuid = __webpack_require__(171171);

const inquirer = __webpack_require__(496062);

const version = __webpack_require__(64146).info();

//set truffleAnalyticsId depending on whether version is bundled
const truffleAnalyticsId = version.bundle ? "UA-83874933-6" : "UA-83874933-7";

const analyticsInquiry = [
  {
    type: "list",
    name: "analyticsInquiry",
    message:
      "Would you like to enable analytics for your Truffle projects? Doing so will allow us to make sure Truffle is working as expected and help us address any bugs more efficiently.",
    choices: ["Yes, enable analytics", "No, do not enable analytics"]
  }
];
const analyticsDisable = [
  {
    type: "confirm",
    name: "analyticsDisable",
    message: "Analytics are currently enabled. Would you like to disable them?",
    default: false
  }
];
const analyticsEnable = [
  {
    type: "confirm",
    name: "analyticsEnable",
    message: "Analytics are currently disabled. Would you like to enable them?",
    default: false
  }
];

const googleAnalytics = {
  /**
   * set user-level unique id
   */
  setUserId: function() {
    if (!userConfig.get("uniqueId")) {
      let userId = uuid();
      userConfig.set({ uniqueId: userId });
    }
  },
  /**
   * get user-level options for analytics
   * @param {Object} userConfig
   * @returns {bool}
   */
  getAnalytics: function() {
    return userConfig.get("enableAnalytics");
  },
  /**
   * set user-level options for analytics
   * @param {bool} analyticsBool
   * @param {Object} userConfig
   */
  setAnalytics: function(analyticsBool) {
    if (analyticsBool === true) {
      this.setUserId();
      userConfig.set({
        enableAnalytics: true,
        analyticsSet: true,
        analyticsMessageDateTime: Date.now()
      });
    } else if (analyticsBool === false) {
      userConfig.set({
        enableAnalytics: false,
        analyticsSet: true,
        analyticsMessageDateTime: Date.now()
      });
    } else {
      const message =
        `Error setting config option.` +
        `\n> You must set the 'analytics' option to either 'true' ` +
        `or 'false'. \n> The value you provided was ${analyticsBool}.`;
      throw new Error(message);
    }
    return true;
  },
  /**
   * prompt user to determine values for user-level analytics config options
   * @param {Object} userConfig
   */
  setUserConfigViaPrompt: async function() {
    if (!userConfig.get("analyticsSet") && process.stdin.isTTY === true) {
      let answer = await inquirer.prompt(analyticsInquiry);
      if (answer.analyticsInquiry === analyticsInquiry[0].choices[0]) {
        this.setAnalytics(true);
      } else {
        this.setAnalytics(false);
      }
    } else if (
      userConfig.get("analyticsSet") &&
      userConfig.get("enableAnalytics") &&
      process.stdin.isTTY === true
    ) {
      let answer = await inquirer.prompt(analyticsDisable);
      if (answer.analyticsDisable) {
        this.setAnalytics(false);
      } else {
        this.setAnalytics(true);
      }
    } else if (
      userConfig.get("analyticsSet") &&
      !userConfig.get("enableAnalytics") &&
      process.stdin.isTTY === true
    ) {
      let answer = await inquirer.prompt(analyticsEnable);
      if (answer.analyticsEnable) {
        this.setAnalytics(true);
      } else {
        this.setAnalytics(false);
      }
    }
    return true;
  },
  /**
   * check user-level config to see if user has enabled analytics
   * @returns {bool}
   */
  checkIfAnalyticsEnabled: function() {
    if (userConfig.get("enableAnalytics")) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * set data that will be the same in future calls
   * @returns {Object} visitor
   */
  setPersistentAnalyticsData: function() {
    if (this.checkIfAnalyticsEnabled() === true) {
      let userId = userConfig.get("uniqueId");
      let visitor = ua(truffleAnalyticsId, { cid: userId });
      return visitor;
    }
  },

  /**
   * send event to Google Analytics
   * @param {Object}
   */
  // eslint-disable-next-line no-unused-vars
  sendAnalyticsEvent: function(eventObject, callback) {
    let visitor = this.setPersistentAnalyticsData();
    let sendObject = {};
    if (eventObject["command"]) {
      sendObject["ec"] = eventObject["command"];
      sendObject["ea"] = JSON.stringify(eventObject["args"]);
      sendObject["el"] = eventObject["version"];
      sendObject["dp"] = "/" + eventObject["command"];
    } else {
      sendObject["ec"] = "Error";
      sendObject["ea"] = "nonzero exit code";
      sendObject["el"] =
        eventObject["version"] + " " + eventObject["exception"];
      sendObject["dp"] = "/error";
    }

    if (visitor) {
      // eslint-disable-next-line no-unused-vars
      visitor.event(sendObject, function(err) {});
    }

    return true;
  }
};

module.exports = googleAnalytics;


/***/ }),

/***/ 54708:
/***/ ((module) => {

// Extracts the input flags --option from the arguments  of type `--option=value` or `--option value` or `--flag`
const extractFlags = inputArguments => {
  // Get all the args that begins with `--`. This also includes `--option=value`
  const inputFlags = inputArguments.filter(flag => {
    return flag.startsWith("--") ? flag : null;
  });

  // Extract only the flags i.e `--option` from `--option=value`
  inputFlags.map((flag, i) => {
    let indexOfEqualsSign = flag.indexOf("=");
    if (indexOfEqualsSign > 0) {
      flag = flag.slice(0, indexOfEqualsSign);
      inputFlags.splice(i, 1, flag);
    }
  });
  return inputFlags;
};

module.exports = { extractFlags };


/***/ }),

/***/ 64146:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const pkg = __webpack_require__(512322);
const { CompilerSupplier } = __webpack_require__(611105);
const Config = __webpack_require__(120553);

const info = config => {
  let bundleVersion;
  // NOTE: Webpack will replace BUNDLE_VERSION with a string.
  if (true) bundleVersion = "5.4.2";

  let supplierOptions;
  if (config && config.compilers) {
    supplierOptions = {
      events: config.events,
      solcConfig: config.compilers.solc
    };
  } else {
    const { events, compilers } = new Config();
    const solcConfig = compilers.solc;
    supplierOptions = { events, solcConfig };
  }
  const supplier = new CompilerSupplier(supplierOptions);

  return {
    core: pkg.version,
    bundle: bundleVersion,
    solc: supplier.version
  };
};

const logTruffle = (logger = console, versionInformation) => {
  const bundle = versionInformation.bundle
    ? `v${versionInformation.bundle}`
    : "(unbundled)";
  logger.log(`Truffle ${bundle} (core: ${versionInformation.core})`);
};

const logNode = (logger = console) => {
  logger.log(`Node ${process.version}`);
};

const logSolidity = (logger = console, versionInformation, config) => {
  let solcVersion;
  if (
    config &&
    config.compilers &&
    config.compilers.solc &&
    config.compilers.solc.version
  ) {
    solcVersion = config.compilers.solc.version;
    logger.log(`Solidity - ${solcVersion} (solc-js)`);
  } else {
    const versionInformation = info(config);
    solcVersion = versionInformation.solc;
    logger.log(`Solidity v${solcVersion} (solc-js)`);
  }
};

const logWeb3 = (logger = console) => {
  const web3Version = pkg.dependencies.web3;
  logger.log(`Web3.js v${web3Version}`);
};

const logAll = (logger = console, config) => {
  const versionInformation = info(config);
  logTruffle(logger, versionInformation);
  logSolidity(logger, versionInformation, config);
  logNode(logger);
  logWeb3(logger);
};

const logTruffleAndNode = (logger = console, config) => {
  const versionInformation = info(config);
  logTruffle(logger, versionInformation);
  logNode(logger);
};

module.exports = {
  logAll,
  info,
  logTruffleAndNode
};


/***/ }),

/***/ 386927:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { IPC } = __webpack_require__(775898);
const path = __webpack_require__(385622);
const { spawn } = __webpack_require__(63129);
const debug = __webpack_require__(905845);

const Develop = {
  start: async function(ipcNetwork, options = {}) {
    let chainPath;

    // The path to the dev env process depends on whether or not
    // we're running in the bundled version. If not, use chain.js
    // directly, otherwise let the bundle point at the bundled version.
    if (true) {
      // Remember: In the bundled version, __dirname refers to the
      // build directory where cli.bundled.js and cli.chain.js live.
      chainPath = path.join(__dirname, "chain.bundled.js");
    } else {}

    const logger = options.logger || console;
    //check that genesis-time config option passed through the truffle-config.js file is a valid time.
    if (options.time && isNaN(Date.parse(options.time))) {
      options.time = Date.now();
      logger.log(
        "\x1b[31m%s\x1b[0m",
        "Invalid Date passed to genesis-time, using current Date instead",
        "\x1b[0m"
      );
    }

    const stringifiedOptions = JSON.stringify(options);
    const optionsBuffer = Buffer.from(stringifiedOptions);
    const base64OptionsString = optionsBuffer.toString("base64");

    return spawn("node", [chainPath, ipcNetwork, base64OptionsString], {
      detached: true,
      stdio: "ignore"
    });
  },

  connect: function(options) {
    const debugServer = debug("develop:ipc:server");
    const debugClient = debug("develop:ipc:client");
    const debugRPC = debug("develop:ganache");

    options.retry = options.retry || false;
    options.log = options.log || false;
    options.network = options.network || "develop";
    var ipcNetwork = options.network;

    var ipc = new IPC();
    ipc.config.appspace = "truffle.";

    // set connectPath explicitly
    var dirname = ipc.config.socketRoot;
    var basename = `${ipc.config.appspace}${ipcNetwork}`;
    var connectPath = path.join(dirname, basename);

    ipc.config.silent = !debugClient.enabled;
    ipc.config.logger = debugClient;

    var loggers = {};

    if (debugServer.enabled) {
      loggers.ipc = debugServer;
    }

    if (options.log) {
      debugRPC.enabled = true;

      loggers.ganache = function() {
        // HACK-y: replace `{}` that is getting logged instead of ""
        var args = Array.prototype.slice.call(arguments);
        if (
          args.length === 1 &&
          typeof args[0] === "object" &&
          Object.keys(args[0]).length === 0
        ) {
          args[0] = "";
        }

        debugRPC.apply(undefined, args);
      };
    }

    if (!options.retry) {
      ipc.config.maxRetries = 0;
    }

    var disconnect = function() {
      ipc.disconnect(ipcNetwork);
    };

    return new Promise((resolve, reject) => {
      ipc.connectTo(ipcNetwork, connectPath, function() {
        ipc.of[ipcNetwork].on("destroy", function() {
          reject(new Error("IPC connection destroyed"));
        });

        ipc.of[ipcNetwork].on("truffle.ready", function() {
          resolve(disconnect);
        });

        Object.keys(loggers).forEach(function(key) {
          var log = loggers[key];
          if (log) {
            var message = `truffle.${key}.log`;
            ipc.of[ipcNetwork].on(message, log);
          }
        });
      });
    });
  },

  connectOrStart: async function(options, ganacheOptions) {
    options.retry = false;

    const ipcNetwork = options.network || "develop";

    let connectedAlready = false;

    try {
      const disconnect = await this.connect(options);
      connectedAlready = true;
      return {
        started: false,
        disconnect
      };
    } catch (_error) {
      await this.start(ipcNetwork, ganacheOptions);
      options.retry = true;
      const disconnect = await this.connect(options);
      if (connectedAlready) return;
      connectedAlready = true;
      return {
        started: true,
        disconnect
      };
    }
  }
};

module.exports = Develop;


/***/ }),

/***/ 753234:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Web3 = __webpack_require__(503283);
const { createInterfaceAdapter } = __webpack_require__(936339);
const expect = __webpack_require__(414096);
const TruffleError = __webpack_require__(673321);
const Resolver = __webpack_require__(648511);
const Artifactor = __webpack_require__(529463);
const Ganache = __webpack_require__(968321);
const Provider = __webpack_require__(200509);

const Environment = {
  // It's important config is a Config object and not a vanilla object
  detect: async function (config) {
    expect.options(config, ["networks"]);

    helpers.setUpConfig(config);
    helpers.validateNetworkConfig(config);

    const interfaceAdapter = createInterfaceAdapter({
      provider: config.provider,
      networkType: config.networks[config.network].type
    });

    await Provider.testConnection(config);
    await helpers.detectAndSetNetworkId(config, interfaceAdapter);
    await helpers.setFromOnConfig(config, interfaceAdapter);
  },

  // Ensure you call Environment.detect() first.
  fork: async function (config) {
    expect.options(config, ["from", "provider", "networks", "network"]);

    const interfaceAdapter = createInterfaceAdapter({
      provider: config.provider,
      networkType: config.networks[config.network].type
    });

    let accounts;
    try {
      accounts = await interfaceAdapter.getAccounts();
    } catch {
      // don't prevent Truffle from working if user doesn't provide some way
      // to sign transactions (e.g. no reason to disallow debugging)
      accounts = [];
    }
    const block = await interfaceAdapter.getBlock("latest");

    const upstreamNetwork = config.network;
    const upstreamConfig = config.networks[upstreamNetwork];
    const forkedNetwork = config.network + "-fork";
    const ganacheOptions = {
      fork: config.provider,
      gasLimit: block.gasLimit,
      _chainId: 1337 //temporary until Ganache v3!
    };
    if (accounts.length > 0) ganacheOptions.unlocked_accounts = accounts;

    config.networks[forkedNetwork] = {
      network_id: config.network_id,
      provider: Ganache.provider(ganacheOptions),
      from: config.from,
      gas: upstreamConfig.gas,
      gasPrice: upstreamConfig.gasPrice
    };
    config.network = forkedNetwork;
  },

  develop: async (config, ganacheOptions) => {
    expect.options(config, ["networks"]);

    const network = config.network || "develop";
    const url = `http://${ganacheOptions.host}:${ganacheOptions.port}/`;

    config.networks[network] = {
      network_id: ganacheOptions.network_id,
      provider: function () {
        return new Web3.providers.HttpProvider(url, { keepAlive: false });
      }
    };

    config.network = network;

    return await Environment.detect(config);
  }
};

const helpers = {
  setFromOnConfig: async (config, interfaceAdapter) => {
    if (config.from) return;

    try {
      const accounts = await interfaceAdapter.getAccounts();
      config.networks[config.network].from = accounts[0];
    } catch {
      // don't prevent Truffle from working if user doesn't provide some way
      // to sign transactions (e.g. no reason to disallow debugging)
    }
  },

  detectAndSetNetworkId: async (config, interfaceAdapter) => {
    const configNetworkId = config.networks[config.network].network_id;
    const providerNetworkId = await interfaceAdapter.getNetworkId();
    if (configNetworkId !== "*") {
      // Ensure the network id matches the one in the config for safety
      if (providerNetworkId.toString() !== configNetworkId.toString()) {
        const error =
          `The network id specified in the truffle config ` +
          `(${configNetworkId}) does not match the one returned by the network ` +
          `(${providerNetworkId}).  Ensure that both the network and the ` +
          `provider are properly configured.`;
        throw new Error(error);
      }
    } else {
      // We have a "*" network. Get the current network and replace it with the real one.
      // TODO: Should we replace this with the blockchain uri?
      config.networks[config.network].network_id = providerNetworkId;
    }
  },

  validateNetworkConfig: config => {
    const networkConfig = config.networks[config.network];

    if (!networkConfig) {
      throw new TruffleError(
        `Unknown network "${config.network}` +
          `". See your Truffle configuration file for available networks.`
      );
    }

    const configNetworkId = config.networks[config.network].network_id;

    if (configNetworkId == null) {
      throw new Error(
        `You must specify a network_id in your '` +
          `${config.network}' configuration in order to use this network.`
      );
    }
  },

  setUpConfig: config => {
    if (!config.resolver) {
      config.resolver = new Resolver(config);
    }

    if (!config.artifactor) {
      config.artifactor = new Artifactor(config.contracts_build_directory);
    }

    if (!config.network) {
      if (config.networks["development"]) {
        config.network = "development";
      } else {
        config.network = "ganache";
        config.networks[config.network] = {
          host: "127.0.0.1",
          port: 7545,
          network_id: 5777
        };
      }
    }

    const currentNetworkSettings = config.networks[config.network];
    if (
      currentNetworkSettings &&
      currentNetworkSettings.ens &&
      currentNetworkSettings.ens.registry
    ) {
      config.ens.registryAddress = currentNetworkSettings.ens.registry.address;
    }
  }
};

module.exports = Environment;


/***/ }),

/***/ 376765:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Environment = __webpack_require__(753234);
const Develop = __webpack_require__(386927);

module.exports = { Environment, Develop };


/***/ }),

/***/ 221579:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.normalizeSourcePath = void 0;
const utils_1 = __importDefault(__webpack_require__(326086));
const tmp_1 = __importDefault(__webpack_require__(336276));
const path_1 = __importDefault(__webpack_require__(385622));
const config_1 = __importDefault(__webpack_require__(120553));
const fs_extra_1 = __importDefault(__webpack_require__(655674));
const inquirer_1 = __importDefault(__webpack_require__(556723));
const debug_1 = __importDefault(__webpack_require__(615158));
const debug = debug_1.default("unbox");
const defaultPath = "git@github.com:trufflesuite/truffle-init-default";
/*
 * accepts a number of different url and org/repo formats and returns the
 * format required by https://www.npmjs.com/package/download-git-repo for remote URLs
 * or absolute path to local folder if the source is local folder
 *
 * supported input formats are as follows:
 *   - org/repo[#branch]
 *   - https://github.com(/|:)<org>/<repo>[.git][#branch]
 *   - git@github.com:<org>/<repo>[#branch]
 *   - path to local folder (absolute, relative or ~/home)
 */
const normalizeSourcePath = (url = defaultPath) => {
    // Process filepath resolution
    //
    if (url.startsWith(".") || url.startsWith("/") || url.startsWith("~")) {
        debug({ in: url, out: path_1.default.normalize(url) });
        return path_1.default.resolve(path_1.default.normalize(url));
    }
    // preprocess to reduce regex complexity
    // `https` is not case sensitiv, unlike `git`
    url = url.replace(/^https/i, "https");
    // branch should not end with slash
    const invalidBranch = /\/$/;
    // process https? or git prefixed input
    //
    if (/^(https?|git)/i.test(url)) {
        // This regular expression uses named capture groups to parse input. The
        // format is (?<the-name>the-regex)
        //
        // \w, the word meta character is a member of [A-Za-z0-9_]. all letters,
        // digits and the underscore. Note \w has to be \\w to escape the backslash
        // in a string literal.
        //
        const protocolRex = new RegExp([
            // match either `htps://` or `git@`
            "(?<protocol>(https://|git@))",
            // service is 1 or many (word, dot or dash)
            "(?<service>[\\w.-]+)",
            // match either `/` or `:`
            "(/|:)",
            // org is 1 or many (word, dot or dash)
            "(?<org>[\\w.-]+)",
            "/",
            // repo is 1 or many (word, dot or dash)
            "(?<repo>[\\w.-]+)",
            // branch is 1 or many (word, dot or dash) and can be optional
            "(?<branch>#[\\w./-]+)?",
            // the input string must be consumed fully at this point to match
            "$",
        ].join(""));
        const match = url.match(protocolRex);
        if (match) {
            const { groups } = match;
            const branch = groups["branch"] || "";
            if (invalidBranch.test(branch)) {
                debug({
                    in: url,
                    error: "InvalidFormat (protocol)",
                    hint: "branch is malformed",
                });
                throw new Error("Box specified with invalid format (git/https)");
            }
            const repo = groups["repo"].replace(/\.git$/i, "");
            const result = `https://${groups["service"]}:${groups["org"]}/${repo}${branch}`;
            debug({ in: url, out: result });
            return result;
        }
        debug({
            in: url,
            error: "InvalidFormat (protocol)",
            hint: "did not match protocol",
        });
        throw new Error("Box specified with invalid format (git/https)");
    }
    // default case: process [org/] + repo + [ #branch/name/with/slashes ]
    //
    const orgRepoBranchRex = new RegExp([
        // start match at beginning
        "^",
        // org is 1 or many (word, dot or dash) followed by a slash. org can be
        // optional
        "(?<org>[\\w.-]+/)?",
        // repo is 1 or many (word, dot or dash)
        "(?<repo>[\\w.-]+)",
        // optional branch (undefined if unmatched)
        "(?<branch>#[\\w./-]+)?",
        "$",
    ].join(""));
    const match = url.match(orgRepoBranchRex);
    if (match) {
        const { groups } = match;
        // `truffle-box` is the default org
        const org = groups["org"] || "truffle-box/";
        const branch = groups["branch"] || "";
        if (invalidBranch.test(branch)) {
            debug({
                in: url,
                error: "InvalidFormat (orgRepoBranch)",
                hint: "branch is malformed",
            });
            throw new Error("Box specified with invalid format");
        }
        let repo = groups["repo"];
        // Official Truffle boxes should have a `-box` suffix
        if (org.toLowerCase().startsWith("truffle-box")) {
            repo = repo.endsWith("-box") ? repo : `${repo}-box`;
        }
        const result = `https://github.com:${org}${repo}${branch}`;
        debug({ in: url, out: result });
        return result;
    }
    // No match, it's an error!
    debug({ in: url, error: "InvalidFormat", hint: "matched nothing" });
    throw new Error("Box specified in invalid format");
};
exports.normalizeSourcePath = normalizeSourcePath;
const parseSandboxOptions = (options) => {
    if (typeof options === "string") {
        // back compatibility for when `options` used to be `name`
        return {
            name: options,
            unsafeCleanup: false,
            setGracefulCleanup: false,
            logger: console,
            force: false,
        };
    }
    else if (typeof options === "object") {
        return {
            name: options.name || "default",
            unsafeCleanup: options.unsafeCleanup || false,
            setGracefulCleanup: options.setGracefulCleanup || false,
            logger: options.logger || console,
            force: options.force || false,
        };
    }
};
const Box = {
    unbox: (url, destination, options = {}, config) => __awaiter(void 0, void 0, void 0, function* () {
        const { events } = config;
        let tempDirCleanup;
        const logger = options.logger || { log: () => { } };
        const unpackBoxOptions = {
            logger: options.logger,
            force: options.force,
        };
        try {
            const normalizedSourcePath = exports.normalizeSourcePath(url);
            yield Box.checkDir(options, destination);
            const tempDir = utils_1.default.setUpTempDirectory(events);
            const tempDirPath = tempDir.path;
            tempDirCleanup = tempDir.cleanupCallback;
            yield utils_1.default.downloadBox(normalizedSourcePath, tempDirPath, events);
            const boxConfig = yield utils_1.default.readBoxConfig(tempDirPath);
            yield utils_1.default.unpackBox(tempDirPath, destination, boxConfig, unpackBoxOptions);
            events.emit("unbox:cleaningTempFiles:start");
            tempDirCleanup();
            events.emit("unbox:cleaningTempFiles:succeed");
            utils_1.default.setUpBox(boxConfig, destination, events);
            return boxConfig;
        }
        catch (error) {
            if (tempDirCleanup)
                tempDirCleanup();
            events.emit("unbox:fail");
            throw error;
        }
    }),
    checkDir: (options = {}, destination) => __awaiter(void 0, void 0, void 0, function* () {
        let logger = options.logger || console;
        if (!options.force) {
            const unboxDir = fs_extra_1.default.readdirSync(destination);
            if (unboxDir.length) {
                logger.log(`This directory is non-empty...`);
                const prompt = [
                    {
                        type: "confirm",
                        name: "proceed",
                        message: `Proceed anyway?`,
                        default: true,
                    },
                ];
                const answer = yield inquirer_1.default.prompt(prompt);
                if (!answer.proceed) {
                    logger.log("Unbox cancelled");
                    process.exit();
                }
            }
        }
    }),
    // options.unsafeCleanup
    //   Recursively removes the created temporary directory, even when it's not empty. default is false
    // options.setGracefulCleanup
    //   Cleanup temporary files even when an uncaught exception occurs
    sandbox: (options) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, unsafeCleanup, setGracefulCleanup, logger, force, } = parseSandboxOptions(options);
        const boxPath = name.replace(/^default(?=#|$)/, defaultPath);
        //ordinarily, this line will have no effect.  however, if the name is "default",
        //possibly with a branch specification, this replaces it appropriately
        //(this is necessary in order to keep using trufflesuite/truffle-init-default
        //instead of truffle-box/etc)
        if (setGracefulCleanup)
            tmp_1.default.setGracefulCleanup();
        let config = new config_1.default();
        const tmpDir = tmp_1.default.dirSync({ unsafeCleanup });
        const unboxOptions = { logger, force };
        yield Box.unbox(boxPath, tmpDir.name, unboxOptions, config);
        return config_1.default.load(path_1.default.join(tmpDir.name, "truffle-config.js"), {});
    }),
};
exports.default = Box;
//# sourceMappingURL=box.js.map

/***/ }),

/***/ 77220:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_extra_1 = __importDefault(__webpack_require__(655674));
function setDefaults(config = {}) {
    const hooks = config.hooks || {};
    return {
        ignore: config.ignore || [],
        commands: config.commands || {
            compile: "truffle compile",
            migrate: "truffle migrate",
            test: "truffle test"
        },
        hooks: {
            "post-unpack": hooks["post-unpack"] || ""
        }
    };
}
function read(path) {
    return fs_extra_1.default
        .readFile(path)
        .catch(() => "{}")
        .then(JSON.parse)
        .then(setDefaults);
}
module.exports = {
    read,
    setDefaults
};
//# sourceMappingURL=config.js.map

/***/ }),

/***/ 326086:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const unbox_1 = __importDefault(__webpack_require__(91104));
const fs_1 = __importDefault(__webpack_require__(935747));
const config_1 = __importDefault(__webpack_require__(77220));
const tmp_1 = __importDefault(__webpack_require__(336276));
const cwd = __webpack_require__(961765).cwd();
const path_1 = __importDefault(__webpack_require__(385622));
module.exports = {
    downloadBox: (source, destination, events) => __awaiter(void 0, void 0, void 0, function* () {
        events.emit("unbox:downloadingBox:start");
        try {
            yield unbox_1.default.verifySourcePath(source);
            yield unbox_1.default.fetchRepository(source, destination);
            events.emit("unbox:downloadingBox:succeed");
        }
        catch (error) {
            events.emit("unbox:fail");
            throw error;
        }
    }),
    readBoxConfig: (destination) => __awaiter(void 0, void 0, void 0, function* () {
        const possibleConfigs = [
            path_1.default.join(destination, "truffle-box.json"),
            path_1.default.join(destination, "truffle-init.json")
        ];
        const configPath = possibleConfigs.reduce((path, alt) => path || (fs_1.default.existsSync(alt) && alt), undefined);
        return yield config_1.default.read(configPath);
    }),
    setUpTempDirectory: (events) => {
        events.emit("unbox:preparingToDownload:start");
        const options = {
            unsafeCleanup: true
        };
        try {
            const tmpDir = tmp_1.default.dirSync(options);
            events.emit("unbox:preparingToDownload:succeed");
            return {
                path: path_1.default.join(tmpDir.name, "box"),
                cleanupCallback: tmpDir.removeCallback
            };
        }
        catch (error) {
            events.emit("unbox:fail");
            throw error;
        }
    },
    unpackBox: (tempDir, destination, boxConfig, unpackBoxOptions) => __awaiter(void 0, void 0, void 0, function* () {
        unbox_1.default.prepareToCopyFiles(tempDir, boxConfig);
        yield unbox_1.default.copyTempIntoDestination(tempDir, destination, unpackBoxOptions);
    }),
    setUpBox: (boxConfig, destination, events) => {
        events.emit("unbox:settingUpBox:start");
        try {
            unbox_1.default.installBoxDependencies(boxConfig, destination);
            events.emit("unbox:settingUpBox:succeed");
        }
        catch (error) {
            events.emit("unbox:fail");
            throw error;
        }
    }
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 91104:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_extra_1 = __importDefault(__webpack_require__(655674));
const path_1 = __importDefault(__webpack_require__(385622));
const download_git_repo_1 = __importDefault(__webpack_require__(120448));
const axios_1 = __importDefault(__webpack_require__(409669));
const vcsurl_1 = __importDefault(__webpack_require__(309627));
const url_1 = __webpack_require__(978835);
const child_process_1 = __webpack_require__(63129);
const inquirer_1 = __importDefault(__webpack_require__(556723));
const util_1 = __webpack_require__(431669);
const ignore_1 = __importDefault(__webpack_require__(754877));
function verifyLocalPath(localPath) {
    const configPath = path_1.default.join(localPath, "truffle-box.json");
    fs_extra_1.default.access(configPath).catch(_e => {
        throw new Error(`Truffle Box at path ${localPath} doesn't exist.`);
    });
}
function verifyVCSURL(url) {
    return __awaiter(this, void 0, void 0, function* () {
        // Next let's see if the expected repository exists. If it doesn't, ghdownload
        // will fail spectacularly in a way we can't catch, so we have to do it ourselves.
        const configURL = url_1.parse(`${vcsurl_1.default(url)
            .replace("github.com", "raw.githubusercontent.com")
            .replace(/#.*/, "")}/master/truffle-box.json`);
        const repoUrl = `https://${configURL.host}${configURL.path}`;
        try {
            yield axios_1.default.head(repoUrl, { maxRedirects: 50 });
        }
        catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error(`Truffle Box at URL ${url} doesn't exist. If you believe this is an error, please contact Truffle support.`);
            }
            else {
                const prefix = `Error connecting to ${repoUrl}. Please check your internet connection and try again.`;
                error.message = `${prefix}\n\n${error.message || ''}`;
                throw error;
            }
        }
    });
}
function verifySourcePath(sourcePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (sourcePath.startsWith("/")) {
            return verifyLocalPath(sourcePath);
        }
        return verifyVCSURL(sourcePath);
    });
}
function gitIgnoreFilter(sourcePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const ignoreFilter = ignore_1.default();
        try {
            const gitIgnore = yield fs_extra_1.default.readFile(path_1.default.join(sourcePath, ".gitignore"), "utf8");
            ignoreFilter.add(gitIgnore.split(/\r?\n/).map(p => p.replace(/\/$/, "")));
        }
        catch (err) { }
        return ignoreFilter;
    });
}
function fetchRepository(sourcePath, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (sourcePath.startsWith("/")) {
            const filter = yield gitIgnoreFilter(sourcePath);
            return fs_extra_1.default.copy(sourcePath, dir, {
                filter: file => sourcePath === file || !filter.ignores(path_1.default.relative(sourcePath, file))
            });
        }
        return util_1.promisify(download_git_repo_1.default)(sourcePath, dir);
    });
}
function prepareToCopyFiles(tempDir, { ignore }) {
    const needingRemoval = ignore;
    // remove box config file
    needingRemoval.push("truffle-box.json");
    needingRemoval.push("truffle-init.json");
    needingRemoval
        .map((fileName) => path_1.default.join(tempDir, fileName))
        .forEach((filePath) => fs_extra_1.default.removeSync(filePath));
}
function promptOverwrites(contentCollisions, logger = console) {
    return __awaiter(this, void 0, void 0, function* () {
        const overwriteContents = [];
        for (const file of contentCollisions) {
            logger.log(`${file} already exists in this directory...`);
            const overwriting = [
                {
                    type: "confirm",
                    name: "overwrite",
                    message: `Overwrite ${file}?`,
                    default: false
                }
            ];
            const { overwrite } = yield inquirer_1.default.prompt(overwriting);
            if (overwrite) {
                fs_extra_1.default.removeSync(file);
                overwriteContents.push(file);
            }
        }
        return overwriteContents;
    });
}
function copyTempIntoDestination(tmpDir, destination, options) {
    return __awaiter(this, void 0, void 0, function* () {
        fs_extra_1.default.ensureDirSync(destination);
        const { force, logger } = options;
        const boxContents = fs_extra_1.default.readdirSync(tmpDir);
        const destinationContents = fs_extra_1.default.readdirSync(destination);
        const newContents = boxContents.filter(filename => !destinationContents.includes(filename));
        const contentCollisions = boxContents.filter(filename => destinationContents.includes(filename));
        let shouldCopy;
        if (force) {
            shouldCopy = boxContents;
        }
        else {
            const overwriteContents = yield promptOverwrites(contentCollisions, logger);
            shouldCopy = [...newContents, ...overwriteContents];
        }
        for (const file of shouldCopy) {
            fs_extra_1.default.copySync(`${tmpDir}/${file}`, `${destination}/${file}`);
        }
    });
}
function installBoxDependencies({ hooks }, destination) {
    const postUnpack = hooks["post-unpack"];
    if (postUnpack.length === 0)
        return;
    child_process_1.execSync(postUnpack, { cwd: destination });
}
module.exports = {
    copyTempIntoDestination,
    fetchRepository,
    installBoxDependencies,
    prepareToCopyFiles,
    verifySourcePath,
    verifyVCSURL
};
//# sourceMappingURL=unbox.js.map

/***/ }),

/***/ 239583:
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 239583;
module.exports = webpackEmptyContext;

/***/ }),

/***/ 921077:
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 921077;
module.exports = webpackEmptyContext;

/***/ }),

/***/ 457372:
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 457372;
module.exports = webpackEmptyContext;

/***/ }),

/***/ 826503:
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 826503;
module.exports = webpackEmptyContext;

/***/ }),

/***/ 495183:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Plugin = void 0;
const TruffleError = __webpack_require__(637113);
const originalRequire = __webpack_require__(588277);
const path_1 = __importDefault(__webpack_require__(385622));
class Plugin {
    constructor({ module, definition }) {
        this.module = module;
        this.definition = definition;
    }
    /*
     * `truffle run` support
     */
    get commands() {
        return Object.keys(this.definition.commands || {});
    }
    definesCommand(commandName) {
        return this.commands.includes(commandName);
    }
    loadCommand(commandName) {
        const commandLocalPath = this.definition.commands && this.definition.commands[commandName];
        if (!commandLocalPath) {
            throw new TruffleError(`Plugin ${this.module} does not define command ${commandName}`);
        }
        return this.loadModule(commandLocalPath);
    }
    /*
     * `truffle preserve` support
     */
    get tag() {
        return this.definition.tag;
    }
    definesRecipe() {
        return !!(this.definition.preserve && this.definition.preserve.recipe);
    }
    loadRecipe() {
        if (!this.definesRecipe()) {
            throw new TruffleError(`Plugin ${this.module} does not define a \`truffle preserve\` recipe.`);
        }
        return this.loadModule(this.definition.preserve.recipe).Recipe;
    }
    loadModule(localPath) {
        if (path_1.default.isAbsolute(localPath)) {
            throw new TruffleError(`\nError: Absolute paths not allowed!\nPlease ensure truffle-plugin.json only references paths relative to the plugin root.\n`);
        }
        const pluginPath = originalRequire.resolve(this.module);
        const modulePath = path_1.default.resolve(path_1.default.dirname(pluginPath), localPath);
        return originalRequire(modulePath);
    }
}
exports.Plugin = Plugin;
//# sourceMappingURL=Plugin.js.map

/***/ }),

/***/ 108097:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Plugins = void 0;
const TruffleError = __webpack_require__(637113);
const originalRequire = __webpack_require__(588277);
const path_1 = __importDefault(__webpack_require__(385622));
const Plugin_1 = __webpack_require__(495183);
const utils_1 = __webpack_require__(436025);
class Plugins {
    /**
     * Given a truffle-config-like, find and return all configured plugins
     */
    static listAll(config) {
        const plugins = Plugins.checkPluginModules(config);
        const definitions = Plugins.loadPluginDefinitions(plugins);
        return Object.entries(definitions).map(([module, definition]) => new Plugin_1.Plugin({ module, definition }));
    }
    /**
     * Given a truffle-config-like and command, find and return all plugins that define the command
     */
    static findPluginsForCommand(config, command) {
        const allPlugins = Plugins.listAll(config);
        const pluginsForCommand = allPlugins.filter(plugin => plugin.definesCommand(command));
        return pluginsForCommand;
    }
    /**
     * Given a truffle-config-like, find and return all plugins that define any command
     */
    static listAllCommandPlugins(config) {
        const allPlugins = Plugins.listAll(config);
        const pluginsWithCommands = allPlugins.filter(plugin => plugin.commands.length > 0);
        return pluginsWithCommands;
    }
    /**
     * Given a truffle-config-like, find and return all plugins that define a recipe
     */
    static listAllRecipes(config) {
        const allPlugins = Plugins.listAll(config);
        const recipes = allPlugins.filter(plugin => plugin.definesRecipe());
        return recipes;
    }
    /*
     * internals
     */
    static checkPluginModules(config) {
        originalRequire("app-module-path").addPath(path_1.default.resolve(config.working_directory, "node_modules"));
        const plugins = utils_1.normalizeConfigPlugins(config.plugins || []);
        return plugins;
    }
    static loadPluginDefinitions(plugins) {
        let pluginConfigs = {};
        for (const { module, tag } of plugins) {
            try {
                const required = originalRequire(`${module}/truffle-plugin.json`);
                const defaultTag = required.preserve && required.preserve.tag;
                required.tag = tag || defaultTag || undefined;
                pluginConfigs[module] = required;
            }
            catch (_) {
                throw new TruffleError(`\nError: truffle-plugin.json not found in the ${module} plugin package!\n`);
            }
        }
        return pluginConfigs;
    }
}
exports.Plugins = Plugins;
//# sourceMappingURL=Plugins.js.map

/***/ }),

/***/ 342113:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(849094), exports);
__exportStar(__webpack_require__(495183), exports);
__exportStar(__webpack_require__(108097), exports);
__exportStar(__webpack_require__(436025), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 849094:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 436025:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.normalizeConfigPlugins = exports.resolves = void 0;
const TruffleError = __webpack_require__(637113);
const originalRequire = __webpack_require__(588277);
/**
 * Returns true or false based on whether or not a particular plugin
 * resolves successfully
 */
const resolves = (module) => {
    try {
        originalRequire.resolve(module);
        return true;
    }
    catch (_) {
        return false;
    }
};
exports.resolves = resolves;
/**
 * Takes a list of raw plugin configurations and returns a list of normalized
 * internal representations
 */
const normalizeConfigPlugins = (plugins) => {
    const map = new Map([]);
    const normalized = plugins.map((plugin) => typeof plugin === "string" ? { module: plugin } : plugin);
    for (const plugin of normalized) {
        // fatal error if we can't load a plugin listed in truffle-config.js
        if (!exports.resolves(plugin.module)) {
            throw new TruffleError(`\nError: ${plugin.module} listed as a plugin, but not found in global or local node modules!\n`);
        }
        map.set(plugin.module, plugin);
    }
    return [...map.values()];
};
exports.normalizeConfigPlugins = normalizeConfigPlugins;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 296606:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConsoleReporter = void 0;
const chalk_1 = __importDefault(__webpack_require__(732589));
const spinnies_1 = __importDefault(__webpack_require__(186891));
const Control = __importStar(__webpack_require__(962523));
class ConsoleReporter {
    constructor(options) {
        this.spinners = new spinnies_1.default();
        this.console = options.console;
    }
    report(events) {
        var events_1, events_1_1;
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (events_1 = __asyncValues(events); events_1_1 = yield events_1.next(), !events_1_1.done;) {
                    const event = events_1_1.value;
                    this[event.type].bind(this)(event);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (events_1_1 && !events_1_1.done && (_a = events_1.return)) yield _a.call(events_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    /*
     * Error events
     */
    fail(event) {
        const { error } = event;
        const { key } = eventProperties(event);
        // get current text
        const { text, indent } = this.spinners.pick(key);
        const errorMessage = error.message ? `Error: ${error.message}` : error.toString();
        const options = error
            ? {
                text: `${text}\n${" ".repeat(indent)}${chalk_1.default.red(errorMessage)}`
            }
            : {};
        this.spinners.fail(key, options);
    }
    abort(event) {
        const { key } = eventProperties(event);
        this.spinners.fail(key);
    }
    stop(event) {
        const { key } = eventProperties(event);
        this.spinners.remove(key);
    }
    /*
     * Step events
     */
    begin(event) {
        this.console.log();
        const { key, indent } = eventProperties(event);
        this.spinners.add(key, {
            succeedColor: "white",
            failColor: "white",
            indent: indent
        });
    }
    succeed(event) {
        const { message } = event;
        const { key } = eventProperties(event);
        const options = message ? { text: message } : {};
        this.spinners.succeed(key, options);
    }
    step(event) {
        const { key, indent } = eventProperties(event);
        const { message } = event;
        this.spinners.add(key, {
            text: message,
            indent,
            succeedColor: "white",
            failColor: "white"
        });
    }
    /*
     * Value resolution events
     */
    declare(event) {
        const { key, indent } = eventProperties(event);
        const { message } = event;
        this.spinners.add(key, {
            text: chalk_1.default.cyan(message),
            indent,
            succeedColor: "white",
            failColor: "white"
        });
    }
    resolve(event) {
        const { payload } = event;
        const { key } = eventProperties(event);
        const { text } = this.spinners.pick(key);
        const [name] = text.split(":");
        const options = payload ? { text: `${name}: ${payload}` } : { text };
        this.spinners.update(key, Object.assign(Object.assign({}, options), { status: "stopped" }));
    }
    update(event) {
        const { payload, message } = event;
        const { key } = eventProperties(event);
        const { text } = this.spinners.pick(key);
        if (!payload && !message)
            return;
        const [name] = text.split(":");
        // Update the value resolution with a payload or the step with message
        const options = message
            ? { text: message }
            : { text: `${name}: ${payload}` };
        this.spinners.update(key, options);
    }
}
exports.ConsoleReporter = ConsoleReporter;
const eventProperties = (event) => ({
    key: Control.Scopes.toKey(event.scope),
    indent: event.scope.length * 2
});
//# sourceMappingURL=ConsoleReporter.js.map

/***/ }),

/***/ 955830:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.run = exports.control = void 0;
const controllers_1 = __webpack_require__(642914);
const types_1 = __webpack_require__(176816);
function control(controlOptions, methodOptions) {
    return __asyncGenerator(this, arguments, function* control_1() {
        const { name, method } = controlOptions;
        const scope = [name || ""];
        const controller = new controllers_1.StepsController({ scope });
        const controls = {
            update: controller.update,
            declare: controller.declare,
            step: controller.step
        };
        yield __await(yield* __asyncDelegator(__asyncValues(controller.begin())));
        try {
            const completeMethodOptions = Object.assign(Object.assign({}, methodOptions), { controls });
            const result = yield __await(yield* __asyncDelegator(__asyncValues(method(completeMethodOptions))));
            yield __await(yield* __asyncDelegator(__asyncValues(controller.succeed({ result }))));
            // check for error state (in case of cascaded failures)
            if (controller.state !== types_1.State.Done) {
                return yield __await(void 0);
            }
            return yield __await(result);
        }
        catch (error) {
            yield __await(yield* __asyncDelegator(__asyncValues(controller.fail({ error }))));
            return yield __await(void 0);
        }
    });
}
exports.control = control;
const run = (controlOptions, methodOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const generator = control(controlOptions, methodOptions);
    while (true) {
        const { done, value } = yield generator.next();
        if (done) {
            return value;
        }
    }
});
exports.run = run;
//# sourceMappingURL=control.js.map

/***/ }),

/***/ 580354:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseController = void 0;
const types_1 = __webpack_require__(176816);
class BaseController {
    constructor(options) {
        const { scope, state } = options;
        this.scope = scope;
        this._state = state !== null && state !== void 0 ? state : types_1.State.Pending;
    }
    get state() {
        return this._state;
    }
    emit(event) {
        return Object.assign(Object.assign({}, Object.entries(event)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => ({ [key]: value }))
            .reduce((a, b) => (Object.assign(Object.assign({}, a), b)))), { scope: this.scope });
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map

/***/ }),

/***/ 255601:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ErrorController = void 0;
const types_1 = __webpack_require__(176816);
const BaseController_1 = __webpack_require__(580354);
const decorators_1 = __webpack_require__(708225);
class ErrorController extends BaseController_1.BaseController {
    constructor(options) {
        const { parent } = options, superOptions = __rest(options, ["parent"]);
        super(superOptions);
        this.children = [];
        if (parent) {
            this.parent = parent;
        }
        // so we can pass these around as functions
        this.fail = this.fail.bind(this);
        this.abort = this.abort.bind(this);
        this.stop = this.stop.bind(this);
    }
    fail({ error, cascade = true } = {}) {
        return __asyncGenerator(this, arguments, function* fail_1() {
            // stop all children
            for (const child of this.children) {
                yield __await(yield* __asyncDelegator(__asyncValues(child.stop())));
            }
            yield yield __await(this.emit({
                type: "fail",
                error
            }));
            this._state = types_1.State.Error;
            // propagate to parent
            if (this.parent && cascade) {
                yield __await(yield* __asyncDelegator(__asyncValues(this.parent.abort({ cascade }))));
            }
        });
    }
    abort({ cascade = true } = {}) {
        return __asyncGenerator(this, arguments, function* abort_1() {
            // stop all children
            for (const child of this.children) {
                yield __await(yield* __asyncDelegator(__asyncValues(child.stop())));
            }
            yield yield __await(this.emit({
                type: "abort"
            }));
            this._state = types_1.State.Error;
            // propagate to parent
            if (this.parent && cascade) {
                yield __await(yield* __asyncDelegator(__asyncValues(this.parent.abort({ cascade }))));
            }
        });
    }
    stop({} = {}) {
        return __asyncGenerator(this, arguments, function* stop_1() {
            // stop all children
            for (const child of this.children) {
                yield __await(yield* __asyncDelegator(__asyncValues(child.stop())));
            }
            yield yield __await(this.emit({
                type: "stop"
            }));
        });
    }
}
__decorate([
    decorators_1.validStates([types_1.State.Active])
], ErrorController.prototype, "fail", null);
__decorate([
    decorators_1.validStates([types_1.State.Active])
], ErrorController.prototype, "abort", null);
__decorate([
    decorators_1.validStates([types_1.State.Active]),
    decorators_1.transitionToState(types_1.State.Error)
], ErrorController.prototype, "stop", null);
exports.ErrorController = ErrorController;
//# sourceMappingURL=ErrorController.js.map

/***/ }),

/***/ 868791:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StepsController = void 0;
const ErrorController_1 = __webpack_require__(255601);
const ValueResolutionController_1 = __webpack_require__(79313);
const types_1 = __webpack_require__(176816);
const decorators_1 = __webpack_require__(708225);
class StepsController extends ErrorController_1.ErrorController {
    constructor(options) {
        const superOptions = __rest(options, []);
        super(superOptions);
        // so we can pass these around as functions
        this.begin = this.begin.bind(this);
        this.succeed = this.succeed.bind(this);
        this.update = this.update.bind(this);
        this.declare = this.declare.bind(this);
        this.step = this.step.bind(this);
    }
    begin() {
        return __asyncGenerator(this, arguments, function* begin_1() {
            yield yield __await(this.emit({
                type: "begin"
            }));
        });
    }
    succeed({ result, message } = {}) {
        return __asyncGenerator(this, arguments, function* succeed_1() {
            yield yield __await(this.emit({
                type: "succeed",
                result,
                message
            }));
        });
    }
    update({ message }) {
        return __asyncGenerator(this, arguments, function* update_1() {
            yield yield __await(this.emit({
                type: "update",
                message
            }));
        });
    }
    declare({ identifier, message }) {
        return __asyncGenerator(this, arguments, function* declare_1() {
            const parent = this;
            const child = new ValueResolutionController_1.ValueResolutionController({
                scope: [...this.scope, identifier],
                parent,
                state: types_1.State.Active
            });
            this.children.push(child);
            yield yield __await(child.emit({
                type: "declare",
                message: message || identifier
            }));
            return yield __await(child);
        });
    }
    step({ identifier, message }) {
        return __asyncGenerator(this, arguments, function* step_1() {
            const parent = this;
            const child = new StepsController({
                scope: [...this.scope, identifier || message],
                parent,
                state: types_1.State.Active
            });
            this.children.push(child);
            yield yield __await(child.emit({
                type: "step",
                message: message || identifier
            }));
            return yield __await(child);
        });
    }
}
__decorate([
    decorators_1.validStates([types_1.State.Pending]),
    decorators_1.transitionToState(types_1.State.Active)
], StepsController.prototype, "begin", null);
__decorate([
    decorators_1.validStates([types_1.State.Active]),
    decorators_1.transitionToState(types_1.State.Done)
], StepsController.prototype, "succeed", null);
__decorate([
    decorators_1.validStates([types_1.State.Active])
], StepsController.prototype, "update", null);
__decorate([
    decorators_1.validStates([types_1.State.Active])
], StepsController.prototype, "declare", null);
__decorate([
    decorators_1.validStates([types_1.State.Active])
], StepsController.prototype, "step", null);
exports.StepsController = StepsController;
//# sourceMappingURL=StepsController.js.map

/***/ }),

/***/ 79313:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValueResolutionController = void 0;
const types_1 = __webpack_require__(176816);
const decorators_1 = __webpack_require__(708225);
const ErrorController_1 = __webpack_require__(255601);
class ValueResolutionController extends ErrorController_1.ErrorController {
    constructor(options) {
        const superOptions = __rest(options, []);
        super(superOptions);
        // so we can pass these around as functions
        this.resolve = this.resolve.bind(this);
        this.extend = this.extend.bind(this);
    }
    update({ payload } = {}) {
        return __asyncGenerator(this, arguments, function* update_1() {
            yield yield __await(this.emit({
                type: "update",
                payload
            }));
        });
    }
    resolve({ resolution, payload } = {}) {
        return __asyncGenerator(this, arguments, function* resolve_1() {
            yield yield __await(this.emit({
                type: "resolve",
                resolution,
                payload
            }));
        });
    }
    extend({ identifier, message }) {
        return __asyncGenerator(this, arguments, function* extend_1() {
            const parent = this;
            const child = new ValueResolutionController({
                scope: [...this.scope, identifier],
                parent,
                state: types_1.State.Active
            });
            this.children.push(child);
            yield yield __await(child.emit({
                type: "declare",
                message: message || identifier
            }));
            return yield __await(child);
        });
    }
}
__decorate([
    decorators_1.validStates([types_1.State.Active])
], ValueResolutionController.prototype, "update", null);
__decorate([
    decorators_1.validStates([types_1.State.Active]),
    decorators_1.transitionToState(types_1.State.Done)
], ValueResolutionController.prototype, "resolve", null);
__decorate([
    decorators_1.validStates([types_1.State.Active])
], ValueResolutionController.prototype, "extend", null);
exports.ValueResolutionController = ValueResolutionController;
//# sourceMappingURL=ValueResolutionController.js.map

/***/ }),

/***/ 708225:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.transitionToState = exports.validStates = void 0;
const validStates = (states) => (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        return __asyncGenerator(this, arguments, function* () {
            if (!states.includes(this._state))
                return yield __await(void 0);
            const result = yield __await(yield* __asyncDelegator(__asyncValues(originalMethod.apply(this, args))));
            return yield __await(result);
        });
    };
    return descriptor;
};
exports.validStates = validStates;
const transitionToState = (state) => (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        return __asyncGenerator(this, arguments, function* () {
            const result = yield __await(yield* __asyncDelegator(__asyncValues(originalMethod.apply(this, args))));
            this._state = state;
            return yield __await(result);
        });
    };
    return descriptor;
};
exports.transitionToState = transitionToState;
//# sourceMappingURL=decorators.js.map

/***/ }),

/***/ 642914:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValueResolution = exports.ValueResolutionController = exports.Steps = exports.StepsController = exports.Error = exports.ErrorController = exports.Base = exports.BaseController = void 0;
var BaseController_1 = __webpack_require__(580354);
Object.defineProperty(exports, "BaseController", ({ enumerable: true, get: function () { return BaseController_1.BaseController; } }));
const Base = __importStar(__webpack_require__(580354));
exports.Base = Base;
var ErrorController_1 = __webpack_require__(255601);
Object.defineProperty(exports, "ErrorController", ({ enumerable: true, get: function () { return ErrorController_1.ErrorController; } }));
const Error = __importStar(__webpack_require__(255601));
exports.Error = Error;
var StepsController_1 = __webpack_require__(868791);
Object.defineProperty(exports, "StepsController", ({ enumerable: true, get: function () { return StepsController_1.StepsController; } }));
const Steps = __importStar(__webpack_require__(868791));
exports.Steps = Steps;
var ValueResolutionController_1 = __webpack_require__(79313);
Object.defineProperty(exports, "ValueResolutionController", ({ enumerable: true, get: function () { return ValueResolutionController_1.ValueResolutionController; } }));
const ValueResolution = __importStar(__webpack_require__(79313));
exports.ValueResolution = ValueResolution;
__exportStar(__webpack_require__(708225), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 531719:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=events.js.map

/***/ }),

/***/ 962523:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Controllers = exports.ValueResolutionController = exports.StepsController = exports.ErrorController = exports.BaseController = exports.Scopes = void 0;
__exportStar(__webpack_require__(955830), exports);
__exportStar(__webpack_require__(531719), exports);
__exportStar(__webpack_require__(176816), exports);
const Scopes = __importStar(__webpack_require__(693859));
exports.Scopes = Scopes;
var controllers_1 = __webpack_require__(642914);
Object.defineProperty(exports, "BaseController", ({ enumerable: true, get: function () { return controllers_1.BaseController; } }));
Object.defineProperty(exports, "ErrorController", ({ enumerable: true, get: function () { return controllers_1.ErrorController; } }));
Object.defineProperty(exports, "StepsController", ({ enumerable: true, get: function () { return controllers_1.StepsController; } }));
Object.defineProperty(exports, "ValueResolutionController", ({ enumerable: true, get: function () { return controllers_1.ValueResolutionController; } }));
const Controllers = __importStar(__webpack_require__(642914));
exports.Controllers = Controllers;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 693859:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fromKey = exports.toKey = void 0;
const separator = "␟"; // ASCII delimiter: unit separator
const toKey = (scope) => scope.join(separator);
exports.toKey = toKey;
const fromKey = (key) => key.split(separator);
exports.fromKey = fromKey;
//# sourceMappingURL=scopes.js.map

/***/ }),

/***/ 176816:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.State = void 0;
var State;
(function (State) {
    State["Pending"] = "pending";
    State["Active"] = "active";
    State["Done"] = "done";
    State["Error"] = "error";
})(State = exports.State || (exports.State = {}));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 63370:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * @module @truffle/preserve
 */ /** */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Targets = exports.Control = void 0;
__exportStar(__webpack_require__(296606), exports);
__exportStar(__webpack_require__(954238), exports);
const Control = __importStar(__webpack_require__(962523));
exports.Control = Control;
const Targets = __importStar(__webpack_require__(544542));
exports.Targets = Targets;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 954238:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.preserve = void 0;
const control_1 = __webpack_require__(962523);
const TruffleError = __webpack_require__(673321);
function preserve(options) {
    return __asyncGenerator(this, arguments, function* preserve_1() {
        const { request, recipes } = options;
        const { recipe } = request;
        if (!("settings" in request)) {
            request.settings = new Map([]);
        }
        if (!("inputs" in request)) {
            request.inputs = {};
        }
        const inputLabels = Object.keys(request.inputs);
        /*
         * planning
         * (use BFS)
         */
        const queue = [recipe];
        let plan = [];
        while (queue.length > 0) {
            const current = queue.shift();
            plan.unshift(current);
            for (const label of current.inputLabels) {
                const plugin = getRecipeForLabel(label, inputLabels, recipes);
                if (plugin)
                    queue.push(plugin);
            }
        }
        // Filter out duplicates afterwards so that we only keep the first occurrance of the plugin
        plan = plan.filter((plugin, index) => index === plan.findIndex(other => other.name === plugin.name));
        /*
         * execution
         */
        // Populate initial preserve inputs with provided inputs
        let inputs = Object.assign({}, request.inputs);
        for (const recipe of plan) {
            const settings = request.settings.get(recipe.name) || {};
            const { name } = recipe;
            const method = recipe.execute.bind(recipe);
            const results = yield __await(yield* __asyncDelegator(__asyncValues(control_1.control({ name, method }, { inputs, settings }))));
            // Add all result key + values to the inputs object for the next plugin
            for (const [key, value] of Object.entries(results || {})) {
                inputs[key] = value;
            }
        }
    });
}
exports.preserve = preserve;
const getRecipeForLabel = (label, inputLabels, plugins) => {
    // If the label exists in the initial inputLabels it is provided without recipe
    if (inputLabels.includes(label))
        return;
    const pluginsForLabel = plugins
        .filter(plugin => plugin.outputLabels.includes(label));
    if (pluginsForLabel.length === 0) {
        throw new TruffleError(`No plugins found that output the label "${label}".`);
    }
    if (pluginsForLabel.length > 1) {
        console.warn(`Warning: multiple plugins found that output the label "${label}".`);
    }
    const [plugin] = pluginsForLabel;
    return plugin;
};
//# sourceMappingURL=preserve.js.map

/***/ }),

/***/ 544542:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sources = void 0;
const Sources = __importStar(__webpack_require__(174515));
exports.Sources = Sources;
__exportStar(__webpack_require__(960702), exports);
__exportStar(__webpack_require__(654850), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 282321:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(97713), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 97713:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isAsyncIterable = exports.isIterable = exports.isBytes = exports.isString = void 0;
const isString = (content) => typeof content === "string";
exports.isString = isString;
const isBytes = (content) => Buffer.isBuffer(content) ||
    content instanceof ArrayBuffer ||
    ArrayBuffer.isView(content);
exports.isBytes = isBytes;
const isIterable = (content) => content && typeof content === "object" && Symbol.iterator in content;
exports.isIterable = isIterable;
const isAsyncIterable = (content) => content && typeof content === "object" && Symbol.asyncIterator in content;
exports.isAsyncIterable = isAsyncIterable;
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 174515:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Contents = void 0;
__exportStar(__webpack_require__(51469), exports);
const Contents = __importStar(__webpack_require__(282321));
exports.Contents = Contents;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 51469:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isContent = exports.isContainer = void 0;
const isContainer = (source) => source &&
    typeof source === "object" &&
    "entries" in source &&
    typeof source.entries === "object";
exports.isContainer = isContainer;
const isContent = (source) => !exports.isContainer(source);
exports.isContent = isContent;
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 960702:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 654850:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(211940), exports);
__exportStar(__webpack_require__(321005), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 211940:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.normalize = void 0;
const Common = __importStar(__webpack_require__(544542));
const normalize = (target) => {
    const source = normalizeSource(target.source);
    return { source };
};
exports.normalize = normalize;
const normalizeSource = (source) => {
    if (Common.Sources.isContainer(source)) {
        return normalizeContainer(source);
    }
    return normalizeContent(source);
};
const normalizeContainer = (container) => {
    const entries = normalizeEntries(container.entries);
    return { entries };
};
const normalizeEntries = function (entries) {
    return __asyncGenerator(this, arguments, function* () {
        var e_1, _a;
        try {
            for (var entries_1 = __asyncValues(entries), entries_1_1; entries_1_1 = yield __await(entries_1.next()), !entries_1_1.done;) {
                const entry = entries_1_1.value;
                yield yield __await(normalizeEntry(entry));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) yield __await(_a.call(entries_1));
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
};
const normalizeEntry = (entry) => {
    const { path } = entry;
    const source = normalizeSource(entry.source);
    return { path, source };
};
const normalizeContent = (content) => {
    if (Common.Sources.Contents.isString(content)) {
        return normalizeString(content);
    }
    if (Common.Sources.Contents.isBytes(content)) {
        return normalizeBytes(content);
    }
    if (Common.Sources.Contents.isIterable(content)) {
        return normalizeIterable(content);
    }
    if (Common.Sources.Contents.isAsyncIterable(content)) {
        return normalizeAsyncIterable(content);
    }
};
const normalizeString = (content) => {
    return (function () {
        return __asyncGenerator(this, arguments, function* () {
            yield yield __await(Buffer.from(content));
        });
    })();
};
const normalizeBytes = (content) => {
    return (function () {
        return __asyncGenerator(this, arguments, function* () {
            yield yield __await(Buffer.from(content));
        });
    })();
};
const normalizeIterable = (content) => {
    return (function () {
        return __asyncGenerator(this, arguments, function* () {
            for (const bytes of content) {
                yield yield __await(Buffer.from(bytes));
            }
        });
    })();
};
const normalizeAsyncIterable = (content) => {
    return (function () {
        return __asyncGenerator(this, arguments, function* () {
            var e_2, _a;
            try {
                for (var content_1 = __asyncValues(content), content_1_1; content_1_1 = yield __await(content_1.next()), !content_1_1.done;) {
                    const bytes = content_1_1.value;
                    yield yield __await(Buffer.from(bytes));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (content_1_1 && !content_1_1.done && (_a = content_1.return)) yield __await(_a.call(content_1));
                }
                finally { if (e_2) throw e_2.error; }
            }
        });
    })();
};
//# sourceMappingURL=normalize.js.map

/***/ }),

/***/ 321005:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringify = void 0;
const normalize_1 = __webpack_require__(211940);
const Common = __importStar(__webpack_require__(544542));
const stringify = (target) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedTarget = normalize_1.normalize(target);
    const source = yield stringifySource(normalizedTarget.source);
    return { source };
});
exports.stringify = stringify;
const stringifySource = (source) => __awaiter(void 0, void 0, void 0, function* () {
    if (Common.Sources.isContainer(source)) {
        return yield stringifyContainer(source);
    }
    return yield stringifyContent(source);
});
const stringifyContainer = (container) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const entries = [];
    try {
        for (var _b = __asyncValues(container.entries), _c; _c = yield _b.next(), !_c.done;) {
            const entry = _c.value;
            entries.push(yield stringifyEntry(entry));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return { entries };
});
const stringifyEntry = (entry) => __awaiter(void 0, void 0, void 0, function* () {
    const { path } = entry;
    const source = yield stringifySource(entry.source);
    return { path, source };
});
const stringifyContent = (content) => { var content_1, content_1_1; return __awaiter(void 0, void 0, void 0, function* () {
    var e_2, _a;
    const buffers = [];
    try {
        for (content_1 = __asyncValues(content); content_1_1 = yield content_1.next(), !content_1_1.done;) {
            const piece = content_1_1.value;
            buffers.push(piece);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (content_1_1 && !content_1_1.done && (_a = content_1.return)) yield _a.call(content_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return Buffer.concat(buffers).toString();
}); };
//# sourceMappingURL=stringify.js.map

/***/ })

};
;
//# sourceMappingURL=903.bundled.js.map