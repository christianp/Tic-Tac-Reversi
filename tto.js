$(function() {

//create an array of direction vectors to check for reversi moves
//in a wilfully obtuse way
var directions = [-1,0,1].reduce(function(l,a,i,arr){return l.concat(arr.reduce(function(l2,b){return l2.concat(a,b);},[]));},[]);
directions.splice(8,2);

// why not add a jQuery method to turn any selector into a tic-tac-reversi game?
// WHY NOT INDEED
$.fn.ttrGame = function(tsize) {

	$(this).each(function() {
		var size = tsize;	//size is in scope of just this game, so won't get touched by other games in the same selector

		//clear the game area, add game styling
		var elem = $(this);
		elem.html('').addClass('ttrGame');
		elem.undelegate('#board td:not(.player0,.player1)','click');

		//create the buttons to make bigger and smaller 
		elem.append('<input type="button" id="smaller" value="Smaller"/><input type="button" id="bigger" value="Bigger"/>');
		elem.find('#smaller').click(function() {
			size = Math.max(1,size-1)
			elem.ttrGame(size);
		});
		elem.find('#bigger').click(function() {
			size++;
			elem.ttrGame(size);
		});

		//create the status display area
		var player = $('<div id="status"/>').append('Player: ').append('<span id="name"/>');
		elem.append(player);

		//create the board - both HTML and javascript array versions
		var boardElem = $('<table id="board"/>');
		var row;
		var board = [];
		for(var i=0;i<size;i++)
		{
			board.push([]);
			row = $('<tr/>');
			boardElem.append(row);
			for(var j=0;j<size;j++)
			{
				row.append('<td/>');
				board[i].push(null);
			}
		}
		elem.append(boardElem);

		//how many squares have been filled, and whether the game is over
		var clicks = 0;
		var done = false;

		//decide on a player to start, and set up
		var player = Math.random()>0.5;
		elem.find('#name').addClass(player ? 'player0' : 'player1');

		//check for reversi moves - placing your mark on the end of a line of the other guy's, with one of yours at the other end
		//goes horizontally, vertically, or diagonally
		function checkReversi(i,j)
		{
			//for each direction in the array created at the top of the program
			for(var m=0;m<16;m+=2)
			{
				var dx = directions[m];
				var dy = directions[m+1];
				var x = i+dx;
				var y = j+dy;
				var moves = 1;
				//move in the given direction for as long as the cell you're looking at is owned by the other guy
				while(x>=0 && x<size && y>=0 && y<size && board[x][y]==!player)
				{
					x += dx;
					y += dy;
					moves++;
				}
				//if process finished inside the board and on one of your squares, then a reversi move can be made
				if(x>=0 && x<size && y>=0 && y<size && board[x][y]==player)
				{
					//for each cell in the line, make it yours
					for(var n=1;n<moves;n++)
					{
						x = i+dx*n;
						y = j+dy*n;
						board[x][y] = player;
						checkWinners(x,y);
						elem.find('#board tr').eq(x).find('td').eq(y).toggleClass('player0 player1');
					}
				}

			}
		}

		//check if the player's move has created a winning row
		//player wins if his mark covers an entire row, column, or diagonal
		function checkWinners(i,j)
		{
			//check row and column of last placed mark
			for(x=0;x<size && board[i][x]==player;x++){}
			for(y=0;y<size && board[y][j]==player;y++){}

			//if move is on top-left -> bottom-right diagonal
			var d1,d2;
			if(i==j)
				for(d1=0;d1<size && board[d1][d1]==player;d1++){}
			//if move is on top-right -> bottom-left diagonal
			if(i==size-1-j);
				for(d2=0;d2<size && board[d2][size-1-d2]==player;d2++){}

			//if any of the rows are complete
			if(x==size || y==size || d1==size || d2==size)
			{
				var winners = $('');

				//select all the squares involved a winning row (there might be more than one winning row)
				if(x==size)
					winners=winners.add(elem.find('#board tr').eq(i).find('td'));
				if(y==size)
					winners=winners.add(elem.find('#board tr td:nth-child('+(j+1)+')'));
				for(m=0;m<size;m++){ 
					if(d1==size)
						winners=winners.add(elem.find('#board tr').eq(m).find('td').eq(m));
					if(d2==size)
						winners=winners.add(elem.find('#board tr').eq(m).find('td').eq(size-1-m));
				}

				//add exclusive winner's styling to the winning squares
				winners.addClass('win');

				//update the status
				elem.find('#status').append(' wins').find('#name').toggleClass('player0 player1');

				//make the board inert, display the reset message
				endGame();
			}
		}

		function endGame()
		{
			//unhook the click events for making moves
			elem.undelegate('#board td:not(.player0,.player1)','click');
	
			//create the reset message
			elem.append('<input id="reset"/>');
			var reset = elem.find('#reset');
			reset
				.val('Play Again')
				.click(function() {			//when the reset message is clicked, start another game of the same size
					elem.ttrGame(size);
				})
				.fadeIn(400)				//fade it in because THIS IS THE TWENTY-FIRST CENTURY AND EVERYTHING GOES SWOOSH NOW
			;

			elem.find('#board td').css('cursor','default');	//can't click on squares any more, so don't show the pointer

			//game is done, so make a note not to do any more game logic
			done = true;
		}

		//squares that haven't already been marked get marked when you click on them
		elem.delegate('#board td:not(.player0,.player1)','click',function() {

			//get position of clicked square
			var j = size - $(this).nextAll().length - 1;
			var i = size - $(this).parent().nextAll().length - 1;

			//update board states
			board[i][j] = player;
			$(this).addClass(player ? 'player0' : 'player1');

			checkReversi(i,j);

			checkWinners(i,j);
			
			//if as many clicks have been done as there are squares, it's a draw
			clicks++;
			if(clicks==size*size && !done)
			{
				elem.find('#status').html("It's a draw!");
				endGame();
			}


			//swap active player
			player = !player;
			elem.find('#name').toggleClass('player0 player1');
		});

	});
};


$('#game').ttrGame(3);

});

