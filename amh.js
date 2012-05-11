/**
 * A javascript class to type in ethiopic languages. I've supported all the letters
 * from Amharic and Tigrigna. Most characters used for other languages like Guragna, Mursi should
 * be working as long as they have unicode entry.
 *
 * 
 * please send bugs to my contact info below.
 *
 * Copyright:	(c) 2009 Daniel Goita Ferketa
 * Email:		dangoita@gmail.com
 * Title: 		Unicode Ethiopic Typing
 * Version:		1.0.0.0
 *
 *   
 */
// init Typing

if (typeof Typing=="undefined" || !Typing) {
	 var Typing = {};
}

// simplifying YUI calls
D = YAHOO.util.Dom;
E = YAHOO.util.Event;
K = YAHOO.util.KeyListener.KEY;

Typing.Ethopic = {
	

	/**
	 * all initialization code goes here.
	 */
	init : function () {
	
		E.addListener("ethiopicEntry", "keypress", this.onKeyPressed);  
	},
	
	/**
	 * swallow the keypressed event and map it to amharic unicode char code
	 */
	onKeyPressed : function (e, entry) {
		
		charCode = e.charCode ? e.charCode : e.keyCode;
		keyCode = e.keyCode;
		//var textValue = entry.value;
		
		var win = D.get('ethiopicTracker');
	
		var current = String.fromCharCode(charCode);
		if (keyCode == K.BACK_SPACE   ||
		//	keyCode == K.SPACE 		  ||
			keyCode == K.ENTER		  ||
			keyCode == K.ALT          ||
		    keyCode == K.CAPS_LOCK    ||
		    keyCode == K.CONTROL      ||
		    keyCode == K.DELETE       ||
		    keyCode == K.DOWN         ||
		    keyCode == K.END          ||
		    keyCode == K.HOME         ||
		    keyCode == K.LEFT         ||
		    keyCode == K.META         ||
		    keyCode == K.NUM_LOCK     ||
		    keyCode == K.PAGE_DOWN    ||
		    keyCode == K.PAGE_UP      || 
		    keyCode == K.PRINTSCREEN  ||
		    keyCode == K.RIGHT        ||
		    keyCode == K.SCROLL_LOCK  ||
		    keyCode == K.SHIFT        ||
		    keyCode == K.UP) {
		    win.value = '';
			return true;
		}
		
		
		var code = 	keyCode ? keyCode : charCode; 
		// handle new line, space and back space separetely
		// for YUI prevent default seem to have issues	
		switch (code) {
			case K.ENTER : 
				entry.value += '\n'; 
				win.value = '';
			return false;
		/*	case K.SPACE : 
				entry.value += ' ';
				win.value = '';
			return true;
			case K.BACK_SPACE :
				entry.value = entry.value.substring(0, entry.value.length - 1); 
				win.value = '';
			 return true;*/
		}
		
		// keep latin numbers
		// all okay to use symbols go here
		if ((charCode >= 0x21 && charCode <= 0x40) || (charCode >= 0x7B && charCode <= 0x7E)) {
			//entry.value += String.fromCharCode(charCode);
			win.value = '';
			return true;
		}
		
		// non supported chars
		if (charCode < 41 || (charCode > 0x5A && charCode < 0x61) || charCode > 0x7A){
			win.value = '';
			return true;
		}
		
		// non used letters
		if (!Typing.Ethopic.getConsonantUnicode(current) && !Typing.Ethopic.isVowel(current)) {
			win.value = '';
			return true;
		}
		
		var stateItems = win.value.split('');
		var char = stateItems.length > 0 ? stateItems[0] : '';
		var nxtChar = stateItems.length > 1 ? stateItems[1] : '';
		
		// reset conditions
		// len = 1 and next coming is not vowel except char is either 's','h','S' (isSsh)
		// len >= 2 and next is not vowel
		// len = 3 and char is not ssh 
		// len = 4 no questions asked
		if (stateItems.length == 4 ) win.value = '';
		else if (stateItems.length == 3 && !Typing.Ethopic.isDouble(char)) win.value = '';
		else if (stateItems.length >= 2 && !Typing.Ethopic.isVowel(current)) win.value = '';
		else if (stateItems.length == 2 && (Typing.Ethopic.isVowel(char) && Typing.Ethopic.isVowel(nxtChar))) win.value = '';
		else if (stateItems.length == 1 && !(Typing.Ethopic.isDouble(char) && char == current) && !Typing.Ethopic.areDouble(current, nxtChar) && !Typing.Ethopic.isVowel(current)) win.value = '';
	
		// should we reset the window
		if (win.value == '') {
			stateItems = win.value.split('');
		}
		
		// restore window state
		char = stateItems.length > 0 ? stateItems[0] : '';
		nxtChar = stateItems.length > 1 ? stateItems[1] : '';
		var nxtNxtChar = stateItems.length > 2 ? stateItems[2] : '';
		var nxtNxtNxtChar = stateItems.length > 3 ? stateItems[3] : '';
		
		
		// add new values to the window state
		if (stateItems.length == 0) char = String.fromCharCode(charCode);
		if (stateItems.length == 1) nxtChar = String.fromCharCode(charCode);
		if (stateItems.length == 2) nxtNxtChar = String.fromCharCode(charCode);
		if (stateItems.length == 3) nxtNxtNxtChar = String.fromCharCode(charCode);

		
		var unicodeCode = Typing.Ethopic.keyMap(char, nxtChar, nxtNxtChar, nxtNxtNxtChar);
		var futureState = char + nxtChar + nxtNxtChar + nxtNxtNxtChar;



		if (unicodeCode && nxtChar == ''){
			E.preventDefault(e);
			entry.value += String.fromCharCode(unicodeCode);
			win.value = futureState;
		}
		else if (unicodeCode) {
			E.preventDefault(e);
			entry.value = entry.value.substring(0, entry.value.length - 1) + String.fromCharCode(unicodeCode);
			win.value = futureState;
		}
		else {
			win.value = '';
		}

		
		// set the control
		//if (elem.innerHTML) elem.innerHTML = textValue;
		
		return true;
	},
	
	/**
	 * maps english keyboard to ethiopic keyboard without the need to switch
	 * system keyboard layout.
	 * @param int charCode current character code
	 * @param int prevCharCode char code before charCode
	 * @param int prevPrevCharCode char code before prevCharCode
	 */
	keyMap : function (char, nxtChar, nxtNxtChar, nxtNxtNxtChar) {
		var unicodeCode = 0;
		// amharic vowel
		if (this.isVowel(char)) {
			unicodeCode = this.getVowelUnicode(char);
			if (char == 'i' && nxtChar == 'e') unicodeCode += 2;
			if (char == 'e' && nxtChar == 'a') unicodeCode -= 2;
			if (char == 'a' && nxtChar == 'e') unicodeCode += 7;
			return unicodeCode;
		}
		
		// get code of the stem
		unicodeCode = this.getConsonantUnicode(char);
		
		if (this.isDouble(char)) {
			nxtUnicodeCode = this.getConsonantUnicode(nxtChar);
			if ((unicodeCode != 0) && (unicodeCode == nxtUnicodeCode)) {
				if (unicodeCode == 0x1230)  unicodeCode = 0x1220;
				else if (unicodeCode == 0x1200) unicodeCode = 0x1280;
				else if (unicodeCode == 0x1338) unicodeCode = 0x1340;
				
				// shift up
				nxtChar = nxtNxtChar;
				nxtNxtChar = nxtNxtNxtChar;
			}
		}
	
		// tigrigna
		var rOffset = 0;
		if ( (char == 'Q' || 
			  char == 'K' || 
			  char == 'g' || 
			  char == 'q' ||
			  char == 'h' || 
			  char == 'k') && 
			  nxtChar == 'u' && nxtNxtChar != '') {
			
			if (char == 'Q') unicodeCode = 0x1258;
			else if (char == 'K') unicodeCode = 0x12C0;
			else if (char == 'g') unicodeCode = 0x1310;
			else if (char == 'q') unicodeCode = 0x1248;
			else if (char == 'h') unicodeCode = 0x1288;
			else if (char == 'k') unicodeCode = 0x12B0;
			
			// shift up
			nxtChar = nxtNxtChar;
			nxtNxtChar = nxtNxtNxtChar;
		}
		
		// see what extesnsion the stem needs
		switch (nxtChar) {
			case 'e': unicodeCode += 0; break; //1st extension
			case 'u': unicodeCode += 1; break; //2nd extension
			case 'i': unicodeCode += 2; break; //3rd extension
			case 'a': unicodeCode += 3; break; //4th extension
			// case 'ie': unicodeCode += 4; break; (see below) //5th  extension
			case '': unicodeCode += 5; break;	//6th extension
			case 'o': unicodeCode += 6; break;  //7th extension
		}
			
		// the 5th extension
		if (nxtNxtChar == 'e') unicodeCode += 2;
		
		// the 8th extension
		if (nxtNxtChar == 'a') unicodeCode += 6;

		
		return unicodeCode;
	},
	
	/*
	 * getConsonantUnicode
	 * returns consonant unicode
	 * if char is not consonant returns zero
	 *
	 */
	getConsonantUnicode : function (char) {
		var unicodeCode = 0;
		switch (char) {
			case 'h': unicodeCode = 0x1200; break; // haletaw ha
			case 'l': unicodeCode = 0x1208; break; // le
			case 'H': unicodeCode = 0x1210; break; // hameruha
			case 'm': unicodeCode = 0x1218; break; // me
			// case 's': unicodeCode = 0x1220; break; // se (specially handled below)
			case 'r': unicodeCode = 0x1228; break; // re
			case 's': unicodeCode = 0x1230; break; // haileselase se 
			case 'x': unicodeCode = 0x1238; break; // she as in shera
			case 'q': unicodeCode = 0x1240; break; // ke as in kebeto
			case 'b': unicodeCode = 0x1260; break; // be
			case 'v': unicodeCode = 0x1268; break; // ve
			case 't': unicodeCode = 0x1270; break; // te as in tedla
			case 'c': unicodeCode = 0x1278; break; // che as in chernet
			
			// case 'h': unicodeCode = 0x1280; break; // negusu or haileselase ha (specially handled below)
			
			case 'n': unicodeCode = 0x1290; break; // ne
			case 'N': unicodeCode = 0x1298; break; // gne
			
			// case : vowels (handled separetly)
			
			case 'k': unicodeCode = 0x12A8; break; // ke
			case 'K': unicodeCode = 0x12B8; break; // he as in heiyre
			case 'w': unicodeCode = 0x12C8; break; // we
			case 'A': unicodeCode = 0x12D0; break; // aa as in eyen
			case 'z': unicodeCode = 0x12D8; break; // ze
			case 'Z': unicodeCode = 0x12E0; break; // ze as in zantila
			case 'y': unicodeCode = 0x12E8; break; // ye 
			case 'd': unicodeCode = 0x12F0; break; // de
			case 'j': unicodeCode = 0x1300; break; // je
			case 'g': unicodeCode = 0x1308; break; // ge
			case 'T': unicodeCode = 0x1320; break; // te as in tatate
			case 'C': unicodeCode = 0x1328; break; // che as in chefe
			case 'P': unicodeCode = 0x1330; break; // pe as in pagume
			case 'S': unicodeCode = 0x1338; break; // se as in tsadiq
			// case 'S': unicodeCode = 0x1340; break; // se as in tsehay
			case 'f': unicodeCode = 0x1348; break; // fe
			case 'p': unicodeCode = 0x1350; break; // pe as in police
			
			case 'Q': unicodeCode = 0x1250; break; // tigrigna
			case 'D': unicodeCode = 0x12F8; break; // mursi
			case 'G': unicodeCode = 0x1318; break; //Awngi/Blin?Kayla?kufal?Quara?Qimant?Zamtanga
			
			
		}
		return unicodeCode;	
	},
	
	/**
	 * returns unicode code of an ethiopic vowel
	 *
	 */
	 getVowelUnicode : function (char) {
	 	var unicodeCode = 0;
	 	switch (char) {
			// vowel (ethiopic/latin)
			case 'a': unicodeCode = 0x12A0; break; // aa
			case 'u': unicodeCode = 0x12A1; break; // au
			case 'i': unicodeCode = 0x12A2; break; // ai
			// case 'ea': unicodeCode = 0x12A3; break; // a
			// case 'ie': unicodeCode = 0x12A4; break; // aei
			case 'e': unicodeCode = 0x12A5; break; // a
			case 'o': unicodeCode = 0x12A6; break; // ao
		}
		return unicodeCode;
	 },
	 
	 /**
	  * isDouble
	  * checks if a consonant is possible double like 's' and 'h'
	  */
	 isDouble : function (char) {
	 	return char == 's' || 
	 		   char == 'h' || 
	 		   char == 'S' || 
	 		   char == 'K' || 
	 		   char == 'Q' || 
	 		   char == 'g' || 
	 		   char == 'q' || 
	 		   char == 'h' || 
	 		   char == 'k';
	 },

	 /**
	  * areDouble
	  * checks if a consonant is possible double like 's' and 'h'
	  */
	 areDouble : function (char, nxt) {
	 	return (char == nxt || ((char == 'K' ||
	 						     char == 'Q' || 
	 						     char == 'q' || 
	 						     char == 'g' || 
	 						     char == 'k' || 
	 						     char == 'h') && 
	 						     nxt == 'u')
	 						     ) && this.isDouble(char);
	 },
	 
	/**
	 * is vowel
	 * determins if a keyCode is vowel i.e. one of 
	 * a u i a o
	 */
	 isVowel : function (char) {
	 	switch (char) {
	 		case 'a': return true;
	 		case 'u': return true;
	 		case 'i': return true;
	 		case 'e': return true;
	 		case 'o': return true;
	 	}
	 	return false;
	 }
};
