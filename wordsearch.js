(function(){
  'use strict';

  // Extend the element method
  Element.prototype.wordSeach = function(settings) {
    return new WordSeach(this, settings);
  }

  /**
   * Word search
   *
   * @param {Element} wrapWl the games wrap element
   * @param {Array} settings
   * constructor
   */
  function WordSeach(wrapEl, settings) {
    
    this.wrapEl = wrapEl;

    // Add `.ws-area` to wrap element
    this.wrapEl.classList.add('ws-area');

	
	var mid = gup('mid');
	
    // Default settings
    var default_settings = {
      'directions': ['W', 'N', 'WN', 'EN'],
      'gridSize': 18,
      'words': [
	     'throne',
		'palace',
		'tradition',
		'family',
		'descent',
		'royal',
		'kingdom',
		'prince',
		'law',
		'earl',
		'government',
		'charter',
		'sovereign',
		'orb',
		'commons'
	  ],
      'debug': false,
	  'condition' : 0,
	  'same' : true,
	  'test' : false
    }

    this.settings = Object.merge(settings, default_settings);
    //this.settings.condition = 5;   //need to remove this
   
	
    // Check the words length if it is overflow the grid
    if (this.parseWords(this.settings.gridSize)) {
      // Add words into the matrix data
      var isWorked = false;
	  
	  if (this.settings.test) {
			this.words = ['browser'];
	  }
	
      while (isWorked == false) {
        // initialize the application
        this.initialize();
		if (this.settings.test) {
			isWorked = this.testmatrix(this.settings.gridSize);
		} else {
		if (!this.settings.same) {
		       
			isWorked = this.addWords();
		} else {
		    isWorked = this.bobmatrix(this.settings.gridSize);
		}
		}
      }

      // Fill up the remaining blank items
      if (!this.settings.debug) {
	     if (!this.settings.test) {
			this.fillUpFools();
		 }
		//disable this to check earlystop
      }

      // Draw the matrix into wrap element
      this.drawmatrix();
	  
	  //added by bob to show score - require score function in the bob script
	  var currentscore = score();
	  document.getElementById("score").innerHTML = "Found " + currentscore + " out of " + this.settings.words.length + " words so far.";
    }
  }

  
  /**
   * Parse words
   * @param {Number} Max size
   * @return {Boolean}
   */
  WordSeach.prototype.parseWords = function(maxSize) {
    var itWorked = true;

    for (var i = 0; i < this.settings.words.length; i++) {
      // Convert all the letters to upper case
      this.settings.words[i] = this.settings.words[i].toUpperCase();

      var word = this.settings.words[i];
      if (word.length > maxSize) {
        alert('The length of word `' + word + '` is overflow the gridSize.');
        console.error('The length of word `' + word + '` is overflow the gridSize.');
        itWorked = false;
      }
    }

    return itWorked;
  }

  /**
   * Put the words into the matrix
   */
  WordSeach.prototype.addWords = function() {
	  //modified this function to make impossible puzzles when condition = 1



      
	  var condition = this.settings.condition;
	  var endoflist = this.settings.words.length;	//default to add all words
	  if (condition == 1) {
		endoflist = 3;					//if condition = 1 then only add first two words
	  }
	  
	  if (this.settings.test) {
		endoflist = 1;
      }
  
      var keepGoing = true,
        counter = 0,
        isWorked = true;

      while (keepGoing) {
        // Getting random direction
        var dir = this.settings.directions[Math.rangeInt(this.settings.directions.length - 1)],
          result = this.addWord(this.settings.words[counter], dir),
          isWorked = true;

        if (result == false) {
          keepGoing = false;
          isWorked = false;
        }

        counter++;
//        if (counter >= this.settings.words.length) {
// 			modified this line from original to creat earlystop when condition = 1
        if (counter >= endoflist) {
          keepGoing = false;
        }
		

      }

      return isWorked;
  }

  
  
  /**
   * Add word into the matrix
   *
   * @param {String} word
   * @param {Number} direction
   */
  WordSeach.prototype.addWord = function(word, direction) {
    var itWorked = true,
      directions = {
        'W': [0, 1], // Horizontal (From left to right)
        'N': [1, 0], // Vertical (From top to bottom)
        'WN': [1, 1], // From top left to bottom right
        'EN': [1, -1] // From top right to bottom left
      },
      row, col; // y, x

    switch (direction) {
      case 'W': // Horizontal (From left to right)
        var row = Math.rangeInt(this.settings.gridSize  - 1),
          col = Math.rangeInt(this.settings.gridSize - word.length);
        break;

      case 'N': // Vertical (From top to bottom)
        var row = Math.rangeInt(this.settings.gridSize - word.length),
          col = Math.rangeInt(this.settings.gridSize  - 1);
        break;

      case 'WN': // From top left to bottom right
        var row = Math.rangeInt(this.settings.gridSize - word.length),
          col = Math.rangeInt(this.settings.gridSize - word.length);
        break;

      case 'EN': // From top right to bottom left
        var row = Math.rangeInt(this.settings.gridSize - word.length),
          col = Math.rangeInt(word.length - 1, this.settings.gridSize - 1);
        break;

      default:
        var error = 'UNKNOWN DIRECTION ' + direction + '!';
        alert(error);
        console.log(error);
        break;
    }

    // Add words to the matrix
    for (var i = 0; i < word.length; i++) {
      var newRow = row + i * directions[direction][0],
        newCol = col + i * directions[direction][1];

      // The letter on the board
      var origin = this.matrix[newRow][newCol].letter;

      if (origin == '.' || origin == word[i]) {
        this.matrix[newRow][newCol].letter = word[i];
      } else {
        itWorked = false;
      }
    }

    return itWorked;
  }

  /**
   * Initialize the application
   */
  WordSeach.prototype.initialize = function() {
    /**
     * Letter matrix
     *
     * param {Array}
     */
    this.matrix = [];

    /**
     * Selection from
     * @Param {Object}
     */
    this.selectFrom = null;

    /**
     * Selected items
     */
    this.selected = [];
	this.initmatrix(this.settings.gridSize);

  }

  /**
   * Fill default items into the matrix
   * @param {Number} size Grid size
   */
  WordSeach.prototype.initmatrix = function(size) {
   var rsize = size;
   var csize = size
   if (this.settings.condition > 2) {
      rsize = 14;
      csize = 12;
   }
    for (var row = 0; row < rsize; row++) {
      for (var col = 0; col < csize; col++) {
        var item = {
          letter: '.', // Default value
          row: row,
          col: col
        }

        if (!this.matrix[row]) {
          this.matrix[row] = [];
        }

        this.matrix[row][col] = item;
      }
    }
  }

  WordSeach.prototype.testmatrix = function(size) {
    var test_matrix = [
	['.','.','.','.','.','.','.','.','.'],
	['.','B','R','O','W','S','E','R','.'],
	['.','.','.','.','.','.','.','.','.']
	];
	for (var row = 0; row<3; row++) {
      for (var col = 0; col < 9; col++) {
	    var item = {
			letter: test_matrix [row][col], // Default value
			row: row,
			col: col
		}
		
		this.matrix[row][col] = item;
	   }
	   }
	   return 1;
  }
  
  WordSeach.prototype.bobmatrix = function(size) {
	
    //for (var row = 0; row < size; row++) {
	//   if (!this.matrix[row]) {
    //      this.matrix[row] = [];
    //    }
	//}
	 	//puzzle 85 from jumbo word puzzle book volume 46, landolls, 1995, ashland, oh
	var control_matrix = [
[	'L',	'O', 	'E', 	'S', 	'P', 	'R', 	'E', 	'S', 	'S', 	'I', 	'V', 	'O', 	'C', 	'N', 	'A', 	'P', 	'S'	],
[	'B',	'D', 	'G', 	'A', 	'T', 	'A', 	'D', 	'A', 	'G', 	'I', 	'O', 	'M', 	'O', 	'G', 	'G', 	'A', 	'O'	],
[	'U',	'O', 	'O', 	'D', 	'N', 	'E', 	'C', 	'S', 	'E', 	'R', 	'C', 	'I', 	'C', 	'R', 	'R', 	'L', 	'V'	],
[	'P',	'T', 	'B', 	'I', 	'A', 	'S', 	'D', 	'O', 	'L', 	'C', 	'E', 	'U', 	'T', 	'A', 	'O', 	'A', 	'E'	],
[	'O',	'A', 	'O', 	'M', 	'O', 	'D', 	'N', 	'A', 	'Z', 	'R', 	'O', 	'F', 	'A', 	'N', 	'D', 	'C', 	'R'	],
[	'N',	'C', 	'T', 	'I', 	'A', 	'S', 	'E', 	'F', 	'E', 	'D', 	'R', 	'V', 	'V', 	'D', 	'L', 	'L', 	'E'	],
[	'E',	'R', 	'T', 	'N', 	'A', 	'H', 	'T', 	'E', 	'U', 	'C', 	'I', 	'R', 	'E', 	'I', 	'E', 	'K', 	'I'	],
[	'M',	'A', 	'E', 	'U', 	'L', 	'A', 	'N', 	'T', 	'D', 	'R', 	'N', 	'M', 	'O', 	'O', 	'G', 	'Y', 	'G'	],
[	'I',	'M', 	'R', 	'E', 	'L', 	'R', 	'A', 	'G', 	'F', 	'R', 	'I', 	'E', 	'A', 	'S', 	'A', 	'H', 	'N'	],
[	'C',	'T', 	'B', 	'N', 	'E', 	'P', 	'D', 	'B', 	'R', 	'O', 	'O', 	'O', 	'D', 	'O', 	'T', 	'U', 	'I'	],
[	'R',	'E', 	'I', 	'D', 	'G', 	'U', 	'N', 	'N', 	'A', 	'A', 	'R', 	'H', 	'S', 	'A', 	'O', 	'N', 	'K'	],
[	'O',	'E', 	'L', 	'O', 	'R', 	'S', 	'A', 	'E', 	'P', 	'S', 	'V', 	'T', 	'C', 	'O', 	'C', 	'C', 	'X'	],
[	'H',	'C', 	'I', 	'N', 	'O', 	'T', 	'A', 	'I', 	'D', 	'S', 	'S', 	'E', 	'E', 	'N', 	'A', 	'T', 	'K'	],
[	'K',	'S', 	'E', 	'A', 	'L', 	'M', 	'U', 	'C', 	'T', 	'W', 	'I', 	'N', 	'D', 	'S', 	'O', 	'R', 	'C'	],
[	'A',	'Z', 	'N', 	'E', 	'T', 	'N', 	'E', 	'M', 	'A', 	'I', 	'L', 	'R', 	'A', 	'P', 	'Z', 	'M', 	'I'	],
[	'C',	'B', 	'E', 	'A', 	'T', 	'O', 	'A', 	'T', 	'A', 	'M', 	'R', 	'E', 	'F', 	'D', 	'M', 	'A', 	'G'	],
[	'J',	'O', 	'Z', 	'A', 	'C', 	'G', 	'R', 	'N', 	'T', 	'A', 	'O', 	'Y', 	'D', 	'L', 	'G', 	'X', 	'C'	]
];

	var impossible_matrix = [
[	'L', 	'T', 	'Q', 	'T', 	'T', 	'T', 	'N', 	'A', 	'T', 	'S', 	'N', 	'O', 	'C', 	'N'	],
[	'B', 	'T', 	'U', 	'P', 	'O', 	'L', 	'Y', 	'N', 	'O', 	'M', 	'I', 	'A', 	'L', 	'B'	],
[	'L', 	'R', 	'A', 	'B', 	'A', 	'C', 	'R', 	'L', 	'T', 	'U', 	'S', 	'U', 	'T', 	'E'	],
[	'O', 	'I', 	'D', 	'L', 	'I', 	'N', 	'E', 	'A', 	'R', 	'L', 	'Y', 	'I', 	'M', 	'B'	],
[	'O', 	'N', 	'R', 	'I', 	'B', 	'S', 	'T', 	'C', 	'Z', 	'E', 	'R', 	'O', 	'O', 	'O'	],
[	'L', 	'O', 	'A', 	'B', 	'R', 	'A', 	'M', 	'E', 	'U', 	'E', 	'I', 	'N', 	'R', 	'L'	],
[	'M', 	'M', 	'T', 	'E', 	'L', 	'B', 	'A', 	'I', 	'R', 	'A', 	'V', 	'O', 	'I', 	'E'	],
[	'O', 	'I', 	'I', 	'O', 	'A', 	'B', 	'M', 	'C', 	'N', 	'L', 	'O', 	'N', 	'A', 	'A'	],
[	'N', 	'A', 	'C', 	'B', 	'I', 	'C', 	'D', 	'A', 	'U', 	'T', 	'N', 	'I', 	'L', 	'L'	],
[	'O', 	'L', 	'M', 	'N', 	'M', 	'Y', 	'O', 	'E', 	'Q', 	'B', 	'A', 	'E', 	'A', 	'G'	],
[	'M', 	'C', 	'C', 	'N', 	'O', 	'I', 	'I', 	'C', 	'G', 	'N', 	'I', 	'T', 	'I', 	'E'	],
[	'I', 	'U', 	'O', 	'O', 	'N', 	'M', 	'N', 	'B', 	'E', 	'R', 	'L', 	'C', 	'A', 	'B'	],
[	'A', 	'A', 	'N', 	'O', 	'I', 	'T', 	'A', 	'U', 	'Q', 	'E', 	'E', 	'R', 	'V', 	'R'	],
[	'L', 	'E', 	'E', 	'R', 	'B', 	'I', 	'R', 	'I', 	'T', 	'D', 	'E', 	'E', 	'Q', 	'A'	]
];

	var power_matrix = [
[	'K',	'X',	'N',	'A',	'V',	'K',	'W',	'U',	'D',	'K',	'B'	],
[	'C',	'O',	'F',	'F',	'E',	'E',	'N',	'O',	'E',	'T',	'S'	],
[	'E',	'Y',	'I',	'N',	'F',	'L',	'U',	'E',	'N',	'C',	'E'	],
[	'T',	'X',	'F',	'L',	'J',	'C',	'F',	'N',	'E',	'M',	'X'	],
[	'D',	'X',	'E',	'H',	'O',	'U',	'S',	'E',	'Y',	'W',	'D'	],
[	'A',	'A',	'M',	'C',	'A',	'R',	'I',	'S',	'U',	'R',	'R'	],
[	'O',	'U',	'E',	'M',	'U',	'S',	'T',	'R',	'G',	'L',	'A'	],
[	'S',	'Y',	'T',	'X',	'O',	'T',	'R',	'N',	'S',	'U',	'O'	],
[	'J',	'R',	'E',	'H',	'T',	'M',	'I',	'T',	'O',	'E',	'B'	],
[	'N',	'J',	'E',	'A',	'O',	'D',	'J',	'V',	'G',	'C',	'W'	],
[	'H',	'C',	'I',	'R',	'N',	'R',	'B',	'E',	'E',	'Q',	'G'	],
[	'K',	'C',	'O',	'L',	'C',	'L',	'I',	'O',	'J',	'E',	'K'	],
[	'M',	'U',	'H',	'E',	'C',	'Y',	'O',	'T',	'S',	'W',	'O'	],
[	'X',	'K',	'J',	'K',	'S',	'X',	'Z',	'O',	'Y',	'S',	'Z'	]
];

	var neutral_matrix = [
[	'I',	'O',	'E',	'E',	'I',	'U',	'P',	'E',	'A',	'S',	'J',	'Y' 	],
[	'N',	'M',	'S',	'E',	'T',	'N',	'E',	'T',	'P',	'U',	'N',	'H'	],
[	'A',	'E',	'N',	'R',	'U',	'T',	'A',	'S',	'P',	'E',	'R',	'T'	],
[	'U',	'T',	'U',	'O',	'R',	'R',	'U',	'I',	'Y',	'E',	'M',	'R'	],
[	'R',	'S',	'M',	'U',	'A',	'U',	'T',	'R',	'S',	'N',	'T',	'A'	],
[	'A',	'Y',	'N',	'U',	'U',	'E',	'U',	'P',	'U',	'S',	'U',	'E'	],
[	'N',	'S',	'E',	'U',	'R',	'C',	'V',	'E',	'N',	'U',	'S',	'S'	],
[	'U',	'R',	'C',	'M',	'R',	'E',	'R',	'S',	'S',	'J',	'N',	'S'	],
[	'S',	'A',	'N',	'E',	'P',	'T',	'U',	'N',	'E',	'R',	'T',	'U'	],
[	'N',	'L',	'M',	'P',	'P',	'L',	'U',	'T',	'O',	'A',	'U',	'N'	],
[	'S',	'O',	'U',	'T',	'A',	'E',	'A',	'T',	'R',	'T',	'C',	'U'	],
[	'H',	'S',	'U',	'P',	'P',	'P',	'T',	'S',	'R',	'O',	'O',	'U'	],
[	'E',	'R',	'S',	'M',	'U',	'S',	'R',	'A',	'M',	'U',	'R',	'U'	],
[	'T',	'E',	'N',	'M',	'M',	'S',	'E',	'M',	'O',	'O',	'N',	'N'	]
];

	var csize = size;
	var rsize = size;
	if (this.settings.condition > 2) { 
		csize = 12; 
		rsize = 14;
	}
	
	for (var row = 0; row < rsize; row++) {
      for (var col = 0; col < csize; col++) {
	    if(this.settings.condition == 0) {
			var item = {
			letter: control_matrix [row][col], // Default value
			row: row,
			col: col
			}
		} 
	     if(this.settings.condition == 1) {
			var item = {
			letter: impossible_matrix [row][col], // Default value
			row: row,
			col: col
			}
		}
	     
	     if(this.settings.condition == 4) {
			var item = {
			letter: neutral_matrix [row][col], // Default value
			row: row,
			col: col
			}
		}
		
	     
	     if(this.settings.condition == 5) {
			var item = {
			letter: power_matrix  [row][col], // Default value
			row: row,
			col: col
			}
		}
		
		this.matrix[row][col] = item;
	   }
	}
	return 1;
  }
  
  /**
   * Draw the matrix
   */
  WordSeach.prototype.drawmatrix = function() {
    var rowcount = this.settings.gridSize;
	var columncount = this.settings.gridSize;
	if (this.settings.test) { 
		rowcount = 3; 
		columncount = 9;
	}
	if (this.settings.condition > 2) {
		rowcount = 14;
		columncount = 11;
	}
	
	
    for (var row = 0; row < rowcount; row++) {
      // New row
      var divEl = document.createElement('div');
      divEl.setAttribute('class', 'ws-row');
      this.wrapEl.appendChild(divEl);

      for (var col = 0; col < columncount; col++) {
        var cvEl = document.createElement('canvas');
        cvEl.setAttribute('class', 'ws-col');
        cvEl.setAttribute('width', 25);
        cvEl.setAttribute('height', 25);

        // Fill text in middle center
        var x = cvEl.width / 2,
          y = cvEl.height / 2;

        var ctx = cvEl.getContext('2d');
        ctx.font = '400 18px Calibri';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333'; // Text color
        ctx.fillText(this.matrix[row][col].letter, x, y);

        // Add event listeners
        cvEl.addEventListener('mousedown', this.onMousedown(this.matrix[row][col]));
        cvEl.addEventListener('mouseover', this.onMouseover(this.matrix[row][col]));
        cvEl.addEventListener('mouseup', this.onMouseup());

        divEl.appendChild(cvEl);
      }
    }
  }

  /**
   * Fill up the remaining items
   */
  WordSeach.prototype.fillUpFools = function() {
    var rsize = this.settings.gridSize;
    var csize = this.settings.gridSize;
    if (this.settings.condition > 2) {
       rsize = 14;
       csize = 12;
    }
    for (var row = 0; row < rsize; row++) {
      for (var col = 0; col < csize; col++) {
        if (this.matrix[row][col].letter == '.') {
          // Math.rangeInt(65, 90) => A ~ Z
          this.matrix[row][col].letter = String.fromCharCode(Math.rangeInt(65, 90));
        }
      }
    }
  }

  /**
   * Returns matrix items
   * @param rowFrom
   * @param colFrom
   * @param rowTo
   * @param colTo
   * @return {Array}
   */
  WordSeach.prototype.getItems = function(rowFrom, colFrom, rowTo, colTo) {
    var items = [];

    if ( rowFrom === rowTo || colFrom === colTo || Math.abs(rowTo - rowFrom) == Math.abs(colTo - colFrom) ) {
      var shiftY = (rowFrom === rowTo) ? 0 : (rowTo > rowFrom) ? 1 : -1,
        shiftX = (colFrom === colTo) ? 0 : (colTo > colFrom) ? 1 : -1,
        row = rowFrom,
        col = colFrom;

      items.push(this.getItem(row, col));
      do {
        row += shiftY;
        col += shiftX;
        items.push(this.getItem(row, col));
      } while( row !== rowTo || col !== colTo );
    }

    return items;
  }

  /**
   * Returns matrix item
   * @param {Number} row
   * @param {Number} col
   * @return {*}
   */
  WordSeach.prototype.getItem = function(row, col) {
    return (this.matrix[row] ? this.matrix[row][col] : undefined);
  }

  /**
   * Clear the exist highlights
   */
  WordSeach.prototype.clearHighlight = function() {
    var selectedEls = document.querySelectorAll('.ws-selected');
    for (var i = 0; i < selectedEls.length; i++) {
      selectedEls[i].classList.remove('ws-selected');
    }
  }

  /**
   * Lookup if the wordlist contains the selected
   * @param {Array} selected
   */
  WordSeach.prototype.lookup = function(selected) {
  
  
    var words = [''];

    for (var i = 0; i < selected.length; i++) {
      words[0] += selected[i].letter;
    }
    words.push(words[0].split('').reverse().join(''));

    if (this.settings.words.indexOf(words[0]) > -1 ||
        this.settings.words.indexOf(words[1]) > -1) {
		
		
		//word has been found -- added this code to keep score - requires score function in bob script
		//also, added to strik found words and to check if already found before adding to score
	  var ele = document.getElementById(words[0])
	  
	  if(document.getElementById(words[0]).getAttribute("text-decoration") == 'none') {
		var currentscore = score();
	  	document.getElementById("score").innerHTML = "Found " + currentscore + " out of " + this.settings.words.length + " words so far.";
		document.getElementById(words[0]).style.setProperty("text-decoration", "line-through");
		document.getElementById(words[0]).setAttribute("text-decoration", "line-through");
	  }
		
	  
      for (var i = 0; i < selected.length; i++) {
        var row = selected[i].row + 1,
          col = selected[i].col + 1,
          el = document.querySelector('.ws-area .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');

        el.classList.add('ws-found');
      }
    }
  }

  /**
   * Mouse event - Mouse down
   * @param {Object} item
   */
  WordSeach.prototype.onMousedown = function(item) {
    var _this = this;
    return function() {
      _this.selectFrom = item;
    }
  }

  /**
   * Mouse event - Mouse move
   * @param {Object}
   */
  WordSeach.prototype.onMouseover = function(item) {
    var _this = this;
    return function() {
      if (_this.selectFrom) {
        _this.selected = _this.getItems(_this.selectFrom.row, _this.selectFrom.col, item.row, item.col);

        _this.clearHighlight();

        for (var i = 0; i < _this.selected.length; i ++) {
          var current = _this.selected[i],
            row = current.row + 1,
            col = current.col + 1,
            el = document.querySelector('.ws-area .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');

          el.className += ' ws-selected';
        }
      }
    }
  }

  /**
   * Mouse event - Mouse up
   */
  WordSeach.prototype.onMouseup = function() {
    var _this = this;
    return function() {
      _this.selectFrom = null;
      _this.clearHighlight();
      _this.lookup(_this.selected);
      _this.selected = [];
    }
  }

})();
