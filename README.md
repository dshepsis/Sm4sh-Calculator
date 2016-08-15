## Sm4sh Calculator
Web based Smash 4 knockback calculator

### Github Pages
http://rubendal.github.io/Sm4sh-Calculator/

## Calculator

### Recent Changes
* Added - Distance launched and improved gravity-knockback calculation
* Added - Launch speed
* Changed - Target DI angle change with DI angle calculation
* Added - Shield damage
* Added - Detect attacks with windboxes
* Fixed - Missing FAF in moves with multiple hitboxes
* Added - Detect unblockable moves
* Added - Parsed counters damage multipliers from KH API
* Added - [Luma knockback](https://twitter.com/LettuceUdon/status/755101541405556736)
* Added - DI angle change
* Added - Tooltips in most table values with explanations
* Added - Show Reeling animation chance when possible
* Added - Miis

### How to use it
Just input your data, the calculator will update the results when you change something

To access KuroganeHammer's API it is required to use webpage with http instead of https (unless you deactivate mixed content blocking on your web browser since the API doesn't support https) for attack list, some attacks might have missing data, these will show empty inputs since the API isn't complete or the website doesn't have them, also it could have wrong data so double check with the website

To fill move related data (Base damage, Angle, BKB, KBG) use [KuroganeHammer frame data repository](http://kuroganehammer.com/Smash4)

### What does it calculate
* Modifiers like Monado Arts and Deep Breathing
* Rage
* Aura
* Charged Smash attacks multiplier
* Countered damage
* Hitlag (Attacker and Target)
* Knockback modifiers
* Stale-move negation
* Sakurai Angle
* DI angle
* Knockback Horizontal and Vertical components
* Gravity included in the vertical component
* Hitstun
* Hitstun cancel frames (Not 100% accurate)
* Determine if the move can jab lock
* Shield stun
* Shield Hitlag
* Shield Advantage
* Luma knockback
* When Reeling/Untechable spin animation could happen
* Launch speed
* Max distance

### To Do
* Improve Hitstun cancel frames formula

## Move Search
http://rubendal.github.io/Sm4sh-Calculator/movesearch.html

Search for moves that match certain conditions using filters

Filter moves by:
* Name/Character/Type
* Hitbox startup frame
* Active hitbox frame
* FAF
* Base damage
* Angle
* BKB/WBKB
* KBG

### Name filter format
* Case insensitive
* `,` == or
* `&` == and
* `-` == not
* `"name"` == Move name is exactly the one between double quotes
* `character:name` == filter by character
* `type:movetype` == filter by type (jab, tilt, dashattack, smash, aerial, grab, throw, taunt, special, counter, commandgrab, unblockable, windbox, multihit, extrashielddamage, weightdependentthrow)


#### Examples
* ftilt & up (Ftilt AND up: all ftilts capable of being angled up)
* up,down & fsmash (up OR down AND fsmash: all fsmash angled up or down)
* rapid jab,-finisher (rapid jab NOT finisher: all rapid jabs without finisher hitbox)
* counter,-attack,-late,-hit,witch time,substitute,vision,toad (All counter moves counter frames)
* character:pit,character:dark pit,& type:smash (Pit and Dark Pit smash attacks)
* type:dashattack (All dash attacks)

### To Do
* Filter by landing lag and auto cancel frames

## Percentage Calculator
http://rubendal.github.io/Sm4sh-Calculator/percentcalc.html

Get target percent required to obtain certain knockback

* All knockback/damage modifiers are available (Rage, Aura, Monado, Deep Breathing, Crouch cancel, Charge Smash, Staleness)
* Search desired total KB or search with X or Y components
* Using X or Y components will calculate best and worst DI angles and percents needed to get inputted knockback with the hitstun difference
* WBKB isn't supported due to being weight related

### To Do
* Change application to calculate the minimum percentage needed to launch certain distance instead of knockback

## Launch Visualizer
http://rubendal.github.io/Sm4sh-Calculator/launchvisualizer.html

Note: Work in progress, stage layout collision detection might give weird results

Visualize launch trajectory, position per hitstun frame and distance launched in a graph and display stage layout with some collision detection

* Each marker represents each frame in hitstun
* Line color represents vertical momentum
* Yellow markers represents frames that hitstun can be cancelled by using an airdodge
* Green markers represents frames that hitstun can be cancelled by using an aerial
* Give target position when hit using x,y coordinates
* X-axis can be inverted to represent launching opponents to the left
* X-axis can represent a surface to show traction and bouncing effects
* Add legal stage layout with platforms and blast zones with physics (Collision, traction along surfaces, bounce off a surface angle calculation)

### To Do
* Add platform collision detection when falling

## Issues
You can [open an Issue here](https://github.com/rubendal/Sm4sh-Calculator-Web/issues) or DM me on [Twitter](https://twitter.com/Ruben_dal), all KH API related issues will be sent to [Frannsoft](https://github.com/Frannsoft/FrannHammer)

## Credits
* [@KuroganeHammer](https://twitter.com/KuroganeHammer) [frame data repository](http://kuroganehammer.com/Smash4)
* [FrannHammer (KuroganeHammer API)](https://github.com/Frannsoft/FrannHammer)
* [ssbwiki.com](http://www.ssbwiki.com)
