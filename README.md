# Core of my typescript modules
Allows to write any TS scripts as modules of single app, includes:
- Logging system: printing infos, warns, errors, crashes to file and/or terminal with stack trace
- Task manager: synchronous executing of async functions with superseding by name
- `node:fs` additional functions in `Core.fs`: getting data of files without ENOENT exception (when folder is not exists)
- Terminal commands: handling third argument at running app by modules, can be used for example for setting some options like discord bot token
- Data saving in `.json`

## How to compile?
1. Install [git-scm](https://git-scm.com)
2. Install [node.js](https://nodejs.org)
3. Open terminal in any folder and run commands:
```
git clone https://github.com/TheLeerName/ts-module-core
cd ts-module-core
npm i --allow-git=all
```
4. Choose modules which you want to use:

|Module|Description|Dependencies|
|---|---|---|
|[ts-module-discord](https://github.com/TheLeerName/ts-module-discord)|Contains methods to use Discord bot API|*None*|
|[ts-module-discord-guest-text-channel](https://github.com/TheLeerName/ts-module-discord-guest-text-channel)|Adds discord text channel, which opens only for voice members|[ts-module-discord](https://github.com/TheLeerName/ts-module-discord)|
|[ts-module-discord-rooms](https://github.com/TheLeerName/ts-module-discord-rooms)|Adds discord private rooms as voice channels, which can be created by joining specified voice channel. Also it can be customized by their owner (editing channel options)|[ts-module-discord](https://github.com/TheLeerName/ts-module-discord)|
|[ts-module-discord-verification-reaction](https://github.com/TheLeerName/ts-module-discord-verification-reaction)|Adds specified role to any user reacted to specified discord message|[ts-module-discord](https://github.com/TheLeerName/ts-module-discord)|
|[ts-module-twitch](https://github.com/TheLeerName/ts-module-twitch)|Contains methods to use Twitch API|*None*|
|[ts-module-twitch-in-discord-commands](https://github.com/TheLeerName/ts-module-twitch-in-discord-commands)|Adds discord slash commands which uses Twitch API (for now only sending info of specified twitch channel)|[ts-module-discord](https://github.com/TheLeerName/ts-module-discord), [ts-module-twitch](https://github.com/TheLeerName/ts-module-twitch)|
|[ts-module-twitch-notifications](https://github.com/TheLeerName/ts-module-twitch-notifications)|Adds twitch channel stream notifications as messages in discord channel|[ts-module-discord](https://github.com/TheLeerName/ts-module-discord), [ts-module-twitch](https://github.com/TheLeerName/ts-module-twitch)|

1. Add git submodule for each selected by you module with command:
```
git submodule update --init src/modules/<name>
```
1. Compile with command `npm run build`
2. Run the app:
- Linux -> run in terminal `sh loop.sh`
- Windows -> open file `loop.bat`

## How to run this on host machine?
> [!TIP]
> It also can be hosted on your Android phone! (make sure you will have phone and connection to internet on it working 24/7)
1. Compile scripts where it possible
2. Send files/folders to host machine:
- `dist`
- `data` (if you already have it created)
- `package.json`
- `index.js`
- `loop.bat` (if host machine on Windows) / `loop.sh` (if host machine on Linux)
3. Do command `npm i --omit=dev --allow-git=all --no-bin-links` to download only production packages
4. Run the app, you already know how

## TODO
- add translations, cuz bot answers only in russian language
- insert LeerTwitchChatBot to db-module-core as module with name: twitch-chat-bot
- module twitch-chat-bot: command `!uid` - sends uid of streamer gacha account (genshin, hsr) of current category, `!setuid <uid>` - sets uid to current category
- module twitch-chat-bot: command `!rank` - works exactly like `!uid` but for valorant
- module twitch-chat-bot: command `!poll` - starts poll by arguments if just write !poll bot will send arguments needed
- module telegram: post message with socials on each post comments in channel
- loading node.js package dependencies from modules (for now they must be specified in `package.json` in core)

> [!IMPORTANT]
> ⢰⣶⣶⣦⣝⢝⢕⢕⠅⡆⢕⢕⢕⢕⢕⣴⠏⣠⡶⠛⡉⡉⡛⢶⣦⡀⠐⣕\
> ⡄⢻⢟⣿⣿⣷⣕⣕⣅⣿⣔⣕⣵⣵⣿⣿⢠⣿⢠⣮⡈⣌⠨⠅⠹⣷⡀⢱\
> ⡵⠟⠈⢀⣀⣀⡀⠉⢿⣿⣿⣿⣿⣿⣿⣿⣼⣿⢈⡋⠴⢿⡟⣡⡇⣿⡇⡀\
> ⠁⣠⣾⠟⡉⡉⡉⠻⣦⣻⣿⣿⣿⣿⣿⣿⣿⣿⣧⠸⣿⣦⣥⣿⡇⡿⣰⢗\
> ⢰⣿⡏⣴⣌⠈⣌⠡⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣬⣉⣉⣁⣄⢖⢕⢕\
> ⢻⣿⡇⢙⠁⠴⢿⡟⣡⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣵⣵\
> ⣄⣻⣿⣌⠘⢿⣷⣥⣿⠇⣿⣿⣿⣿⣿⣿⠛⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\
> ⢄⠻⣿⣟⠿⠦⠍⠉⣡⣾⣿⣿⣿⣿⣿⣿⢸⣿⣦⠙⣿⣿⣿⣿⣿⣿⣿⣿\
> ⡑⣑⣈⣻⢗⢟⢞⢝⣻⣿⣿⣿⣿⣿⣿⣿⠸⣿⠿⠃⣿⣿⣿⣿⣿⣿⡿⠁\
> ⡵⡈⢟⢕⢕⢕⢕⣵⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣿⣿⣿⣿⣿⠿⠋⣀⣈\
> ⡵⡕⡀⠑⠳⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⢉⡠⡲⡫⡪⡪