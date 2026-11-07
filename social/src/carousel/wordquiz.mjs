// "Argentinian word of the day" quiz reels: one entry per word carousel (carousels.mjs), day = the carousel's number.
// Each round is a line from the reviewed carousel, three English meanings and the index of the right one.
// "mal" is left out on purpose (its lines didn't sound natural). Regenerate from build-quizzes.mjs in the session scratchpad, or edit by hand.
export const WORD_QUIZZES = [
  {
    "id": "wotd-posta",
    "day": 1,
    "word": "posta",
    "marks": [
      "posta"
    ],
    "hook": "You’ll hear it 100 times a day in Buenos Aires",
    "rounds": [
      {
        "say": "Me caso en mayo. —¿Posta?",
        "options": [
          "Congratulations!",
          "Really?",
          "Which day?"
        ],
        "answer": 1
      },
      {
        "say": "Posta que no sabía.",
        "options": [
          "I knew it all along",
          "I’ll find out later",
          "I honestly didn’t know"
        ],
        "answer": 2
      },
      {
        "say": "Es un amigo posta.",
        "options": [
          "He’s a true friend",
          "He’s a new friend",
          "He’s a fake friend"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-dale",
    "day": 2,
    "word": "dale",
    "marks": [
      "dale"
    ],
    "hook": "The most useful word you’ll learn in Argentina",
    "rounds": [
      {
        "say": "¿Pedimos pizza? —¡Dale!",
        "options": [
          "No thanks",
          "Maybe later",
          "Yes, let’s!"
        ],
        "answer": 2
      },
      {
        "say": "¡Dale, que llegamos tarde!",
        "options": [
          "Come on, we’re late!",
          "Relax, we’re early",
          "Give me a minute"
        ],
        "answer": 0
      },
      {
        "say": "¿Puedo pasar? —Dale.",
        "options": [
          "Not now",
          "Go ahead",
          "Who is it?"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-che",
    "day": 3,
    "word": "che",
    "marks": [
      "che"
    ],
    "hook": "Say it once and you already sound Argentine",
    "rounds": [
      {
        "say": "Che, ¿tenés hora?",
        "options": [
          "Hey, do you have the time?",
          "Excuse me, are you free?",
          "Sorry, are you lost?"
        ],
        "answer": 0
      },
      {
        "say": "Che, vení un toque.",
        "options": [
          "Hey, come and play",
          "Hey, come here a sec",
          "Please, leave me alone"
        ],
        "answer": 1
      },
      {
        "say": "Che, ¿viste el partido?",
        "options": [
          "Dude, did you play today?",
          "Wait, who won the game?",
          "Hey, did you see the game?"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-boludo",
    "day": 4,
    "word": "boludo",
    "marks": [
      "boludo",
      "boluda",
      "boludear",
      "boludeando",
      "boludez"
    ],
    "hook": "The most Argentine word there is",
    "rounds": [
      {
        "say": "¿Qué hacés, boludo?",
        "options": [
          "What are you doing, idiot?",
          "What’s up, dude?",
          "What time is it, dude?"
        ],
        "answer": 1
      },
      {
        "say": "No te hagas el boludo.",
        "options": [
          "Don’t be rude",
          "Don’t make me laugh",
          "Don’t play dumb"
        ],
        "answer": 2
      },
      {
        "say": "Dejá de boludear.",
        "options": [
          "Stop messing around",
          "Stop insulting me",
          "Stop being so serious"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-quilombo",
    "day": 5,
    "word": "quilombo",
    "marks": [
      "quilombo",
      "quilombos"
    ],
    "hook": "You’ll hear it on day one in Buenos Aires",
    "rounds": [
      {
        "say": "Tu cuarto es un quilombo.",
        "options": [
          "Your room is huge",
          "Your room is a mess",
          "Your room is cozy"
        ],
        "answer": 1
      },
      {
        "say": "Había un quilombo de gente.",
        "options": [
          "Nobody came",
          "People were angry",
          "There were tons of people"
        ],
        "answer": 2
      },
      {
        "say": "Si se entera, se arma quilombo.",
        "options": [
          "There’ll be trouble",
          "She’ll throw a party",
          "She won’t care"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-tipo",
    "day": 6,
    "word": "tipo",
    "marks": [
      "tipo"
    ],
    "hook": "Argentines drop it into almost every sentence",
    "rounds": [
      {
        "say": "Nos vemos tipo ocho.",
        "options": [
          "See you around eight",
          "See you at eight sharp",
          "See you in eight days"
        ],
        "answer": 0
      },
      {
        "say": "Es un buen tipo.",
        "options": [
          "It’s a good type",
          "He’s a good guy",
          "He’s a good boss"
        ],
        "answer": 1
      },
      {
        "say": "Era, tipo, enorme.",
        "options": [
          "It was a huge type",
          "It was kind of small",
          "It was, like, huge"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-onda",
    "day": 7,
    "word": "onda",
    "marks": [
      "onda"
    ],
    "hook": "How Argentines talk about vibes",
    "rounds": [
      {
        "say": "¿Qué onda?",
        "options": [
          "What wave?",
          "What’s up?",
          "Where are you?"
        ],
        "answer": 1
      },
      {
        "say": "Es re buena onda.",
        "options": [
          "She’s a great surfer",
          "She’s very busy",
          "She’s really nice"
        ],
        "answer": 2
      },
      {
        "say": "Pegamos onda enseguida.",
        "options": [
          "We clicked right away",
          "We fought right away",
          "We left right away"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-toque",
    "day": 8,
    "word": "toque",
    "marks": [
      "toque",
      "toquecito"
    ],
    "hook": "The tiny word Argentines use for everything",
    "rounds": [
      {
        "say": "Esperá un toque.",
        "options": [
          "Don’t touch it",
          "Wait outside",
          "Wait a sec"
        ],
        "answer": 2
      },
      {
        "say": "Está un toque caro.",
        "options": [
          "It’s a bit expensive",
          "It’s really cheap",
          "It’s way too expensive"
        ],
        "answer": 0
      },
      {
        "say": "Bajá un toque la música.",
        "options": [
          "Turn the music up",
          "Turn the music down a bit",
          "Change the song"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-bancar",
    "day": 9,
    "word": "bancar",
    "marks": [
      "banco",
      "bancan",
      "bancás",
      "bancame",
      "bancá",
      "banca",
      "bancar"
    ],
    "hook": "One verb, four very different meanings",
    "rounds": [
      {
        "say": "Te banco a muerte.",
        "options": [
          "I’ve got your back",
          "I owe you money",
          "I’ll never forgive you"
        ],
        "answer": 0
      },
      {
        "say": "No banco el calor.",
        "options": [
          "I love the heat",
          "I can’t stand the heat",
          "The bank has no AC"
        ],
        "answer": 1
      },
      {
        "say": "Bancame un toque.",
        "options": [
          "Lend me some money",
          "Call me later",
          "Hold on a sec"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-copado",
    "day": 10,
    "word": "copado",
    "marks": [
      "copado",
      "copada",
      "copa",
      "copate"
    ],
    "hook": "How Argentines say something is cool",
    "rounds": [
      {
        "say": "¡Qué copado!",
        "options": [
          "How boring!",
          "How cool!",
          "How expensive!"
        ],
        "answer": 1
      },
      {
        "say": "Tu hermana es re copada.",
        "options": [
          "Your sister is really busy",
          "Your sister is very tall",
          "Your sister is really nice"
        ],
        "answer": 2
      },
      {
        "say": "Me copa la idea.",
        "options": [
          "I love the idea",
          "I copied the idea",
          "I hate the idea"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-joda",
    "day": 11,
    "word": "joda",
    "marks": [
      "joda",
      "joder",
      "jodas",
      "jodiendo"
    ],
    "hook": "Argentina’s favorite word for fun",
    "rounds": [
      {
        "say": "¿Vamos de joda?",
        "options": [
          "Should we go to work?",
          "Should we go home?",
          "Should we go partying?"
        ],
        "answer": 2
      },
      {
        "say": "¡Es joda!",
        "options": [
          "Just kidding!",
          "It’s a disaster!",
          "It’s true!"
        ],
        "answer": 0
      },
      {
        "say": "Ni en joda voy.",
        "options": [
          "I’m going for sure",
          "No way I’m going",
          "I’ll go later"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-zarpado",
    "day": 12,
    "word": "zarpado",
    "marks": [
      "zarpado",
      "zarpada",
      "zarpaste",
      "zarpé",
      "zarpó"
    ],
    "hook": "For when normal words aren’t enough",
    "rounds": [
      {
        "say": "La comida está zarpada.",
        "options": [
          "The food is amazing",
          "The food is gone",
          "The food is too salty"
        ],
        "answer": 0
      },
      {
        "say": "Te zarpaste.",
        "options": [
          "You left early",
          "You went too far",
          "You did great"
        ],
        "answer": 1
      },
      {
        "say": "Fue un comentario zarpado.",
        "options": [
          "That was really funny",
          "That was very smart",
          "That was out of line"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-flashear",
    "day": 13,
    "word": "flashear",
    "marks": [
      "flasheaste",
      "flasheé",
      "flasheó",
      "flashear",
      "flasheando",
      "flasheá"
    ],
    "hook": "The Argentine verb for a wild imagination",
    "rounds": [
      {
        "say": "Flasheé, perdón.",
        "options": [
          "Sorry, I took a photo",
          "My bad, I got it wrong",
          "Sorry, I’m late"
        ],
        "answer": 1
      },
      {
        "say": "Me flasheó la película.",
        "options": [
          "The movie was boring",
          "I missed the movie",
          "The movie blew my mind"
        ],
        "answer": 2
      },
      {
        "say": "¿Ir caminando? Estás flasheando.",
        "options": [
          "You’re dreaming",
          "You’re right",
          "You’re too slow"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-laburo",
    "day": 14,
    "word": "laburo",
    "marks": [
      "laburo",
      "laburás",
      "laburar",
      "laburó",
      "laburante"
    ],
    "hook": "How Argentines talk about work",
    "rounds": [
      {
        "say": "Conseguí laburo.",
        "options": [
          "I lost my job",
          "I got a raise",
          "I got a job"
        ],
        "answer": 2
      },
      {
        "say": "¿De qué laburás?",
        "options": [
          "What do you do for work?",
          "Where do you live?",
          "When do you finish?"
        ],
        "answer": 0
      },
      {
        "say": "Mi viejo es re laburante.",
        "options": [
          "My dad is very old",
          "My dad works really hard",
          "My dad hates his job"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-fiaca",
    "day": 15,
    "word": "fiaca",
    "marks": [
      "fiaca",
      "fiaquero",
      "fiaquera"
    ],
    "hook": "The word for that lazy Sunday feeling",
    "rounds": [
      {
        "say": "Tengo fiaca de salir.",
        "options": [
          "I don’t feel like going out",
          "I’m ready to go out",
          "I’m scared to go out"
        ],
        "answer": 0
      },
      {
        "say": "¿Lavar los platos? Qué fiaca.",
        "options": [
          "Sure, no problem",
          "Ugh, what a drag",
          "They’re already clean"
        ],
        "answer": 1
      },
      {
        "say": "Mi gato es un fiaquero.",
        "options": [
          "My cat is so fat",
          "My cat is so angry",
          "My cat is so lazy"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-chamuyo",
    "day": 16,
    "word": "chamuyo",
    "marks": [
      "chamuyo",
      "chamuyando",
      "chamuyó",
      "chamuyero",
      "chamuyera"
    ],
    "hook": "Argentines are experts at this",
    "rounds": [
      {
        "say": "Me está chamuyando.",
        "options": [
          "He’s yelling at me",
          "He’s hitting on me",
          "He’s ignoring me"
        ],
        "answer": 1
      },
      {
        "say": "Es puro chamuyo.",
        "options": [
          "It’s pure gold",
          "It’s really true",
          "It’s all talk"
        ],
        "answer": 2
      },
      {
        "say": "No le creas, es re chamuyero.",
        "options": [
          "He’s all talk",
          "He’s very shy",
          "He’s super honest"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-cualquiera",
    "day": 17,
    "word": "cualquiera",
    "marks": [
      "cualquiera"
    ],
    "hook": "It doesn’t mean what you learned in class",
    "rounds": [
      {
        "say": "¿Dos horas de cola? Cualquiera.",
        "options": [
          "Anyone can wait",
          "That’s not bad",
          "Ridiculous"
        ],
        "answer": 2
      },
      {
        "say": "Estás diciendo cualquiera.",
        "options": [
          "You’re talking nonsense",
          "You can say anything",
          "You’re very quiet"
        ],
        "answer": 0
      },
      {
        "say": "Perdón, estaba en cualquiera.",
        "options": [
          "I was with someone",
          "My mind was elsewhere",
          "I was at work"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-ya-fue",
    "day": 18,
    "word": "ya fue",
    "marks": [
      "ya fue"
    ],
    "hook": "The Argentine way to say “forget it”",
    "rounds": [
      {
        "say": "Perdimos el bondi. Ya fue.",
        "options": [
          "Oh well, forget it",
          "Let’s run for it!",
          "We have to wait"
        ],
        "answer": 0
      },
      {
        "say": "Ya fue, me lo compro.",
        "options": [
          "I already bought it",
          "Whatever, I’m buying it",
          "I’ll never buy it"
        ],
        "answer": 1
      },
      {
        "say": "Lo nuestro ya fue.",
        "options": [
          "We’re getting married",
          "We’re just friends",
          "We’re over"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-pedo",
    "day": 19,
    "word": "pedo",
    "marks": [
      "pedo"
    ],
    "hook": "The rudest word you’ll use every day",
    "rounds": [
      {
        "say": "Ni en pedo pago eso.",
        "options": [
          "I’ll pay that, no problem",
          "No way I’m paying that",
          "I already paid that"
        ],
        "answer": 1
      },
      {
        "say": "Fui al pedo.",
        "options": [
          "I went to the bathroom",
          "I went with friends",
          "I went for nothing"
        ],
        "answer": 2
      },
      {
        "say": "Aprobé de pedo.",
        "options": [
          "I passed by pure luck",
          "I passed easily",
          "I failed the exam"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-ni",
    "day": 20,
    "word": "ni",
    "marks": [
      "ni"
    ],
    "hook": "The tiny word Argentines use to say no",
    "rounds": [
      {
        "say": "Ni idea.",
        "options": [
          "Good idea",
          "Same idea",
          "No idea"
        ],
        "answer": 2
      },
      {
        "say": "¿Estás enojado? —Ni ahí.",
        "options": [
          "Not at all",
          "Very much",
          "Over there"
        ],
        "answer": 0
      },
      {
        "say": "Ni loco salto de ahí.",
        "options": [
          "I’d jump, I’m crazy",
          "No way I’d jump",
          "Let’s jump together"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-re",
    "day": 21,
    "word": "re",
    "marks": [
      "re"
    ],
    "hook": "The two letters that make you sound Argentine",
    "rounds": [
      {
        "say": "Está re bueno.",
        "options": [
          "It’s really good",
          "It’s good again",
          "It’s not good"
        ],
        "answer": 0
      },
      {
        "say": "Me re gustó.",
        "options": [
          "I liked it again",
          "I really liked it",
          "I didn’t like it"
        ],
        "answer": 1
      },
      {
        "say": "¿Tenés hambre? —Re.",
        "options": [
          "Again?",
          "Not really",
          "Very"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-viste",
    "day": 22,
    "word": "viste",
    "marks": [
      "viste"
    ],
    "hook": "Argentines end half their sentences with this",
    "rounds": [
      {
        "say": "Es caro, ¿viste?",
        "options": [
          "It’s cheap, right?",
          "It’s expensive, you know?",
          "It’s expensive, get dressed"
        ],
        "answer": 1
      },
      {
        "say": "¿Viste? Te dije.",
        "options": [
          "Get dressed, I said",
          "Look, I’m sorry",
          "See? I told you"
        ],
        "answer": 2
      },
      {
        "say": "¿Viste lo de Juan?",
        "options": [
          "Did you hear about Juan?",
          "Did you see Juan’s house?",
          "Did you call Juan?"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-bardo",
    "day": 24,
    "word": "bardo",
    "marks": [
      "bardo",
      "bardear",
      "bardeó",
      "bardees",
      "bardearon"
    ],
    "hook": "Like quilombo, but younger",
    "rounds": [
      {
        "say": "Es un bardo.",
        "options": [
          "It’s a mess",
          "He’s a poet",
          "It’s a bar"
        ],
        "answer": 0
      },
      {
        "say": "No hagas bardo.",
        "options": [
          "Don’t be late",
          "Don’t cause trouble",
          "Don’t leave yet"
        ],
        "answer": 1
      },
      {
        "say": "Me bardeó.",
        "options": [
          "He hugged me",
          "He called me",
          "He insulted me"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-garron",
    "day": 25,
    "word": "garrón",
    "marks": [
      "garrón"
    ],
    "hook": "For when life goes wrong",
    "rounds": [
      {
        "say": "Qué garrón, llueve.",
        "options": [
          "Great, it’s raining",
          "Ugh, bad luck",
          "Let’s go out"
        ],
        "answer": 1
      },
      {
        "say": "Me comí un garrón en el banco.",
        "options": [
          "I ate at the bank",
          "I got a loan",
          "I had a terrible time"
        ],
        "answer": 2
      },
      {
        "say": "Entré de garrón.",
        "options": [
          "I got in for free",
          "I got in late",
          "I couldn’t get in"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-pibe",
    "day": 26,
    "word": "pibe",
    "marks": [
      "pibe",
      "piba",
      "pibes",
      "pibas"
    ],
    "hook": "You’ll hear it on every corner in Argentina",
    "rounds": [
      {
        "say": "Salgo con los pibes.",
        "options": [
          "I’m going out with my kids",
          "I’m staying home",
          "I’m going out with the guys"
        ],
        "answer": 2
      },
      {
        "say": "Es un pibe.",
        "options": [
          "He’s just a kid",
          "He’s a cop",
          "He’s an old man"
        ],
        "answer": 0
      },
      {
        "say": "De pibe vivía en Rosario.",
        "options": [
          "I live in Rosario now",
          "I lived there as a kid",
          "My kid lives in Rosario"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-mango",
    "day": 27,
    "word": "mango",
    "marks": [
      "mango",
      "mangos",
      "manguear",
      "manguea",
      "mangueó"
    ],
    "hook": "It’s not the fruit",
    "rounds": [
      {
        "say": "No tengo un mango.",
        "options": [
          "I have no money",
          "I have no fruit",
          "I have no time"
        ],
        "answer": 0
      },
      {
        "say": "Esa peli no vale un mango.",
        "options": [
          "That movie is free",
          "That movie is no good",
          "That movie is great"
        ],
        "answer": 1
      },
      {
        "say": "Me mangueó un cigarrillo.",
        "options": [
          "He gave me a cigarette",
          "He hid my cigarettes",
          "He asked me for a cigarette"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-gil",
    "day": 28,
    "word": "gil",
    "marks": [
      "gil",
      "gila",
      "gilada",
      "giladas"
    ],
    "hook": "The classic Argentine insult",
    "rounds": [
      {
        "say": "¡No seas gil!",
        "options": [
          "Don’t be shy!",
          "Don’t be a fool!",
          "Don’t be late!"
        ],
        "answer": 1
      },
      {
        "say": "¿Me viste cara de gil?",
        "options": [
          "Did you see my face?",
          "Do I look tired?",
          "Do you think I’m stupid?"
        ],
        "answer": 2
      },
      {
        "say": "Quedé como un gil.",
        "options": [
          "I looked like a fool",
          "I stayed with a friend",
          "I looked great"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-cagar",
    "day": 29,
    "word": "cagar",
    "marks": [
      "cagó",
      "cagaron",
      "cagues",
      "cago",
      "cagamos",
      "cagué",
      "cagada",
      "cagar"
    ],
    "hook": "Rude, yes. But you’ll hear it every day",
    "rounds": [
      {
        "say": "Me cagó a pedos.",
        "options": [
          "He laughed at me",
          "He ignored me",
          "He yelled at me"
        ],
        "answer": 2
      },
      {
        "say": "Me cagó el mecánico.",
        "options": [
          "The mechanic cheated me",
          "The mechanic helped me",
          "The mechanic called me"
        ],
        "answer": 0
      },
      {
        "say": "Nos cagamos de risa.",
        "options": [
          "We were scared",
          "We laughed a lot",
          "We got bored"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-mandar",
    "day": 30,
    "word": "mandar",
    "marks": [
      "mandate",
      "mandé",
      "mandaste",
      "mandó",
      "mandes",
      "mandar",
      "mandando",
      "mandá"
    ],
    "hook": "A simple verb with secret meanings",
    "rounds": [
      {
        "say": "Me mandé una macana.",
        "options": [
          "I made a mistake",
          "I sent a message",
          "I bought a gift"
        ],
        "answer": 0
      },
      {
        "say": "Estás mandando fruta.",
        "options": [
          "You’re sending fruit",
          "You’re making things up",
          "You’re eating healthy"
        ],
        "answer": 1
      },
      {
        "say": "Dale, mandate.",
        "options": [
          "Come on, send it",
          "Come on, sit down",
          "Come on, go for it"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-bajon",
    "day": 31,
    "word": "bajón",
    "marks": [
      "bajón",
      "bajoneada"
    ],
    "hook": "For sad days and hungry nights",
    "rounds": [
      {
        "say": "Estoy de bajón.",
        "options": [
          "I’m going downstairs",
          "I feel down",
          "I feel great"
        ],
        "answer": 1
      },
      {
        "say": "Tengo bajón.",
        "options": [
          "I have a headache",
          "I’m going down",
          "I’m suddenly starving"
        ],
        "answer": 2
      },
      {
        "say": "Se terminó la serie. Qué bajón.",
        "options": [
          "How sad",
          "Finally!",
          "What a twist"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-ponele",
    "day": 32,
    "word": "ponele",
    "marks": [
      "ponele"
    ],
    "hook": "One word for “let’s say”",
    "rounds": [
      {
        "say": "Vení, ponele, a las ocho.",
        "options": [
          "Come at eight sharp",
          "Put it on at eight",
          "Come at, let’s say, eight"
        ],
        "answer": 2
      },
      {
        "say": "¿Está limpio? —Ponele.",
        "options": [
          "More or less",
          "Totally",
          "Put it away"
        ],
        "answer": 0
      },
      {
        "say": "Ganamos, ponele la firma.",
        "options": [
          "Sign here, we won",
          "We’ll win, I’m sure",
          "We might lose"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-trucho",
    "day": 33,
    "word": "trucho",
    "marks": [
      "trucho",
      "trucha",
      "truchos",
      "truchas"
    ],
    "hook": "When something isn’t what it looks like",
    "rounds": [
      {
        "say": "Esa cartera es trucha.",
        "options": [
          "That bag is fake",
          "That bag is new",
          "That bag is expensive"
        ],
        "answer": 0
      },
      {
        "say": "Compré un cargador trucho.",
        "options": [
          "I bought a fast charger",
          "I bought a bad charger",
          "I lost my charger"
        ],
        "answer": 1
      },
      {
        "say": "Ese negocio es trucho.",
        "options": [
          "That business is closed",
          "That business is new",
          "That business isn’t honest"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-tranqui",
    "day": 34,
    "word": "tranqui",
    "marks": [
      "tranqui"
    ],
    "hook": "The word that calms every Argentine",
    "rounds": [
      {
        "say": "Tranqui, yo pago.",
        "options": [
          "Slow down, pay later",
          "Don’t worry, I’ll pay",
          "Quiet, I’m paying"
        ],
        "answer": 1
      },
      {
        "say": "Es un barrio tranqui.",
        "options": [
          "It’s a dangerous area",
          "It’s a fancy area",
          "It’s a quiet neighborhood"
        ],
        "answer": 2
      },
      {
        "say": "Mi jefa es tranqui.",
        "options": [
          "My boss is easygoing",
          "My boss is strict",
          "My boss is new"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-hinchar",
    "day": 35,
    "word": "hinchar",
    "marks": [
      "hinchar",
      "hincha",
      "hinches",
      "hincho",
      "hinchamos",
      "hinchás"
    ],
    "hook": "From football to your annoying cousin",
    "rounds": [
      {
        "say": "Dejá de hinchar.",
        "options": [
          "Stop eating so much",
          "Stop cheering",
          "Stop annoying me"
        ],
        "answer": 2
      },
      {
        "say": "¿Por quién hinchás hoy?",
        "options": [
          "Who are you rooting for?",
          "Who are you meeting today?",
          "Who’s bothering you?"
        ],
        "answer": 0
      },
      {
        "say": "Es hincha de River.",
        "options": [
          "He lives by the river",
          "He’s a River fan",
          "He plays for River"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-rajar",
    "day": 36,
    "word": "rajar",
    "marks": [
      "rajar",
      "rajá",
      "rajemos",
      "rajé",
      "rajaron",
      "rajan"
    ],
    "hook": "How to leave fast in Argentina",
    "rounds": [
      {
        "say": "¡Rajá de acá!",
        "options": [
          "Get out of here!",
          "Come over here!",
          "Break it here!"
        ],
        "answer": 0
      },
      {
        "say": "Lo rajaron.",
        "options": [
          "They hired him",
          "They fired him",
          "They hurt him"
        ],
        "answer": 1
      },
      {
        "say": "Rajemos.",
        "options": [
          "Let’s stay a bit",
          "Let’s fight",
          "Let’s get out of here"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-cancha",
    "day": 37,
    "word": "cancha",
    "marks": [
      "cancha",
      "canchero",
      "canchera"
    ],
    "hook": "It’s not just a football field",
    "rounds": [
      {
        "say": "Vamos a la cancha.",
        "options": [
          "Let’s go to the beach",
          "Let’s go to the stadium",
          "Let’s go to the store"
        ],
        "answer": 1
      },
      {
        "say": "Tiene mucha cancha.",
        "options": [
          "He has a big garden",
          "He plays a lot of football",
          "He has a lot of experience"
        ],
        "answer": 2
      },
      {
        "say": "Se hace el canchero.",
        "options": [
          "He acts cool",
          "He plays football",
          "He acts shy"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-pinta",
    "day": 38,
    "word": "pinta",
    "marks": [
      "pinta",
      "pintó"
    ],
    "hook": "A small word for plans, looks and feelings",
    "rounds": [
      {
        "say": "¿Qué pinta hoy?",
        "options": [
          "What are you painting?",
          "How do I look today?",
          "What’s the plan today?"
        ],
        "answer": 2
      },
      {
        "say": "Esa pizza tiene buena pinta.",
        "options": [
          "That pizza looks good",
          "That pizza is cold",
          "That pizza is huge"
        ],
        "answer": 0
      },
      {
        "say": "Tenés pinta de turista.",
        "options": [
          "You paint like a tourist",
          "You look like a tourist",
          "You’re a tour guide"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-colgar",
    "day": 39,
    "word": "colgar",
    "marks": [
      "colgué",
      "colgó",
      "colgado",
      "colgada",
      "colgar"
    ],
    "hook": "For when your brain leaves the room",
    "rounds": [
      {
        "say": "Perdón, me colgué.",
        "options": [
          "Sorry, I forgot",
          "Sorry, I hung up",
          "Sorry, I fell asleep"
        ],
        "answer": 0
      },
      {
        "say": "Me colgué con una serie.",
        "options": [
          "I hated that show",
          "I lost track of time",
          "I finished the show"
        ],
        "answer": 1
      },
      {
        "say": "Hoy estoy colgada.",
        "options": [
          "I’m busy today",
          "I’m sick today",
          "I’m distracted today"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-cortar",
    "day": 40,
    "word": "cortar",
    "marks": [
      "cortala",
      "corté",
      "cortó",
      "corto",
      "cortes",
      "cortar"
    ],
    "hook": "Cut it out, literally",
    "rounds": [
      {
        "say": "¡Cortala!",
        "options": [
          "Cut it!",
          "Stop it!",
          "Take it!"
        ],
        "answer": 1
      },
      {
        "say": "Corté con mi novio.",
        "options": [
          "I cut my boyfriend’s hair",
          "I’m moving in with him",
          "I broke up with him"
        ],
        "answer": 2
      },
      {
        "say": "Me cortó el teléfono.",
        "options": [
          "He hung up on me",
          "He broke my phone",
          "He called me back"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-andar",
    "day": 41,
    "word": "andar",
    "marks": [
      "andan",
      "ando",
      "anda",
      "andate",
      "andá",
      "andar",
      "andás"
    ],
    "hook": "The verb Argentines use for everything",
    "rounds": [
      {
        "say": "¿Cómo andás?",
        "options": [
          "How do you walk?",
          "Where are you going?",
          "How are you?"
        ],
        "answer": 2
      },
      {
        "say": "El wifi no anda.",
        "options": [
          "The wifi isn’t working",
          "There’s no wifi here",
          "The wifi is slow"
        ],
        "answer": 0
      },
      {
        "say": "Andate, yo cierro.",
        "options": [
          "Wait, I’ll close it",
          "You go, I’ll lock up",
          "Come in, it’s open"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-ahi",
    "day": 42,
    "word": "ahí",
    "marks": [
      "ahí"
    ],
    "hook": "A small word with a lot of jobs",
    "rounds": [
      {
        "say": "¿Cómo estás? —Ahí ando.",
        "options": [
          "Getting by",
          "Over there",
          "Really great"
        ],
        "answer": 0
      },
      {
        "say": "Por ahí llueve.",
        "options": [
          "It’s raining over there",
          "Maybe it’ll rain",
          "It never rains"
        ],
        "answer": 1
      },
      {
        "say": "Vivo ahí nomás.",
        "options": [
          "I live there alone",
          "I live far away",
          "I live very close"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-medio",
    "day": 43,
    "word": "medio",
    "marks": [
      "medio"
    ],
    "hook": "How Argentines say things without saying them",
    "rounds": [
      {
        "say": "Estoy medio cansado.",
        "options": [
          "I’m half asleep",
          "I’m kind of tired",
          "I’m not tired"
        ],
        "answer": 1
      },
      {
        "say": "Medio que no quiero ir.",
        "options": [
          "I’ll go halfway",
          "I really want to go",
          "I don’t really want to go"
        ],
        "answer": 2
      },
      {
        "say": "¿Entendiste? —Medio.",
        "options": [
          "Sort of",
          "Perfectly",
          "In the middle"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-nada",
    "day": 44,
    "word": "nada",
    "marks": [
      "nada"
    ],
    "hook": "It means nothing. That’s the point",
    "rounds": [
      {
        "say": "Y nada, me fui.",
        "options": [
          "I left with nothing",
          "I didn’t leave",
          "So yeah, I left"
        ],
        "answer": 2
      },
      {
        "say": "¿Te molesta? —Para nada.",
        "options": [
          "Not at all",
          "A lot",
          "For nothing"
        ],
        "answer": 0
      },
      {
        "say": "¿Qué dijiste? —Nada.",
        "options": [
          "I said hello",
          "Never mind",
          "Let’s swim"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-zafar",
    "day": 45,
    "word": "zafar",
    "marks": [
      "zafé",
      "zafamos",
      "zafa",
      "zafo",
      "zafar"
    ],
    "hook": "The survival verb of Argentina",
    "rounds": [
      {
        "say": "¡Zafé!",
        "options": [
          "I got out of it!",
          "I got caught!",
          "I’m so tired!"
        ],
        "answer": 0
      },
      {
        "say": "¿Está rica? —Zafa.",
        "options": [
          "It’s amazing",
          "It’s OK",
          "It’s burnt"
        ],
        "answer": 1
      },
      {
        "say": "Zafo con el español.",
        "options": [
          "I’m fluent in Spanish",
          "I hate Spanish",
          "I get by in Spanish"
        ],
        "answer": 2
      }
    ]
  },
  {
    "id": "wotd-bola",
    "day": 46,
    "word": "bola",
    "marks": [
      "bola",
      "bolas",
      "bolazo"
    ],
    "hook": "Round, rude and everywhere",
    "rounds": [
      {
        "say": "No me da bola.",
        "options": [
          "He won’t give me the ball",
          "He ignores me",
          "He’s always calling me"
        ],
        "answer": 1
      },
      {
        "say": "¡Qué bolazo!",
        "options": [
          "What a great goal!",
          "What a big ball!",
          "What a big lie!"
        ],
        "answer": 2
      },
      {
        "say": "Nadie me dio bola.",
        "options": [
          "Nobody paid attention",
          "Nobody passed me the ball",
          "Nobody gave me money"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "wotd-flaco",
    "day": 47,
    "word": "flaco",
    "marks": [
      "flaco",
      "flaca"
    ],
    "hook": "You don’t have to be thin for this one",
    "rounds": [
      {
        "say": "¿Qué hacés, flaco?",
        "options": [
          "Why so skinny?",
          "What are you eating?",
          "What’s up, man?"
        ],
        "answer": 2
      },
      {
        "say": "Me habló un flaco.",
        "options": [
          "A guy talked to me",
          "My dad talked to me",
          "Nobody talked to me"
        ],
        "answer": 0
      },
      {
        "say": "Voy con la flaca.",
        "options": [
          "Going with a skinny girl",
          "Going with my girlfriend",
          "Going on a diet"
        ],
        "answer": 1
      }
    ]
  },
  {
    "id": "wotd-pucho",
    "day": 48,
    "word": "pucho",
    "marks": [
      "pucho"
    ],
    "hook": "It starts with a cigarette",
    "rounds": [
      {
        "say": "¿Tenés un pucho?",
        "options": [
          "Do you have a cigarette?",
          "Do you have a lighter?",
          "Do you have a minute?"
        ],
        "answer": 0
      },
      {
        "say": "Me importa un pucho.",
        "options": [
          "I care a lot",
          "I don’t care at all",
          "I want a cigarette"
        ],
        "answer": 1
      },
      {
        "say": "Llegamos sobre el pucho.",
        "options": [
          "We got there early",
          "We got there smoking",
          "We got there last-minute"
        ],
        "answer": 2
      }
    ]
  }
];
