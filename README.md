# Smash 4 Combolyze
Web based Smash 4 combo calculator.

The base calculator (most of the work) is credited to, and used with the permission of [Ruben_dal](https://github.com/rubendal).

## How to use it
This tool is not yet functional. You cannot really use it.

## Planned Functionality:
* Take two moves, and a frame delay between them, and provide a graph showing whether that combo is true frame-data-wise. X-axis is attacker %, Y-axis is defender %.
* Given a move, search for followups, frame-traps, and 50/50s
* Eventually parameterize movement and jumps to provide more information on whether combos may be true beyond just comparing frame-data.

## To do:
* Remove `gravity2` from all attributes files. It is not used anywhere, and has no related functionality.
* The attributes files also contain air acceleration, but only the max additional value, not the base value.
* ~~Implement the following classes~~:
  * Fighter (Draft Complete)
  * ~~Attack~~ Action and Hitbox (Draft Complete)
  * ~~Attacker~~ Player (Draft Complete)
  * ~~Target~~ Player
  * ~~GameState~~ Game (Draft Complete)

## Things which depend on port priority:
Credit to Kurogane Hammer:
* "pacman hydrant ownership when hit at the same time"
* "grabbing the ledge at the same time iirc"
* "also footstools"
* "grabs and being KOd at the same time in sudden death?"


## Credits
* [@KuroganeHammer](https://twitter.com/KuroganeHammer) [frame data repository](http://kuroganehammer.com/Smash4)
* [FrannHammer (KuroganeHammer API)](https://github.com/Frannsoft/FrannHammer)
* [ssbwiki.com](http://www.ssbwiki.com)
* [Meshima's](https://twitter.com/Meshima_) [params spreadsheet](https://docs.google.com/spreadsheets/d/1FgOsGYfTD4nQo4jFGJ22nz5baU1xihT5lreNinY5nNQ/edit#gid=305485435) (and everyone contributing here)
* [Sammi Husky's](https://twitter.com/sammihusky) [Sm4sh Tools](https://github.com/Sammi-Husky/Sm4sh-Tools)
* [Ruben Dal's](https://github.com/rubendal) [Sm4sh-Calculator](https://github.com/rubendal/Sm4sh-Calculator)
