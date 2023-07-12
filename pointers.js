let pointerSocket

Hooks.once("socketlib.ready", () => {
  
  pointerSocket = socketlib.registerModule("pointers");
  function point(userId, show, x, y, icon) {
   let user = game.users.get(userId)
   if (user.viewedScene!=canvas.scene.id) return;
   let size = canvas.grid.size;
   let $bubble = $(`#${userId}-talk-bubble`);
   if (!show) return $bubble.remove();
   if ($bubble.length) return $bubble.css({top: `${y-size}px`, left: `${x}px`})
   $bubble = $(`<div id="${userId}-talk-bubble" style="position: absolute;  top: ${y-size}px; left: ${x}px; ">
    <style>
    .talk-icon {
      color: var(--color-text-light-2);
      cursor: none;
      pointer-events: all !important;
      font-size: ${size}px;
      text-shadow: 0 0 8px #000000;
      opacity: .9;
    }
    #hud {pointer-events: all !important;}
    </style>
    <span class="talk-icon" style="color:${user.color}"><i class="fas ${icon}"></i></span>
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

Hooks.once('init', () => {
 game.keybindings.register("pointers", "showArrow", {
     name: "Arrow",
     hint: "Show Arrow at cursor",
     editable: [{key: "KeyX"}],
     onDown: (e) => { return pointerSocket.emit(true, "fa-location-arrow fa-rotate-180") },
     onUp: () => { return pointerSocket.emit(false) },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 game.keybindings.register("pointers", "showSpeak", {
     name: "Speak",
     hint: "Show speach bubble at cursor",
     editable: [{key: "KeyX", modifiers: [KeyboardManager.MODIFIER_KEYS.CONTROL] }],
     onDown: () => { return pointerSocket.emit(true, "fa-comment") },
     onUp: () => { return pointerSocket.emit(false, "") },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 game.keybindings.register("pointers", "showThink", {
     name: "Think",
     hint: "Show light bulb at cursor",
     editable: [{key: "KeyX", modifiers: [KeyboardManager.MODIFIER_KEYS.SHIFT] }],
     onDown: (e) => { return pointerSocket.emit(true, "fa-lightbulb") },
     onUp: () => { return pointerSocket.emit(false) },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
 game.keybindings.register("pointers", "showPoint", {
     name: "Point",
     hint: "Show pointer at cursor",
     editable: [{key: "KeyX", modifiers: [KeyboardManager.MODIFIER_KEYS.SHIFT, KeyboardManager.MODIFIER_KEYS.CONTROL] }],
     onDown: (e) => { return pointerSocket.emit(true, "fa-hand-point-down") },
     onUp: () => { return pointerSocket.emit(false) },      
     precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
 });
});
