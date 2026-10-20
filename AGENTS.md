# AGENTS.md

- Plain JavaScript ES modules, no build step. Keep it that way unless the user asks.
- Extend Foundry's own classes and templates. Copy core behaviour only where core offers no hook, and say why in a comment.
- For Foundry API details, read the running version's source in the devkit container: `docker exec foundry-devkit cat /home/node/resources/app/<path>`.
- Run `npm test` with the devkit running before you finish. See `../../devkit/README.md`.
- When the module starts depending on another Foundry internal, add it to `docs/check-a-foundry-update.md`.
