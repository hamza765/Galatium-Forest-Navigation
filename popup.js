var GAReloader = {
  onclickRegex : /.*'(.*)'.*/,
  which : 0,
  hp : /Hit Points:\s*(\d+)\/(\d+)/,
  stam : /Stamina:\s*(\d+)\/(\d+)/,
  
  forestListener : function(e) {
    GAReloader.which = e.which;
    GAReloader.move(e.which);
  },
  
  autoMove : function() {
    GAReloader.move(GAReloader.which);
  },
  
  move : function(key) {
    // Get the list of td's
    var frame = $('iframe').contents().find('#forest td');
    var target = false;
    
    var left, right, up, down, upleft, upright, downleft, downright;
    if(frame.length == 25) {
      upleft   = 6;
      up       = 7;
      upright  = 8;
      left     = 11;
      right    = 13;
      downleft = 16;
      down     = 17;
      downright= 18;
    } else if(frame.length == 49) {
      upleft   = 16;
      up       = 17; 
      upright  = 18;
      left     = 23;
      right    = 25;
      downleft = 30;
      down     = 31;
      downright= 32;
    }
    
    // Select the td that we're interested in
    switch(key) {
    case 55:
      target = frame[upleft];
      break;
    case 56:
      target = frame[up];
      break;
    case 57:
      target = frame[upright];
      break;
    
    case 52:
      target = frame[left];
      break;
    case 54:
      target = frame[right];
      break;
    
    case 49:
      target = frame[downleft];
      break;
    case 50:
      target = frame[down];
      break;
    case 51:
      target = frame[downright];
      break;
    }
    
    if(target)
      // Simulate a click on it
      $('iframe').attr('src', 'forestgrid.php' + GAReloader.onclickRegex.exec(target.onclick)[1]);
  }
};

jQuery(function() {
  if(window.location.pathname == '/Faerlyn/forest.php') {
    jQuery('body').keypress(GAReloader.forestListener);
    jQuery('iframe').contents().keypress(GAReloader.forestListener);
    
    jQuery('iframe').load(function() {
      var frame = jQuery('iframe').contents();
      var frameText = jQuery(frame).text();
      // Check number of hitpoints
      var hp = Number(GAReloader.hp.exec(frameText)[1]);
      if(hp <= 0) {
        jQuery.ajax({
          method : 'POST',
          url : '/heal.php?action=heal',
          success : GAReloader.autoMove
        });
        return true;
      }
      // Auto-loots bandit corpses
      var links = jQuery('a[href="?action=loot"]', frame);
      if(links.length > 0) {
        jQuery('iframe').attr('src', 'forestgrid.php?action=loot');
        return true;
      }
      // Alerts you if you should stop now
      var imgs = jQuery('#forest td img', frame);
      if(imgs.length > 1) {
        GAReloader.which = 0;
        return true;
      }
      // Discovered tokens
      
      // Check that we still have stamina to continue on
      var stam = Number(GAReloader.stam.exec(frameText)[1]);
      if(stam <= 0) {
        console.log("Stamina returns " + stam);
        return true;
      }
      
      GAReloader.autoMove();
    });
  }
});