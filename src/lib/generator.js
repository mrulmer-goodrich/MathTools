// src/lib/generator.js (v4.0)



// Ensures the scale fragment always shows "=" with original unit tokens.
function scaleWithEquals({ a, b, u1, u2 }) {
  return `${a} ${u1} = ${b} ${u2}.`;
}
/* ========== RNG & UUID (self-contained) ========== */
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function choice(arr)   { return arr[Math.floor(Math.random() * arr.length)] }
function uuid() {
  try { if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID() } catch {}
  return 'id_' + Math.random().toString(36).slice(2)
}
function shuffle(a) { for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a }

/* ========== SCALE FACTOR (unchanged) ========== */
export function genScaleProblem() {
  for (let tries = 0; tries < 300; tries++) {
    const p = rand(1, 10), q = rand(1, 10)
    if (p === q) continue
    const w = rand(6, 40), h = rand(6, 40)
    const W = (w * p) / q, H = (h * p) / q
    if (Number.isInteger(W) && Number.isInteger(H) && W >= 6 && W <= 100 && H >= 6 && H <= 100) {
      const pair = choice(['horizontal', 'vertical'])
      const part2 = pair === 'horizontal' ? 'vertical' : 'horizontal'
      return {
        id: uuid(),
        ratio: { p, q, value: p / q },
        original: { w, h },
        copy: { w: W, h: H },
        shownPair: pair,
        missingPair: part2
      }
    }
  }
  return {
    id: uuid(),
    ratio: { p: 2, q: 1, value: 2 },
    original: { w: 12, h: 8 },
    copy: { w: 24, h: 16 },
    shownPair: 'horizontal',
    missingPair: 'vertical'
  }
}

/* ========== H-TABLE: SCENE SYSTEM ========== */

/* Big unit pools by category (generator uses these).
   Make sure your HTableModule.jsx validator (UNIT_CATS) recognizes synonyms/abbrevs. */
const UNITS = {
  length: ['mm','cm','m','km','inches','feet','yards','miles'],
  time:   ['seconds','minutes','hours','days','weeks','years'],
  volume: ['teaspoons','tablespoons','cups','quarts','gallons','liters','milliliters'],
  mass:   ['grams','kilograms','pounds']
}

/* Your student roster (names) */
const FIRST = [
  "Abal","Abdul","Alexander","Ana","Anderson","Braily","Brayden","Britany","Bryan","Camryn","Candi",
  "Carlos","Cherish","Claritza","Cristian","Diyana","Edvin","Eliezer","Emeli","Emmie","Erika","Estephany",
  "Franklin","Freydell","Geraldine","Gunnar","Hannah","Henry","Ignatius","Isaiah","Jasmin","Jathan","Javian",
  "Jeff","Jesus","John","Jojari","Jonathan","Kimora","Kritika","Lisandro","Lizet","Luis","Mackendy","Masiah",
  "Monserrath","Naomi","Nazlly","Ngun","Ny'aira","Ny'isha","Oscar","Pablo","Ricardo","Rylan","Santiago",
  "Skyler","Sofia","Sonia","Steven","Stheysi","Taylor","Tra'el","Tyrone","Unique","Victoria","Walfred",
  "William","Yesica","Zaid","Zaliah","Zoey"
]

/* Scenes -> what unit categories fit + which motivations fit (coherence) */
const SCENES = {
  hamster_parade_map: {
    units: ['length','time'],
    motivations: ['time_the_snack_route','beat_the_timer','impress_judges'],
    nouns: { length: 'parade route', time: 'parade lap time' }
  },
  rubber_duck_regatta: {
    units: ['length','time','volume'],
    motivations: ['map_to_real','science_fair_demo','impress_judges'],
    nouns: { length: 'race course', time: 'warm-up lap', volume: 'splash tank' }
  },
  pizza_box_diagram: {
    units: ['length','time','mass','volume'],
    motivations: ['fit_on_page','convert_systems','avoid_spilling_juice'],
    nouns: { length: 'box edge', time: 'oven timer', mass: 'dough ball', volume: 'sauce batch' }
  },
  cardboard_rollercoaster: {
    units: ['length','time'],
    motivations: ['build_to_match','fit_through_door','beat_the_timer'],
    nouns: { length: 'ramp', time: 'test run' }
  },
  marble_run_manual: {
    units: ['length','time'],
    motivations: ['science_fair_demo','beat_the_timer','impress_judges'],
    nouns: { length: 'track segment', time: 'trial run' }
  },
  bake_sale_recipe: {
    units: ['volume','mass','time'],
    motivations: ['measure_without_spoons','miniature_for_display','avoid_spilling_juice'],
    nouns: { volume: 'syrup amount', mass: 'bag of flour', time: 'resting time' }
  },
  art_poster_resize: {
    units: ['length','time'],
    motivations: ['fit_bulletin','convert_systems','fit_on_page'],
    nouns: { length: 'poster side', time: 'setup time' }
  },
  library_display_map: {
    units: ['length','time'],
    motivations: ['map_to_real','fit_on_page','impress_judges'],
    nouns: { length: 'hallway distance', time: 'tour schedule' }
  },
  kite_festival_plan: {
    units: ['length','time'],
    motivations: ['pace_for_event','beat_the_timer','map_to_real'],
    nouns: { length: 'string length', time: 'launch window' }
  },
  cat_parkour_course: {
    units: ['length','time'],
    motivations: ['build_to_match','science_fair_demo','pace_for_event'],
    nouns: { length: 'jump distance', time: 'practice session' }
  },
  shoebox_city_plan: {
    units: ['length','time'],
    motivations: ['miniature_for_display','fit_on_page','convert_systems'],
    nouns: { length: 'street segment', time: 'tour loop' }
  },
  cafeteria_seating_chart: {
    units: ['length','time'],
    motivations: ['fit_bulletin','beat_the_timer','impress_judges'],
    nouns: { length: 'table row', time: 'lunch period' }
  }
}

/* Fragment lexicon: place & why (EN/ES/FR/DE/SW/VI) */
const LEX = {
  English: {
    place: {
      hamster_parade_map: 'a parade map for the hamster club',
      rubber_duck_regatta: 'the giant rubber-duck regatta course',
      pizza_box_diagram: 'a pizza-box engineering diagram',
      cardboard_rollercoaster: 'a cardboard roller-coaster layout',
      marble_run_manual: 'a manual for an extreme marble run',
      bake_sale_recipe: 'a recipe card for a bake sale',
      art_poster_resize: 'an art poster resize',
      library_display_map: 'a library display map',
      kite_festival_plan: 'the kite festival plan',
      cat_parkour_course: 'a blueprint for a cat parkour course',
      shoebox_city_plan: 'a tiny city plan for a shoebox',
      cafeteria_seating_chart: 'the (legendary) cafeteria seating chart'
    },
    why: {
      time_the_snack_route: 'to time the fastest route to the snack table',
      beat_the_timer: 'to beat the classroom timer by a mile',
      impress_judges: 'to impress the judges (and maybe the principal)',
      map_to_real: 'to compare the printed plan to real distance',
      science_fair_demo: 'for a wildly dramatic science-fair demo',
      fit_on_page: 'to check if the plan fits the page',
      convert_systems: 'to convert between two systems accurately',
      avoid_spilling_juice: 'to avoid spilling juice on the rubric again',
      build_to_match: 'to build a model that matches the instructions',
      fit_through_door: 'to check if the giant prop fits through a door',
      miniature_for_display: 'to make a miniature display version',
      pace_for_event: 'to pace themselves for an upcoming event',
      measure_without_spoons: 'to measure ingredients without the original spoons',
      fit_bulletin: 'to scale the poster for the bulletin board'
    }
  },
  Spanish: {
    place: {
      hamster_parade_map: 'un mapa del desfile del club de hámsters',
      rubber_duck_regatta: 'el recorrido de la regata de patos gigantes',
      pizza_box_diagram: 'un diagrama de ingeniería en una caja de pizza',
      cardboard_rollercoaster: 'un trazado de montaña rusa de cartón',
      marble_run_manual: 'un manual para una pista extrema de canicas',
      bake_sale_recipe: 'una tarjeta de receta para una venta de pasteles',
      art_poster_resize: 'un cartel de arte para redimensionar',
      library_display_map: 'un mapa de exposición de la biblioteca',
      kite_festival_plan: 'el plan del festival de cometas',
      cat_parkour_course: 'un plano para un circuito de parkour felino',
      shoebox_city_plan: 'un miniplano de ciudad para una caja de zapatos',
      cafeteria_seating_chart: 'el mítico plano de mesas de la cafetería'
    },
    why: {
      time_the_snack_route: 'para cronometrar la ruta más rápida a la mesa de snacks',
      beat_the_timer: 'para ganarle por mucho al temporizador de clase',
      impress_judges: 'para impresionar al jurado (y quizá a la directora)',
      map_to_real: 'para comparar el plano impreso con la distancia real',
      science_fair_demo: 'para una demostración épica de la feria de ciencias',
      fit_on_page: 'para comprobar si el plano cabe en la página',
      convert_systems: 'para convertir con precisión entre dos sistemas',
      avoid_spilling_juice: 'para no derramar jugo sobre la rúbrica',
      build_to_match: 'para construir un modelo que coincida con las instrucciones',
      fit_through_door: 'para ver si el objeto gigante cabe por la puerta',
      miniature_for_display: 'para hacer una versión en miniatura para exhibir',
      pace_for_event: 'para marcar el ritmo para un evento',
      measure_without_spoons: 'para medir sin las cucharas originales',
      fit_bulletin: 'para ajustar el póster al tablón de anuncios'
    }
  },
  French: {
    place: {
      hamster_parade_map: 'un plan du défilé du club de hamsters',
      rubber_duck_regatta: 'le parcours de la régate des canards géants',
      pizza_box_diagram: 'un schéma d’ingénierie sur une boîte à pizza',
      cardboard_rollercoaster: 'un tracé de montagnes russes en carton',
      marble_run_manual: 'une notice pour un parcours de billes extrême',
      bake_sale_recipe: 'une fiche recette pour une vente de gâteaux',
      art_poster_resize: 'une affiche d’art à redimensionner',
      library_display_map: 'un plan d’exposition de la bibliothèque',
      kite_festival_plan: 'le plan du festival de cerfs-volants',
      cat_parkour_course: 'un plan pour un parcours de parkour pour chats',
      shoebox_city_plan: 'un mini-plan de ville pour une boîte à chaussures',
      cafeteria_seating_chart: 'le légendaire plan de la cafétéria'
    },
    why: {
      time_the_snack_route: 'pour chronométrer la route la plus rapide vers la table des goûters',
      beat_the_timer: 'pour battre largement le minuteur de la classe',
      impress_judges: 'pour impressionner le jury (et peut-être la principale)',
      map_to_real: 'pour comparer le plan imprimé à la distance réelle',
      science_fair_demo: 'pour une démonstration spectaculaire à la foire scientifique',
      fit_on_page: 'pour vérifier si le plan tient sur la page',
      convert_systems: 'pour convertir précisément entre deux systèmes',
      avoid_spilling_juice: 'pour éviter d’éclabousser la grille d’évaluation',
      build_to_match: 'pour fabriquer une maquette conforme à la notice',
      fit_through_door: 'pour vérifier si l’objet géant passe la porte',
      miniature_for_display: 'pour créer une version miniature d’exposition',
      pace_for_event: 'pour caler son rythme pour un événement',
      measure_without_spoons: 'pour doser sans les cuillères d’origine',
      fit_bulletin: 'pour adapter l’affiche au panneau d’affichage'
    }
  },
  German: {
    place: {
      hamster_parade_map: 'einen Paradeplan für den Hamsterclub',
      rubber_duck_regatta: 'die Strecke der Riesen-Gummienten-Regatta',
      pizza_box_diagram: 'ein Konstruktionsdiagramm auf einer Pizzaschachtel',
      cardboard_rollercoaster: 'einen Karton-Achterbahn-Plan',
      marble_run_manual: 'eine Anleitung für eine extreme Murmelbahn',
      bake_sale_recipe: 'eine Rezeptkarte für den Kuchenverkauf',
      art_poster_resize: 'ein Kunstplakat zum Skalieren',
      library_display_map: 'einen Ausstellungsplan der Bibliothek',
      kite_festival_plan: 'den Plan für das Drachenfestival',
      cat_parkour_course: 'einen Plan für einen Katzen-Parkour-Kurs',
      shoebox_city_plan: 'einen winzigen Stadtplan für eine Schuhschachtel',
      cafeteria_seating_chart: 'den legendären Sitzplan der Mensa'
    },
    why: {
      time_the_snack_route: 'um die schnellste Route zum Snacktisch zu messen',
      beat_the_timer: 'um den Klassen-Timer deutlich zu schlagen',
      impress_judges: 'um die Jury (und vielleicht die Schulleitung) zu beeindrucken',
      map_to_real: 'um den gedruckten Plan mit echter Entfernung zu vergleichen',
      science_fair_demo: 'für eine dramatische Wissenschafts-Show',
      fit_on_page: 'um zu prüfen, ob der Plan auf die Seite passt',
      convert_systems: 'um genau zwischen zwei Systemen umzurechnen',
      avoid_spilling_juice: 'um den Bewertungsbogen nicht zu bekleckern',
      build_to_match: 'um ein Modell passend zur Anleitung zu bauen',
      fit_through_door: 'um zu prüfen, ob das Riesen-Requisit durch die Tür passt',
      miniature_for_display: 'um eine Miniatur-Ausgabe zu bauen',
      pace_for_event: 'um das Tempo für ein Event zu üben',
      measure_without_spoons: 'um ohne die originellen Löffel zu dosieren',
      fit_bulletin: 'um das Plakat für die Pinnwand zu skalieren'
    }
  },
  Swahili: {
    place: {
      hamster_parade_map: 'ramani ya gwaride la klabu ya hamster',
      rubber_duck_regatta: 'njia ya mashindano ya bata wa mpira wakubwa',
      pizza_box_diagram: 'mchoro wa uhandisi kwenye boksi la pizza',
      cardboard_rollercoaster: 'mpango wa roller-coaster ya katoni',
      marble_run_manual: 'maelekezo ya njia kali ya marumaru',
      bake_sale_recipe: 'kadi ya mapishi ya mauzo ya keki',
      art_poster_resize: 'posti ya sanaa ya kurekebishwa ukubwa',
      library_display_map: 'ramani ya maonyesho ya maktaba',
      kite_festival_plan: 'mpango wa tamasha la mandege',
      cat_parkour_course: 'mchoro wa kozi ya parkour ya paka',
      shoebox_city_plan: 'mpango mdogo wa jiji kwa boksi la viatu',
      cafeteria_seating_chart: 'ramani maarufu ya viti ya mkahawa wa shule'
    },
    why: {
      time_the_snack_route: 'kupima njia ya haraka kuelekea meza ya vitafunwa',
      beat_the_timer: 'kushinda kipima-muda cha darasa kwa mbali',
      impress_judges: 'kuwavutia majaji (na labda mwalimu mkuu)',
      map_to_real: 'kulinganisha mpango uliyochapishwa na umbali halisi',
      science_fair_demo: 'kwa onyesho la sayansi la kusisimua',
      fit_on_page: 'kukagua kama mchoro unaingia kwenye ukurasa',
      convert_systems: 'kubadili kwa usahihi kati ya mifumo miwili',
      avoid_spilling_juice: 'kuepuka kumwagia karatasi ya alama',
      build_to_match: 'kujenga mfano unaolingana na maelekezo',
      fit_through_door: 'kuona kama reki kubwa inapita mlangoni',
      miniature_for_display: 'kutengeneza toleo dogo la maonyesho',
      pace_for_event: 'kujiweka sawa kwa tukio lijalo',
      measure_without_spoons: 'kupima bila vijiko vya asili',
      fit_bulletin: 'kupima ukubwa wa bango ili litoshee kwenye ubao'
    }
  },
  Vietnamese: {
    place: {
      hamster_parade_map: 'bản đồ diễu hành của câu lạc bộ chuột hamster',
      rubber_duck_regatta: 'đường đua vịt cao su khổng lồ',
      pizza_box_diagram: 'sơ đồ kỹ thuật trên hộp pizza',
      cardboard_rollercoaster: 'bản vẽ tàu lượn bằng bìa cứng',
      marble_run_manual: 'sổ tay đường chạy bi siêu tốc',
      bake_sale_recipe: 'thẻ công thức cho buổi bán bánh',
      art_poster_resize: 'áp phích nghệ thuật cần đổi kích thước',
      library_display_map: 'sơ đồ trưng bày của thư viện',
      kite_festival_plan: 'kế hoạch lễ hội thả diều',
      cat_parkour_course: 'bản vẽ đường chạy parkour cho mèo',
      shoebox_city_plan: 'bản quy hoạch thành phố mini trong hộp giày',
      cafeteria_seating_chart: 'sơ đồ chỗ ngồi căn tin (huyền thoại)'
    },
    why: {
      time_the_snack_route: 'để bấm giờ đường nhanh nhất tới bàn ăn nhẹ',
      beat_the_timer: 'để vượt xa đồng hồ bấm giờ của lớp',
      impress_judges: 'để gây ấn tượng với ban giám khảo (và cô hiệu trưởng)',
      map_to_real: 'để so kế hoạch in với khoảng cách thật',
      science_fair_demo: 'cho màn trình diễn khoa học cực ngầu',
      fit_on_page: 'để kiểm tra bản vẽ có vừa trang giấy không',
      convert_systems: 'để đổi chính xác giữa hai hệ đo lường',
      avoid_spilling_juice: 'để khỏi làm đổ nước quả lên phiếu chấm',
      build_to_match: 'để làm mô hình đúng theo hướng dẫn',
      fit_through_door: 'để xem đạo cụ khổng lồ có lọt cửa không',
      miniature_for_display: 'để làm phiên bản thu nhỏ trưng bày',
      pace_for_event: 'để tập nhịp độ cho sự kiện sắp tới',
      measure_without_spoons: 'để đong mà không cần muỗng gốc',
      fit_bulletin: 'để chỉnh tỉ lệ áp phích cho vừa bảng thông báo'
    }
  }
}

/* Language list for rotation */
const LANGS = ['Spanish','French','German','Swahili','Vietnamese']
const ALT_ORDER = [...LANGS, 'XXXX'] // optional, harmless

/* Openers (random verb phrases) */
const OPENERS = {
  English: [
    'is puzzling through', 'has been “voluntold” to decode', 'is heroically mapping out',
    'is chaotically analyzing', 'is drafting an epic plan for', 'is reverse-engineering',
    'is stress-testing', 'is choreographing', 'is prototyping', 'is wrangling',
    'is dangerously enthusiastic about modeling', 'is over-caffeinated and charting',
    'is curating a dramatic diagram for', 'is beta-testing a blueprint for'
  ],
  Spanish: ['está descifrando', 'ha sido “reclutado/a” para entender', 'está trazando heroicamente',
            'está analizando a lo loco', 'está elaborando un plan épico para', 'está re-ingenierizando',
            'está poniendo a prueba', 'está coreografiando', 'está prototipando', 'está domando'],
  French:  ['est en train de décortiquer', 'a été “volontaire désigné” pour décrypter', 'cartographie héroïquement',
            'analyse en mode chaotique', 'réalise un plan épique pour', 'fait de la rétro-ingénierie',
            'met à l’épreuve', 'chorégraphie', 'prototypage en cours de', 'essaie d’« apprivoiser »'],
  German:  ['knobelt an', 'wurde “freiwillig bestimmt”, um zu entziffern', 'kartiert heldenhaft',
            'analysiert chaotisch', 'entwirft einen epischen Plan für', 'führt Reverse-Engineering durch',
            'unterzieht einem Stresstest', 'choreografiert', 'prototypisiert', 'zähmt das Chaos von'],
  Swahili: ['anapekua suluhu za', 'amepewa jukumu la “kudecode”', 'anachora ramani kishujaa ya',
            'anachambua kwa mizaha', 'anatengeneza mpango wa kifahari kwa', 'anafanya uhandisi-tendaji upya wa',
            'anajaribu kwa shinikizo', 'anaandaa mchujo wa hatua za', 'anabuni mfano wa', 'anajaribu “kuidhibiti”'],
  Vietnamese: ['đang mày mò với', 'được “chỉ định tự nguyện” để giải mã', 'đang vẽ sơ đồ một cách anh hùng',
               'đang phân tích hỗn loạn', 'đang phác thảo một kế hoạch hoành tráng cho', 'đang đảo ngược thiết kế của',
               'đang kiểm tra chịu lực', 'đang biên đạo', 'đang làm nguyên mẫu cho', 'đang cố gắng “thuần hóa”']
}

/* Scale-line variants (all embed a,b,u1,u2 clearly) */
const SCALE_LINES = {
  English: [
    o => `A sticky note yells: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `The margin scribble claims: ${o.a} ${o.u1} equals ${o.b} ${o.u2}.`,
    o => `A faded caption reads: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Blueprint footer states: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `There’s a QR label that decodes to ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Someone wrote in marker: ${o.a} ${o.u1} ↔ ${o.b} ${o.u2}.`,
    o => `Top corner note insists: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `The legend spells out ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `A bold caption announces ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Calibration says ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  Spanish: [
    o => `Una nota pegada grita: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Un garabato en el margen dice: ${o.a} ${o.u1} equivale a ${o.b} ${o.u2}.`,
    o => `Un pie de plano indica: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Una etiqueta QR revela ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `En la esquina se lee: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `La leyenda aclara ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  French: [
    o => `Un post-it hurle : ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Un gribouillage en marge affirme : ${o.a} ${o.u1} équivaut à ${o.b} ${o.u2}.`,
    o => `La légende précise : ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Une étiquette QR révèle ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `En pied de plan : ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Un encadré annonce ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  German: [
    o => `Ein Klebezettel ruft: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Ein Randkritzel behauptet: ${o.a} ${o.u1} entspricht ${o.b} ${o.u2}.`,
    o => `Die Legende zeigt: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Ein QR-Label entschlüsselt ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Unten steht: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Ein Hinweis verkündet ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  Swahili: [
    o => `Kijikaratasi kinasema: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Mwandiko pembezoni unaeleza: ${o.a} ${o.u1} ni sawa na ${o.b} ${o.u2}.`,
    o => `Maelezo ya chini yanasema: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Lebo ya QR inaonyesha ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Kona ya juu imeandika ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Ufafanuzi unasema ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  Vietnamese: [
    o => `Tờ giấy nhớ la lên: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Dòng ghi chú ở mép nói rằng: ${o.a} ${o.u1} bằng ${o.b} ${o.u2}.`,
    o => `Chú thích mờ ghi: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Nhãn QR giải mã thành: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Góc bản vẽ ghi rõ: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Chú giải xác nhận: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ]
}

/* Category-tailored question templates (short, flavorful; must keep math coherent) */
const QUESTIONS = {
  English: {
    length: [
      o => `In ${o.place}, one ${o.noun} is ${o.g} ${o.uGiven}. How many is that in ${o.uOther}?`,
      o => `If a ${o.noun} is ${o.g} ${o.uGiven}, convert to ${o.uOther}.`,
      o => `The plan marks ${o.g} ${o.uGiven} along the ${o.noun}. What is that in ${o.uOther}?`,
      o => `Suppose the ${o.noun} needs ${o.g} ${o.uGiven}. Give the value in ${o.uOther}.`,
      o => `A label says ${o.g} ${o.uGiven} on the ${o.noun}. Convert to ${o.uOther}.`,
      o => `For the ${o.noun}, use ${o.g} ${o.uGiven}. What is the corresponding amount in ${o.uOther}?`
    ],
    time: [
      o => `For ${o.place}, the ${o.noun} is ${o.g} ${o.uGiven}. How many ${o.uOther} is that?`,
      o => `Schedule shows ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`,
      o => `The ${o.noun} lasts ${o.g} ${o.uGiven}. Express this in ${o.uOther}.`,
      o => `If setup takes ${o.g} ${o.uGiven}, what is that in ${o.uOther}?`,
      o => `Timing note: ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`,
      o => `Use the ratio to change ${o.g} ${o.uGiven} into ${o.uOther}.`
    ],
    volume: [
      o => `Recipe calls for ${o.g} ${o.uGiven}. How much is that in ${o.uOther}?`,
      o => `The ${o.noun} needs ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`,
      o => `Measure ${o.g} ${o.uGiven} for the ${o.noun}. What is that in ${o.uOther}?`,
      o => `Use ${o.g} ${o.uGiven} of liquid. Express in ${o.uOther}.`,
      o => `Label reads ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`,
      o => `How many ${o.uOther} match ${o.g} ${o.uGiven}?`
    ],
    mass: [
      o => `The ${o.noun} weighs ${o.g} ${o.uGiven}. What is that in ${o.uOther}?`,
      o => `We measured ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`,
      o => `${o.g} ${o.uGiven} of material is required. Express in ${o.uOther}.`,
      o => `Inventory lists ${o.g} ${o.uGiven}. How many in ${o.uOther}?`,
      o => `Tag shows ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`,
      o => `What is ${o.g} ${o.uGiven} when converted to ${o.uOther}?`
    ]
  },
  Spanish: {
    length: [
      o => `En ${o.place}, un ${o.noun} mide ${o.g} ${o.uGiven}. ¿Cuánto es en ${o.uOther}?`,
      o => `Si un ${o.noun} es ${o.g} ${o.uGiven}, conviértelo a ${o.uOther}.`,
      o => `El plano marca ${o.g} ${o.uGiven} en el ${o.noun}. ¿En ${o.uOther}?`,
      o => `Si el ${o.noun} necesita ${o.g} ${o.uGiven}, exprésalo en ${o.uOther}.`
    ],
    time: [
      o => `Para ${o.place}, el ${o.noun} dura ${o.g} ${o.uGiven}. ¿Cuántos ${o.uOther} son?`,
      o => `La agenda dice ${o.g} ${o.uGiven}. Convierte a ${o.uOther}.`,
      o => `El ${o.noun} toma ${o.g} ${o.uGiven}. Exprésalo en ${o.uOther}.`
    ],
    volume: [
      o => `La receta pide ${o.g} ${o.uGiven}. ¿Cuánto es en ${o.uOther}?`,
      o => `El ${o.noun} lleva ${o.g} ${o.uGiven}. Convierte a ${o.uOther}.`
    ],
    mass: [
      o => `El ${o.noun} pesa ${o.g} ${o.uGiven}. ¿En ${o.uOther} cuánto es?`,
      o => `Medimos ${o.g} ${o.uGiven}. Convierte a ${o.uOther}.`
    ]
  },
  French: {
    length: [
      o => `Dans ${o.place}, un ${o.noun} fait ${o.g} ${o.uGiven}. Combien en ${o.uOther} ?`,
      o => `Si un ${o.noun} vaut ${o.g} ${o.uGiven}, convertir en ${o.uOther}.`,
      o => `Le plan indique ${o.g} ${o.uGiven} sur le ${o.noun}. En ${o.uOther} ?`
    ],
    time: [
      o => `Pour ${o.place}, le ${o.noun} dure ${o.g} ${o.uGiven}. Combien en ${o.uOther} ?`,
      o => `L’horaire note ${o.g} ${o.uGiven}. Convertir en ${o.uOther}.`
    ],
    volume: [
      o => `La recette demande ${o.g} ${o.uGiven}. En ${o.uOther}, cela fait combien ?`,
      o => `Le ${o.noun} utilise ${o.g} ${o.uGiven}. Convertir en ${o.uOther}.`
    ],
    mass: [
      o => `Le ${o.noun} pèse ${o.g} ${o.uGiven}. Combien en ${o.uOther} ?`,
      o => `Mesure: ${o.g} ${o.uGiven}. Convertir en ${o.uOther}.`
    ]
  },
  German: {
    length: [
      o => `In ${o.place} misst ein ${o.noun} ${o.g} ${o.uGiven}. Wie viel ist das in ${o.uOther}?`,
      o => `Wenn ein ${o.noun} ${o.g} ${o.uGiven} beträgt, wandle in ${o.uOther} um.`,
      o => `Der Plan markiert ${o.g} ${o.uGiven} am ${o.noun}. In ${o.uOther}?`
    ],
    time: [
      o => `Für ${o.place} dauert der ${o.noun} ${o.g} ${o.uGiven}. Wieviel in ${o.uOther}?`,
      o => `Der Zeitplan zeigt ${o.g} ${o.uGiven}. Umrechnen in ${o.uOther}.`
    ],
    volume: [
      o => `Das Rezept verlangt ${o.g} ${o.uGiven}. Wieviel ist das in ${o.uOther}?`,
      o => `Der ${o.noun} braucht ${o.g} ${o.uGiven}. Umrechnen in ${o.uOther}.`
    ],
    mass: [
      o => `Der ${o.noun} wiegt ${o.g} ${o.uGiven}. Wieviel in ${o.uOther}?`,
      o => `Gemessen: ${o.g} ${o.uGiven}. In ${o.uOther} umrechnen.`
    ]
  },
  Swahili: {
    length: [
      o => `Katika ${o.place}, ${o.noun} ni ${o.g} ${o.uGiven}. Ni ngapi kwa ${o.uOther}?`,
      o => `Ikiwa ${o.noun} ni ${o.g} ${o.uGiven}, badili kuwa ${o.uOther}.`
    ],
    time: [
      o => `Kwa ${o.place}, ${o.noun} hudumu ${o.g} ${o.uGiven}. Ni ngapi kwa ${o.uOther}?`,
      o => `Ratiba ina ${o.g} ${o.uGiven}. Badili kuwa ${o.uOther}.`
    ],
    volume: [
      o => `Mapishi yanahitaji ${o.g} ${o.uGiven}. Ni kiasi gani kwa ${o.uOther}?`
    ],
    mass: [
      o => `${o.noun} una uzito wa ${o.g} ${o.uGiven}. Badili kuwa ${o.uOther}.`
    ]
  },
  Vietnamese: {
    length: [
      o => `Trong ${o.place}, một ${o.noun} là ${o.g} ${o.uGiven}. Bao nhiêu ${o.uOther}?`,
      o => `Nếu ${o.noun} dài ${o.g} ${o.uGiven}, đổi sang ${o.uOther}.`,
      o => `Bản vẽ ghi ${o.g} ${o.uGiven} ở ${o.noun}. Vậy bằng bao nhiêu ${o.uOther}?`
    ],
    time: [
      o => `Với ${o.place}, ${o.noun} kéo dài ${o.g} ${o.uGiven}. Đổi sang ${o.uOther}.`,
      o => `Lịch cho biết ${o.g} ${o.uGiven}. Hãy chuyển thành ${o.uOther}.`
    ],
    volume: [
      o => `Công thức cần ${o.g} ${o.uGiven}. Vậy là bao nhiêu ${o.uOther}?`,
      o => `${o.noun} cần ${o.g} ${o.uGiven}. Đổi sang ${o.uOther}.`
    ],
    mass: [
      o => `${o.noun} nặng ${o.g} ${o.uGiven}. Bao nhiêu theo ${o.uOther}?`,
      o => `Đo được ${o.g} ${o.uGiven}. Hãy đổi ra ${o.uOther}.`
    ]
  }
}

/* Helpers */
function tr(lang, group, key) {
  const src = LEX[lang] && LEX[lang][group] && LEX[lang][group][key]
  return src || (LEX.English[group] && LEX.English[group][key]) || key
}
function pickUnitsFrom(category) {
  const pool = UNITS[category]
  const u1 = choice(pool)
  let u2 = choice(pool), guard = 0
  while (u2 === u1 && guard++ < 25) u2 = choice(pool)
  return [u1, u2]
}
function integerGiven(a, b, gRow) {
  const gcd = (x,y)=> y?gcd(y,x%y):x
  const k = gRow === 'top' ? a / gcd(a,b) : b / gcd(a,b)
  return k * rand(1, 10)
}
function computeAnswer({a,b,g,gRow}) {
  return gRow === 'top' ? (g * b) / a : (g * a) / b
}

/* ===== Main export: scene-aware humorous H-table problem ===== */
export function genHProblem({ languages = LANGS, enforceInteger = true } = {}) {
  const name = choice(FIRST)

  // Pick scene → coherent category & motivation
  const sceneKey = choice(Object.keys(SCENES))
  const scene = SCENES[sceneKey]
  const category = choice(scene.units)
  const motivationKey = choice(scene.motivations)

  // Units, scale, given
  const [u1, u2] = pickUnitsFrom(category)
  const a = rand(1, 20), b = rand(1, 20)
  const gRow = Math.random() < 0.5 ? 'bottom' : 'top'
  const g = enforceInteger ? integerGiven(a, b, gRow) : rand(1, 20)

  // Localized fragments
  const englishPlace = tr('English', 'place', sceneKey)
  const englishWhy   = tr('English', 'why', motivationKey)

  // Build English sentence from randomized parts
  const openerEN   = choice(OPENERS.English)
  const scaleEN = scaleWithEquals({ a, b, u1, u2 })
  const nounEN     = scene.nouns[category] || 'segment'
  const uGiven     = gRow === 'top' ? u1 : u2
  const uOther     = gRow === 'top' ? u2 : u1
  const qEN        = choice(QUESTIONS.English[category])({
    place: englishPlace, noun: nounEN, g, uGiven, uOther
  })
  const english = `${name} ${openerEN} ${englishPlace} ${englishWhy}. ${scaleEN} ${qEN}`

  // Build alts per language
  const alts = {}
  // Rotation languages with XXXX; validate narratives contain exact '=’ scale fragment
  const rotationLanguages = [...LANGS, 'XXXX'];
  const must = `${a} ${u1} = ${b} ${u2}`;
  const rotationFiltered = rotationLanguages.filter(lang => {
    if (lang === 'XXXX') return true;
    const t = alts[lang];
    return typeof t === 'string' && t.includes(must);
  });

  for (const lang of languages) {
    const place = tr(lang, 'place', sceneKey)
    const why   = tr(lang, 'why', motivationKey)
    const opener = choice(OPENERS[lang] || OPENERS.English)
    const scale = scaleWithEquals({ a, b, u1, u2 })
    const noun   = scene.nouns[category] || 'segment'
    const qBank  = QUESTIONS[lang] && QUESTIONS[lang][category]
      ? QUESTIONS[lang][category] : QUESTIONS.English[category]
    const qLine  = choice(qBank)({ place, noun, g, uGiven, uOther })
    alts[lang] = `${name} ${opener} ${place} ${why}. ${scale} ${qLine}`
  }
  // Optional modes preserved (UI filters if you choose): 
  alts.FadeOut  = ' '
  alts.BlackOut = ' '

  const answer = computeAnswer({ a, b, g, gRow })

  return {
    id: uuid(),
    text: { english, alts },
    units: [u1, u2],
    scale: [a, b],
    given: { row: gRow, value: g },
    altOrder: (typeof shuffle==='function' ? shuffle(rotationFiltered) : rotationFiltered),
    meta: { baseUnits: { u1, u2, otherUnit: (gRow==='top'?u2:u1) }, languages: rotationFiltered },
    altOrder: (typeof shuffle==='function' ? shuffle(rotationFiltered) : rotationFiltered),
    // Extras available if you ever want MC:
    answer
  }
}

// src/lib/ptables/generator.js
// Problem generator for Proportional Tables.
// Returns an object: { rows: [{x,y},...], k, proportional, revealRow4 }
export function genPTable(difficulty = "easy") {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const ranges = {
    easy: { kMin: 2, kMax: 9, xMin: 2, xMax: 12, noise: 0 },
    medium: { kMin: 2, kMax: 12, xMin: 3, xMax: 18, noise: 0.2 },   // occasional non-proportional
    hard: { kMin: 2, kMax: 16, xMin: 4, xMax: 24, noise: 0.35 }     // more frequent non-proportional
  };

  const R = ranges[difficulty] || ranges.easy;

  // choose constant of proportionality k as an integer for clarity
  const k = rng(R.kMin, R.kMax);

  // build three base x's (distinct)
  const xs = new Set();
  while (xs.size < 3) xs.add(rng(R.xMin, R.xMax));
  const xArr = Array.from(xs);

  // With some probability on medium/hard, inject a non-proportional y
  const makeNonProp = Math.random() < R.noise;

  const rows = xArr.map((x, i) => {
    let y = x * k;
    if (makeNonProp && i === 1) {
      // perturb one row to break proportionality
      y += rng(1, Math.max(2, Math.floor(k / 2)));
    }
    return { x, y };
  });

  const proportional = !makeNonProp;

  // We’ll always provide a 4th row prompt if proportional
  const revealRow4 = proportional
    ? { x: rng(R.xMin, R.xMax), y: null }
    : null;

  return { rows, k, proportional, revealRow4 };
}



// Generator for Proportional Graphs problems (variety + 2-decimal display-safe)
/**
 * Generate a proportional graphs problem
 * @param {string} difficulty - 'easy', 'medium', or 'hard' (preserved for API)
 * @returns {object} Problem data for proportional graphs
 */
export function genPGraph(difficulty = 'easy') {
  // 65% proportional, 35% non-proportional
  const isProportional = Math.random() < 0.65;

  if (!isProportional) {
    // --- Non-proportional (unchanged API; added variety preserved) ---
    const types = ['curved', 'notThroughOrigin', 'curvedNotThrough'];
    const type = types[Math.floor(Math.random() * types.length)];

    let whyNot, curveFunc, yIntercept, k;

    if (type === 'curved') {
      whyNot = 'notStraight';
      const coefficients = [0.05, 0.08, 0.1, 0.12, 0.16, 0.2];
      const a = coefficients[Math.floor(Math.random() * coefficients.length)];
      curveFunc = (x) => a * x * x;
    } else if (type === 'notThroughOrigin') {
      whyNot = 'notThroughOrigin';
      // Keep slopes varied and y-intercepts modest
      k = 1 + Math.floor(Math.random() * 12);          // 1..12
      yIntercept = 1 + Math.floor(Math.random() * 7);   // 1..7
    } else {
      whyNot = 'both';
      const coefficients = [0.04, 0.06, 0.08, 0.1, 0.12];
      const a = coefficients[Math.floor(Math.random() * coefficients.length)];
      const b = 1 + Math.floor(Math.random() * 5); // 1..5
      curveFunc = (x) => a * x * x + b;
    }

    return {
      isProportional: false,
      type,
      whyNot,
      curveFunc,
      yIntercept,
      k,
      perfectPoints: [],
    };
  }

  // --- Proportional case ---
  function gcd(a, b) { while (b) [a, b] = [b, a % b]; return Math.abs(a); }

  // Bias away from integers to avoid "every point is perfect" feel:
  //  - 15% integers (1..14)
  //  - 55% proper fractions (num < den, den up to 15)
  //  - 30% improper fractions (non-integer)
  let num, den;
  const roll = Math.random();
  if (roll < 0.15) {
    den = 1;
    num = 1 + Math.floor(Math.random() * 14); // 1..14
  } else if (roll < 0.70) {
    den = 3 + Math.floor(Math.random() * 13); // 3..15
    num = 1 + Math.floor(Math.random() * (den - 1)); // 1..den-1
  } else {
    den = 2 + Math.floor(Math.random() * 12); // 2..13
    let base = den + 1 + Math.floor(Math.random() * 12); // (den+1)..(den+12)
    if (base % den === 0) base += 1; // ensure non-integer
    num = base;
  }

  // Reduce to lowest terms to define the fundamental lattice step
  const g = gcd(num, den);
  const baseNum = num / g;
  const baseDen = den / g;

  const k = num / den;

  // --- 2-decimal display fields (do NOT use for math) ---
  const kRounded = Number(k.toFixed(2));           // numeric 2-dec
  const kRoundedText = k.toFixed(2);               // string "x.xx"
  const kFractionText = `${num}/${den}`;

  // --- Perfect points: return a *subset* (3..6) of lattice points, not every multiple ---
  // Pick random m values to sample sparse points so UI never looks "all perfect."
  const perfectPoints = [];
  const wanted = 3 + Math.floor(Math.random() * 4); // 3..6
  const used = new Set();
  const mMax = 16; // cap size so numbers stay readable

  while (perfectPoints.length < wanted) {
    const m = 1 + Math.floor(Math.random() * mMax); // 1..mMax
    if (used.has(m)) continue;
    used.add(m);
    const x = m * baseDen;
    const y = m * baseNum;
    if (x >= 1 && y >= 1) perfectPoints.push({ x, y });
  }

  return {
    isProportional: true,
    type: 'proportional',
    k,                 // keep full-precision number for all computations
    kNum: num,         // NEW: integer numerator
    kDen: den,         // NEW: integer denominator
    kRounded,          // NEW: numeric rounded (2 decimals) if you need numeric compare within tolerance
    kRoundedText,      // NEW: "x.xx" for UI labels
    kFractionText,     // NEW: "num/den" for UI fraction display
    perfectPoints,     // limited subset for variety
  };
}
