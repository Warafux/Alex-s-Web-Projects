function World(w_, h_){
	this.w = w_ + 2;
	this.h = h_ + 2;
	this.generation = 0;
	this.lifes = 0;
	this.stats = {
		totalLifes: 0,
		totalDeaths: 0,
		deathsLoneliness: 0,
		deathsOverpopulation: 0
	}
	
	this.worldGrid = new Array(this.h);
	for(var i = 0; i < this.w; i++){
		this.worldGrid[i] = new Array(this.w);
	}
	
	this.worldGridCD = new Array(this.h);
	for(var i = 0; i < this.w; i++){
		this.worldGridCD[i] = new Array(this.w);
	}
	this.cellCD = 500;
	
	//Inicializacion de tablas a valores false
	for(var y = 0; y < this.h; y++){
		for(var x = 0; x < this.w; x++){
			this.worldGrid[y][x] = false;
		}
	}
	
	for(var y = 0; y < this.h; y++){
		for(var x = 0; x < this.w; x++){
			this.worldGridCD[y][x] = false;
		}
	}
	
	
	this.resetAll = function(){
		this.lifes = 0;
		this.generation = 0;
		this.stats = {
			totalLifes: 0,
			totalDeaths: 0,
			deathsLoneliness: 0,
			deathsOverpopulation: 0
		}
	}
	
	this.draw = function(config){
		var cellW = canvasSize.x / this.w;
		var cellH = canvasSize.y / this.h;
		var cont = 0;
		push();
		if(config.showGrid){
			strokeWeight(config.gridStrokeWeigth);
		}else{
			strokeWeight(0);
		}
		
		if(config.showAuxGrid){
			//Mostrar toooda laas casillas, incluso las auxiliares (para debugging y otros)
			for(var y = 0; y < this.h; y++){
				for(var x = 0; x < this.w; x++){
					if(!this.worldGrid[y][x]){
						fill(255,255,255);
					}else{
						fill(5,255,0);
					}
					rect(x*cellW,y*cellH, cellW, cellH);
					if(config.showCellNumber){
						fill(0);
						textSize(10);
						text(cont,x*cellW,y*cellH +20)
						cont++;
					}
				}
			}
		}else{
			//Solo mostrar las casillas que se deberian ver
			for(var y = 1; y < this.h - 1; y++){
				for(var x = 1; x < this.w - 1; x++){
			
					if(!this.worldGrid[y][x]){
						fill(255,255,255);
					}else{
						fill(5,255,0);
					}
					rect(x*cellW,y*cellH, cellW, cellH);
					if(config.showCellNumber){
						fill(0);
						textSize(10);
						text(cont,x*cellW,y*cellH +20)
						cont++;
					}
				}
			}
		}
	}
	
	this.switchState = function(x, y){
		var cell = this.worldGrid[y][x];
		var world = this;
		//Cooldown entre click y click (evitar spam)
		this.worldGridCD[y][x] = true;
		setTimeout(function(){world.worldGridCD[y][x] = false;}, world.cellCD);
		if(cell){
			this.kill(x,y);
		}else{
			this.live(x,y);
		}
	}
	
	this.kill = function(x, y){
		this.lifes--;
		this.worldGrid[y][x] = false;
		this.stats.totalDeaths++;
	}
	
	this.live = function(x, y){
		this.lifes++;
		this.worldGrid[y][x] = true;
		this.stats.totalLifes++;
	}
	
	this.clearValues = function(){
		this.resetAll();
		for(var y = 0; y < this.h; y++){
			for(var x = 0; x < this.w; x++){
				this.worldGrid[y][x] = false;
			}
		}
	}
	
	this.randomValues = function(percentAlive){
		this.resetAll();
		for(var y = 1; y < this.h - 1; y++){
			for(var x = 1; x < this.w - 1; x++){
				this.worldGrid[y][x] = (random(0,100) < percentAlive);
				if(this.worldGrid[y][x]){this.lifes++;};
			}
		}
	}
	
	this.calculateAliveNeighbours = function(neighbours){
		var aliveNeighbours = 0;
		for(var i = 0; i < neighbours.length; i++){
			if(neighbours[i]){
				aliveNeighbours++;
			}
		}
		return aliveNeighbours;
	}
	
	this.shouldDie = function(aliveNeighbours){
		if(aliveNeighbours > 3){
			this.stats.deathsOverpopulation++;
		}else if(aliveNeighbours < 2){
			this.stats.deathsLoneliness++;
		}
		
		return (aliveNeighbours > 3 || aliveNeighbours < 2);
	}
	
	this.shouldLive = function(aliveNeighbours){
		return (aliveNeighbours == 3);
	}
	
	this.setNewWorldGrid = function(nextGen){
		//Copia el contenido de la variable nextGen a la tabla worldGrid del objeto World
		//Utilizo método live y kill para entender mejor
		for(var y = 1; y < this.h - 1; y++){
			for(var x = 1; x < this.w - 1; x++){
				if(nextGen[y][x]){
					if(!this.worldGrid[y][x]){
						this.live(x,y);
					}
				}else{
					if(this.worldGrid[y][x]){
						this.kill(x,y);
					}
				}
			}
		}
		this.generation++;
	}
	
	this.nextGeneration = function(){
		//Creación tabla vacia siguiente generación
		var nextGenerationGrid = new Array(this.h);
		for(var i = 0; i < this.w; i++){
			nextGenerationGrid[i] = new Array(this.w);
		}
		
		//Recorrido total del grid
		for(var y = 1; y < this.h - 1; y++){
			for(var x = 1; x < this.w - 1; x++){
				//Analisis de los vecinos
				var cell = this.worldGrid[y][x];
				var cellNeighbours = [
					this.worldGrid[y - 1][x],//up
					this.worldGrid[y - 1][x + 1],//upright
					this.worldGrid[y][x + 1],//right
					this.worldGrid[y + 1][x + 1],//downright
					this.worldGrid[y + 1][x],//down
					this.worldGrid[y + 1][x - 1],//downleft
					this.worldGrid[y][x - 1],//left
					this.worldGrid[y - 1][x - 1]//upleft
					]
				//Cálculo de vecinos vivos
				var aliveNeighbours = this.calculateAliveNeighbours(cellNeighbours);
				if(cell){
					//Debe morir?
					if(this.shouldDie(aliveNeighbours)){
						nextGenerationGrid[y][x] = false;
					}else{
						//Si no, que siga vivo
						nextGenerationGrid[y][x] = true;
					}
				}else{
					//Debe morir?
					if(this.shouldLive(aliveNeighbours)){
						nextGenerationGrid[y][x] = true;
					}
				}
			}
			
		}
		return nextGenerationGrid
	}
}
