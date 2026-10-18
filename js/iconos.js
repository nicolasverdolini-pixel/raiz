// Íconos ilustrados de Raíz: dibujos chiquitos a color, con volumen, en una caja de 48 × 48.

const IL = {
  // Áreas
  cuerpo: '<path d="M24 41S8 31 8 19a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 12-16 22-16 22z" fill="#e0607e"/><path d="M14 17a4 4 0 0 1 4-4" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/><path d="M10 24h8l3-5 4 10 3-5h10" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  mente: '<path d="M24 10c-6-4-14-1-14 6-4 2-4 9 0 11-1 6 5 10 10 8 2 3 6 3 8 0 5 2 11-2 10-8 4-2 4-9 0-11 0-7-8-10-14-6z" fill="#b3a3e6"/><path d="M24 12v26M17 18c3 1 4 4 4 6M31 18c-3 1-4 4-4 6M16 30c3 0 5-2 5-4M32 30c-3 0-5-2-5-4" stroke="#7a68c4" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
  casa: '<path d="M8 22L24 9l16 13v17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill="#f2c27a"/><path d="M5 23L24 7l19 16" stroke="#c45a3a" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="19" y="27" width="10" height="14" rx="2" fill="#a5672f"/><rect x="30" y="24" width="6" height="6" rx="1" fill="#bfe0ee"/>',
  trabajo: '<rect x="6" y="15" width="36" height="25" rx="5" fill="#5f8fbf"/><path d="M18 15v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" stroke="#3d6383" stroke-width="3.5" fill="none"/><rect x="6" y="24" width="36" height="5" fill="#3d6383"/><rect x="21" y="23" width="6" height="7" rx="1.5" fill="#f2c230"/>',
  vinculos: '<path d="M18 36S6 28 6 19a6.5 6.5 0 0 1 12-3.5A6.5 6.5 0 0 1 30 19c0 9-12 17-12 17z" fill="#f08aa6"/><path d="M31 41s-10-6.5-10-14a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 7.5-10 14-10 14z" fill="#e0607e"/>',

  // Tipos de misión y secciones
  raiz: '<path d="M24 6v18" stroke="#8a6a45" stroke-width="5" stroke-linecap="round"/><path d="M24 22c-3 6-9 9-13 18M24 22c3 6 9 9 13 18M24 24v18" stroke="#a5672f" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M24 10c-6-6-13-4-14 1 6 3 11 2 14-1zM24 10c6-6 13-4 14 1-6 3-11 2-14-1z" fill="#6aa65a"/>',
  rama: '<path d="M8 40C16 30 26 22 40 10" stroke="#8a6a45" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="18" cy="24" rx="7" ry="4" transform="rotate(-50 18 24)" fill="#6aa65a"/><ellipse cx="30" cy="27" rx="7" ry="4" transform="rotate(20 30 27)" fill="#86bf6c"/><ellipse cx="34" cy="13" rx="6" ry="3.5" transform="rotate(-40 34 13)" fill="#6aa65a"/>',
  hoja: '<path d="M10 38C8 20 22 8 40 8c0 18-12 32-30 30z" fill="#6aa65a"/><path d="M10 38C18 28 26 20 36 12" stroke="#3f7a3a" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M18 20c4 0 6 2 7 4" stroke="#a6d68a" stroke-width="2" fill="none" stroke-linecap="round"/>',
  fruto: '<circle cx="24" cy="28" r="14" fill="#e65a4a"/><path d="M24 14c0-4 2-7 5-8" stroke="#7a5a3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M26 12c4-4 10-3 11 1-4 3-8 3-11-1z" fill="#6aa65a"/><ellipse cx="18" cy="23" rx="3.5" ry="5" fill="#fff" opacity=".45"/>',
  estrella: '<path d="M24 5l5.6 12 13 1.6-9.6 9 2.6 13L24 34l-11.6 6.6 2.6-13-9.6-9 13-1.6z" fill="#f2c230"/><path d="M24 11l3.6 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>',
  regalo: '<rect x="7" y="18" width="34" height="9" rx="2" fill="#e0607e"/><rect x="9" y="27" width="30" height="15" rx="2" fill="#f08aa6"/><rect x="21" y="18" width="6" height="24" fill="#f2c230"/><path d="M24 18c-3-8-12-8-10-2 1 3 7 2 10 2zM24 18c3-8 12-8 10-2-1 3-7 2-10 2z" fill="#f2c230"/>',

  // Barra de juego
  llama: '<path d="M24 44c8 0 14-6 14-14 0-6-3-10-7-14 .5 4-2 7-4 7 0-6-3-13-9-19 1 7-2 11-5 14-3 3-5 7-5 12 0 8 7 14 16 14z" fill="#f28c3a"/><path d="M24 44c4 0 7-3 7-7 0-3-2-5-4-7 0 2-1 3-2 3 0-3-1-6-4-8 0 4-2 6-3 7-1 2-2 3-2 5 0 4 4 7 8 7z" fill="#f6d55c"/>',
  corazon: '<path d="M24 42S6 31 6 18a9 9 0 0 1 18-4 9 9 0 0 1 18 4c0 13-18 24-18 24z" fill="#e8475f"/><path d="M13 15a5 5 0 0 1 5-4" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".6"/>',
  semilla: '<path d="M24 5c9 6 14 15 14 23a14 14 0 0 1-28 0c0-8 5-17 14-23z" fill="#d9a441"/><path d="M24 5c9 6 14 15 14 23a14 14 0 0 1-14 14z" fill="#c18a2c"/><path d="M24 14v26" stroke="#9a6a1a" stroke-width="2" stroke-linecap="round"/><ellipse cx="18" cy="24" rx="2.5" ry="5" fill="#fff" opacity=".45"/>',
  gota: '<path d="M24 4s14 15 14 25a14 14 0 0 1-28 0C10 19 24 4 24 4z" fill="#6fb6e0"/><path d="M24 4s14 15 14 25a14 14 0 0 1-14 14z" fill="#4f9fd0"/><ellipse cx="18" cy="28" rx="3" ry="6" fill="#fff" opacity=".55"/>',

  // Pestañas
  t_hoy: '<circle cx="24" cy="24" r="10" fill="#f2c230"/><g stroke="#f2a640" stroke-width="3.5" stroke-linecap="round"><path d="M24 4v5M24 39v5M4 24h5M39 24h5M10 10l3.5 3.5M34.5 34.5L38 38M38 10l-3.5 3.5M13.5 34.5L10 38"/></g>',
  t_arbol: '<rect x="21" y="26" width="6" height="16" rx="2" fill="#8a6a45"/><circle cx="24" cy="18" r="12" fill="#5c9a5a"/><circle cx="15" cy="24" r="8" fill="#6aa65a"/><circle cx="33" cy="24" r="8" fill="#6aa65a"/><circle cx="20" cy="14" r="4" fill="#86bf6c"/>',
  t_bosque: '<path d="M14 6L4 26h20z" fill="#3f7a3a"/><path d="M14 14L6 30h16z" fill="#4f8a58"/><rect x="12" y="30" width="4" height="10" fill="#8a6a45"/><circle cx="33" cy="22" r="11" fill="#6aa65a"/><rect x="31" y="31" width="4" height="11" fill="#8a6a45"/><path d="M2 42h44" stroke="#a6c48c" stroke-width="3" stroke-linecap="round"/>',
  t_premios: '<rect x="7" y="18" width="34" height="9" rx="2" fill="#e0607e"/><rect x="9" y="27" width="30" height="15" rx="2" fill="#f08aa6"/><rect x="21" y="18" width="6" height="24" fill="#f2c230"/><path d="M24 18c-3-8-12-8-10-2 1 3 7 2 10 2zM24 18c3-8 12-8 10-2-1 3-7 2-10 2z" fill="#f2c230"/>',
  t_ajustes: '<path d="M24 6l4 4 6-1 1 6 5 3-3 5 3 5-5 3-1 6-6-1-4 4-4-4-6 1-1-6-5-3 3-5-3-5 5-3 1-6 6 1z" fill="#9aa8b4"/><circle cx="24" cy="24" r="7" fill="#eef2f5"/>',

  // Misiones: cuerpo
  libro: '<path d="M6 12c6-2 12-2 18 2v28c-6-4-12-4-18-2z" fill="#6f9fd8"/><path d="M42 12c-6-2-12-2-18 2v28c6-4 12-4 18-2z" fill="#4f84c4"/><path d="M10 18h9M10 23h9M29 18h9M29 23h9" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>',
  zapatilla: '<path d="M6 34c0-5 3-9 7-12l6-6c2 4 7 6 11 6l9 4c3 1 4 4 4 8v2H6z" fill="#e65a4a"/><path d="M6 36h37v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" fill="#fff6e6"/><path d="M20 20l3 3M23 17l3 3" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M2 30h6M0 24h7" stroke="#a6c4e0" stroke-width="2.5" stroke-linecap="round"/>',
  pesa: '<rect x="14" y="21" width="20" height="6" rx="2" fill="#9aa3a8"/><rect x="6" y="12" width="8" height="24" rx="3" fill="#4d5b6a"/><rect x="34" y="12" width="8" height="24" rx="3" fill="#4d5b6a"/><rect x="2" y="17" width="5" height="14" rx="2" fill="#6a7888"/><rect x="41" y="17" width="5" height="14" rx="2" fill="#6a7888"/>',
  cronometro: '<circle cx="24" cy="27" r="16" fill="#f2a640"/><circle cx="24" cy="27" r="12" fill="#fff6e6"/><rect x="20" y="4" width="8" height="5" rx="2" fill="#c97a2a"/><path d="M24 27V18M24 27l6 4" stroke="#c45a3a" stroke-width="3" stroke-linecap="round"/>',
  loto: '<path d="M24 38c-6-6-6-18 0-26 6 8 6 20 0 26z" fill="#f08aa6"/><path d="M24 38c-10 0-16-10-15-18 8 2 13 9 15 18zM24 38c10 0 16-10 15-18-8 2-13 9-15 18z" fill="#e0607e"/><path d="M8 40h32" stroke="#6aa65a" stroke-width="3.5" stroke-linecap="round"/>',
  bici: '<circle cx="12" cy="32" r="8" fill="none" stroke="#3d6383" stroke-width="3.5"/><circle cx="36" cy="32" r="8" fill="none" stroke="#3d6383" stroke-width="3.5"/><path d="M12 32l8-14h10l6 14M20 18l6 14h-14M28 14h6" stroke="#e65a4a" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  escalera: '<path d="M6 42h10v-8h8v-8h8v-8h10V8" stroke="#a5672f" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M6 42h10v-8h8v-8h8v-8h10V8v34H6z" fill="#f2c27a"/>',
  montana: '<path d="M2 42L18 14l10 16 6-8 12 20z" fill="#6f8f7a"/><path d="M18 14l5 8-4 2-3-3-4 3z" fill="#fff"/><circle cx="38" cy="10" r="5" fill="#f2c230"/>',
  medalla: '<path d="M14 4h8l4 14-8 2zM34 4h-8l-4 14 8 2z" fill="#6f9fd8"/><circle cx="24" cy="31" r="12" fill="#f2c230"/><circle cx="24" cy="31" r="8" fill="#e2a52a"/><path d="M24 26l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#fff6e6"/>',
  vaso: '<path d="M12 8h24l-3 32a3 3 0 0 1-3 2H18a3 3 0 0 1-3-2z" fill="#d8eef8"/><path d="M13.5 20h21l-2 20a3 3 0 0 1-3 2H18.5a3 3 0 0 1-3-2z" fill="#6fb6e0"/><ellipse cx="20" cy="28" rx="2" ry="5" fill="#fff" opacity=".6"/>',
  sol: '<circle cx="24" cy="24" r="10" fill="#f2c230"/><g stroke="#f2a640" stroke-width="3.5" stroke-linecap="round"><path d="M24 4v5M24 39v5M4 24h5M39 24h5M10 10l3.5 3.5M34.5 34.5L38 38M38 10l-3.5 3.5M13.5 34.5L10 38"/></g>',
  cruz: '<rect x="6" y="6" width="36" height="36" rx="10" fill="#fff6e6"/><path d="M19 12h10v7h7v10h-7v7H19v-7h-7V19h7z" fill="#e8475f"/>',
  diente: '<path d="M12 10c4-4 8-2 12 0 4-2 8-4 12 0 4 5 2 12 0 16l-2 14c-1 3-4 3-5 0l-2-8c-1-2-5-2-6 0l-2 8c-1 3-4 3-5 0l-2-14c-2-4-4-11 0-16z" fill="#fff"/><path d="M12 10c4-4 8-2 12 0 4-2 8-4 12 0 4 5 2 12 0 16l-2 14c-1 3-4 3-5 0l-2-8c-1-2-5-2-6 0l-2 8c-1 3-4 3-5 0l-2-14c-2-4-4-11 0-16z" fill="none" stroke="#9ec7dc" stroke-width="2.5"/><path d="M16 14c2-1 4-1 6 0" stroke="#bfe0ee" stroke-width="2.5" stroke-linecap="round"/>',
  cepillo: '<rect x="6" y="28" width="30" height="6" rx="3" transform="rotate(-35 21 31)" fill="#6fb6e0"/><rect x="26" y="9" width="14" height="8" rx="2" transform="rotate(-35 33 13)" fill="#fff"/><path d="M28 8l2 4M31 6l2 4M34 4l2 4" stroke="#bfe0ee" stroke-width="2.5" stroke-linecap="round"/>',
  crema: '<rect x="14" y="14" width="20" height="28" rx="5" fill="#f6c8a8"/><rect x="19" y="6" width="10" height="9" rx="2" fill="#e0607e"/><rect x="18" y="24" width="12" height="10" rx="2" fill="#fff6e6"/>',
  pie: '<ellipse cx="22" cy="31" rx="9" ry="12" fill="#f2c9a8"/><circle cx="16" cy="14" r="3.5" fill="#f2c9a8"/><circle cx="22" cy="12" r="3" fill="#f2c9a8"/><circle cx="27" cy="13" r="2.6" fill="#f2c9a8"/><circle cx="31" cy="16" r="2.3" fill="#f2c9a8"/><circle cx="33" cy="20" r="2" fill="#f2c9a8"/>',
  luna: '<path d="M30 6a18 18 0 1 0 12 26A14 14 0 0 1 30 6z" fill="#8f86c4"/><path d="M34 8h6l-6 6h6M38 18h4l-4 4h4" stroke="#f2c230" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  celu_off: '<rect x="13" y="4" width="22" height="40" rx="5" fill="#4d5b6a"/><rect x="16" y="9" width="16" height="28" rx="2" fill="#a6c4e0"/><path d="M10 40L38 8" stroke="#e8475f" stroke-width="4.5" stroke-linecap="round"/>',
  alarma: '<circle cx="24" cy="26" r="15" fill="#e65a4a"/><circle cx="24" cy="26" r="11" fill="#fff6e6"/><circle cx="10" cy="10" r="5" fill="#c43a3a"/><circle cx="38" cy="10" r="5" fill="#c43a3a"/><path d="M24 26v-7M24 26l5 3" stroke="#4d5b6a" stroke-width="3" stroke-linecap="round"/>',
  manzana: '<path d="M24 14c-8-5-18 0-17 12 1 10 8 17 13 16 2 0 3-1 4-1s2 1 4 1c5 1 12-6 13-16 1-12-9-17-17-12z" fill="#e65a4a"/><path d="M24 14c0-4 1-7 4-9" stroke="#7a5a3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M27 9c4-3 9-2 10 2-4 3-8 2-10-2z" fill="#6aa65a"/><ellipse cx="15" cy="22" rx="3" ry="5" fill="#fff" opacity=".45"/>',
  zanahoria: '<path d="M10 40L30 16l6 6z" fill="#f28c3a"/><path d="M16 32l3 1M21 26l3 1M26 20l2 2" stroke="#c96a1f" stroke-width="2" stroke-linecap="round"/><path d="M33 19c2-6 6-10 10-10-1 5-4 9-10 10zM33 19c-1-6 1-11 5-14 1 5-1 10-5 14zM33 19c5-2 10-1 12 2-4 3-8 2-12-2z" fill="#6aa65a"/>',
  lata_no: '<rect x="15" y="8" width="18" height="32" rx="4" fill="#e65a4a"/><rect x="15" y="17" width="18" height="10" fill="#fff6e6"/><circle cx="24" cy="24" r="19" fill="none" stroke="#4d5b6a" stroke-width="4"/><path d="M11 11l26 26" stroke="#4d5b6a" stroke-width="4" stroke-linecap="round"/>',
  olla: '<path d="M8 20h32v14a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8z" fill="#5f8fbf"/><rect x="5" y="17" width="38" height="5" rx="2.5" fill="#3d6383"/><path d="M18 14c0-3 3-3 3-6M26 14c0-3 3-3 3-6" stroke="#bfc9d2" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  idioma: '<path d="M6 8h24a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H16l-7 6v-6H6a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#6f9fd8"/><path d="M14 23l4-10 4 10M15.5 19h5" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 20h14a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-2v5l-6-5h-6a4 4 0 0 1-4-4V24a4 4 0 0 1 4-4z" fill="#f2c230"/>',
  birrete: '<path d="M2 18L24 8l22 10-22 10z" fill="#4d5b6a"/><path d="M12 23v9c0 4 24 4 24 0v-9l-12 5z" fill="#6a7888"/><path d="M42 20v12" stroke="#f2c230" stroke-width="2.5"/><circle cx="42" cy="34" r="3" fill="#f2c230"/>',
  bombilla: '<path d="M24 4a13 13 0 0 0-8 23c2 2 3 4 3 6h10c0-2 1-4 3-6A13 13 0 0 0 24 4z" fill="#f6d55c"/><rect x="18" y="34" width="12" height="5" rx="2" fill="#9aa3a8"/><rect x="20" y="39" width="8" height="4" rx="2" fill="#6a7888"/><path d="M18 14a7 7 0 0 1 5-4" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>',
  gracias: '<path d="M24 40S8 30 8 19a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 11-16 21-16 21z" fill="#f08aa6"/><path d="M38 4l1.5 4 4 1.5-4 1.5L38 15l-1.5-4-4-1.5 4-1.5zM8 30l1 2.5 2.5 1-2.5 1L8 37l-1-2.5-2.5-1 2.5-1z" fill="#f2c230"/>',
  diario: '<rect x="8" y="6" width="26" height="36" rx="3" fill="#a5672f"/><rect x="12" y="6" width="22" height="36" rx="2" fill="#f6efe0"/><path d="M16 14h13M16 20h13M16 26h9" stroke="#c9b98f" stroke-width="2" stroke-linecap="round"/><path d="M42 16L28 38l-4 2 1-4 14-22z" fill="#f2c230"/><path d="M42 16l-3-2" stroke="#e0607e" stroke-width="3" stroke-linecap="round"/>',
  pincel: '<path d="M30 6l12 12-16 16-12-12z" fill="#f2c230"/><path d="M14 22l12 12-4 4c-4 4-12 6-16 4 2-4 0-8 4-12z" fill="#e0607e"/><circle cx="36" cy="38" r="4" fill="#6fb6e0"/><circle cx="12" cy="10" r="3" fill="#6aa65a"/>',
  guitarra: '<circle cx="18" cy="31" r="10" fill="#c9763e"/><circle cx="25" cy="24" r="7" fill="#c9763e"/><circle cx="19" cy="30" r="3.5" fill="#5a3a20"/><path d="M24 24L40 8" stroke="#5a3a20" stroke-width="4" stroke-linecap="round"/><rect x="37" y="4" width="7" height="7" rx="2" transform="rotate(45 40.5 7.5)" fill="#5a3a20"/>',
  camara: '<rect x="4" y="14" width="40" height="26" rx="6" fill="#4d5b6a"/><rect x="14" y="9" width="12" height="7" rx="2" fill="#4d5b6a"/><circle cx="24" cy="27" r="9" fill="#a6c4e0"/><circle cx="24" cy="27" r="5" fill="#3d6383"/><circle cx="37" cy="20" r="2.5" fill="#f2c230"/>',
  escoba: '<path d="M30 4L20 26" stroke="#a5672f" stroke-width="4" stroke-linecap="round"/><path d="M14 24l12 5-4 14c-6 0-14-4-16-8z" fill="#f2c230"/><path d="M12 32l9 4M14 28l9 4" stroke="#c9952a" stroke-width="2" stroke-linecap="round"/>',
  cama: '<rect x="4" y="22" width="40" height="12" rx="3" fill="#6f9fd8"/><rect x="4" y="16" width="14" height="9" rx="4" fill="#fff6e6"/><path d="M4 14v28M44 26v16" stroke="#8a6a45" stroke-width="4" stroke-linecap="round"/>',
  remera: '<path d="M16 6l-12 8 5 8 5-3v23h20V19l5 3 5-8-12-8c-1 4-4 6-8 6s-7-2-8-6z" fill="#86bf6c"/><path d="M18 6c1 3 3 4 6 4s5-1 6-4" stroke="#5c9a5a" stroke-width="2.5" fill="none"/>',
  percha: '<path d="M24 12a4 4 0 1 1 4-4" stroke="#9aa3a8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M24 12L4 30h40z" fill="none" stroke="#a5672f" stroke-width="4" stroke-linejoin="round"/><path d="M10 30h28l-2 12H12z" fill="#e0607e"/>',
  regadera: '<path d="M10 18h20v20a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#6aa65a"/><path d="M30 24l12-8" stroke="#6aa65a" stroke-width="5" stroke-linecap="round"/><path d="M10 22c-6 0-7 10-1 12" stroke="#4f8a4a" stroke-width="3.5" fill="none"/><path d="M44 18v4M42 22l-1 3M46 21l1 3" stroke="#6fb6e0" stroke-width="2" stroke-linecap="round"/>',
  llave: '<path d="M34 6a9 9 0 0 0-8 12L8 36l4 4 18-18a9 9 0 0 0 12-8l-5 3-5-5 3-5z" fill="#9aa3a8"/><circle cx="11" cy="37" r="2" fill="#6a7888"/>',
  rodillo: '<rect x="8" y="6" width="28" height="12" rx="4" fill="#f08aa6"/><path d="M36 12h4v12H24v8" stroke="#6a7888" stroke-width="3.5" fill="none" stroke-linejoin="round"/><rect x="20" y="32" width="8" height="12" rx="2" fill="#a5672f"/>',
  diana: '<circle cx="22" cy="26" r="17" fill="#e65a4a"/><circle cx="22" cy="26" r="11" fill="#fff6e6"/><circle cx="22" cy="26" r="5" fill="#e65a4a"/><path d="M22 26L42 6" stroke="#4d5b6a" stroke-width="3" stroke-linecap="round"/><path d="M36 6h6v6" stroke="#f2c230" stroke-width="3" fill="none" stroke-linecap="round"/>',
  lista: '<rect x="8" y="4" width="32" height="40" rx="5" fill="#fff6e6"/><rect x="8" y="4" width="32" height="40" rx="5" fill="none" stroke="#c9b98f" stroke-width="2.5"/><path d="M14 15l3 3 5-6M14 27l3 3 5-6" stroke="#5c9a5a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 16h9M26 28h9M14 38h21" stroke="#c9b98f" stroke-width="2.5" stroke-linecap="round"/>',
  sobre: '<rect x="4" y="10" width="40" height="28" rx="5" fill="#6f9fd8"/><path d="M6 13l18 13 18-13" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/><circle cx="40" cy="12" r="6" fill="#e8475f"/>',
  monedas: '<ellipse cx="18" cy="34" rx="13" ry="5" fill="#c18a2c"/><rect x="5" y="26" width="26" height="8" fill="#d9a441"/><ellipse cx="18" cy="26" rx="13" ry="5" fill="#f2c230"/><ellipse cx="32" cy="22" rx="11" ry="4.5" fill="#c18a2c"/><rect x="21" y="14" width="22" height="8" fill="#d9a441"/><ellipse cx="32" cy="14" rx="11" ry="4.5" fill="#f2c230"/>',
  alcancia: '<ellipse cx="24" cy="27" rx="17" ry="13" fill="#f08aa6"/><circle cx="38" cy="25" r="5" fill="#f4a3b8"/><circle cx="31" cy="20" r="1.8" fill="#4d5b6a"/><path d="M14 15l-2-6 7 4M20 14h8" stroke="#e0607e" stroke-width="3" stroke-linecap="round"/><rect x="14" y="37" width="5" height="6" rx="2" fill="#e0607e"/><rect x="28" y="37" width="5" height="6" rx="2" fill="#e0607e"/><circle cx="24" cy="6" r="4" fill="#f2c230"/>',
  grafico: '<rect x="4" y="6" width="40" height="36" rx="6" fill="#fff6e6"/><rect x="10" y="26" width="6" height="11" rx="1.5" fill="#6f9fd8"/><rect x="21" y="18" width="6" height="19" rx="1.5" fill="#5c9a5a"/><rect x="32" y="12" width="6" height="25" rx="1.5" fill="#f2a640"/>',
  tijera: '<circle cx="12" cy="36" r="6" fill="none" stroke="#e65a4a" stroke-width="4"/><circle cx="36" cy="36" r="6" fill="none" stroke="#e65a4a" stroke-width="4"/><path d="M16 32L34 6M32 32L14 6" stroke="#9aa3a8" stroke-width="4" stroke-linecap="round"/>',
  documento: '<path d="M10 4h20l10 10v28a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fff6e6"/><path d="M30 4v10h10" fill="#e3d9c3"/><circle cx="18" cy="17" r="5" fill="#6f9fd8"/><path d="M14 28h20M14 34h14" stroke="#c9b98f" stroke-width="2.5" stroke-linecap="round"/>',
  cohete: '<path d="M24 4c8 6 10 16 8 26H16c-2-10 0-20 8-26z" fill="#eef2f5"/><circle cx="24" cy="17" r="4" fill="#6fb6e0"/><path d="M16 24l-6 10h7zM32 24l6 10h-7z" fill="#e65a4a"/><path d="M19 30h10l-2 8h-6z" fill="#f2a640"/><path d="M22 38l2 6 2-6" fill="#f6d55c"/>',
  plato: '<circle cx="24" cy="26" r="15" fill="#fff6e6"/><circle cx="24" cy="26" r="10" fill="#f2c27a"/><path d="M4 8v12M2 8v6a2 2 0 0 0 4 0V8M44 8c-3 0-4 4-4 8h4v14" stroke="#9aa3a8" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  telefono: '<path d="M14 6l6 8-4 4c2 5 6 9 11 11l4-4 8 6-3 6c-14 0-28-14-28-28z" fill="#5c9a5a"/><path d="M30 6a12 12 0 0 1 12 12M30 12a6 6 0 0 1 6 6" stroke="#86bf6c" stroke-width="3" fill="none" stroke-linecap="round"/>',
  mensaje: '<path d="M8 8h32a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H20l-9 8v-8H8a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5z" fill="#86bf6c"/><circle cx="16" cy="21" r="2.5" fill="#fff"/><circle cx="24" cy="21" r="2.5" fill="#fff"/><circle cx="32" cy="21" r="2.5" fill="#fff"/>',
  amigos: '<circle cx="16" cy="15" r="7" fill="#f2c9a8"/><circle cx="32" cy="15" r="7" fill="#d9a882"/><path d="M4 40c0-8 5-13 12-13s12 5 12 13z" fill="#6f9fd8"/><path d="M20 40c0-8 5-13 12-13s12 5 12 13z" fill="#f2a640"/>',
  mano: '<path d="M10 26l8-8c2-2 5-1 5 2l-3 4h12c3 0 3 4 0 4h-2c3 0 3 4 0 4h-2c3 0 3 4 0 4H18c-4 0-8-2-8-6z" fill="#f2c9a8"/><path d="M34 6c-3-3-8-1-8 3 0 5 8 9 8 9s8-4 8-9c0-4-5-6-8-3z" fill="#e8475f"/>',
  globo: '<ellipse cx="18" cy="16" rx="10" ry="12" fill="#e0607e"/><ellipse cx="32" cy="20" rx="9" ry="11" fill="#6fb6e0"/><path d="M18 28c0 6 2 10 4 14M32 31c0 5-2 8-4 11" stroke="#9aa3a8" stroke-width="2" fill="none"/><ellipse cx="15" cy="11" rx="2.5" ry="4" fill="#fff" opacity=".5"/>',
  maleta: '<rect x="8" y="14" width="32" height="26" rx="5" fill="#c9763e"/><path d="M18 14v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" stroke="#7a4a1f" stroke-width="3.5" fill="none"/><path d="M18 14v26M30 14v26" stroke="#a5672f" stroke-width="3"/><circle cx="14" cy="42" r="2.5" fill="#4d5b6a"/><circle cx="34" cy="42" r="2.5" fill="#4d5b6a"/>',
  candado: '<rect x="10" y="20" width="28" height="22" rx="5" fill="#f2c230"/><path d="M16 20v-6a8 8 0 0 1 16 0v6" stroke="#9aa3a8" stroke-width="4" fill="none"/><circle cx="24" cy="30" r="3" fill="#a5672f"/><rect x="23" y="31" width="2" height="6" fill="#a5672f"/>',
};

const ilus = (nombre, clase = '') => `<svg viewBox="0 0 48 48" class="il ${clase}" aria-hidden="true">${IL[nombre] || IL.estrella}</svg>`;

// Ícono de cada misión del catálogo.
const ICONO_MISION = {
  sentadillas: 'pesa', flexiones: 'pesa', plancha: 'cronometro', abdominales: 'pesa', entreno: 'pesa', dominadas: 'medalla',
  caminar: 'zapatilla', estirar: 'loto', pasos: 'zapatilla', escaleras: 'escalera', yoga: 'loto', correr: 'zapatilla', bici: 'bici',
  'caminata-naturaleza': 'montana', 'carrera-10k': 'medalla',
  agua: 'vaso', sol: 'sol', chequeo: 'cruz', hilo: 'diente', cepillado: 'cepillo', dentista: 'diente', protector: 'sol', skincare: 'crema',
  'pies-crema': 'pie', 'pies-unas': 'pie', zapatillas: 'zapatilla', dormir: 'luna', 'sin-pantallas': 'celu_off', alarma: 'alarma',
  fruta: 'manzana', verdura: 'zanahoria', 'sin-gaseosa': 'lata_no', 'sin-chatarra': 'zanahoria', cocinar: 'olla', receta: 'olla',
  leer: 'libro', 'leer-noche': 'libro', 'terminar-libro': 'libro', idioma: 'idioma', clase: 'birrete', contar: 'bombilla', curso: 'birrete',
  respirar: 'loto', agradecer: 'gracias', diario: 'diario', 'sin-celu': 'celu_off',
  dibujar: 'pincel', escribir: 'diario', instrumento: 'guitarra', foto: 'camara', 'proyecto-creativo': 'pincel',
  casa: 'escoba', cama: 'cama', ordenar: 'escoba', ropa: 'remera', 'limpieza-profunda': 'escoba', heladera: 'escoba', placard: 'percha',
  escritorio: 'lista', donar: 'remera', plantas: 'regadera', arreglar: 'llave', filtros: 'llave', mejora: 'rodillo', rincon: 'rodillo', pintar: 'rodillo',
  foco: 'diana', planificar: 'lista', inbox: 'sobre', 'sin-redes-trabajo': 'celu_off', gastos: 'monedas', presupuesto: 'grafico', ahorrar: 'alcancia',
  'sin-gastos': 'alcancia', suscripcion: 'tijera', fondo: 'alcancia', proyecto: 'cohete', rubro: 'libro', contacto: 'amigos', cv: 'documento',
  'algo-lindo': 'vinculos', 'plan-pareja': 'vinculos', 'cena-sin-celu': 'plato', 'yoga-pareja': 'loto', escapada: 'maleta',
  'llamar-familia': 'telefono', 'visitar-familia': 'casa', 'almuerzo-familiar': 'plato', mensaje: 'mensaje', 'ver-amigo': 'amigos',
  ayudar: 'mano', juntada: 'globo',
};

// Para misiones propias, adivina por palabras del título.
const PALABRAS_ICONO = [
  [/le[eé]r|libro|p[aá]gina/i, 'libro'], [/camin|correr|pasos|trot/i, 'zapatilla'], [/gym|gimnasio|entren|pesas|sentadilla|flexi/i, 'pesa'],
  [/yoga|medit|respir|estir/i, 'loto'], [/agua|tomar/i, 'vaso'], [/dorm|acost|sue[nñ]o/i, 'luna'], [/diente|dental|cepill/i, 'diente'],
  [/platos|barrer|limpi|orden|casa|trapo/i, 'escoba'], [/ropa|lavar/i, 'remera'], [/cocin|comida|receta/i, 'olla'], [/fruta|manzana/i, 'manzana'],
  [/verdura|ensalada/i, 'zanahoria'], [/plata|gasto|ahorr|dinero|pesos/i, 'monedas'], [/estudi|curso|clase|idioma|ingl[eé]s/i, 'birrete'],
  [/escrib|diario/i, 'diario'], [/dibuj|pint/i, 'pincel'], [/m[uú]sica|guitarra|piano/i, 'guitarra'], [/llam|tel[eé]fono/i, 'telefono'],
  [/mensaje|escribile/i, 'mensaje'], [/amig/i, 'amigos'], [/pareja|novi|cita|anto/i, 'vinculos'], [/famil|mam[aá]|pap[aá]/i, 'casa'],
  [/trabaj|proyecto|tarea/i, 'diana'], [/plant|regar/i, 'regadera'], [/sol/i, 'sol'], [/celu|redes|pantalla/i, 'celu_off'],
];

function iconoDeMision(m) {
  const cat = m.cat || m.id;
  if (ICONO_MISION[cat]) return ICONO_MISION[cat];
  const hit = PALABRAS_ICONO.find(([re]) => re.test(m.titulo || ''));
  if (hit) return hit[1];
  return (m.area || '').split('/')[0] in IL ? m.area.split('/')[0] : 'hoja';
}
