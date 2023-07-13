let pointerSocket

Hooks.once("socketlib.ready", () => {
  
  pointerSocket = socketlib.registerModule("pointers");
  function point(userId, show, x, y, icon) {
   let user = game.users.get(userId)
   if (user.viewedScene!=canvas.scene.id) return;
   let size = canvas.grid.size*game.settings.get('pointers', 'sizeMultiplier');
   let $bubble = $(`#${userId}-talk-bubble`);
   if (!show) return $bubble.remove();
   if ($bubble.length) return $bubble.css({top: `${y-size}px`, left: `${x}px`})
   $bubble = $(`<div id="${userId}-talk-bubble" style="position: absolute;  top: ${y-size}px; left: ${x}px; ">
    <style>
    .talk-icon {
      font-size: ${size}px;
      ${game.settings.get('pointers', 'css')}
      color:${user.color};
    }
    #hud {pointer-events: all !important;}
    </style>
    <span class="talk-icon" style="">${icon}</span>
    </div>`);

    return  $(`#hud`).append($bubble);
  }
  pointerSocket.register("point", point);
  pointerSocket.emit = function(show, icon) {
  if (!show) {
   $(`#hud`).off('mousemove').css({cursor: 'unset'})
   return pointerSocket.executeForEveryone(point, game.user.id, false);
  }
  pointerSocket.icon = icon;
  
  $(`#hud`).on('mousemove', function(e){
   let position = (game.release?.generation < 11)?canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage):canvas.app.renderer.plugins.interaction.pointer.getLocalPosition(canvas.app.stage);
   pointerSocket.executeForEveryone(point, game.user.id, true, position.x, position.y, pointerSocket.icon);
  }).css({cursor: 'none'})
  let position = (game.release?.generation < 11)?canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage):canvas.app.renderer.plugins.interaction.pointer.getLocalPosition(canvas.app.stage);
  pointerSocket.executeForEveryone(point, game.user.id, true, position.x, position.y, icon);
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
    default: `<i class="fas fa-location-arrow fa-rotate-180"></i>`,
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
 game.settings.register('pointers', 'think', {
    name: `Think`,
    hint: `HTML for the think pointer `,
    scope: "world",
    type: String,
    default: `<i class="fas fa-lightbulb"></i>`,
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
 game.keybindings.register("pointers", "showArrow", {
     name: "Arrow",
     hint: "Show Arrow at cursor",
     editable: [{key: "KeyX"}],
     onDown: (e) => { return pointerSocket.emit(true, game.settings.get('pointers', 'arrow') ) },
     onUp: () => { return pointerSocket.emit(false) },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 game.keybindings.register("pointers", "showSpeak", {
     name: "Speak",
     hint: "Show speach bubble at cursor",
     editable: [{key: "KeyX", modifiers: [KeyboardManager.MODIFIER_KEYS.CONTROL] }],
     onDown: () => { return pointerSocket.emit(true, game.settings.get('pointers', 'speak') ) },
     onUp: () => { return pointerSocket.emit(false, "") },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 game.keybindings.register("pointers", "showThink", {
     name: "Think",
     hint: "Show light bulb at cursor",
     editable: [{key: "KeyX", modifiers: [KeyboardManager.MODIFIER_KEYS.SHIFT] }],
     onDown: (e) => { return pointerSocket.emit(true, game.settings.get('pointers', 'think') ) },
     onUp: () => { return pointerSocket.emit(false) },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 game.keybindings.register("pointers", "showPoint", {
     name: "Point",
     hint: "Show pointer at cursor",
     editable: [{key: "KeyX", modifiers: [KeyboardManager.MODIFIER_KEYS.SHIFT, KeyboardManager.MODIFIER_KEYS.CONTROL] }],
     onDown: (e) => { return pointerSocket.emit(true, game.settings.get('pointers', 'point') ) },
     onUp: () => { return pointerSocket.emit(false) },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 
});
