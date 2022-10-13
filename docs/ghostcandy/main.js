title = "Candy Heist";

description = `
Use your cursor 

to collect candy!
`;

characters = [
// a
`
 llll
l ll l
l ll l
rllllr
llllll
l ll l
`, // b
`
r    r
rrrrrr
rRrrRr
rRrrRr
 rrrr
`, // c
`
rr
rr
`, // d
`
    p 
  gggp
 gggg
 gggg
pggg
 p
`, // e
`
 p    
pccc
 cccc
 cccc
  cccp
    p
`, // f
`
    y 
  bbby
 bbbb
 bbbb
ybbb
 y
`, // g
`
 y    
yppp
 pppp
 pppp
  pppy
    y
`,
];

const G = {
	WIDTH: 200,
	HEIGHT: 150,

    STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,

	ENEMY_MIN_BASE_SPEED: 0.5,
    ENEMY_MAX_BASE_SPEED: 1.0,
	ENEMY_FIRE_RATE: 100,

    EBULLET_SPEED: 0.5,
    EBULLET_ROTATION_SPD: 0.1,

    NUM_CANDY: 75
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	theme: "crt",
	seed: 980,
	isPlayingBgm: true
};

/**
* @typedef {{
* pos: Vector,
* speed: number
* }} Star
*/

/**
* @type  { Star [] }
*/
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * isFiringLeft: boolean
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

let candy;

/**
 * @type { Enemy [] }
 */
let enemies;

/**
 * @type { number }
 */
let currentEnemySpeed;

/**
 * @type { number }
 */
let waveCount;

// New property: firingCooldown
/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number
 * }} Enemy
 */

// New type
/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number
 * }} EBullet
 */

/**
 * @type { EBullet [] }
 */
let eBullets;

let ids = ["d", "e", "f", "g"];

// The game loop function
function update() {
    // The init function running at startup
	if (!ticks) {

        candy = [];

        let xPos = 1;
		candy = times(G.NUM_CANDY, () => {
			xPos += 15;
			const posX = xPos;
            const posY = rnd(1, 50);
			const rand = Math.floor(Math.random() * 4)
			return {
				pos: vec(posX, posY),
				speed: rnd(G.ENEMY_MIN_BASE_SPEED + 20, G.ENEMY_MAX_BASE_SPEED),
				id: ids[rand]
			};
		});

        // A CrispGameLib function
        // First argument (number): number of times to run the second argument
        // Second argument (function): a function that returns an object. This
        // object is then added to an array. This array will eventually be
        // returned as output of the times() function.
		stars = times(20, () => {
            // Random number generator function
            // rnd( min, max )
            const posX = rnd(0, G.WIDTH);
            const posY = rnd(0, G.HEIGHT);
            // An object of type Star with appropriate properties
            return {
                // Creates a Vector
                pos: vec(posX, posY),
                // More RNG
                speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
            };
        });

        player = {
            pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
            firingCooldown: G.PLAYER_FIRE_RATE,
            isFiringLeft: true
        };

        enemies = [];
        eBullets = [];

        waveCount = 0;
	}

    color("black");
    candy.forEach((f) => {
		
		f.pos.y += 0.25;
		char(f.id, f.pos);
        if (f.pos.y > G.HEIGHT) f.pos.y = 0;
	});

    if(candy.length < G.NUM_CANDY) {
        for(let i = candy.length; i < G.NUM_CANDY; i++) {
            const posX = rnd(5, G.WIDTH);
            const posY = rnd(-200, -5);
            const rand = Math.floor(Math.random() * 4);
            candy.push({
                pos: vec(posX, posY),
                speed: rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED),
                id: ids[rand]
            });
        }
    }

    // Spawning enemies
    if (enemies.length === 0) {
        currentEnemySpeed =
            rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
        for (let i = 0; i < rnd(3, 7); i++) {
            const posX = rnd(0, G.WIDTH);
            const posY = -rnd(i * G.HEIGHT * 0.1);
            enemies.push({
                pos: vec(posX, posY),
                firingCooldown: G.ENEMY_FIRE_RATE - waveCount
            });
        }

        waveCount++; // Increase the tracking variable by one
    }

    // Update for Star
    stars.forEach((s) => {
        // Move the star downwards
        s.pos.y += s.speed;
        // Bring the star back to top once it's past the bottom of the screen
        if (s.pos.y > G.HEIGHT) s.pos.y = 0;

        // Choose a color to draw
        color("light_cyan");
        // Draw the star as a square of size 1
        box(s.pos, 1);
    });

    // Updating and drawing the player
    player.pos = vec(input.pos.x, input.pos.y);
    player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);

    color("cyan");
    // Generate particles
    particle(
        player.pos.x, // x coordinate
        player.pos.y, // y coordinate
        1, // The number of particles
        -0.6, // The speed of the particles
        -PI/2, // The emitting angle
        PI/4  // The emitting width
    );

    color ("black");
    char("a", player.pos);

    remove(candy, (f) => {
		let isCollidingGHOST
		isCollidingGHOST = char(f.id, f.pos).isColliding.char.a;

		//small particle explosion
		if (isCollidingGHOST) {
			
			color("cyan");
			particle(f.pos);
			color("black");

			play("coin");
            addScore(10, f.pos);

		}

		return (isCollidingGHOST || f.pos.x > G.WIDTH );
	});

    remove(enemies, (e) => {
        e.pos.y += currentEnemySpeed;
        e.firingCooldown--;
        if (e.firingCooldown <= 0) {
            eBullets.push({
                pos: vec(e.pos.x, e.pos.y),
                angle: e.pos.angleTo(player.pos),
                rotation: rnd()
            });
            e.firingCooldown = G.ENEMY_FIRE_RATE;
            play("select");
        }

        color("black");
        // Interaction from enemies to fBullets
        // Shorthand to check for collision against another specific type
        // Also draw the sprits
        const isCollidingWithFBullets = char("b", e.pos).isColliding.rect.yellow;
        const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a;
        if (isCollidingWithPlayer) {
            end();
            play("powerUp");
        }
        
        // Also another condition to remove the object
        return (isCollidingWithFBullets || e.pos.y > G.HEIGHT);
    });

    remove(eBullets, (eb) => {
        // Old-fashioned trigonometry to find out the velocity on each axis
        eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
        eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);
        // The bullet also rotates around itself
        eb.rotation += G.EBULLET_ROTATION_SPD;

        color("red");
        const isCollidingWithPlayer
            = char("c", eb.pos, {rotation: eb.rotation}).isColliding.char.a;

        if (isCollidingWithPlayer) {
            // End the game
            end();
            play("powerUp");
        }
        
        // If eBullet is not onscreen, remove it
        return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
    });
}
