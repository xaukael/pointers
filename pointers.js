let pointerSocket

Hooks.once("socketlib.ready", () => {
  
  pointerSocket = socketlib.registerModule("pointers");
  function point(userId, show, x, y, icon, quadrant) {
   let user = game.users.get(userId);
   if (user.viewedScene!=canvas.scene.id) return;
   let size = canvas.grid.size*game.settings.get('pointers', 'sizeMultiplier');
   let top = y;
   let left = x;
   if (quadrant == "0") {
    top -= size/2;
    left -= size/2;
   }
   if (quadrant == "1")  {
    top -= size;
   }
   if (quadrant == "2")  {
    top -= size;
    left -= size;
   }
   if (quadrant == "3")  {
    left -= size;
   }
   let $pointer = $(`#${userId}-talk-bubble`);
   if (!show) {
    if (game.user.id!=userId) canvas.controls._cursors[userId].alpha = 1;
    return $pointer.remove();
   }
   if ($pointer.length) return $pointer.css({top: `${top}px`, left: `${left}px`})
   $pointer = $(`<div id="${userId}-talk-bubble" style="position: absolute;  top: ${top}px; left: ${left}px; display:block !important;">
    ${game.settings.get('pointers', 'element')=='hud'?'<style>#hud{pointer-events:all;}</style>':''}
    <span class="talk-icon" style="font-size: ${size}px; color:${user.color}; ${game.settings.get('pointers', 'css')}">${icon}</span>
    </div>`);
    
    if (game.user.id!=userId) canvas.controls._cursors[userId].alpha = 0;
    return  $(`#hud`).append($pointer);
  }
    //#hud {pointer-events: all !important;}
  pointerSocket.register("point", point);
  pointerSocket.emit = function(show, icon, quadrant) {
   if (!show) {
    $(`#${game.settings.get('pointers', 'element')}`).off('mousemove').css({cursor: 'unset'})
    return pointerSocket.executeForEveryone(point, game.user.id, false);
   }
   pointerSocket.icon = icon;
   
   $(`#${game.settings.get('pointers', 'element')}`).on('mousemove', function(e){

    let position 
     if (game.release?.generation>=12) {
         let {x,y} = canvas.mousePosition
         position = {x, y}
     }
     else position = (game.release?.generation < 11)?canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage):canvas.app.renderer.plugins.interaction.pointer.getLocalPosition(canvas.app.stage);
    pointerSocket.executeForEveryone(point, game.user.id, true, position.x, position.y, pointerSocket.icon, quadrant);
   }).css({cursor: 'none'})
   
   let position 
    if (game.release?.generation>=12) {
         let {x,y} = canvas.mousePosition
         position = {x, y}
     }
     else position = (game.release?.generation < 11)?canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage):canvas.app.renderer.plugins.interaction.pointer.getLocalPosition(canvas.app.stage);
   pointerSocket.executeForEveryone(point, game.user.id, true, position.x, position.y, icon, quadrant);
 }
});

Hooks.on('renderSettingsConfig', (app, html)=>{
 let faLink = $(`<a href="https://fontawesome.com/search?o=r&m=free" target="_blank">Find Icons</a>`);
 html.find('section[data-tab=pointers] p.notes:contains("HTML")').append(faLink)
});

Hooks.once('init', () => {
  game.settings.register('pointers', 'css', {
    name: `CSS`,
    hint: `CSS Style to apply to pointers`,
    scope: "world",
    type: String,
    default: "text-shadow: 0 0 8px #000000; opacity: .9;",
    config: true  
 });
 game.settings.register('pointers', 'sizeMultiplier', {
    name: `Grid Size Multiplier`,
    hint: `Scale of pointer to grid size`,
    scope: "world",
    type: Number,
    default: 1,
    config: true  
 });
 game.settings.register('pointers', 'arrow', {
    name: `Arrow`,
    hint: `HTML for the arrow pointer `,
    scope: "world",
    type: String,
    default: `<i class="fas fa-location-arrow fa-rotate-270"></i>`,
    config: true  
 });
 game.settings.register('pointers', 'arrow-position', {
    name: `Arrow Position`,
    hint: `Quadrant for the arrow pointer `,
    scope: "world",
    type: String,
    choices: { "0": "Origin", "1": "I", "2": "II", "3": "III", "4": "IV" },
    default: "4",
    config: true  
 });
 
 game.settings.register('pointers', 'speak', {
    name: `Speak`,
    hint: `HTML for the speak pointer `,
    scope: "world",
    type: String,
    default: `<i class="fas fa-comment"></i>`,
    config: true  
 });
 game.settings.register('pointers', 'speak-position', {
    name: `Speak Position`,
    hint: `Quadrant for the speak pointer `,
    scope: "world",
    type: String,
    choices: { "0": "Origin", "1": "I", "2": "II", "3": "III", "4": "IV" },
    default: "1",
    config: true  
 });
 
 game.settings.register('pointers', 'think', {
    name: `Think`,
    hint: `HTML for the think pointer `,
    scope: "world",
    type: String,
    default: `<i class="fas fa-lightbulb"></i>`,
    config: true  
 });
 game.settings.register('pointers', 'think-position', {
    name: `Think Position`,
    hint: `Quadrant for the think pointer `,
    scope: "world",
    type: String,
    choices: { "0": "Origin", "1": "I", "2": "II", "3": "III", "4": "IV" },
    default: "1",
    config: true  
 });
 
 game.settings.register('pointers', 'point', {
    name: `Point`,
    hint: `HTML for the point pointer `,
    scope: "world",
    type: String,
    default: `<i class="fas fa-hand-point-down"></i>`,
    config: true  
 });
 game.settings.register('pointers', 'point-position', {
    name: `Point Position`,
    hint: `Quadrant for the point pointer `,
    scope: "world",
    type: String,
    choices: { "0": "Origin", "1": "I", "2": "II", "3": "III", "4": "IV" },
    default: "1",
    config: true  
 });
 
 game.settings.register('pointers', 'element', {
    name: `Mouse Move Event Element`,
    hint: `Where the mouse events originate. Choosing board will allow interraction with the canvas, but has trouble with the cursor reappearing. Choosing hud will prevent the cursor reappearing, but does not allow for interraction with the canvas while pointing.`,
    scope: "client",
    choices: { "board": "board", "hud": "hud" },
    type: String,
    default: `board`,
    config: true  
 });
 game.keybindings.register("pointers", "showArrow", {
     name: "Arrow",
     hint: "Show Arrow at cursor",
     editable: [{key: "KeyX"}],
     onDown: (e) => { return pointerSocket.emit(true, game.settings.get('pointers', 'arrow'), game.settings.get('pointers', 'arrow-position') ) },
     onUp: () => { return pointerSocket.emit(false) },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 game.keybindings.register("pointers", "showSpeak", {
     name: "Speak",
     hint: "Show speach bubble at cursor",
     editable: [{key: "KeyX", modifiers: [KeyboardManager.MODIFIER_KEYS.CONTROL] }],
     onDown: () => { return pointerSocket.emit(true, game.settings.get('pointers', 'speak'), game.settings.get('pointers', 'speak-position')  ) },
     onUp: () => { return pointerSocket.emit(false, "") },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 game.keybindings.register("pointers", "showThink", {
     name: "Think",
     hint: "Show light bulb at cursor",
     editable: [{key: "KeyX", modifiers: [KeyboardManager.MODIFIER_KEYS.SHIFT] }],
     onDown: (e) => { return pointerSocket.emit(true, game.settings.get('pointers', 'think'), game.settings.get('pointers', 'think-position')  ) },
     onUp: () => { return pointerSocket.emit(false) },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 game.keybindings.register("pointers", "showPoint", {
     name: "Point",
     hint: "Show pointer at cursor",
     editable: [{key: "KeyX", modifiers: [KeyboardManager.MODIFIER_KEYS.SHIFT, KeyboardManager.MODIFIER_KEYS.CONTROL] }],
     onDown: (e) => { return pointerSocket.emit(true, game.settings.get('pointers', 'point'), game.settings.get('pointers', 'point-position')  ) },
     onUp: () => { return pointerSocket.emit(false) },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 
});
