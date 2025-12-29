// const ALL_KEYS = [
//   '1',
//   '2',
//   '3',
//   '4',
//   '5',
//   '6',
//   '7',
//   '8',
//   '9',
//   'A',
//   'B',
//   'confirm',
// ];

// export function buildKeymap(player, context) {
//   const { events, interrupts, players } = context;

//   // 1. Neutral map
//   const map = {};
//   ALL_KEYS.forEach((key) => {
//     map[key] = {
//       enabled: false,
//       label: key.toUpperCase(),
//       actionId: null,
//       targetId: null,
//       type: null,
//     };
//   });

//   const resolveTarget = (n) => {
//     const id = Number(n);
//     return players.find((p) => p.id === id) || null;
//   };

//   //
//   // 2. INTERRUPTS OVERRIDE EVERYTHING
//   //
//   const myInterrupt = interrupts?.find((int) => int.actorId === player.id);

//   if (myInterrupt) {
//     const def = myInterrupt.actionDef;

//     def.input.allowed.forEach((key) => {
//       const target = key >= '1' && key <= '9' ? resolveTarget(key) : null;

//       map[key].enabled = true;
//       map[key].type = 'interrupt';
//       map[key].actionId = myInterrupt.id;
//       map[key].targetId = target?.id ?? null;
//     });

//     if (def.input.confirmReq) {
//       map.confirm.enabled = true;
//       map.confirm.type = 'interrupt';
//       map.confirm.actionId = myInterrupt.id;
//     }

//     return map; // interrupts block events
//   }

//   //
//   // 3. MULTIPLE EVENTS FOR THIS PLAYER
//   //
//   const myEvents = events
//     .filter((ev) => ev.participants.includes(player.id))
//     .sort((a, b) => a.createdAt - b.createdAt); // deterministic order

//   if (myEvents.length === 0) {
//     return map; // no events, no actions
//   }

//   // Pick the first event the player has NOT completed
//   const activeEvent =
//     myEvents.find((ev) => !ev.completedBy?.includes(player.id)) || myEvents[0];

//   const def = activeEvent.actionDef;

//   def.input.allowed.forEach((key) => {
//     const target = key >= '1' && key <= '9' ? resolveTarget(key) : null;

//     // must pass actionDef.conditions
//     if (target && !def.conditions({ actor: player, target })) return;

//     map[key].enabled = true;
//     map[key].type = 'event';
//     map[key].actionId = activeEvent.id;
//     map[key].targetId = target?.id ?? null;
//   });

//   if (def.input.confirmReq) {
//     map.confirm.enabled = true;
//     map.confirm.type = 'event';
//     map.confirm.actionId = activeEvent.id;
//   }

//   return map;
// }
