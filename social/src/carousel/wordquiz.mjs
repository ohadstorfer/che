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
    "meanings": [
      "To swear it’s true",
      "It’s true",
      "The real story"
    ],
    "explain": "Someone tells you something hard to believe? Answer with **one word**.",
    "example": {
      "es": [
        "¿Posta que no venís?"
      ],
      "en": [
        "You’re really not coming?"
      ]
    },
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
    "meanings": [
      "OK! Sure!",
      "Come on!",
      "Go ahead"
    ],
    "explain": "The most common way to say **yes** to a plan.",
    "example": {
      "es": [
        "¿Nos vemos a las ocho?",
        "Dale."
      ],
      "en": [
        "See you at eight?",
        "Sure."
      ]
    },
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
    "meanings": [
      "Hey!",
      "Hey, listen"
    ],
    "explain": "Use **che** to get someone’s **attention**.",
    "example": {
      "es": [
        "Che, ¿y tu hermana?"
      ],
      "en": [
        "Hey, what about your sister?"
      ]
    },
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
    "meanings": [
      "Between friends",
      "To play dumb",
      "Messing around"
    ],
    "explain": "With friends, **boludo** is like **dude**. Totally friendly.",
    "example": {
      "es": [
        "Boludo, no sabés lo que pasó."
      ],
      "en": [
        "Dude, you won’t believe what happened."
      ]
    },
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
    ],
    "meanings": [
      "A mess",
      "Chaos",
      "Trouble"
    ],
    "explain": "A messy room, a messy desk: it’s a **quilombo**.",
    "example": {
      "es": [
        "Qué quilombo tenés en el escritorio."
      ],
      "en": [
        "Your desk is such a mess."
      ]
    }
  },
  {
    "id": "wotd-tipo",
    "day": 6,
    "word": "tipo",
    "marks": [
      "tipo"
    ],
    "hook": "Argentines drop it into almost every sentence",
    "meanings": [
      "Like…",
      "Around",
      "A guy"
    ],
    "explain": "Just like English **like**, it fills a pause.",
    "example": {
      "es": [
        "Tipo, no sé."
      ],
      "en": [
        "Like, I don’t know."
      ]
    },
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
    "meanings": [
      "What’s up?",
      "Good vibes",
      "Bad vibes"
    ],
    "explain": "**¿Qué onda?** is a casual hello.",
    "example": {
      "es": [
        "¿Qué onda, todo bien?"
      ],
      "en": [
        "What’s up, all good?"
      ]
    },
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
    "meanings": [
      "A sec",
      "A little",
      "A bit of"
    ],
    "explain": "**Un toque** = a moment, quickly.",
    "example": {
      "es": [
        "Vení un toque."
      ],
      "en": [
        "Come here a sec."
      ]
    },
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
    "meanings": [
      "To back someone",
      "To stand",
      "Hold on"
    ],
    "explain": "**Te banco** = I’ve got your back.",
    "example": {
      "es": [
        "Mis amigos me bancan."
      ],
      "en": [
        "My friends support me."
      ]
    },
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
    "meanings": [
      "Cool",
      "A nice person",
      "I’m into it"
    ],
    "explain": "**Copado** = cool, nice, great.",
    "example": {
      "es": [
        "Es un lugar re copado."
      ],
      "en": [
        "It’s a really cool place."
      ]
    },
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
    "meanings": [
      "A party",
      "Just kidding",
      "No way"
    ],
    "explain": "**La joda** = partying, a night out.",
    "example": {
      "es": [
        "Hay joda en lo de Juan."
      ],
      "en": [
        "There’s a party at Juan’s."
      ]
    },
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
    "meanings": [
      "Amazing",
      "Out of line",
      "Too far"
    ],
    "explain": "**Zarpado** = amazing, insane (in a good way).",
    "example": {
      "es": [
        "Fue un recital zarpado."
      ],
      "en": [
        "It was an insane concert."
      ]
    },
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
    "meanings": [
      "Got it wrong",
      "Blown away",
      "You’re dreaming"
    ],
    "explain": "**Flashear** = to get the wrong idea, to imagine things.",
    "example": {
      "es": [
        "Flasheé que era hoy."
      ],
      "en": [
        "I thought it was today."
      ]
    },
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
    "meanings": [
      "A job",
      "To work",
      "Hard work"
    ],
    "explain": "**Laburo** = job, work.",
    "example": {
      "es": [
        "Estoy buscando laburo."
      ],
      "en": [
        "I’m looking for a job."
      ]
    },
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
    "meanings": [
      "Feeling lazy",
      "What a drag",
      "A lazy person"
    ],
    "explain": "**Fiaca** = laziness, not feeling like doing anything.",
    "example": {
      "es": [
        "Tengo una fiaca…"
      ],
      "en": [
        "I feel so lazy…"
      ]
    },
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
    "meanings": [
      "Flirting",
      "All talk",
      "A smooth talker"
    ],
    "explain": "**Chamuyar** = to flirt, to sweet-talk.",
    "example": {
      "es": [
        "La chamuyó toda la noche."
      ],
      "en": [
        "He flirted with her all night."
      ]
    },
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
    "meanings": [
      "Nonsense",
      "Talking nonsense",
      "Totally off"
    ],
    "explain": "Alone, **cualquiera** = ridiculous, makes no sense.",
    "example": {
      "es": [
        "Lo que dice es cualquiera."
      ],
      "en": [
        "What he says makes no sense."
      ]
    },
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
    "meanings": [
      "Forget it",
      "Whatever, let’s go",
      "It’s over"
    ],
    "explain": "**Ya fue** = forget it, never mind.",
    "example": {
      "es": [
        "Ya fue, no importa."
      ],
      "en": [
        "Forget it, it doesn’t matter."
      ]
    },
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
    "meanings": [
      "Drunk",
      "No way",
      "For nothing"
    ],
    "explain": "**En pedo** = drunk.",
    "example": {
      "es": [
        "¡Estás en pedo!"
      ],
      "en": [
        "You’re drunk!"
      ]
    },
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
    "meanings": [
      "Not at all",
      "I’d never do it",
      "Not a chance"
    ],
    "explain": "**Ni ahí** = not at all, not even close.",
    "example": {
      "es": [
        "Ni ahí me gusta."
      ],
      "en": [
        "I don’t like it at all."
      ]
    },
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
    "meanings": [
      "Very",
      "Really"
    ],
    "explain": "**Re** before an adjective = very.",
    "example": {
      "es": [
        "Estoy re cansado."
      ],
      "en": [
        "I’m very tired."
      ]
    },
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
    "meanings": [
      "You know?",
      "I told you",
      "Did you hear?"
    ],
    "explain": "At the end of a sentence, **¿viste?** = you know?",
    "example": {
      "es": [
        "Hacía frío, ¿viste?"
      ],
      "en": [
        "It was cold, you know?"
      ]
    },
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
    "meanings": [
      "A mess",
      "Trouble",
      "To insult"
    ],
    "explain": "**Bardo** = a mess, a problem.",
    "example": {
      "es": [
        "Tengo un bardo en el laburo."
      ],
      "en": [
        "I have a big problem at work."
      ]
    },
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
    "meanings": [
      "How annoying",
      "A bad time",
      "For free"
    ],
    "explain": "**Qué garrón** = what bad luck, how annoying.",
    "example": {
      "es": [
        "Se canceló. Qué garrón."
      ],
      "en": [
        "It was cancelled. How annoying."
      ]
    },
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
    "meanings": [
      "A kid",
      "My friends"
    ],
    "explain": "**Pibe / piba** = kid, young person.",
    "example": {
      "es": [
        "Hay pibes jugando a la pelota."
      ],
      "en": [
        "Some kids are playing football."
      ]
    },
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
    "meanings": [
      "Money",
      "Worth nothing",
      "To ask for free"
    ],
    "explain": "**Mango** = a peso, money.",
    "example": {
      "es": [
        "Estoy sin un mango."
      ],
      "en": [
        "I have no money at all."
      ]
    },
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
    "meanings": [
      "A fool",
      "Easy to fool",
      "Looking foolish"
    ],
    "explain": "**Gil** = a fool.",
    "example": {
      "es": [
        "Qué gil que soy."
      ],
      "en": [
        "I’m such a fool."
      ]
    },
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
    "meanings": [
      "To yell at",
      "To cheat",
      "Extremely"
    ],
    "explain": "**Cagar a pedos** = to yell at someone.",
    "example": {
      "es": [
        "Mi vieja me cagó a pedos."
      ],
      "en": [
        "My mom yelled at me."
      ]
    },
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
    "meanings": [
      "To go for it",
      "To make a mistake",
      "Making it up"
    ],
    "explain": "**Mandarse** = to go ahead and do it.",
    "example": {
      "es": [
        "Me mandé y le hablé."
      ],
      "en": [
        "I took a chance and talked to her."
      ]
    },
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
    "meanings": [
      "How sad",
      "Feeling down",
      "Late-night hunger"
    ],
    "explain": "**Qué bajón** = how sad, what a shame.",
    "example": {
      "es": [
        "Qué bajón, no vino nadie."
      ],
      "en": [
        "How sad, nobody came."
      ]
    },
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
    "meanings": [
      "Let’s say",
      "I guess",
      "It’s certain"
    ],
    "explain": "**Ponele** = let’s say, for example.",
    "example": {
      "es": [
        "Ponele que vamos."
      ],
      "en": [
        "Let’s say we go."
      ]
    },
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
    "meanings": [
      "Fake",
      "Bad quality",
      "Not honest"
    ],
    "explain": "**Trucho** = fake.",
    "example": {
      "es": [
        "Es un billete trucho."
      ],
      "en": [
        "It’s a fake bill."
      ]
    },
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
    "meanings": [
      "Don’t worry",
      "Calm, quiet",
      "Easygoing"
    ],
    "explain": "**Tranqui** = relax, don’t worry.",
    "example": {
      "es": [
        "Tranqui, no pasa nada."
      ],
      "en": [
        "Relax, it’s OK."
      ]
    },
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
    "meanings": [
      "To annoy",
      "To support",
      "A fan"
    ],
    "explain": "**Hinchar** = to annoy someone.",
    "example": {
      "es": [
        "Me hincha todo el día."
      ],
      "en": [
        "He bothers me all day."
      ]
    },
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
    "meanings": [
      "Get out",
      "To leave fast",
      "To fire"
    ],
    "explain": "**Rajá** = get out of here.",
    "example": {
      "es": [
        "Rajá, que viene mi vieja."
      ],
      "en": [
        "Go, my mom is coming."
      ]
    },
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
    "meanings": [
      "The stadium",
      "Experience",
      "Cool, confident"
    ],
    "explain": "**La cancha** = the field, the stadium.",
    "example": {
      "es": [
        "Hoy hay cancha."
      ],
      "en": [
        "There’s a game today."
      ]
    },
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
    "meanings": [
      "What’s the plan?",
      "To feel like it",
      "To look good"
    ],
    "explain": "**¿Qué pinta?** = what are we doing?",
    "example": {
      "es": [
        "¿Qué pinta esta noche?"
      ],
      "en": [
        "What are we doing tonight?"
      ]
    },
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
    "meanings": [
      "To forget",
      "Losing track",
      "Distracted"
    ],
    "explain": "**Colgarse** = to forget to do something.",
    "example": {
      "es": [
        "Me colgué con el turno."
      ],
      "en": [
        "I forgot about the appointment."
      ]
    },
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
    "meanings": [
      "Stop it",
      "To break up",
      "To hang up"
    ],
    "explain": "**Cortala** = stop it.",
    "example": {
      "es": [
        "Cortala con el celu."
      ],
      "en": [
        "Stop using your phone."
      ]
    },
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
    "meanings": [
      "How are you?",
      "It works",
      "Go away"
    ],
    "explain": "**¿Cómo andás?** = how are you?",
    "example": {
      "es": [
        "Ando bien, ¿y vos?"
      ],
      "en": [
        "I’m good, and you?"
      ]
    },
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
    "meanings": [
      "Getting by",
      "Maybe",
      "Very close"
    ],
    "explain": "**Ahí ando** = not great, not bad.",
    "example": {
      "es": [
        "¿Y el laburo?",
        "Ahí va."
      ],
      "en": [
        "How’s work?",
        "It’s going OK."
      ]
    },
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
    "meanings": [
      "Kind of",
      "Sort of"
    ],
    "explain": "**Medio** + adjective = kind of, a bit.",
    "example": {
      "es": [
        "Es medio raro."
      ],
      "en": [
        "It’s a bit strange."
      ]
    },
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
    "meanings": [
      "So, yeah…",
      "Never mind",
      "Not at all"
    ],
    "explain": "**Y nada** fills the gaps when you tell a story.",
    "example": {
      "es": [
        "Y nada, eso."
      ],
      "en": [
        "So yeah, that’s it."
      ]
    },
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
    "meanings": [
      "To get out of it",
      "Good enough",
      "To get by"
    ],
    "explain": "**Zafar** = to escape a problem.",
    "example": {
      "es": [
        "Zafé del examen."
      ],
      "en": [
        "I got out of the exam."
      ]
    },
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
    "meanings": [
      "Attention",
      "Naked",
      "A big lie"
    ],
    "explain": "**Dar bola** = to pay attention.",
    "example": {
      "es": [
        "Estaba en bolas."
      ],
      "en": [
        "He was naked."
      ]
    },
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
    "meanings": [
      "Hey, man",
      "Some guy",
      "My partner"
    ],
    "explain": "**Flaco** = man, to call someone.",
    "example": {
      "es": [
        "El flaco del kiosco."
      ],
      "en": [
        "The guy from the kiosk."
      ]
    },
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
    "meanings": [
      "A cigarette",
      "I don’t care",
      "At the last moment"
    ],
    "explain": "**Pucho** = cigarette.",
    "example": {
      "es": [
        "Salgo a fumar un pucho."
      ],
      "en": [
        "I’m going out for a cigarette."
      ]
    },
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
