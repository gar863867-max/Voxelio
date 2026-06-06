const games = [
    { name: 'Space Shooter', url: 'game/index.html' }, {
        name: 'Pizza Tower',
        url: 'https://truffled.lol/gamefile/Pizza%20Tower.html'
    }, {
        name: 'Fallout',
        url: 'https://truffled.lol/gamefile/falloutt.html'
    }, {
        name: 'Slow Roads',
        url: 'https://truffled.lol/games/slowroads/index.html'
    }, {
        name: 'Sonic Mania',
        url: 'https://truffled.lol/extra/main/index.html'
    }, {
        name: 'Sonic CD',
        url: 'https://truffled.lol/games/soniccd/soniccd.html'
    }, {
        name: 'Sonic 3',
        url: 'https://truffled.lol/games/sonic3/index.html'
    }, {
        name: 'Sonic 2',
        url: 'https://truffled.lol/games/sonic2/index.html'
    }, {
        name: 'Sonic 1',
        url: 'https://truffled.lol/games/sonic/index.html'
    }, {
        name: 'Dadish 3D',
        url: 'https://truffled.lol/gamefile/dadish3d.html'
    }, {
        name: 'Dadish 3',
        url: 'https://truffled.lol/gamefile/dadish3.html'
    }, {
        name: 'Dadish 2',
        url: 'https://truffled.lol/gamefile/dadish2.html'
    }, {
        name: 'Dadish',
        url: 'https://truffled.lol/gamefile/dadish.html'
    }, {
        name: 'Doom 2',
        url: 'https://truffled.lol/gamefile/doom2.html'
    }, {
        name: 'Cluster Truck',
        url: 'https://truffled.lol/games/cluster/index.html'
    }, {
        name: 'REPO',
        url: 'https://truffled.lol/games/repo/index.html'
    }, {
        name: 'Club Penguin',
        url: 'https://play.cplegacy.com/'
    }, {
        name: 'MPS Baby',
        url: 'https://ghgames.netlify.app/games/MPS_BABY.html'
    }, {
        name: 'MPS Sanic',
        url: 'https://ghgames.netlify.app/games/MPS_SANIC.html'
    }, {
        name: 'MPS Admin',
        url: 'https://ghgames.netlify.app/games/MPS_ADMIN.html'
    }, {
        name: 'Mind Invasion',
        url: 'https://ghgames.netlify.app/games/Mind-Invasion.html'
    }, {
        name: 'Coin Clicker',
        url: 'https://ghgames.netlify.app/games/CoinClicker.html'
    }, {
        name: 'The Architect',
        url: 'https://ghgames.netlify.app/games/The_Architect.html'
    }, {
        name: 'Retro Bowl',
        url: 'https://ghgames.netlify.app/games/Retro.html'
    }, {
        name: 'Tiny Fishing',
        url: 'https://ghgames.netlify.app/games(blckt)/annoyingfishgame.html'
    }, {
        name: 'Arena',
        url: 'https://ghgames.netlify.app/games(blckt)/arena.html'
    }, {
        name: 'Bad Time Sim',
        url: 'https://ghgames.netlify.app/games(blckt)/badtimesim.html'
    }, {
        name: "Baldi's Basics",
        url: 'https://ghgames.netlify.app/games(blckt)/bald.html'
    }, {
        name: 'Bank Robbery 2',
        url: 'https://ghgames.netlify.app/games(blckt)/bankrobbery2.html'
    }, {
        name: 'Basket Catch',
        url: 'https://ghgames.netlify.app/games/Basket-catch-brython.html'
    }, {
        name: 'Bitlife',
        url: 'https://ghgames.netlify.app/games(blckt)/bitlife.html'
    }, {
        name: 'Celeste',
        url: 'https://ghgames.netlify.app/games(blckt)/celeste.html'
    }, {
        name: 'Chess AI',
        url: 'https://ghgames.netlify.app/games/ChessAI.html'
    }, {
        name: 'Click the Box',
        url: 'https://ghgames.netlify.app/games/clickthebox.html'
    }, {
        name: 'Cluster Rush',
        url: 'https://ghgames.netlify.app/games(blckt)/clusterrush.html'
    }, {
        name: 'Cookie Clicker (Local)',
        url: 'https://ghgames.netlify.app/games(blckt)/cookie.html'
    }, {
        name: 'Observe a Cube',
        url: 'https://ghgames.netlify.app/games(blckt)/coolbeans.html'
    }, {
        name: 'Crossy Roads',
        url: 'https://ghgames.netlify.app/games(blckt)/crossyroad.html'
    }, {
        name: 'CSGO Clicker (Local)',
        url: 'https://ghgames.netlify.app/games(blckt)/csgoclicker.html'
    }, {
        name: 'Dead Rails',
        url: 'https://ghgames.netlify.app/games(blckt)/deadrails.html'
    }, {
        name: 'Death Run 3D',
        url: 'https://ghgames.netlify.app/games(blckt)/deathrun3d.html'
    }, {
        name: 'Drift Hunters',
        url: 'https://ghgames.netlify.app/games(blckt)/drift.html'
    }, {
        name: 'Microsoft Edge Surf',
        url: 'https://ghgames.netlify.app/games(blckt)/edgesurf.html'
    }, {
        name: 'Fancy Pants Adventure',
        url: 'https://ghgames.netlify.app/games(blckt)/fancyp.html'
    }, {
        name: 'Fifa 2007',
        url: 'https://ghgames.netlify.app/games(blckt)/fifa2007.html'
    }, {
        name: 'FNAF Shooter',
        url: 'https://ghgames.netlify.app/games(blckt)/fnafshooter.html'
    }, {
        name: 'Fruit Ninja (Local)',
        url: 'https://ghgames.netlify.app/games(blckt)/fruit.html'
    }, {
        name: 'Funny Shooter (Local)',
        url: 'https://ghgames.netlify.app/games(blckt)/funnyshooter.html'
    }, {
        name: 'Gacha Life',
        url: 'https://ghgames.netlify.app/games(blckt)/gachalife.html'
    }, {
        name: 'Geometry Dash',
        url: 'https://ghgames.netlify.app/games(blckt)/geodash.html'
    }, {
        name: 'Geometry Dash Subzero',
        url: 'https://ghgames.netlify.app/games(blckt)/geodashsubzero.html'
    }, {
        name: 'Granny',
        url: 'https://selenite.cc/resources/semag/granny/index.html'
    }, {
        name: 'Granny 2',
        url: 'https://selenite.cc/resources/semag/granny2/index.html'
    }, {
        name: 'Secrets of Hallowland',
        url: 'https://ghgames.netlify.app/games(blckt)/hallow.html'
    }, {
        name: 'Line Rider',
        url: 'https://ghgames.netlify.app/games(blckt)/linerider.html'
    }, {
        name: 'Mario Combat',
        url: 'https://ghgames.netlify.app/games(blckt)/marioboom.html'
    }, {
        name: 'Mario Kart 64',
        url: 'https://ghgames.netlify.app/games(blckt)/mariokart.html'
    }, {
        name: 'Minecraft 1.5.2 (Local)',
        url: 'https://ghgames.netlify.app/games(blckt)/mc.html'
    }, {
        name: 'Minecraft 1.8',
        url: 'https://ghgames.netlify.app/games/Minecraft.html'
    }, {
        name: 'Minecraft 1.12',
        url: 'https://ghgames.netlify.app/games/1-2.html'
    }, {
        name: 'Minecraft Classic',
        url: 'https://ghgames.netlify.app/games(blckt)/mc2.html'
    }, {
        name: 'Metroid Fusion',
        url: 'https://ghgames.netlify.app/games(blckt)/metro.html'
    }, {
        name: 'Mii Creator',
        url: 'https://ghgames.netlify.app/games(blckt)/miicreator.html'
    }, {
        name: 'Money Rush',
        url: 'https://ghgames.netlify.app/games(blckt)/moneytalkss.html'
    }, {
        name: 'Moto X3M (Local)',
        url: 'https://ghgames.netlify.app/games(blckt)/motorx3m.html'
    }, {
        name: 'Only Up',
        url: 'https://ghgames.netlify.app/games(blckt)/onlyup.html'
    }, {
        name: 'OvO',
        url: 'https://ghgames.netlify.app/games(blckt)/ovo.html'
    }, {
        name: 'Crazy Cattle 3D',
        url: 'https://ghgames.netlify.app/games(blckt)/peakgame.html'
    }, {
        name: 'Pokemon Unbound',
        url: 'https://ghgames.netlify.app/games(blckt)/pokebound.html'
    }, {
        name: 'Pokemon Fire Red',
        url: 'https://ghgames.netlify.app/games(blckt)/pokefirered.html'
    }, {
        name: 'Pokemon Leaf Green',
        url: 'https://ghgames.netlify.app/games(blckt)/pokegreen.html'
    }, {
        name: 'Pokemon Emerald',
        url: 'https://ghgames.netlify.app/games(blckt)/pokemerald.html'
    }, {
        name: 'Pokemon Rouge',
        url: 'https://ghgames.netlify.app/games(blckt)/pokerogue.html'
    }, {
        name: 'Pokemon Stadium',
        url: 'https://ghgames.netlify.app/games(blckt)/pokestadium.html'
    }, {
        name: 'President Simulator',
        url: 'https://ghgames.netlify.app/games(blckt)/pressim.html'
    }, {
        name: 'Riddle School',
        url: 'https://ghgames.netlify.app/games(blckt)/riddle1.html'
    }, {
        name: 'Riddle School 2',
        url: 'https://ghgames.netlify.app/games(blckt)/riddle2.html'
    }, {
        name: 'Roblox',
        url: 'https://ghgames.netlify.app/games(blckt)/roblox.html'
    }, {
        name: 'Rooftop Snipers 2',
        url: 'https://ghgames.netlify.app/games(blckt)/roof2.html'
    }, {
        name: 'Ships 3D',
        url: 'https://ghgames.netlify.app/games/Ships3d.html'
    }, {
        name: 'Slice Masters',
        url: 'https://ghgames.netlify.app/games/slice-masters.html'
    }, {
        name: 'Slope',
        url: 'https://ghgames.netlify.app/games/slope.html'
    }, {
        name: 'Slope 2',
        url: 'https://ghgames.netlify.app/games(blckt)/slope2.html'
    }, {
        name: 'Super Mario Bros 3',
        url: 'https://ghgames.netlify.app/games(blckt)/smb3.html'
    }, {
        name: 'Super Mario Construct',
        url: 'https://ghgames.netlify.app/games(blckt)/smc.html'
    }, {
        name: 'Soccer Random',
        url: 'https://ghgames.netlify.app/games(blckt)/soccer.html'
    }, {
        name: 'Subway Surfers',
        url: 'https://ghgames.netlify.app/games(blckt)/subway.html'
    }, {
        name: 'Super Smash Bros 64',
        url: 'https://ghgames.netlify.app/games(blckt)/supersmash.html'
    }, {
        name: 'Tap Goal',
        url: 'https://ghgames.netlify.app/games(blckt)/taptap.html'
    }, {
        name: 'Vex 7',
        url: 'https://ghgames.netlify.app/games(blckt)/vex7.html'
    }, {
        name: 'Volley Random',
        url: 'https://ghgames.netlify.app/games(blckt)/volley.html'
    }, {
        name: 'Soccer Skills World Cup',
        url: 'https://ghgames.netlify.app/games(blckt)/world.html'
    }, {
        name: 'Memory Game',
        url: 'https://ghgames.netlify.app/games/ShortTermMemory.html'
    }, {
        name: 'Pong',
        url: 'https://ghgames.netlify.app/games/Pong.html'
    }, {
        name: 'Audio Game',
        url: 'https://ghgames.netlify.app/games/FindTheParty.html'
    }, {
        name: 'Buildnow.gg',
        url: 'https://buildnow-gg.io/buildnow-gg.embed'
    }, {
        name: 'Eaglercraft',
        url: 'https://eaglercraft.com/play/?version=1.12.2'
    }, {
        name: 'Bloons Player Pack 1',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/bloonspp1/index.html'
    }, {
        name: 'Bloons Player Pack 2',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/bloonspp2/index.html'
    }, {
        name: 'Bloons Player Pack 3',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/bloonspp3/index.html'
    }, {
        name: 'Bloons Player Pack 4',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/bloonspp4/index.html'
    }, {
        name: 'Bloons Player Pack 5',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/bloonspp5/index.html'
    }, {
        name: 'Blood Tournament',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/bloodtournament/index.html'
    }, {
        name: 'Age of War',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/ageofwar/index.html'
    }, {
        name: 'Age of War 2',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/aow2/index.html'
    }, {
        name: 'Achievement Unlocked',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/achieveunlocked/index.html'
    },
    {
        name: 'Achievement Unlocked 2',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/achieveunlocked2/index.html'
    }, {
        name: 'Glass City',
        url: 'https://1kh0.github.io/projects/glass-city/index.html'
    }, {
        name: 'Portal (Flash)',
        url: 'https://1kh0.github.io/projects/portalflash/index.html'
    }, {
        name: 'Anti-Matter Dimentions',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/antimatterdimensions/index.html'
    }, {
        name: 'Bit Life',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/bitlife/index.html'
    }, {
        name: 'Animal Crossing: Wild World',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/animalcrossingwildworld/index.html'
    },
    { name: 'American Racing', url: 'https://stunning-quokka-4284d0.netlify.app/semag/americanracing1/index.html' },
    { name: '1 on 1 Soccer', url: 'https://stunning-quokka-4284d0.netlify.app/semag/1on1soccer/index.html' }, {
        name: 'Baloon Run',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/bal/index.html'
    }, {
        name: '2D Rocket League',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/2drocketleague/index.html'
    }, {
        name: 'Funny Shooter',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/funnyshooter/index.html'
    }, {
        name: 'Baldi Basics Plus',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/baldi-plus/index.html'
    }, {
        name: 'Diablo',
        url: 'https://d07riv.github.io/diabloweb/'
    }, {
        name: 'Kick that Buddy',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/kickthatbuddy/index.html'
    }, {
        name: 'Hollow Knight',
        url: 'https://selenite.cc/resources/semag/hollowknight/index.html'
    }, {
        name: 'Undertale',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/undertale/index.html'
    },
    {
        name: 'Vampire Survivors',
        url: 'https://truffled.lol/games/vampire/index.html'
    }, {
        name: 'GTA 1',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/gta1/index.html'
    },
    {
        name: 'GTA San Andreas',
        url: 'https://truffled.lol/games/gtasan/index.html'
    },
    {
        name: 'TABS',
        url: 'https://z.axsetubal.pt/api/zones/play/827-f'
    },
    {
        name: 'Hollow Knight: Silksong',
        url: 'https://truffled.lol/games/silk/index.html'
    },
    {
        name: 'Mario Kart 7',
        url: 'https://truffled.lol/games/mk7/index.html'
    },
    {
        name: 'Raft',
        url: 'https://truffled.lol/games/raft/index.html'
    },
    {
        name: 'Minecraft Xbox 360 Edition',
        url: 'https://truffled.lol/games/lce/index.html'
    },
    {
        name: 'Plague Inc',
        url: 'https://truffled.lol/games/PlagueInc/index.html'
    },
    {
        name: 'Space Flight Simulator',
        url: 'https://truffled.lol/gamefile/spaceflight.html'
    },
    {
        name: 'Skribbl.io',
        url: 'https://skribbl.io'
    },
    {
        name: 'Super Meat Boy',
        url: 'https://truffled.lol/games/meatboy/index.html'
    },


    {
        name: 'GTA 2',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/gta2/index.html'
    }, {
        name: 'Jelly Drift',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/jelly-drift/index.html'
    }, {
        name: 'Friday Night Funkin',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/fridaynightfunkin/index.html'
    }, {
        name: 'Ultrakill',
        url: 'https://truffled.lol/games/ultrakill/ultrakill/index.html'
    }, {
        name: 'FNAF 4',
        url: 'https://selenite.cc/resources/semag/fnaf4/index.html'
    }, {
        name: 'FNAF 3',
        url: 'https://selenite.cc/resources/semag/fnaf3/index.html'
    }, {
        name: 'FNAF 2',
        url: 'https://selenite.cc/resources/semag/fnaf2/index.html'
    }, {
        name: 'FNAF',
        url: 'https://selenite.cc/resources/semag/fnaf/index.html'
    }, {
        name: 'Doom',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/doom/index.html'
    }, {
        name: 'Halflife',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/halflife/index.html'
    }, {
        name: 'Cuphead',
        url: 'https://truffled.lol/games/Cuphead/index.html'
    }, {
        name: '1V1.LOL',
        url: 'https://1v1lolreloaded.com/index.html'
    }, {
        name: '1V1space',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/1v1space/index.html'
    }, {
        name: '2048',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/2048/index.html'
    }, {
        name: 'Among Us',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/among-us/index.html'
    }, {
        name: 'Alien Invaders.io',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/alien-invaders-io/index.html'
    }, {
        name: 'Angry Birds',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/angry-birds/index.html'
    }, {
        name: 'Anti Terrorist Rush',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/anti-terrorist-rush/index.html'
    }, {
        name: 'Arcade Wizard',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/arcade-wizard/index.html'
    }, {
        name: 'Asciispace',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/asciispace/index.html'
    }, {
        name: 'Asteroids',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/asteroids/index.html'
    }, {
        name: 'Astray',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/astray/index.html'
    }, {
        name: 'Awesome Tanks 2',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/awesome-tanks-2/index.html'
    }, {
        name: 'Backcountry',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/backcountry/index.html'
    }, {
        name: 'Backflip Dive 3D',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/backflip-dive-3d/index.html'
    }, {
        name: 'Backrooms',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/backrooms/index.html'
    }, {
        name: 'Bad Ice Cream',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/bad-ice-cream/index.html'
    }, {
        name: 'Bad Ice Cream 2',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/bad-ice-cream-2/index.html'
    }, {
        name: 'Bad Ice Cream 3',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/bad-ice-cream-3/index.html'
    }, {
        name: 'Baldis Basics',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/baldis-basics/index.html'
    }, {
        name: 'BasketBros.io',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/basket-bros-io/index.html'
    },
    {
        name: 'Basketball Legends 2020',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/basketball-legends-2020/index.html'
    },
    {
        name: 'Stardew Valley',
        url: 'https://truffled.lol/games/stardew/index.html'
    },
    { name: 'Basketball Stars', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/basketball-stars/index.html' },
    { name: 'Basketball.io', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/basketball-io/index.html' },
    { name: 'Battle For Gondor', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/battleforgondor/index.html' },
    { name: 'Bigred Button', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/bigredbutton/index.html' },
    { name: 'Binding of isaac', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/binding-of-isaac/index.html' },
    { name: 'Black hole Square', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/blackholesquare/index.html' },
    { name: 'Black Knight', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/blackknight/index.html' },
    { name: 'Blocky Snakes', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/blocky-snakes/index.html' },
    { name: 'Bottle Flip 3D', url: 'https://nate-games.com/0/g/bf3d/game/' }, {
        name: 'Bloons Tower Defence 1',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/btd/index.html'
    }, {
        name: 'Bloons Tower Defence 2',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/btd2/index.html'
    }, {
        name: 'Bloons Tower Defence 3',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/btd3/index.html'
    }, {
        name: 'Bloons Tower Defence 4',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/btd4/index.html'
    }, {
        name: 'Bloons Tower Defence 5',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/btd5/index.html'
    }, {
        name: 'Bloons Tower Defence 6',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/btd6/index.html'
    }, {
        name: 'Breakout',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/breakout/index.html'
    }, {
        name: 'Burning Man 2',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/burning-man-2/index.html'
    }, {
        name: 'Call of Duty',
        url: 'https://nzp.gay/'
    }, {
        name: 'Canyon Defence',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/canyondefense/index.html'
    }, {
        name: 'Car simulator',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/cars-simulator/index.html'
    }, {
        name: 'Champion archer',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/championarcher/index.html'
    }, {
        name: 'Chess',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/chess/index.html'
    }, {
        name: 'Chrome Dino',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/chrome-dino/index.html'
    }, {
        name: 'Cookie Clicker',
        url: 'https://orteil.dashnet.org/cookieclicker/'
    }, {
        name: 'CSGO Clicker',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/csgo-clicker/index.html'
    }, {
        name: 'Counter Strike',
        url: 'https://game.play-cs.com/'
    }, {
        name: 'Crossyroad',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/crossyroad/index.html'
    }, {
        name: 'Cut the Rope',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/cuttherope/index.html'
    }, {
        name: 'Doge Mining Simulator',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/doge-mining-simulator/index.html'
    }, {
        name: 'Doodle Jump',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/doodle-jump/index.html'
    }, {
        name: 'Ducklife',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/ducklife/index.html'
    }, {
        name: 'Edge Surf',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/edge-surf/index.html'
    }, {
        name: 'Emulator JS',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/emulator-js/index.html'
    }, {
        name: 'Factoryballs',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/factoryballs/index.html'
    }, {
        name: 'Fall Guys',
        url: 'https://nate-games.com/0/g/fallguys/game/'
    }, {
        name: 'Flappy Bird',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/flappy-bird/index.html'
    }, {
        name: 'Friday Night Funkin',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/fridaynightfunkin/index.html'
    }, {
        name: 'Fruit Ninja',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/fruitninja/index.html'
    }, {
        name: 'FullScreenMario',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/FullScreenMario/Source/index.htm'
    }, {
        name: 'Geometry Dash',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/geometrydash/index.html'
    }, {
        name: 'Getting Over It',
        url: 'https://nate-games.com/0/g/gettingoverit/game/'
    }, {
        name: 'Google Snake',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/google-snake/index.html'
    }, {
        name: 'Google Solitaire',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/google-solitaire/index.html.html'
    }, {
        name: 'Happy Wheels',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/happy-wheels/index.html'
    }, {
        name: 'Hextris',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/hextris/index.html'
    }, {
        name: 'Impossible Quiz',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/impossiblequiz/index.html'
    }, {
        name: 'Iscribble.io',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/iscribble-io/index.html'
    }, {
        name: 'Justfall.lol',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/justfall/index.html'
    }, {
        name: 'Kartfight.io',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/kart-fight-io/index.html'
    }, {
        name: 'Kitchen Gun Game',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/kitchen-gun-game/index.html'
    }, {
        name: 'Krunker',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/krunker/index.html'
    }, {
        name: 'Learn To Fly',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/learntofly/index.html'
    }, {
        name: 'Madalin Stunt Cars 2',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/madalin-stunt-cars-2/index.html'
    }, {
        name: 'Make it meme',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/makeitmeme/index.html'
    }, {
        name: 'Minecraft 1.5.2',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/mc1.5.2/index.html'
    }, {
        name: 'Meat Boy',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/meat-boy/index.html'
    }, {
        name: 'Minesweeper',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/minesweeper/index.html'
    }, {
        name: 'Moto X3M',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/motox3m/index.html'
    }, {
        name: 'Moto X3M2',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/motox3m2/index.html'
    }, {
        name: 'My Friend Pedro',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/my-friend-pedro/index.html'
    }, {
        name: 'Osu!',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/osu/index.html'
    }, {
        name: 'Pacman',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/pacman/index.html'
    }, {
        name: 'Retro Bowl',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/retro-bowl/index.html'
    }, {
        name: 'POLLYTRACK',
        url: 'https://stunning-quokka-4284d0.netlify.app/semag/polytrack/index.html'
    }, {
        name: 'Slither',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/slither/index.html'
    }, {
        name: 'Slope',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/slope/index.html'
    }, {
        name: 'Solitaire',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/solitaire/index.html'
    }, {
        name: 'Sm64',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/sm64/index.html'
    }, {
        name: 'Sonic The Hedgehog',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/sonic-the-hedgehog/src/index.html'
    }, {
        name: 'Soundboard',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/soundboard/index.html'
    }, {
        name: 'Stickman',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/stickman/index.html'
    }, {
        name: 'Super Mario Maker Online',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/super-mario-maker-online/index.html'
    },
    { name: 'Superhero.io', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/superhero-io/index.html' },
    { name: 'Superhot', url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/superhot/index.html' }, {
        name: 'Temple Run 2',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/temple-run-2/index.html'
    }, {
        name: 'Tetris',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/tetris/index.html'
    }, {
        name: 'Terraria',
        url: 'https://truffled.lol/games/terraria/terraria-wrapper.html'
    }, {
        name: 'The Impossible Quiz',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/the-impossible-quiz/index.html'
    },
    {
        name: 'The Impossible Quiz 2',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/the-impossible-quiz-2/index.html'
    }, {
        name: 'The Heist',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/theheist/index.html'
    }, {
        name: 'Time Shooter 3',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/time-shooter-3/index.html'
    }, {
        name: 'Townscaper',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/townscaper/index.html'
    }, {
        name: 'Underrun',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/underrun/index.html'
    }, {
        name: 'Wordle',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/wordle/index.html'
    }, {
        name: "World's Hardest Game",
        url: 'https://nate-games.com/0/g/whg/game/'
    }, {
        name: "World's Hardest Game 2",
        url: 'https://nate-games.com/0/g/whg2/game/'
    }, {
        name: "World's Hardest Game 3",
        url: 'https://nate-games.com/0/g/whg3/game/'
    }, {
        name: 'You are Bezos',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/you-are-bezos/index.html'
    }, {
        name: 'Zig Zag',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/zig-zag/index.html'
    }, {
        name: 'Zombie Apocalypse',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/zombocalypse/index.html'
    }, {
        name: 'Zombs Royale',
        url: 'https://panthercity-lacrosse2020.github.io/HTML-Games-V2/zombs-royale/index.html'
    }, {
        name: 'Mr Racer',
        url: 'https://trafficjam3d.github.io/mr-racer-car-racing/'
    }, {
        name: 'Get away Shooter',
        url: 'https://thirteenfo.netlify.app/games/getawayshoot/index.html'
    }, {
        name: 'Shell Shockers',
        url: 'https://shellshock.io/'
    },
    { name: 'GTA Vice City', url: 'https://selenite.cc/loader.html?title=GTA%3A%20Vice%20City&dir=gtavc&img=256x256.png&type=g' },
    { name: 'Buckshot Roulette', url: 'https://stunning-quokka-4284d0.netlify.app/semag/buckshot-roulette/index.html' }
];
games.sort((a, b) => a.name.localeCompare(b.name));

const apps = [
    { name: 'Cine-Cloud OS(Sometimes works)', url: 'https://cinesteam.cine-softwares.workers.dev/' },
    { name: 'Discord', url: 'https://s3.amazonaws.com/deaganfern/index.html?route=%2Fsearch%3Fquery%3DaHR0cHM6Ly9kaXNjb3JkLmNvbS9hcHA%253D' },
    { name: 'Geforce NOW', url: 'https://s3.amazonaws.com/deaganfern/index.html?route=%2Fsearch%3Fquery%3DaHR0cHM6Ly9wbGF5LmdlZm9yY2Vub3cuY29t%26v%3D%25221%2522' },
    { name: 'Tiktok', url: 'https://s3.amazonaws.com/deaganfern/index.html?route=%2Fsearch%3Fquery%3DaHR0cHM6Ly93d3cudGlrdG9rLmNvbQ%253D%253D' },
    { name: 'Youtube', url: 'https://s3.amazonaws.com/deaganfern/index.html?route=%2Fsearch%3Fquery%3DaHR0cHM6Ly95b3V0dWJlLmNvbQ%253D%253D%26v%3D%25221%2522' }
].sort((a, b) => a.name.localeCompare(b.name));

const flashGames = [
    { name: 'Flash Games Archive', url: 'https://flash-games.io/' },
    { name: 'Flash Museum', url: 'https://flashmuseum.org/' }
];

const unblockers = [
    { name: 'Rammerhead', url: 'https://quizlet.gq/' },
    { name: 'Fern', url: 'https://s3.amazonaws.com/fernisbest/index.html' },
    { name: 'Lucide', url: 'https://lsrelay-l.s3.amazonaws.com/index.html' }
];

renderItems('games-container', games);
renderItems('apps-container', apps);
renderItems('flash-container', flashGames);
renderItems('unblockers-container', unblockers);