// src/lib/generator.js (v4.1 - IMPROVED FOR REAL KIDS)

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

/* IMPROVED SCENES -> relatable, funny, Mad Lib-able */
const SCENES = {
  hot_cheetos_inventory: {
    units: ['length','mass','volume','time'],
    motivations: ['avoid_running_out','impress_the_manager','beat_the_competition','make_money_moves'],
    nouns: { length: 'shelf space', mass: 'bag weight', volume: 'display bin', time: 'restock time' }
  },
  tiktok_dance_challenge: {
    units: ['time','length'],
    motivations: ['go_viral','beat_your_cousin','avoid_embarrassment','prove_them_wrong'],
    nouns: { time: 'dance routine', length: 'camera distance' }
  },
  basketball_court_diagram: {
    units: ['length','time'],
    motivations: ['win_the_game','prove_them_wrong','impress_that_person','avoid_embarrassment'],
    nouns: { length: 'three-point line', time: 'possession time' }
  },
  abuela_recipe_conversion: {
    units: ['volume','mass','time'],
    motivations: ['not_mess_it_up','impress_the_family','avoid_getting_roasted','make_it_perfect'],
    nouns: { volume: 'adobo amount', mass: 'chicken weight', time: 'cooking time' }
  },
  sneaker_trading_scheme: {
    units: ['length','time','mass'],
    motivations: ['make_money_moves','beat_the_competition','not_get_finessed','prove_them_wrong'],
    nouns: { length: 'shoe size', time: 'delivery wait', mass: 'box weight' }
  },
  hallway_sprint_strategy: {
    units: ['length','time'],
    motivations: ['avoid_being_late','beat_the_bell','avoid_embarrassment','prove_you_fast'],
    nouns: { length: 'hallway distance', time: 'class change period' }
  },
  bodega_sandwich_formula: {
    units: ['volume','mass','length','time'],
    motivations: ['make_it_perfect','not_mess_it_up','impress_the_bodega_guy','avoid_getting_roasted'],
    nouns: { volume: 'sauce amount', mass: 'bacon weight', length: 'hero size', time: 'grill time' }
  },
  group_chat_chaos_analysis: {
    units: ['time','length'],
    motivations: ['prove_them_wrong','go_viral','avoid_embarrassment','expose_the_truth'],
    nouns: { time: 'message rate', length: 'screenshot length' }
  },
  phone_screen_time_investigation: {
    units: ['time','length'],
    motivations: ['expose_the_truth','avoid_getting_caught','prove_them_wrong','hide_the_evidence'],
    nouns: { time: 'TikTok hours', length: 'scroll distance' }
  },
  pizza_party_economics: {
    units: ['length','mass','time','volume'],
    motivations: ['not_get_finessed','make_money_moves','prove_you_smart','avoid_being_broke'],
    nouns: { length: 'slice size', mass: 'cheese weight', time: 'delivery time', volume: 'soda amount' }
  },
  barbershop_wait_calculation: {
    units: ['time','length'],
    motivations: ['avoid_wasting_time','beat_the_system','prove_you_smart','not_miss_the_game'],
    nouns: { time: 'wait time', length: 'line length' }
  },
  subway_sandwich_optimization: {
    units: ['length','mass','volume','time'],
    motivations: ['not_get_finessed','make_it_perfect','prove_you_smart','avoid_being_hungry'],
    nouns: { length: 'sandwich length', mass: 'meat weight', volume: 'veggie amount', time: 'lunch period' }
  },
  spotify_playlist_engineering: {
    units: ['time','length'],
    motivations: ['make_it_perfect','impress_that_person','go_viral','prove_your_taste'],
    nouns: { time: 'song duration', length: 'playlist length' }
  },
  gaming_tournament_bracket: {
    units: ['time','length'],
    motivations: ['win_the_tournament','prove_them_wrong','make_money_moves','avoid_embarrassment'],
    nouns: { time: 'match duration', length: 'bracket size' }
  },
  lunch_money_exchange_rate: {
    units: ['mass','volume','time'],
    motivations: ['not_get_finessed','make_money_moves','prove_you_smart','avoid_being_hungry'],
    nouns: { mass: 'chip bag size', volume: 'juice amount', time: 'lunch period' }
  },
  instagram_story_timing: {
    units: ['time','length'],
    motivations: ['go_viral','avoid_embarrassment','impress_that_person','prove_your_aesthetic'],
    nouns: { time: 'story duration', length: 'caption length' }
  }
}

/* Fragment lexicon: place & why (EN/ES/FR/DE/SW/VI) - IMPROVED TO BE FUNNY & LONG */
const LEX = {
  English: {
    place: {
      hot_cheetos_inventory: 'a highly scientific inventory spreadsheet for the corner store\'s Hot Cheetos and Takis supply situation',
      tiktok_dance_challenge: 'an extremely detailed breakdown of that one TikTok dance that everyone\'s doing but nobody can get right',
      basketball_court_diagram: 'a professional-looking (but drawn in pen) basketball court diagram for the ultimate pickup game',
      abuela_recipe_conversion: 'their abuela\'s secret recipe that was written on a napkin with measurements like "a little bit" and "enough"',
      sneaker_trading_scheme: 'a complex business plan for trading sneakers with kids from three different schools to maximize drip',
      hallway_sprint_strategy: 'a tactical map of the fastest route through the hallways that avoids hall monitors and slow walkers',
      bodega_sandwich_formula: 'the legendary bacon egg and cheese formula that the bodega guy makes different every single time',
      group_chat_chaos_analysis: 'a forensic investigation of last night\'s group chat that somehow got to 847 messages while they slept',
      phone_screen_time_investigation: 'their phone\'s screen time report that they\'re definitely NOT showing their parents under any circumstances',
      pizza_party_economics: 'an economic analysis of the pizza party where someone suggested splitting the cost "equally" (suspicious)',
      barbershop_wait_calculation: 'a mathematical model of the barbershop wait time that somehow always takes longer than they said',
      subway_sandwich_optimization: 'a detailed blueprint for getting the maximum amount of sandwich for their money at Subway',
      spotify_playlist_engineering: 'a carefully curated Spotify playlist where every song has to flow perfectly or the whole vibe is ruined',
      gaming_tournament_bracket: 'a tournament bracket for the gaming competition where literally everyone claims they\'re gonna win',
      lunch_money_exchange_rate: 'the complex exchange rate system for trading lunch money, snacks, and favors in the cafeteria',
      instagram_story_timing: 'a strategic posting schedule for Instagram stories to maximize views from That One Person'
    },
    why: {
      avoid_running_out: 'because running out means everyone gets mad and they might have to walk to the OTHER store',
      impress_the_manager: 'to finally prove to the manager that they know what they\'re doing (even though they definitely don\'t)',
      beat_the_competition: 'to absolutely destroy the competition and prove once and for all who\'s really better at this',
      make_money_moves: 'because they\'re trying to make some money moves and not stay broke forever like everyone expects',
      go_viral: 'because this could be the one that finally goes viral and gets them more followers than their annoying cousin',
      beat_your_cousin: 'to prove their cousin wrong for once in their life and maybe rub it in a little bit (a lot)',
      avoid_embarrassment: 'to avoid the absolutely devastating embarrassment of messing this up in front of everybody',
      prove_them_wrong: 'to prove all the haters and doubters wrong because they said it couldn\'t be done but watch this',
      win_the_game: 'because winning this game means bragging rights for at least the next month or until someone brings up that time they lost',
      impress_that_person: 'to lowkey impress that one person without making it obvious that that\'s what they\'re trying to do',
      not_mess_it_up: 'because if they mess this up everyone will remember it forever and bring it up at every family gathering',
      impress_the_family: 'to finally get some respect from the family instead of being known as "the one who can\'t cook"',
      avoid_getting_roasted: 'to avoid getting absolutely roasted in the group chat if this goes wrong',
      make_it_perfect: 'because it has to be absolutely perfect or there\'s literally no point in even doing it',
      not_get_finessed: 'to make sure they don\'t get finessed like last time when they paid way too much for way too little',
      avoid_being_late: 'because being late again means detention and their mom already said she\'s not picking them up this time',
      beat_the_bell: 'to beat the bell before it rings and they get marked late which their teacher definitely keeps track of',
      prove_you_fast: 'to prove they\'re actually fast and not just talking big like everyone says they always do',
      impress_the_bodega_guy: 'to impress the bodega guy who always remembers everyone\'s orders and they want to be a legend too',
      expose_the_truth: 'to expose the truth about what actually happened because somebody\'s lying and the receipts don\'t lie',
      avoid_getting_caught: 'to cover their tracks and avoid getting caught because if their parents find out it\'s game over',
      hide_the_evidence: 'to hide the evidence before someone asks questions they definitely don\'t want to answer',
      prove_you_smart: 'to prove they\'re actually smart and not just "street smart" like everyone always says',
      avoid_being_broke: 'because being broke is not the vibe and they need to make this money stretch until Friday',
      avoid_wasting_time: 'because time is money and they\'re not about to waste three hours sitting around waiting',
      beat_the_system: 'to beat the system like a genius instead of just accepting how things are supposed to work',
      not_miss_the_game: 'because if they miss the game their friends will never let them hear the end of it',
      avoid_being_hungry: 'because being hungry for the rest of the day is absolutely not an option when they got classes',
      prove_your_taste: 'to prove their music taste is superior and everyone else is just following trends',
      win_the_tournament: 'to win this tournament and claim the title they\'ve been training for (playing for) weeks',
      prove_your_aesthetic: 'to prove their aesthetic is on point and not "trying too hard" like some people claim'
    }
  },
  Spanish: {
    place: {
      hot_cheetos_inventory: 'un inventario científico del suministro de Hot Cheetos y Takis de la tienda de la esquina',
      tiktok_dance_challenge: 'un desglose súper detallado de ese baile de TikTok que todos hacen pero nadie puede hacer bien',
      basketball_court_diagram: 'un diagrama de cancha de baloncesto que se ve profesional (pero dibujado con pluma)',
      abuela_recipe_conversion: 'la receta secreta de su abuela escrita en una servilleta con medidas como "un poquito" y "suficiente"',
      sneaker_trading_scheme: 'un plan de negocios complejo para cambiar tenis con chicos de tres escuelas diferentes',
      hallway_sprint_strategy: 'un mapa táctico de la ruta más rápida por los pasillos evitando monitores y gente lenta',
      bodega_sandwich_formula: 'la fórmula legendaria del sándwich de tocino, huevo y queso que sale diferente cada vez',
      group_chat_chaos_analysis: 'una investigación forense del chat grupal de anoche que llegó a 847 mensajes mientras dormían',
      phone_screen_time_investigation: 'el reporte de tiempo en pantalla que definitivamente NO van a mostrar a sus padres',
      pizza_party_economics: 'un análisis económico de la fiesta de pizza donde alguien sugirió dividir "equitativamente"',
      barbershop_wait_calculation: 'un modelo matemático del tiempo de espera en la barbería que siempre toma más de lo que dicen',
      subway_sandwich_optimization: 'un plan detallado para obtener la máxima cantidad de sándwich por su dinero',
      spotify_playlist_engineering: 'una playlist de Spotify curada donde cada canción tiene que fluir perfectamente',
      gaming_tournament_bracket: 'un bracket de torneo donde literalmente todos dicen que van a ganar',
      lunch_money_exchange_rate: 'el sistema complejo de intercambio de dinero de almuerzo, snacks y favores',
      instagram_story_timing: 'un horario estratégico para publicar stories y maximizar vistas de Esa Persona'
    },
    why: {
      avoid_running_out: 'porque si se acaban todos se enojan y toca caminar a la OTRA tienda',
      impress_the_manager: 'para probar al manager que saben lo que hacen (aunque claramente no)',
      beat_the_competition: 'para destruir a la competencia y probar de una vez quién es mejor',
      make_money_moves: 'porque están tratando de hacer dinero y no quedarse quebrados',
      go_viral: 'porque esto podría ser lo que finalmente se hace viral',
      beat_your_cousin: 'para probar que su primo está equivocado por una vez en su vida',
      avoid_embarrassment: 'para evitar la vergüenza devastadora de arruinar esto frente a todos',
      prove_them_wrong: 'para probar que todos los haters estaban equivocados',
      win_the_game: 'porque ganar este juego significa presumir por lo menos el próximo mes',
      impress_that_person: 'para impresionar a esa persona sin que sea obvio',
      not_mess_it_up: 'porque si lo arruinan todos lo van a recordar para siempre',
      impress_the_family: 'para finalmente ganarse respeto en vez de ser "el que no sabe cocinar"',
      avoid_getting_roasted: 'para evitar que los destruyan en el chat grupal',
      make_it_perfect: 'porque tiene que ser absolutamente perfecto',
      not_get_finessed: 'para asegurar que no los timen como la última vez',
      avoid_being_late: 'porque llegar tarde otra vez significa detención',
      beat_the_bell: 'para ganarle a la campana antes de que suene',
      prove_you_fast: 'para probar que son rápidos y no solo hablando',
      impress_the_bodega_guy: 'para impresionar al tipo de la bodega que recuerda todas las órdenes',
      expose_the_truth: 'para exponer la verdad porque alguien está mintiendo',
      avoid_getting_caught: 'para no ser atrapados porque si sus padres se enteran se acabó',
      hide_the_evidence: 'para ocultar la evidencia antes de que hagan preguntas',
      prove_you_smart: 'para probar que son inteligentes de verdad',
      avoid_being_broke: 'porque estar quebrado no es la onda',
      avoid_wasting_time: 'porque el tiempo es dinero',
      beat_the_system: 'para vencer el sistema como un genio',
      not_miss_the_game: 'porque si pierden el juego sus amigos nunca los dejarán olvidarlo',
      avoid_being_hungry: 'porque tener hambre el resto del día no es opción',
      prove_your_taste: 'para probar que su gusto musical es superior',
      win_the_tournament: 'para ganar este torneo y reclamar el título',
      prove_your_aesthetic: 'para probar que su estética está perfecta'
    }
  },
  French: {
    place: {
      hot_cheetos_inventory: 'un inventaire scientifique des Hot Cheetos et Takis du magasin du coin',
      tiktok_dance_challenge: 'une analyse détaillée de cette danse TikTok que tout le monde fait mais personne ne réussit',
      basketball_court_diagram: 'un schéma de terrain de basket qui a l\'air professionnel (mais dessiné au stylo)',
      abuela_recipe_conversion: 'la recette secrète de grand-mère écrite sur une serviette avec des mesures comme "un peu"',
      sneaker_trading_scheme: 'un plan d\'affaires complexe pour échanger des baskets avec des jeunes de trois écoles',
      hallway_sprint_strategy: 'une carte tactique du chemin le plus rapide évitant les surveillants',
      bodega_sandwich_formula: 'la formule légendaire du sandwich bacon-œuf-fromage qui sort différent chaque fois',
      group_chat_chaos_analysis: 'une enquête sur le chat de groupe qui a atteint 847 messages pendant leur sommeil',
      phone_screen_time_investigation: 'le rapport de temps d\'écran qu\'ils ne montreront définitivement PAS à leurs parents',
      pizza_party_economics: 'une analyse économique de la fête pizza où quelqu\'un a suggéré de partager "équitablement"',
      barbershop_wait_calculation: 'un modèle mathématique du temps d\'attente qui prend toujours plus longtemps',
      subway_sandwich_optimization: 'un plan détaillé pour obtenir le maximum de sandwich pour leur argent',
      spotify_playlist_engineering: 'une playlist Spotify où chaque chanson doit s\'enchaîner parfaitement',
      gaming_tournament_bracket: 'un tournoi où littéralement tout le monde prétend qu\'ils vont gagner',
      lunch_money_exchange_rate: 'le système complexe d\'échange d\'argent de repas, snacks et faveurs',
      instagram_story_timing: 'un calendrier stratégique pour maximiser les vues de Cette Personne'
    },
    why: {
      avoid_running_out: 'parce que manquer de stock énerve tout le monde',
      impress_the_manager: 'pour prouver au gérant qu\'ils savent ce qu\'ils font',
      beat_the_competition: 'pour détruire la compétition une fois pour toutes',
      make_money_moves: 'parce qu\'ils essaient de faire de l\'argent',
      go_viral: 'parce que ça pourrait enfin devenir viral',
      beat_your_cousin: 'pour prouver que leur cousin a tort pour une fois',
      avoid_embarrassment: 'pour éviter l\'embarras dévastateur de rater ça',
      prove_them_wrong: 'pour prouver que tous les haters avaient tort',
      win_the_game: 'parce que gagner ce jeu veut dire se vanter pendant un mois',
      impress_that_person: 'pour impressionner cette personne sans que ce soit évident',
      not_mess_it_up: 'parce que s\'ils ratent ça tout le monde s\'en souviendra',
      impress_the_family: 'pour enfin gagner du respect au lieu d\'être "celui qui cuisine mal"',
      avoid_getting_roasted: 'pour éviter de se faire détruire dans le chat de groupe',
      make_it_perfect: 'parce que ça doit être absolument parfait',
      not_get_finessed: 'pour s\'assurer de ne pas se faire arnaquer',
      avoid_being_late: 'parce qu\'être en retard encore veut dire retenue',
      beat_the_bell: 'pour battre la cloche avant qu\'elle sonne',
      prove_you_fast: 'pour prouver qu\'ils sont vraiment rapides',
      impress_the_bodega_guy: 'pour impressionner le gars qui se souvient de toutes les commandes',
      expose_the_truth: 'pour exposer la vérité parce que quelqu\'un ment',
      avoid_getting_caught: 'pour éviter de se faire attraper',
      hide_the_evidence: 'pour cacher les preuves avant les questions',
      prove_you_smart: 'pour prouver qu\'ils sont vraiment intelligents',
      avoid_being_broke: 'parce qu\'être fauché n\'est pas le mood',
      avoid_wasting_time: 'parce que le temps c\'est de l\'argent',
      beat_the_system: 'pour battre le système comme un génie',
      not_miss_the_game: 'parce que manquer le match serait insupportable',
      avoid_being_hungry: 'parce qu\'avoir faim toute la journée n\'est pas une option',
      prove_your_taste: 'pour prouver que leur goût musical est supérieur',
      win_the_tournament: 'pour gagner ce tournoi et réclamer le titre',
      prove_your_aesthetic: 'pour prouver que leur esthétique est parfaite'
    }
  },
  German: {
    place: {
      hot_cheetos_inventory: 'eine wissenschaftliche Bestandsaufnahme der Hot Cheetos und Takis im Eckladen',
      tiktok_dance_challenge: 'eine detaillierte Analyse dieses TikTok-Tanzes, den alle machen aber niemand hinkriegt',
      basketball_court_diagram: 'ein professionell aussehendes (aber mit Kugelschreiber gezeichnetes) Basketballfeld-Diagramm',
      abuela_recipe_conversion: 'das Geheimrezept von Oma auf einer Serviette mit Maßangaben wie "ein bisschen"',
      sneaker_trading_scheme: 'ein komplexer Geschäftsplan zum Tauschen von Sneakers mit Kids von drei verschiedenen Schulen',
      hallway_sprint_strategy: 'eine taktische Karte der schnellsten Route durch die Flure',
      bodega_sandwich_formula: 'die legendäre Speck-Ei-Käse-Formel die jedes Mal anders rauskommt',
      group_chat_chaos_analysis: 'eine forensische Untersuchung des Gruppenchats mit 847 Nachrichten über Nacht',
      phone_screen_time_investigation: 'der Bildschirmzeit-Bericht den sie definitiv NICHT ihren Eltern zeigen',
      pizza_party_economics: 'eine ökonomische Analyse der Pizza-Party mit "gleichmäßiger" Kostenaufteilung',
      barbershop_wait_calculation: 'ein mathematisches Modell der Wartezeit beim Friseur',
      subway_sandwich_optimization: 'ein detaillierter Plan für maximalen Sandwich pro Euro',
      spotify_playlist_engineering: 'eine kuratierte Spotify-Playlist wo jeder Song perfekt passen muss',
      gaming_tournament_bracket: 'ein Turnier-Bracket wo buchstäblich jeder behauptet zu gewinnen',
      lunch_money_exchange_rate: 'das komplexe Wechselkurssystem für Pausengeld, Snacks und Gefallen',
      instagram_story_timing: 'ein strategischer Posting-Plan um Views von Dieser Einen Person zu maximieren'
    },
    why: {
      avoid_running_out: 'weil wenn es ausgeht werden alle sauer',
      impress_the_manager: 'um dem Manager zu beweisen dass sie wissen was sie tun',
      beat_the_competition: 'um die Konkurrenz zu vernichten',
      make_money_moves: 'weil sie Geld machen wollen',
      go_viral: 'weil das endlich viral gehen könnte',
      beat_your_cousin: 'um dem Cousin zu beweisen dass er unrecht hat',
      avoid_embarrassment: 'um die verheerende Peinlichkeit zu vermeiden',
      prove_them_wrong: 'um allen Hatern zu beweisen dass sie falsch lagen',
      win_the_game: 'weil das Spiel gewinnen bedeutet einen Monat lang anzugeben',
      impress_that_person: 'um diese Person zu beeindrucken ohne dass es offensichtlich ist',
      not_mess_it_up: 'weil wenn sie das vermasseln werden sich alle für immer daran erinnern',
      impress_the_family: 'um endlich Respekt zu bekommen',
      avoid_getting_roasted: 'um im Gruppenchat nicht zerstört zu werden',
      make_it_perfect: 'weil es absolut perfekt sein muss',
      not_get_finessed: 'um sicherzugehen nicht abgezockt zu werden',
      avoid_being_late: 'weil zu spät kommen Nachsitzen bedeutet',
      beat_the_bell: 'um die Glocke zu schlagen',
      prove_you_fast: 'um zu beweisen dass sie wirklich schnell sind',
      impress_the_bodega_guy: 'um den Typ zu beeindrucken der sich alle Bestellungen merkt',
      expose_the_truth: 'um die Wahrheit aufzudecken',
      avoid_getting_caught: 'um nicht erwischt zu werden',
      hide_the_evidence: 'um die Beweise zu verstecken',
      prove_you_smart: 'um zu beweisen dass sie wirklich schlau sind',
      avoid_being_broke: 'weil pleite sein nicht der Vibe ist',
      avoid_wasting_time: 'weil Zeit Geld ist',
      beat_the_system: 'um das System zu schlagen',
      not_miss_the_game: 'weil das Spiel zu verpassen unerträglich wäre',
      avoid_being_hungry: 'weil den ganzen Tag Hunger haben keine Option ist',
      prove_your_taste: 'um zu beweisen dass ihr Musikgeschmack überlegen ist',
      win_the_tournament: 'um dieses Turnier zu gewinnen',
      prove_your_aesthetic: 'um zu beweisen dass ihre Ästhetik perfekt ist'
    }
  },
  Swahili: {
    place: {
      hot_cheetos_inventory: 'hesabu ya kisayansi ya Hot Cheetos na Takis katika duka la pembeni',
      tiktok_dance_challenge: 'uchambuzi wa kina wa dansi ya TikTok ambayo kila mtu anafanya lakini hakuna anayefaulu',
      basketball_court_diagram: 'mchoro wa uwanja wa basketball unaoonekana wa kitaalamu',
      abuela_recipe_conversion: 'mapishi ya siri ya bibi yaliyoandikwa kwenye kitambaa',
      sneaker_trading_scheme: 'mpango wa biashara wa kubadilishana viatu na watoto wa shule tatu',
      hallway_sprint_strategy: 'ramani ya njia ya haraka zaidi kupitia njia za kusogea',
      bodega_sandwich_formula: 'fomula ya kihistoria ya sandwich ya bacon, mayai na cheese',
      group_chat_chaos_analysis: 'uchunguzi wa chat ya kikundi iliyofikia ujumbe 847 usiku',
      phone_screen_time_investigation: 'ripoti ya muda wa skrini ambayo HAWATAONYESHA wazazi',
      pizza_party_economics: 'uchambuzi wa uchumi wa pizza party',
      barbershop_wait_calculation: 'mfano wa hisabati wa muda wa kusubiri kinyozini',
      subway_sandwich_optimization: 'mpango wa kina wa kupata sandwich zaidi kwa pesa yao',
      spotify_playlist_engineering: 'playlist ya Spotify iliyopangwa kwa uangalifu',
      gaming_tournament_bracket: 'bracket ya mashindano ambayo kila mtu anasema watashinda',
      lunch_money_exchange_rate: 'mfumo mgumu wa kubadilishana pesa ya chakula',
      instagram_story_timing: 'ratiba ya kimkakati ya kuposti stories'
    },
    why: {
      avoid_running_out: 'kwa sababu kukosa inawakasirishisha wote',
      impress_the_manager: 'kuthibitisha kwa meneja wanajua wanachofanya',
      beat_the_competition: 'kuangamiza ushindani',
      make_money_moves: 'kwa sababu wanajaribu kufanya pesa',
      go_viral: 'kwa sababu hii inaweza kuwa viral',
      beat_your_cousin: 'kuthibitisha binamu yao wamekosea',
      avoid_embarrassment: 'kuepuka aibu ya kukosea',
      prove_them_wrong: 'kuthibitisha wachukizi walikuwa hawana haki',
      win_the_game: 'kwa sababu kushinda mchezo kunamaana kujivuna',
      impress_that_person: 'kuwavutia mtu fulani bila kuonyesha wazi',
      not_mess_it_up: 'kwa sababu kukosea kila mtu atakumbuka',
      impress_the_family: 'kupata heshima',
      avoid_getting_roasted: 'kuepuka kuangamizwa kwenye chat',
      make_it_perfect: 'kwa sababu lazima iwe kamili',
      not_get_finessed: 'kuhakikisha hawahadaiwi',
      avoid_being_late: 'kwa sababu kuchelewa tena kunamaana adhabu',
      beat_the_bell: 'kushinda kengele',
      prove_you_fast: 'kuthibitisha wao ni wepesi kweli',
      impress_the_bodega_guy: 'kuwavutia mtu anayekumbuka maagizo yote',
      expose_the_truth: 'kufichua ukweli',
      avoid_getting_caught: 'kuepuka kushikwa',
      hide_the_evidence: 'kuficha ushahidi',
      prove_you_smart: 'kuthibitisha wao ni werevu kweli',
      avoid_being_broke: 'kwa sababu kuwa maskini si mood',
      avoid_wasting_time: 'kwa sababu muda ni pesa',
      beat_the_system: 'kushinda mfumo',
      not_miss_the_game: 'kwa sababu kukosa mchezo itakuwa mbaya',
      avoid_being_hungry: 'kwa sababu njaa siku nzima si chaguo',
      prove_your_taste: 'kuthibitisha ladha yao ya muziki ni bora',
      win_the_tournament: 'kushinda mashindano',
      prove_your_aesthetic: 'kuthibitisha aesthetic yao ni kamili'
    }
  },
  Vietnamese: {
    place: {
      hot_cheetos_inventory: 'bảng kiểm kê khoa học về nguồn cung Hot Cheetos và Takis của cửa hàng góc phố',
      tiktok_dance_challenge: 'phân tích chi tiết về điệu nhảy TikTok mà ai cũng làm nhưng không ai làm đúng',
      basketball_court_diagram: 'sơ đồ sân bóng rổ trông chuyên nghiệp (nhưng vẽ bằng bút)',
      abuela_recipe_conversion: 'công thức bí mật của bà được viết trên khăn giấy',
      sneaker_trading_scheme: 'kế hoạch kinh doanh phức tạp để đổi giày với học sinh từ ba trường khác nhau',
      hallway_sprint_strategy: 'bản đồ chiến thuật về tuyến đường nhanh nhất qua hành lang',
      bodega_sandwich_formula: 'công thức huyền thoại bánh mì bacon trứng phô mai',
      group_chat_chaos_analysis: 'cuộc điều tra về group chat đạt 847 tin nhắn qua đêm',
      phone_screen_time_investigation: 'báo cáo thời gian màn hình mà họ chắc chắn KHÔNG cho bố mẹ xem',
      pizza_party_economics: 'phân tích kinh tế về bữa tiệc pizza',
      barbershop_wait_calculation: 'mô hình toán học về thời gian chờ ở tiệm cắt tóc',
      subway_sandwich_optimization: 'kế hoạch chi tiết để có bánh mì tối đa với tiền của họ',
      spotify_playlist_engineering: 'playlist Spotify được chọn lọc cẩn thận',
      gaming_tournament_bracket: 'bảng đấu giải đấu mà ai cũng nói sẽ thắng',
      lunch_money_exchange_rate: 'hệ thống tỷ giá phức tạp để đổi tiền ăn trưa',
      instagram_story_timing: 'lịch trình chiến lược để đăng story'
    },
    why: {
      avoid_running_out: 'vì hết hàng nghĩa là mọi người sẽ giận',
      impress_the_manager: 'để chứng minh với quản lý rằng họ biết mình đang làm gì',
      beat_the_competition: 'để tiêu diệt đối thủ',
      make_money_moves: 'vì họ đang cố gắng kiếm tiền',
      go_viral: 'vì cái này cuối cùng có thể viral',
      beat_your_cousin: 'để chứng minh anh chị em họ sai',
      avoid_embarrassment: 'để tránh sự xấu hổ tàn khốc',
      prove_them_wrong: 'để chứng minh tất cả haters đều sai',
      win_the_game: 'vì thắng trò chơi này nghĩa là khoe khoang',
      impress_that_person: 'để gây ấn tượng với người đó mà không rõ ràng',
      not_mess_it_up: 'vì nếu họ làm hỏng mọi người sẽ nhớ mãi',
      impress_the_family: 'để cuối cùng có được sự tôn trọng',
      avoid_getting_roasted: 'để tránh bị phá hủy trong group chat',
      make_it_perfect: 'vì nó phải hoàn hảo',
      not_get_finessed: 'để chắc chắn không bị lừa',
      avoid_being_late: 'vì đến muộn nữa nghĩa là bị phạt',
      beat_the_bell: 'để đánh bại chuông',
      prove_you_fast: 'để chứng minh họ thực sự nhanh',
      impress_the_bodega_guy: 'để gây ấn tượng với người nhớ tất cả đơn hàng',
      expose_the_truth: 'để vạch trần sự thật',
      avoid_getting_caught: 'để tránh bị bắt',
      hide_the_evidence: 'để giấu bằng chứng',
      prove_you_smart: 'để chứng minh họ thực sự thông minh',
      avoid_being_broke: 'vì hết tiền không phải tâm trạng',
      avoid_wasting_time: 'vì thời gian là tiền bạc',
      beat_the_system: 'để đánh bại hệ thống',
      not_miss_the_game: 'vì lỡ trận đấu sẽ không thể chịu được',
      avoid_being_hungry: 'vì đói cả ngày không phải là lựa chọn',
      prove_your_taste: 'để chứng minh gu âm nhạc của họ là tốt hơn',
      win_the_tournament: 'để thắng giải đấu này',
      prove_your_aesthetic: 'để chứng minh thẩm mỹ của họ là hoàn hảo'
    }
  }
}

/* Language list for rotation */
const LANGS = ['Spanish','French','German','Swahili','Vietnamese']
const ALT_ORDER = [...LANGS, 'XXXX']

/* IMPROVED OPENERS - funnier, more relatable */
const OPENERS = {
  English: [
    'is definitely overthinking', 'got volunteered by their cousin to figure out', 'is procrastinating homework by calculating',
    'is low-key obsessing over', 'got called out and now has to prove', 'is stress-calculating',
    'is avoiding doing actual work by analyzing', 'got into a bet about', 'is trying to finesse',
    'is absolutely convinced they can optimize', 'got challenged on TikTok to solve', 'is making a whole presentation about',
    'is texting their friend group about', 'spent their entire lunch period working on', 'is about to blow everyone\'s mind with',
    'stayed up way too late perfecting', 'has receipts and calculations for'
  ],
  Spanish: ['está definitivamente pensando demasiado en', 'fue voluntariado por su primo para resolver', 'está procrastinando la tarea calculando',
            'está obsesionado con', 'lo retaron y ahora tiene que probar', 'está calculando con estrés',
            'está evitando hacer trabajo real analizando', 'apostó sobre', 'está tratando de optimizar'],
  French:  ['réfléchit trop à', 'a été volontaire désigné par leur cousin pour résoudre', 'procrastine leurs devoirs en calculant',
            'est obsédé par', 'a été défié et doit maintenant prouver', 'calcule avec stress',
            'évite le vrai travail en analysant', 'a parié sur', 'essaie d\'optimiser'],
  German:  ['denkt definitiv zu viel über', 'wurde von ihrem Cousin verpflichtet zu lösen', 'prokrastiniert Hausaufgaben durch Berechnen',
            'ist besessen von', 'wurde herausgefordert und muss jetzt beweisen', 'berechnet gestresst',
            'vermeidet echte Arbeit durch Analysieren', 'hat gewettet über', 'versucht zu optimieren'],
  Swahili: ['anawaza sana juu ya', 'amejitolea na binamu yake kutatua', 'anachelewesha kazi za nyumbani kwa kuhesabu',
            'ana obsession na', 'alichanguliwa na sasa lazima athibitishe', 'anahesabu kwa msongo wa mawazo',
            'anaepuka kazi halisi kwa kuchanganua', 'alifanya bahati juu ya', 'anajaribu kuboresha'],
  Vietnamese: ['đang suy nghĩ quá nhiều về', 'bị anh chị em họ tình nguyện để giải quyết', 'đang trì hoãn bài tập bằng cách tính toán',
               'đang ám ảnh với', 'bị thách thức và bây giờ phải chứng minh', 'đang tính toán căng thẳng',
               'đang tránh công việc thật bằng cách phân tích', 'đã đánh cược về', 'đang cố gắng tối ưu hóa']
}

/* Scale-line variants (all embed a,b,u1,u2 clearly) - IMPROVED */
const SCALE_LINES = {
  English: [
    o => `According to the notes they found: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Their calculations show that: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `The facts are simple: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `After extensive research (googling for 5 minutes): ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `The conversion rate is crystal clear: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Written in permanent marker on their hand: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `The screenshot they saved says: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `According to that one reliable source: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `The math is mathing: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `No cap, the ratio is: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  Spanish: [
    o => `Según las notas que encontraron: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Sus cálculos muestran que: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Los hechos son simples: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `La tasa de conversión es clara: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Escrito en marcador en su mano: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `La matemática está clara: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  French: [
    o => `Selon les notes qu'ils ont trouvées : ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Leurs calculs montrent que : ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Les faits sont simples : ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Le taux de conversion est clair : ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Écrit au marqueur sur leur main : ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Les maths sont clairs : ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  German: [
    o => `Laut den Notizen die sie fanden: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Ihre Berechnungen zeigen: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Die Fakten sind einfach: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Die Umrechnungsrate ist klar: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Mit Marker auf ihre Hand geschrieben: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Die Mathematik stimmt: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  Swahili: [
    o => `Kulingana na maelezo waliyopata: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Mahesabu yao yanaonyesha: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Ukweli ni rahisi: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Kiwango cha ubadilishaji ni wazi: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Imeandikwa kwa kalamu kwenye mkono wao: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Hisabati inakubali: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ],
  Vietnamese: [
    o => `Theo ghi chú họ tìm thấy: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Phép tính của họ cho thấy: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Sự thật rất đơn giản: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Tỷ lệ chuyển đổi rõ ràng: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Viết bằng bút lông trên tay: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`,
    o => `Toán học đúng: ${o.a} ${o.u1} = ${o.b} ${o.u2}.`
  ]
}

/* Category-tailored question templates - IMPROVED */
const QUESTIONS = {
  English: {
    length: [
      o => `In ${o.place}, one ${o.noun} is ${o.g} ${o.uGiven}. Convert that to ${o.uOther}.`,
      o => `The ${o.noun} measures ${o.g} ${o.uGiven}. What is that in ${o.uOther}?`,
      o => `They need ${o.g} ${o.uGiven} for the ${o.noun}. How much is that in ${o.uOther}?`,
      o => `According to their calculations, the ${o.noun} is ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`,
      o => `The measurement shows ${o.g} ${o.uGiven} for the ${o.noun}. What's that in ${o.uOther}?`
    ],
    time: [
      o => `For ${o.place}, the ${o.noun} takes ${o.g} ${o.uGiven}. How many ${o.uOther} is that?`,
      o => `They calculated ${o.g} ${o.uGiven} for the ${o.noun}. Convert to ${o.uOther}.`,
      o => `The ${o.noun} lasts ${o.g} ${o.uGiven}. Express this in ${o.uOther}.`,
      o => `It takes ${o.g} ${o.uGiven} for the ${o.noun}. What is that in ${o.uOther}?`,
      o => `The timing is ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`
    ],
    volume: [
      o => `They need ${o.g} ${o.uGiven} of ${o.noun}. How much is that in ${o.uOther}?`,
      o => `The ${o.noun} requires ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`,
      o => `Measurements show ${o.g} ${o.uGiven} for the ${o.noun}. What is that in ${o.uOther}?`,
      o => `They're using ${o.g} ${o.uGiven} for the ${o.noun}. Express in ${o.uOther}.`,
      o => `The amount is ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`
    ],
    mass: [
      o => `The ${o.noun} weighs ${o.g} ${o.uGiven}. What is that in ${o.uOther}?`,
      o => `They measured ${o.g} ${o.uGiven} for the ${o.noun}. Convert to ${o.uOther}.`,
      o => `Weight shows ${o.g} ${o.uGiven}. How many in ${o.uOther}?`,
      o => `It weighs ${o.g} ${o.uGiven}. Convert to ${o.uOther}.`,
      o => `Mass is ${o.g} ${o.uGiven}. What's that in ${o.uOther}?`
    ]
  },
  Spanish: {
    length: [
      o => `En ${o.place}, un ${o.noun} mide ${o.g} ${o.uGiven}. ¿Cuánto es en ${o.uOther}?`,
      o => `El ${o.noun} mide ${o.g} ${o.uGiven}. Convierte a ${o.uOther}.`,
      o => `Necesitan ${o.g} ${o.uGiven} para el ${o.noun}. ¿Cuánto es en ${o.uOther}?`
    ],
    time: [
      o => `Para ${o.place}, el ${o.noun} toma ${o.g} ${o.uGiven}. ¿Cuántos ${o.uOther} son?`,
      o => `El ${o.noun} dura ${o.g} ${o.uGiven}. Convierte a ${o.uOther}.`
    ],
    volume: [
      o => `Necesitan ${o.g} ${o.uGiven} de ${o.noun}. ¿Cuánto es en ${o.uOther}?`,
      o => `El ${o.noun} requiere ${o.g} ${o.uGiven}. Convierte a ${o.uOther}.`
    ],
    mass: [
      o => `El ${o.noun} pesa ${o.g} ${o.uGiven}. ¿En ${o.uOther} cuánto es?`,
      o => `Midieron ${o.g} ${o.uGiven}. Convierte a ${o.uOther}.`
    ]
  },
  French: {
    length: [
      o => `Dans ${o.place}, un ${o.noun} fait ${o.g} ${o.uGiven}. Combien en ${o.uOther} ?`,
      o => `Le ${o.noun} mesure ${o.g} ${o.uGiven}. Convertir en ${o.uOther}.`
    ],
    time: [
      o => `Pour ${o.place}, le ${o.noun} dure ${o.g} ${o.uGiven}. Combien en ${o.uOther} ?`,
      o => `Le ${o.noun} prend ${o.g} ${o.uGiven}. Convertir en ${o.uOther}.`
    ],
    volume: [
      o => `Ils ont besoin de ${o.g} ${o.uGiven} de ${o.noun}. En ${o.uOther} ?`,
      o => `Le ${o.noun} nécessite ${o.g} ${o.uGiven}. Convertir en ${o.uOther}.`
    ],
    mass: [
      o => `Le ${o.noun} pèse ${o.g} ${o.uGiven}. Combien en ${o.uOther} ?`,
      o => `Mesure: ${o.g} ${o.uGiven}. Convertir en ${o.uOther}.`
    ]
  },
  German: {
    length: [
      o => `In ${o.place} misst ein ${o.noun} ${o.g} ${o.uGiven}. Wie viel ist das in ${o.uOther}?`,
      o => `Der ${o.noun} beträgt ${o.g} ${o.uGiven}. Umrechnen in ${o.uOther}.`
    ],
    time: [
      o => `Für ${o.place} dauert der ${o.noun} ${o.g} ${o.uGiven}. Wieviel in ${o.uOther}?`,
      o => `Der ${o.noun} nimmt ${o.g} ${o.uGiven}. Umrechnen in ${o.uOther}.`
    ],
    volume: [
      o => `Sie brauchen ${o.g} ${o.uGiven} ${o.noun}. Wieviel ist das in ${o.uOther}?`,
      o => `Der ${o.noun} erfordert ${o.g} ${o.uGiven}. Umrechnen in ${o.uOther}.`
    ],
    mass: [
      o => `Der ${o.noun} wiegt ${o.g} ${o.uGiven}. Wieviel in ${o.uOther}?`,
      o => `Gemessen: ${o.g} ${o.uGiven}. In ${o.uOther} umrechnen.`
    ]
  },
  Swahili: {
    length: [
      o => `Katika ${o.place}, ${o.noun} ni ${o.g} ${o.uGiven}. Ni ngapi kwa ${o.uOther}?`,
      o => `${o.noun} ni ${o.g} ${o.uGiven}. Badili kuwa ${o.uOther}.`
    ],
    time: [
      o => `Kwa ${o.place}, ${o.noun} huchukua ${o.g} ${o.uGiven}. Ni ngapi kwa ${o.uOther}?`,
      o => `${o.noun} huchukua ${o.g} ${o.uGiven}. Badili kuwa ${o.uOther}.`
    ],
    volume: [
      o => `Wanahitaji ${o.g} ${o.uGiven} ya ${o.noun}. Ni kiasi gani kwa ${o.uOther}?`
    ],
    mass: [
      o => `${o.noun} una uzito wa ${o.g} ${o.uGiven}. Badili kuwa ${o.uOther}.`
    ]
  },
  Vietnamese: {
    length: [
      o => `Trong ${o.place}, một ${o.noun} là ${o.g} ${o.uGiven}. Bao nhiêu ${o.uOther}?`,
      o => `${o.noun} dài ${o.g} ${o.uGiven}. Đổi sang ${o.uOther}.`
    ],
    time: [
      o => `Với ${o.place}, ${o.noun} kéo dài ${o.g} ${o.uGiven}. Đổi sang ${o.uOther}.`,
      o => `${o.noun} mất ${o.g} ${o.uGiven}. Chuyển thành ${o.uOther}.`
    ],
    volume: [
      o => `Họ cần ${o.g} ${o.uGiven} ${o.noun}. Vậy là bao nhiêu ${o.uOther}?`,
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
  const rotationLanguages = [...LANGS, 'XXXX'];
  const must = `${a} ${u1} = ${b} ${u2}`;

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
  
  const rotationFiltered = rotationLanguages.filter(lang => {
    if (lang === 'XXXX') return true;
    const t = alts[lang];
    return typeof t === 'string' && t.includes(must);
  });

  const answer = computeAnswer({ a, b, g, gRow })

  return {
    id: uuid(),
    text: { english, alts },
    units: [u1, u2],
    scale: [a, b],
    given: { row: gRow, value: g },
    altOrder: (typeof shuffle==='function' ? shuffle(rotationFiltered) : rotationFiltered),
    meta: { baseUnits: { u1, u2, otherUnit: (gRow==='top'?u2:u1) }, languages: rotationFiltered },
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


// generator.js — v4.0 (plain JS, no JSX)
// GUARANTEED grid-aligned perfect points with SQUARE viewing windows for clear visual slopes
// Drop-in: exports genPGraph(difficulty) with 35% non-proportional.

export function genPGraph(difficulty = 'easy') {
  const isProportional = Math.random() < 0.65;

  if (!isProportional) {
    // --- Non-proportional (35%) ---
    const types = ['curved', 'notThroughOrigin', 'curvedNotThrough'];
    const type = types[Math.floor(Math.random() * types.length)];

    let whyNot = null;
    let curveFunc = null;
    let yIntercept = null;
    let k = null;

    if (type === 'curved') {
      whyNot = 'notStraight';
      const coefficients = [0.05, 0.08, 0.1, 0.12, 0.16, 0.2];
      const a = coefficients[Math.floor(Math.random() * coefficients.length)];
      curveFunc = (x) => a * x * x;
    } else if (type === 'notThroughOrigin') {
      whyNot = 'notThroughOrigin';
      k = 1 + Math.floor(Math.random() * 12);      // 1..12
      yIntercept = 1 + Math.floor(Math.random() * 7); // 1..7
    } else {
      whyNot = 'both';
      const coefficients = [0.04, 0.06, 0.08, 0.1, 0.12];
      const a = coefficients[Math.floor(Math.random() * coefficients.length)];
      const b = 1 + Math.floor(Math.random() * 5);
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
      xMax: 20,
      yMax: 20,
      xStep: 2,
      yStep: 2,
    };
  }

  // --- Proportional (65%) — SQUARE viewing windows with clear visual slopes ---
  // Strategy: Create a roughly square graph where axes have similar ranges
  // This ensures slopes are visually accurate and not distorted
  
  const BANK = [
    // k < 1 (fractions) - Balanced viewing windows
    { num: 1, den: 2, gridSize: 12 },   // y = (1/2)x → 12x12 grid, points like (2,1), (4,2), (6,3)
    { num: 1, den: 4, gridSize: 16 },   // y = (1/4)x → 16x16 grid, points like (4,1), (8,2), (12,3)
    { num: 1, den: 5, gridSize: 15 },   // y = (1/5)x → 15x15 grid, points like (5,1), (10,2)
    { num: 2, den: 5, gridSize: 15 },   // y = (2/5)x → 15x15 grid, points like (5,2), (10,4)
    { num: 3, den: 5, gridSize: 15 },   // y = (3/5)x → 15x15 grid, points like (5,3), (10,6)
    { num: 3, den: 4, gridSize: 12 },   // y = (3/4)x → 12x12 grid, points like (4,3), (8,6)
    { num: 1, den: 3, gridSize: 12 },   // y = (1/3)x → 12x12 grid, points like (3,1), (6,2), (9,3)
    { num: 2, den: 3, gridSize: 12 },   // y = (2/3)x → 12x12 grid, points like (3,2), (6,4), (9,6)
    { num: 3, den: 8, gridSize: 16 },   // y = (3/8)x → 16x16 grid, points like (8,3)
    { num: 5, den: 8, gridSize: 16 },   // y = (5/8)x → 16x16 grid, points like (8,5)
    { num: 1, den: 6, gridSize: 18 },   // y = (1/6)x → 18x18 grid, points like (6,1), (12,2)
    { num: 5, den: 6, gridSize: 18 },   // y = (5/6)x → 18x18 grid, points like (6,5), (12,10)
    
    // k = 1 - Diagonal at 45 degrees
    { num: 1, den: 1, gridSize: 12 },   // y = x → 12x12 grid, points like (2,2), (4,4), (6,6)
    
    // k between 1 and 2 - Steeper slopes
    { num: 3, den: 2, gridSize: 12 },   // y = (3/2)x → 12x12 grid, points like (2,3), (4,6), (6,9)
    { num: 4, den: 3, gridSize: 12 },   // y = (4/3)x → 12x12 grid, points like (3,4), (6,8), (9,12)
    { num: 5, den: 4, gridSize: 16 },   // y = (5/4)x → 16x16 grid, points like (4,5), (8,10), (12,15)
    { num: 5, den: 3, gridSize: 15 },   // y = (5/3)x → 15x15 grid, points like (3,5), (6,10)
    { num: 7, den: 4, gridSize: 16 },   // y = (7/4)x → 16x16 grid, points like (4,7), (8,14)
    { num: 7, den: 5, gridSize: 15 },   // y = (7/5)x → 15x15 grid, points like (5,7), (10,14)
    
    // k = 2 and above - Steep slopes (use smaller grids to keep visible)
    { num: 2, den: 1, gridSize: 10 },   // y = 2x → 10x10 grid, points like (2,4), (4,8)
    { num: 3, den: 1, gridSize: 9 },    // y = 3x → 9x9 grid, points like (2,6), (3,9)
    { num: 4, den: 1, gridSize: 8 },    // y = 4x → 8x8 grid, points like (2,8)
    { num: 5, den: 2, gridSize: 10 },   // y = (5/2)x → 10x10 grid, points like (2,5), (4,10)
    { num: 7, den: 2, gridSize: 10 },   // y = (7/2)x → 10x10 grid, points like (2,7)
    { num: 9, den: 4, gridSize: 12 },   // y = (9/4)x → 12x12 grid, points like (4,9), (8,18)
  ];

  const pick = BANK[Math.floor(Math.random() * BANK.length)];
  const num = pick.num;
  const den = pick.den;
  const k = num / den;
  const gridSize = pick.gridSize;

  // GCD function
  function gcd(a, b) { 
    while (b) { 
      const t = a % b; 
      a = b; 
      b = t; 
    } 
    return Math.abs(a); 
  }
  
  const g = gcd(num, den);
  const baseNum = num / g;
  const baseDen = den / g;

  // Generate perfect points - all GUARANTEED to be on grid intersections
  // Points are multiples of (baseDen, baseNum)
  const perfectPoints = [];
  
  // Calculate how many points fit in our grid
  // We want the furthest point to be around 70-80% of grid size
  const maxMultiplier = Math.floor((gridSize * 0.75) / Math.max(baseDen, baseNum));
  const numPoints = Math.min(maxMultiplier, 4 + Math.floor(Math.random() * 3)); // 4-6 points, but not beyond grid
  
  for (let m = 1; m <= numPoints; m++) {
    const x = m * baseDen;
    const y = m * baseNum;
    // Only add if within grid bounds
    if (x <= gridSize && y <= gridSize) {
      perfectPoints.push({ x, y });
    }
  }

  // Determine grid steps based on the fraction's denominator and numerator
  // Choose steps that divide evenly into both baseDen and baseNum for perfect alignment
  function findBestStep(base, maxGrid) {
    // Prefer steps that are factors of base for perfect alignment
    const preferredSteps = [1, 2, 3, 4, 5];
    for (let step of preferredSteps) {
      if (base % step === 0 && maxGrid / step >= 8 && maxGrid / step <= 15) {
        return step;
      }
    }
    // Fallback: choose based on grid size
    if (maxGrid <= 10) return 1;
    if (maxGrid <= 16) return 2;
    return 3;
  }

  const xStep = findBestStep(baseDen, gridSize);
  const yStep = findBestStep(baseNum, gridSize);

  // For SQUARE viewing window: use same gridSize for both axes
  const xMax = gridSize;
  const yMax = gridSize;

  const kRounded = Number(k.toFixed(2));
  const kRoundedText = k.toFixed(2);
  const kFractionText = `${num}/${den}`;

  return {
    isProportional: true,
    type: 'proportional',
    k,
    kNum: num,
    kDen: den,
    kRounded,
    kRoundedText,
    kFractionText,
    perfectPoints,
    xMax,
    yMax,
    xStep,
    yStep,
  };
}


// ============================================
// H-TABLE BATTLE ROYALE - PROBLEM GENERATOR
// Mad Libs Edition for Eastway Middle
// ============================================

const STUDENT_NAMES = [
  "Abal", "Alexander", "Anderson", "Brandon", "Britany", "Carlos", 
  "Claritza", "Emmie", "Isaiah", "Jasmin", "Jonathan", "Luis", 
  "Nazlly", "Niang", "Pablo", "Rylan", "Taylor", "Tra'el", 
  "Unique", "Zaid", "Zaliah", "Zoey"
];

// Randomly select 1-3 students for maximum chaos
function getRandomStudents(min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...STUDENT_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Problem templates with Charlotte/teen culture flavor
const PROBLEM_TEMPLATES = [
  // FOOD CATEGORY
  {
    category: "food",
    template: (students, a, k, c) => ({
      text: `${students[0]} destroyed ${a} Cookout trays in ${k} hours at the University location. At this unstoppable rate, how many trays can ${students[0]} demolish in ${c} hours?`,
      visual: "🍔",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "food",
    template: (students, a, k, c) => ({
      text: `${students[0]} and ${students[1]} shared ${a} Bojangles biscuits during ${k} class periods (don't tell the teachers). How many biscuits will they sneak in ${c} periods?`,
      visual: "🥯",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "food",
    template: (students, a, k, c) => ({
      text: `The cafeteria served ${a} chicken nuggets to ${k} students. If ${c} students show up tomorrow, how many nuggets does Eastway need? (Assuming nobody shares)`,
      visual: "🍗",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "food",
    template: (students, a, k, c) => ({
      text: `${students[0]} ate ${a} Takis bags in ${k} days. At this spicy pace, how many bags in ${c} days? (RIP ${students[0]}'s stomach)`,
      visual: "🌶️",
      setup: { given: a, per: k, find: c }
    })
  },

  // SOCIAL MEDIA CATEGORY
  {
    category: "social",
    template: (students, a, k, c) => ({
      text: `${students[0]}'s TikTok got ${a} likes in ${k} hours. At this rate of virality, how many likes in ${c} hours? 💅`,
      visual: "📱",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "social",
    template: (students, a, k, c) => ({
      text: `${students[0]} sent ${a} Snapchat streaks in ${k} minutes. How many streaks can they maintain in ${c} minutes? (No one has that kind of time!)`,
      visual: "👻",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "social",
    template: (students, a, k, c) => ({
      text: `${students[0]} gained ${a} Instagram followers in ${k} days after posting at Freedom Park. At this rate, how many followers in ${c} days?`,
      visual: "📸",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "social",
    template: (students, a, k, c) => ({
      text: `${students[0]} and ${students[1]} watched ${a} YouTube videos during ${k} hours of "homework time." How many videos in ${c} hours?`,
      visual: "📺",
      setup: { given: a, per: k, find: c }
    })
  },

  // GAMING CATEGORY
  {
    category: "gaming",
    template: (students, a, k, c) => ({
      text: `${students[0]} scored ${a} eliminations in ${k} Fortnite matches. At this rate, how many eliminations in ${c} matches?`,
      visual: "🎮",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "gaming",
    template: (students, a, k, c) => ({
      text: `${students[0]} earned ${a} V-Bucks in ${k} hours of grinding. How many V-Bucks in ${c} hours? (Mom's credit card not included)`,
      visual: "💰",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "gaming",
    template: (students, a, k, c) => ({
      text: `${students[0]} rage-quit ${a} times in ${k} Roblox sessions. At this rate, how many rage-quits in ${c} sessions?`,
      visual: "😤",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "gaming",
    template: (students, a, k, c) => ({
      text: `${students[0]} and ${students[1]} completed ${a} levels in ${k} minutes playing Subway Surfers (when they should be listening in class). How many levels in ${c} minutes?`,
      visual: "🛹",
      setup: { given: a, per: k, find: c }
    })
  },

  // SPORTS CATEGORY
  {
    category: "sports",
    template: (students, a, k, c) => ({
      text: `${students[0]} scored ${a} points in ${k} minutes at the Panthers vs Falcons watch party. At this rate, how many points in ${c} minutes?`,
      visual: "🏈",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "sports",
    template: (students, a, k, c) => ({
      text: `During PE, ${students[0]} made ${a} basketball shots in ${k} attempts at the Eastway courts. If ${students[0]} takes ${c} shots, how many will they make?`,
      visual: "🏀",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "sports",
    template: (students, a, k, c) => ({
      text: `${students[0]} ran ${a} laps around Eastway in ${k} minutes. At this speed, how many laps in ${c} minutes?`,
      visual: "🏃",
      setup: { given: a, per: k, find: c }
    })
  },

  // SCHOOL LIFE CATEGORY
  {
    category: "school",
    template: (students, a, k, c) => ({
      text: `${students[0]} forgot their Chromebook password ${a} times in ${k} weeks. At this rate, how many times in ${c} weeks? (Write it down!)`,
      visual: "💻",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "school",
    template: (students, a, k, c) => ({
      text: `${students[0]} asked to go to the bathroom ${a} times during ${k} class periods. How many bathroom trips in ${c} periods?`,
      visual: "🚽",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "school",
    template: (students, a, k, c) => ({
      text: `${students[0]} and ${students[1]} passed ${a} notes in ${k} minutes before getting caught. At this rate, how many notes in ${c} minutes?`,
      visual: "📝",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "school",
    template: (students, a, k, c) => ({
      text: `The line at Eastway's lunch took ${students[0]} exactly ${k} minutes to get ${a} people through. How long for ${c} people?`,
      visual: "⏱️",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "school",
    template: (students, a, k, c) => ({
      text: `${students[0]} got ${a} "stop talking" warnings in ${k} classes. At this rate, how many warnings in ${c} classes? 🤫`,
      visual: "🤐",
      setup: { given: a, per: k, find: c }
    })
  },

  // CHARLOTTE CULTURE CATEGORY
  {
    category: "charlotte",
    template: (students, a, k, c) => ({
      text: `${students[0]} rode the light rail ${a} stops in ${k} minutes. At this rate, how many stops in ${c} minutes? (Almost to South End!)`,
      visual: "🚇",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "charlotte",
    template: (students, a, k, c) => ({
      text: `At Discovery Place, ${students[0]} pressed ${a} interactive buttons in ${k} minutes. How many buttons in ${c} minutes? (Don't break the exhibits!)`,
      visual: "🔬",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "charlotte",
    template: (students, a, k, c) => ({
      text: `${students[0]} and ${students[1]} spotted ${a} Hornets jerseys in Uptown in ${k} minutes. How many jerseys in ${c} minutes?`,
      visual: "🐝",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "charlotte",
    template: (students, a, k, c) => ({
      text: `${students[0]}'s family spent $${a} at the NASCAR Hall of Fame in ${k} hours. At this rate, how much in ${c} hours?`,
      visual: "🏁",
      setup: { given: a, per: k, find: c }
    })
  },

  // RANDOM CHAOS CATEGORY
  {
    category: "chaos",
    template: (students, a, k, c) => ({
      text: `${students[0]} said "no cap" ${a} times in ${k} conversations. At this rate, how many times in ${c} conversations? (Fr fr)`,
      visual: "🧢",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "chaos",
    template: (students, a, k, c) => ({
      text: `${students[0]} dropped their phone ${a} times in ${k} days. At this rate, how many drops in ${c} days? (Get a case!)`,
      visual: "📱",
      setup: { given: a, per: k, find: c }
    })
  },
  {
    category: "chaos",
    template: (students, a, k, c) => ({
      text: `${students[0]}, ${students[1]}, and ${students[2]} argued about ${a} different topics in ${k} minutes at lunch. How many arguments in ${c} minutes?`,
      visual: "💬",
      setup: { given: a, per: k, find: c }
    })
  },
];

// Generate nice numbers for H-table problems
function generateNiceTriple() {
  const multipliers = [2, 3, 4, 5, 6, 8, 10, 12, 15];
  const k = multipliers[Math.floor(Math.random() * multipliers.length)];
  const scale = multipliers[Math.floor(Math.random() * multipliers.length)];
  const a = k * scale;
  const cMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
  const c = k * cMultiplier;
  
  return { a, k, c, answer: (a * c) / k };
}

// Main generator function for Battle Royale
export function generateBattleRoyaleProblem() {
  const template = PROBLEM_TEMPLATES[Math.floor(Math.random() * PROBLEM_TEMPLATES.length)];
  const students = getRandomStudents(1, 3);
  const { a, k, c, answer } = generateNiceTriple();
  
  const problem = template.template(students, a, k, c);
  
  return {
    text: problem.text,
    visual: problem.visual,
    category: template.category,
    correctAnswer: answer,
    hTableSetup: {
      topLeft: a,
      topRight: "?",
      bottomLeft: k,
      bottomRight: c
    },
    students: students
  };
}

// Generate 8 wrong answers that are close but not correct
export function generateDistractors(correctAnswer) {
  const distractors = new Set();
  distractors.add(correctAnswer); // Add correct first
  
  while (distractors.size < 8) {
    const strategies = [
      () => correctAnswer + Math.floor(Math.random() * 20) - 10, // Off by small amount
      () => Math.floor(correctAnswer * 1.1), // 10% more
      () => Math.floor(correctAnswer * 0.9), // 10% less
      () => Math.floor(correctAnswer / 2), // Half
      () => correctAnswer * 2, // Double
      () => correctAnswer + correctAnswer % 10, // Add ones digit
    ];
    
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const distractor = strategy();
    
    if (distractor > 0 && distractor !== correctAnswer) {
      distractors.add(distractor);
    }
  }
  
  return Array.from(distractors).sort(() => Math.random() - 0.5).slice(0, 8);
}

// Token generator for team setup
export function buildTokenSet(perTeam) {
  const animals = ["🦁", "🐯", "🐻", "🦅", "🐺", "🦊", "🐉", "🦈", "🐙", "🦖"];
  const foods = ["🍕", "🌮", "🍔", "🍣", "🍜", "🧇", "🍦", "🍪", "🌭", "🥨"];
  const things = ["⚡", "🔥", "💎", "🎸", "🚀", "👑", "🎯", "🏆", "💫", "🌟"];
  
  const allTokens = [...animals, ...foods, ...things];
  const shuffled = allTokens.sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, perTeam);
}
