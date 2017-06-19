window.onload = function() {

    //  Note that this html file is set to pull down Phaser 2.5.0 from the JS Delivr CDN.
    //  Although it will work fine with this tutorial, it's almost certainly not the most current version.
    //  Be sure to replace it with an updated version before you start experimenting with adding your own code.
    var size = 32;
    var width = 40;
    var height = 25;
    var game = new Phaser.Game(size*width, size*height, Phaser.WEBGL, 'gamecontainer', { preload: preload, create: create });
    var neighbors; //neighbors in certain iteration
    var current; //current state of the map
    var previous; //previous state. used to determine if sprites should be rendered out
    var fadingOut;

    var graphics;
    var emitter;
    var text1 = "Game of Life \n DTEK1061 2017 \n (c) Vilho Kivihalme";
    var style = { font: "65px Arial", fill: "#ffffff", align: "center" }; //text style

    var fadeoutTweens;
    function preload () {

      game.load.image('cell','cell.png');
      game.load.image('part','particle.png');
      game.load.audio('main','02_Underclocked_underunderclocked_mix_.ogg');

      neighbors=new Array(height);
      current = new Array(height);
      sprites=new Array(height);
      previous = new Array(height);
      fadingOut=new Array(height);
      fadeoutTweens=new Array(height);
      for(var i = 0;i<size;i++){
        sprites[i] = new Array(size);

      }
      for(var i = 0;i<height;i++){
        previous[i] = new Array(width);
        for(var j = 0 ;j<width;j++){
          previous[i][j] =0;
        }
      }

      for(var i = 0;i<height;i++){
        current[i] = new Array(width);
        for(var j = 0 ;j<width;j++){
          current[i][j] =0;
        }

      }

      for(var i = 0;i<height;i++){
        fadeoutTweens[i] = new Array(width);
        //for(var j = 0 ;j<size;j++){
        //  current[i][j] =0;
        //}

      }


      for(var i = 0;i<height;i++){
        fadingOut[i] = new Array(width);
        for(var j = 0 ;j<width;j++){
          fadingOut[i][j] =0;
        }

      }
      resetNeighbors(size);
    }

    var text;
    function create () {
      game.physics.startSystem(Phaser.Physics.ARCADE);
      emitter = game.add.emitter(0, 0, 10000);
      emitter.gravity = 0;
      emitter.makeParticles('part');
      graphics = game.add.graphics(0, 0);
      graphics.beginFill(0xffffff);
      setRandomCells();
      game.time.events.loop(Phaser.Timer.SECOND/5, generation, this);
      setButtons();

      text= game.add.text(game.world.centerX, width*size, text1, style);
      text.anchor.set(0.5);

      music = game.add.audio('main');
      music.volume=0.3;
      console.log(music.volume)
      music.play();
      game.add.tween(text).to({ y: -256 }, 10000, Phaser.Easing.Linear.None, true, 200, 1000, false);
    }

  //  var delay;
    var animationTTL;
    var particleCount;

    function setButtons(){


      //delay = document.createElement("INPUT");
      //delay.setAttribute("type", "range");
    //  document.body.appendChild(document.createTextNode("Delay:"));
  //    document.body.appendChild(delay);
    //  delay.min=10;
      //delay.max=1000;

      animationTTL = document.createElement("INPUT");
      var element = document.getElementById("controls");
      animationTTL.setAttribute("type", "range");
      animationTTL.min=1;
      animationTTL.max=1000;
      animationTTL.value=500;
      element.appendChild(document.createTextNode("Particle TTL:"));
      element.appendChild(animationTTL);

      particleCount = document.createElement("INPUT");

      particleCount.setAttribute("type", "range");
      particleCount.min=0;
      particleCount.max=10;
      particleCount.value=0;
      element.appendChild(document.createTextNode("Particle count:"));
      element.appendChild(particleCount);

    }

    function generation(){

      for(var i = 0;i<height;i++){
        for(var j = 0;j<width;j++){
          previous[i][j] = current[i][j];
        }
      }
      countNeighbors();
      update();
      render();
      resetNeighbors();
    }

    function resetNeighbors(){
      for(var i = 0;i<height;i++){
        neighbors[i] = new Array(height);
        for(var j = 0 ;j<width;j++){
          neighbors[i][j] =0;
        }
      }
    }

    function setRandomCells(){
      for(var i = 0;i<height;i++){
        for(var j =0;j<width;j++){
          if(Math.random()>0.6){
            current[i][j] =1;
          }
        }
      }

    }

    function render(){
      graphics.clear();
      //graphics.beginFill(0xffffff);
      var startx=1,starty=1,ssize=32;
      for(var i = 0;i<height;i++){
        for(var j =0;j<width;j++){
          if(current[i][j]==1){
            if(sprites[i][j]==null){
                sprites[i][j]=game.add.sprite(startx,starty,'cell');
            }
            if(previous[i][j]==0){

              //  sprites[i][j].tint =0xf999ff;
            //    game.add.tween(sprites[i][j]).to( { alpha: 1 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);

              }

              if(fadeoutTweens[i][j]!=null){
                fadeoutTweens[i][j].stop();
            //    console.log("stopped tween");
              }else{
              //  console.log("nofadeout");
              }
              sprites[i][j].tint=0xffffff;
              sprites[i][j].alpha=1;
              fadingOut[i][j]=0;

          }else{//if current is 0
            if(sprites[i][j]!=null){
              if(previous[i][j]==1){  //if
                sprites[i][j].alpha=1;
                sprites[i][j].tint = 0xff6060;
                game.add.tween(sprites[i][j]).to( { alpha: 0.5 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
                fadingOut[i][j]=1;
              }else{
                if(fadingOut[i][j]==1){
                  if(fadeoutTweens[i][j]!=null){
                    if(fadeoutTweens[i][j].isRunning){
                      fadeoutTweens[i][j].stop();
                  //    game.destroy(fadeoutTweens[i][j]);
                    //  console.log("delete")
                    }


                  }
                    fadeoutTweens[i][j] = game.add.tween(sprites[i][j]).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false);
                    fadingOut[i][j]=0;
                }

              }
            //  sprites[i][j].destroy();
            //  sprites[i][j]=null;
            }
          }
          startx+=ssize;
        }
        startx=1;
        starty+=ssize;
      }
            text.bringToTop();
    }

    var lowSpawn =0;
    var resetDone=false;
    function update(){
      console.log(lowSpawn);
      var newCells = 0;
      if(resetDone){
        game.time.events.add(Phaser.Timer.SECOND * 2, setRandomCells, this);
        resetDone=false;
        lowSpawn=0;
        return;
      }else if(lowSpawn>100){
        for(var i = 0;i<height;i++){
          for(var j =0;j<width;j++){
            current[i][j]=0;
          }
        }
        resetDone=true;
        return;
      }
      if(resetDone){

      }
      var startx=1,starty=1,ssize=size;
      for(var i = 0;i<height;i++){
        for(var j =0;j<width;j++){

          var n = neighbors[i][j];
          if(current[i][j]==0){
            if(n==3){
              current[i][j] =1;
              newCells++;
            }
          }
          if(current[i][j]==1){
            if(n<2||n>3){
              current[i][j] = 0;
              emitter.y= startx; //ok so here x and y are inverted because no reason
              emitter.x= starty;
              emitter.start(true, animationTTL.value, null, particleCount.value);

            }
          }
          starty+=ssize;
        }
        starty=1;
        startx+=ssize;
      }
      if(newCells<15){
        lowSpawn = lowSpawn + (15-newCells);
      }else if(newCells>40){
        lowSpawn=0;
      }
    }

    function countNeighbors(){
      var n;
      for(var i = 0;i<height;i++){
        for(var j =0;j<width;j++){
          n=0;
          if(i>0){
            n=n+current[i-1][j];
          }
          if(j>0){
            n=n+current[i][j-1];
          }
          if(i<height-1){
            n=n+current[i+1][j];
          }
          if(j<height-1){
            n=n+current[i][j+1];
          }

          if(i>0&&j>0){
            n=n+current[i-1][j-1];
          }
          if(i>0&&j<width-1){
            n=n+current[i-1][j+1];
          }
          if(i<height-1&&j<width-1){
            n=n+current[i+1][j+1];
          }
          if(i<height-1&&j>0){
            n=n+current[i+1][j-1];
          }
          //  console.log(n);

              neighbors[i][j] =n;
        }

      }

    }
function mute(){

}
};
