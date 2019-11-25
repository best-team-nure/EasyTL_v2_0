var game;
Object.defineProperty(window, 'DEBUG', {
    get: function() { return this.value;},
    set: function(value) { 
        this.value = value;
        if (game)
            game.renderHitboxes();
    }
})
class Game {
    constructor(props) {
        $('.game').append('\
            <div id="field">\
                <div id="map"></div>\
                <div id="car"></div>\
            </div>'
        );
        
        $('#map').css({
            backgroundImage: `url(img/game/${props.image}`,
            height: `${props.height}px`,
            width: `${props.width}px`,
        });
        $('#map').append(`<div id="loader"></div>`);
        
        this.posX = props.posX;
        this.posY = props.posY;

        this.speed = 0;
        this.maxSpeed = 1;
        this.minSpeed = 0.3;
        this.angle = - 0;
        this.isRotateLeft = this.isRotateRight = false;
        this.player = new Car(props.player);

        this.center = [350 - this.posX, 350 - this.posY];

        this.exit = new Exit(props.exit);

        const trees = props.trees;
        this.tree = [];
        for (let i = 0; i < trees.length; i++) {
            this.tree[i] = new Tree(trees[i]);
        }

        this.person = [];
        for (let i = 0; i < props.person.length; i++) {
            this.person[i] = new Person(props.person[i]);
        }

        this.engine = setInterval(() => {
            this.move();
            this.render();
            this.player.angle = this.angle;
            this.player.render();
            this.checkColapse();
            this.exit.getAngle(this.center[0], this.center[1], this.angle);
            for (let i = 0; i < this.person.length; i++) {
                this.person[i].render();
            }
        }, 0);

        $(document).keydown((e) => {
            switch(e.keyCode) {
                case 37:
                    this.as = 0.005;
                    break;
                // up
                case 38:
                    this.a = 0.01;
                    break;
                // right
                case 39:
                    this.as = -0.005;
                    break;
                // down
                case 40:
                    this.a = -0.005;
                    break;
                // space
                case 32:
                    this.isStop = true;
                    break;
            }
        }).keyup((e) => {
            switch(e.keyCode) {
                case 37:
                    this.as = 0;
                    break;
                case 38:
                    this.a = 0;
                    break;
                case 39:
                    this.as = 0;
                    break;
                case 40:
                    this.a = 0;
                    break;
                case 32:
                    this.isStop = false;
                    break;
            }
        })
    }

    renderHitboxes() {
        this.player.renderHitbox(DEBUG);
        for (let i = 0; i < this.tree.length; i++) {
            this.tree[i].renderHitbox(DEBUG);
        }

    }

    testCornors() {
        const hitbox = this.player.getHitboxCornors(this.center[0], this.center[1]);
        if (DEBUG) {
            for (let i = 0; i < hitbox.length; i++)
                $('#map').append(`<div style="background: #f00;
                width: 10px; 
                height: 10px; 
                transform: translate(-50%, -50%); 
                position: absolute; 
                top: ${hitbox[i][1]}px;
                left: ${hitbox[i][0]}px;"></div>
                `)
        }
        console.log(hitbox);
        console.log(this.tree[0].getLength(hitbox[0]));
        console.log(this.tree[0].getLength(hitbox[1]));
        console.log(this.tree[0].getLength(hitbox[2]));
        console.log(this.tree[0].getLength(hitbox[3]));
    }
    checkColapse() {
        const cornors = this.player.getHitboxCornors(this.center[0], this.center[1]);
        for (let i = 0; i < cornors.length; i++) {
            const cornor = cornors[i];
            for (let j = 0; j < this.tree.length; j++) {
                if (this.tree[j].check(cornor)) {
                    if (DEBUG)
                        console.log('hit');
                    else {
                        $(document).off();
                        clearInterval(this.engine);
                        alert('Поражение');
                        this.speed = 0;
                    }
                    return;
                }
            }
        }
    }
    move() {
        if (this.isStop) {
            const stop = 0.04;
            if (this.speed > stop) {
                this.speed -= stop;
            }
            else if (this.speed < - stop) {
                this.speed += stop;
            } else {
                this.speed = 0;
            }
        } else {
            if (this.a)
                this.speed += this.a;
            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
            }
            if (this.speed < this.maxSpeed / 2 * -1) {
                this.speed = this.maxSpeed / 2 * -1;
            }

            if (this.speed > this.minSpeed || this.speed < -this.minSpeed) {
                if (this.as) {
                    if (this.speed > 0)
                        this.angle += this.as;
                    if (this.speed < 0)
                        this.angle -= this.as;
                }
            }
            else {
                if (this.as) {
                    const as = this.as * Math.abs(this.speed * 1.5);
                    if (this.speed > 0) {
                        this.angle += as;
                    }
                    else {
                        this.angle -= as;
                    }
                }
                
            }
            
        }

        let dx = this.speed * Math.cos(- this.angle);
        let dy = this.speed * Math.sin(- this.angle);

        this.posX -= dx;
        this.posY -= dy;

        this.center = [350 - this.posX, 350 - this.posY];


    }
    render() {
        $('#map').css({
            left: `${this.posX}px`,
            top: `${this.posY}px`,
        })
    }
}

class Tree {
    constructor(treeSetting) {
        this.width = treeSetting.width;
        this.height = treeSetting.height;
        this.image = treeSetting.image;
        this.posX = treeSetting.posX;
        this.posY = treeSetting.posY;

        this.id = treeSetting.element;
        let tree = document.createElement('div');
        tree.id = treeSetting.element;
        document.getElementById('map').appendChild(tree);
        this.element = document.getElementById(treeSetting.element);

        this.hitboxRadius = treeSetting.hitbox;


        
        this.hitboxId = `${this.id}-hitbox`;
        this.element.innerHTML = `<div id="${this.hitboxId}"></div>`;
        this.hitbox = document.getElementById(this.hitboxId);
        this.c = '#f00';

        this.render();
        this.renderHitbox(DEBUG);
    }
    check(point) {
        const length = Math.sqrt(Math.pow(point[0] - (this.posX + parseInt(this.width) / 2), 2) + Math.pow(point[1] - (this.posY + parseInt(this.height) / 2), 2));
        if (length < this.hitboxRadius) {
            this.c = '#0f0';
            this.render();
            this.renderHitbox(DEBUG);
            return true;
        } else {
            this.c = '#f00';
            this.render();
            this.renderHitbox(DEBUG);
            return false;
        }
    }
    getLength(point) {
        const length = Math.sqrt(Math.pow(point[0] - (this.posX + parseInt(this.width) / 2), 2) + Math.pow(point[1] - (this.posY + parseInt(this.height) / 2), 2));
        return length;
    }
    renderHitbox(deb) {

        this.hitbox.style.position = 'absolute';
        this.hitbox.style.top = '50%';
        this.hitbox.style.left = '50%';
        this.hitbox.style.transform = 'translate(-50%, -50%)';
        this.hitbox.style.width = `${this.hitboxRadius * 2}px`;
        this.hitbox.style.height = `${this.hitboxRadius * 2}px`;
        this.hitbox.style.borderRadius = '50%';
        this.hitbox.style.background = deb ? this.c : 'none';
    }
    render() {
        this.element.style.position = 'absolute';
        this.element.style.top = this.posY + 'px';
        this.element.style.left = this.posX + 'px';
        this.element.style.width = this.width;
        this.element.style.height = this.height;
        this.element.style.backgroundImage = `url(img/game/${this.image})`;
        this.element.style.backgroundSize = 'contain';
        this.element.style.backgroundRepeat = 'no-repeat';
        this.element.style.backgroundPosition = '50% 50%';
    }
}
class Car {
    constructor(carSettings) {
        const {width, height, image, element, posX, posY} = carSettings;

        this.width = width;
        this.height = height;
        this.image = image;
        this.element = document.getElementById(element);

        this.posX = posX;
        this.posY = posY;

        const halfW = parseInt(this.width) / 2;
        const halfH = parseInt(this.height) / 2;
        this.diagonal = Math.sqrt(halfW * halfW + halfH * halfH);
        this.insideAngle = Math.atan(halfH / halfW);
        this.render();

        
        let hitbox = `${this.element.id}-hitbox`;
        this.element.innerHTML = `<div id="${hitbox}"></div>`;

        this.hitbox = document.getElementById(hitbox);
        this.renderHitbox(DEBUG);
    }

    renderHitbox(deb) {
        this.hitbox.style.width = this.width;
        this.hitbox.style.height = this.height;
        this.hitbox.style.boxSizing = 'border-box';
        this.hitbox.style.border = deb ? "1px solid #f00" : 'none';
    }

    getHitboxCornors(posx, posy) {
        const a = -this.angle;
        const b = this.insideAngle;

        // right top and left bottom
        const dy1 = Math.sin(a + b) * this.diagonal;
        const dx1 = Math.cos(a + b) * this.diagonal; 

        // right bottom and left top;
        const dy2 = Math.sin(a - b) * this.diagonal;
        const dx2 = Math.cos(a - b) * this.diagonal;

        return [
            [posx + dx1, posy + dy1],  // right top
            [posx - dx2, posy - dy2],  // left top
            [posx - dx1, posy - dy1],  // left bottom
            [posx + dx2, posy + dy2],  // right bottom
        ]
    }

    render() {
        this.element.style.position = 'absolute';
        this.element.style.top = '50%';
        this.element.style.left = '50%';
        this.element.style.width = this.width;
        this.element.style.height = this.height;
        this.element.style.marginLeft = - parseInt(this.width) / 2 + 'px';
        this.element.style.marginTop =  - parseInt(this.height) / 2 + 'px';
        this.element.style.backgroundImage = `url(img/game/${this.image})`;
        this.element.style.backgroundSize = 'contain';
        this.element.style.backgroundRepeat = 'no-repeat';
        this.element.style.backgroundPosition = '50% 50%';
        this.element.style.transform = `rotate(${- this.angle * 180 / Math.PI}deg)`
    }
}
class Exit {
    constructor(props) {
        this.posX = props.posX;
        this.posY = props.posY;

        this.width = props.width;
        this.height = props.height;

        this.render();
    }
    render() {
        $('#map').append('<div id="game-exit"></div>');

        $('#game-exit').css({
            position: 'absolute',
            top: `${this.posY}px`,
            left: `${this.posX}px`,
            width: this.width,
            height: this.height,
            border: '5px solid #9C27B0',
            borderRadius: '10px'
        });

        $('#map').append('<div id="exit-arrow"></div>');
        $('#exit-arrow').css({
            position: 'absolute',
            transformOrigin: '0% 50%',
            height: '8px',
            width: '200px'
        });

        $('#exit-arrow').append('<div id="exit-arrow-content"></div>');
        
    }
    getAngle(posX, posY) {
        const dx = posX - this.posX - parseInt(this.width) / 2;
        const dy = posY - this.posY - parseInt(this.height) / 2;
        
        let angle = 90 - Math.atan(Math.abs(dx) / Math.abs(dy)) * 180 / Math.PI;

        if (dx > 0) angle = 180 - angle;
        if (dy > 0) angle = -angle;

        $('#exit-arrow').css({
            top: `${posY}px`,
            left: `${posX}px`,
            transform: `translateY(-4px) rotate(${angle}deg)`
        })

        if (Math.sqrt(dx * dx + dy * dy) < 250) $('#exit-arrow').hide()
        else $('#exit-arrow').show();
    }
}
class Person {
    constructor(props) {
        this.script = props.script;
        if (this.script) this.script = this.script.bind(this);
        this.stepAnimation = props.stepAnimation;
        if (this.stepAnimation) this.stepAnimation = this.stepAnimation.bind(this);
        this.stepAnimationRate = props.stepAnimationRate;
        this.posX = props.posX;
        this.posY = props.posY;
        this.angle = props.angle;
        this.width = props.width;
        this.height = props.height;
        this.angle = props.angle;
        this.speed = props.speed;
        this.stop = false;
        $('#loader').append(`<div style='background-image: url("./img/game/person-step-1.png");'></div>`)
        $('#loader').append(`<div style='background-image: url("./img/game/person-step-2.png");'></div>`)
        $('#loader').append(`<div style='background-image: url("./img/game/person-stop.png");'></div>`)
        this.id = props.id;
        $('#map').append(`<div id="${this.id}"></div>`)
        this.id = `#${this.id}`
        $(this.id).css({
            position: 'absolute',
            width: this.width,
            height: this.height,
            backgroundSize: 'contain',
            transition: 'transform 0.5s',
            backgroundRepeat: 'no-repeat'
        })
        this.image = 'person-stop.png';
        this.stepIndex = 0;
        this.step = setInterval(this.stepAnimation, this.stepAnimationRate);

        this.render()
    }
    render() {
        this.move();
        if (this.script) this.script()
        $(this.id).css({
            top: `${this.posY}px`,
            left: `${this.posX}px`,
            transform: `rotate(${this.angle * 180 / Math.PI}deg)`,
            backgroundImage: `url('./img/game/${this.image}'`,
        })
    }
    move() {
        let dx = this.speed * Math.cos(- this.angle);
        let dy = this.speed * Math.sin(- this.angle);

        this.posX += dx;
        this.posY += dy;
    }
}


DEBUG = false;