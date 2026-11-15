// The three versus series in bulk (2026-11-05): Spain vs Argentina, Mexico vs Argentina, Tourist vs
// Argentinian. Each line is one pair: LEFT WORD | RIGHT WORD | English | left says | right says.
// Four pairs make one reel; reels.mjs turns every four lines into a reel with the series' cast,
// background and ending (copied from versus-03, versus-08 and versus-11).
const p = s => s.trim().split('\n').map(l => { const [left, right, english, sayLeft, sayRight] = l.split('|').map(x => x.trim()); return {left, right, english, sayLeft, sayRight}; });

export const SPAIN = p(`
VOSOTROS|USTEDES|You all|Vosotros.|Ustedes.
SOIS|SON|You all are|Vosotros sois.|Ustedes son.
TENÉIS|TIENEN|You all have|Vosotros tenéis.|Ustedes tienen.
QUERÉIS|QUIEREN|You all want|Vosotros queréis.|Ustedes quieren.
¿HABÉIS COMIDO?|¿COMIERON?|Did you all eat?|¿Habéis comido?|¿Comieron?
HOY HE IDO|HOY FUI|I went today|Hoy he ido.|Hoy fui.
HE COMIDO|COMÍ|I ate|He comido.|Comí.
¿LO HABÉIS VISTO?|¿LO VIERON?|Did you all see it?|¿Lo habéis visto?|¿Lo vieron?
SABES|SABÉS|You know|Tú sabes.|Vos sabés.
VIENES|VENÍS|You come|Tú vienes.|Vos venís.
DICES|DECÍS|You say|Tú dices.|Vos decís.
HACES|HACÉS|You do|Tú haces.|Vos hacés.
VEN|VENÍ|Come!|Ven.|Vení.
SIÉNTATE|SENTATE|Sit down|Siéntate.|Sentate.
HAZLO|HACELO|Do it|Hazlo.|Hacelo.
OYE|CHE|Hey!|Oye.|Che.
MANTEQUILLA|MANTECA|Butter|La mantequilla.|La manteca.
PIMIENTO|MORRÓN|Bell pepper|El pimiento.|El morrón.
GUISANTES|ARVEJAS|Peas|Los guisantes.|Las arvejas.
PIÑA|ANANÁ|Pineapple|La piña.|El ananá.
PLÁTANO|BANANA|Banana|El plátano.|La banana.
BOCADILLO|SÁNGUCHE|Sandwich|El bocadillo.|El sánguche.
TARTA|TORTA|Cake|La tarta.|La torta.
GALLETA|GALLETITA|Cookie|La galleta.|La galletita.
GAMBAS|LANGOSTINOS|Shrimp|Las gambas.|Los langostinos.
JUDÍAS VERDES|CHAUCHAS|Green beans|Las judías verdes.|Las chauchas.
CALABACÍN|ZAPALLITO|Zucchini|El calabacín.|El zapallito.
CALABAZA|ZAPALLO|Pumpkin|La calabaza.|El zapallo.
FILETE|BIFE|Steak|El filete.|El bife.
BEICON|PANCETA|Bacon|El beicon.|La panceta.
CERDO|CHANCHO|Pig|El cerdo.|El chancho.
PERRITO|PANCHO|Hot dog|Un perrito caliente.|Un pancho.
NATA|CREMA|Cream|La nata.|La crema.
BOLLERÍA|FACTURAS|Pastries|La bollería.|Las facturas.
CRUASÁN|MEDIALUNA|Croissant|El cruasán.|La medialuna.
CACAHUETE|MANÍ|Peanut|El cacahuete.|El maní.
PALOMITAS|POCHOCLO|Popcorn|Las palomitas.|El pochoclo.
CHUCHES|GOLOSINAS|Candy|Las chuches.|Las golosinas.
MAZORCA|CHOCLO|Corn on the cob|La mazorca.|El choclo.
BARBACOA|ASADO|Barbecue|La barbacoa.|El asado.
CHAQUETA|CAMPERA|Jacket|La chaqueta.|La campera.
SUDADERA|BUZO|Sweatshirt|La sudadera.|El buzo.
BAÑADOR|MALLA|Swimsuit|El bañador.|La malla.
CALCETINES|MEDIAS|Socks|Los calcetines.|Las medias.
FALDA|POLLERA|Skirt|La falda.|La pollera.
AMERICANA|SACO|Blazer|La americana.|El saco.
VAQUEROS|JEAN|Jeans|Los vaqueros.|El jean.
CHÁNDAL|JOGGING|Tracksuit|El chándal.|El jogging.
CREMALLERA|CIERRE|Zipper|La cremallera.|El cierre.
PENDIENTES|AROS|Earrings|Los pendientes.|Los aros.
BRAGAS|BOMBACHA|Panties|Las bragas.|La bombacha.
ABRIGO|TAPADO|Coat|El abrigo.|El tapado.
NEVERA|HELADERA|Fridge|La nevera.|La heladera.
ARMARIO|PLACARD|Closet|El armario.|El placard.
SALÓN|LIVING|Living room|El salón.|El living.
MANTA|FRAZADA|Blanket|La manta.|La frazada.
BOMBILLA|LAMPARITA|Light bulb|La bombilla.|La lamparita.
CERILLA|FÓSFORO|Match|La cerilla.|El fósforo.
MECHERO|ENCENDEDOR|Lighter|El mechero.|El encendedor.
GRAPADORA|ABROCHADORA|Stapler|La grapadora.|La abrochadora.
PISO|DEPARTAMENTO|Apartment|El piso.|El departamento.
BAÑERA|BAÑADERA|Bathtub|La bañera.|La bañadera.
TIRITAS|CURITAS|Band-aids|Las tiritas.|Las curitas.
TARRO|FRASCO|Jar|El tarro.|El frasco.
ORDENADOR|COMPUTADORA|Computer|El ordenador.|La computadora.
PORTÁTIL|NOTEBOOK|Laptop|El portátil.|La notebook.
RATÓN|MOUSE|Mouse|El ratón.|El mouse.
BOLÍGRAFO|BIROME|Pen|El bolígrafo.|La birome.
CONDUCIR|MANEJAR|To drive|Conducir.|Manejar.
APARCAR|ESTACIONAR|To park|Aparcar.|Estacionar.
MALETERO|BAÚL|Trunk|El maletero.|El baúl.
GASOLINA|NAFTA|Gas|La gasolina.|La nafta.
METRO|SUBTE|Subway|El metro.|El subte.
AUTOBÚS|COLECTIVO|Bus|El autobús.|El colectivo.
BILLETE|PASAJE|Ticket|El billete.|El pasaje.
CARRETERA|RUTA|Highway|La carretera.|La ruta.
FONTANERO|PLOMERO|Plumber|El fontanero.|El plomero.
CAMARERO|MOZO|Waiter|El camarero.|El mozo.
CANGURO|NIÑERA|Babysitter|La canguro.|La niñera.
SOCORRISTA|GUARDAVIDAS|Lifeguard|El socorrista.|El guardavidas.
COTILLA|CHUSMA|Gossip|Cotilla.|Chusma.
PIJO|CHETO|Posh|Pijo.|Cheto.
PRINGADO|GIL|Loser|Pringado.|Gil.
CHULO|CANCHERO|Show-off|Chulo.|Canchero.
MAZO|RE|Really|Mazo bueno.|Re bueno.
¡QUÉ PASADA!|¡QUÉ ZARPADO!|That's amazing!|¡Qué pasada!|¡Qué zarpado!
ME PIRO|ME RAJO|I'm out|Me piro.|Me rajo.
DE MARCHA|DE JODA|Partying|De marcha.|De joda.
¡QUÉ FUERTE!|¡QUÉ HEAVY!|That's intense!|¡Qué fuerte!|¡Qué heavy!
ENFADADO|ENOJADO|Angry|Enfadado.|Enojado.
GUAPO|LINDO|Good-looking|Guapo.|Lindo.
BORDE|MALA ONDA|Rude|Borde.|Mala onda.
COGER|AGARRAR|To grab|Coger.|Agarrar.
TE ECHO DE MENOS|TE EXTRAÑO|I miss you|Te echo de menos.|Te extraño.
¿QUEDAMOS?|¿NOS JUNTAMOS?|Wanna meet up?|¿Quedamos?|¿Nos juntamos?
¿TE APETECE?|¿TENÉS GANAS?|Do you feel like it?|¿Te apetece?|¿Tenés ganas?
ADIÓS|CHAU|Bye|Adiós.|Chau.
¡JOLÍN!|¡LA PUCHA!|Darn!|¡Jolín!|¡La pucha!
¿DIGA?|¿HOLA?|Hello? (on the phone)|¿Diga?|¿Hola?
HECHO POLVO|FUNDIDO|Exhausted|Estoy hecho polvo.|Estoy fundido.
`);

export const MEXICO = p(`
AGUACATE|PALTA|Avocado|El aguacate.|La palta.
FRESA|FRUTILLA|Strawberry|La fresa.|La frutilla.
PLÁTANO|BANANA|Banana|El plátano.|La banana.
PIÑA|ANANÁ|Pineapple|La piña.|El ananá.
CHABACANO|DAMASCO|Apricot|El chabacano.|El damasco.
TORONJA|POMELO|Grapefruit|La toronja.|El pomelo.
CAMOTE|BATATA|Sweet potato|El camote.|La batata.
BETABEL|REMOLACHA|Beet|El betabel.|La remolacha.
JITOMATE|TOMATE|Tomato|El jitomate.|El tomate.
CHÍCHAROS|ARVEJAS|Peas|Los chícharos.|Las arvejas.
EJOTES|CHAUCHAS|Green beans|Los ejotes.|Las chauchas.
CALABACITA|ZAPALLITO|Zucchini|La calabacita.|El zapallito.
CACAHUATE|MANÍ|Peanut|El cacahuate.|El maní.
CHILE|AJÍ|Chili pepper|El chile.|El ají.
PALOMITAS|POCHOCLO|Popcorn|Las palomitas.|El pochoclo.
DULCES|GOLOSINAS|Candy|Los dulces.|Las golosinas.
PASTEL|TORTA|Cake|El pastel.|La torta.
TORTA|SÁNGUCHE|Sandwich|La torta.|El sánguche.
PAY|TARTA|Pie|El pay.|La tarta.
PAN DULCE|FACTURAS|Pastries|El pan dulce.|Las facturas.
TOCINO|PANCETA|Bacon|El tocino.|La panceta.
PUERCO|CHANCHO|Pig|El puerco.|El chancho.
CAMARÓN|LANGOSTINO|Shrimp|El camarón.|El langostino.
HOT DOG|PANCHO|Hot dog|Un hot dog.|Un pancho.
MANTEQUILLA|MANTECA|Butter|La mantequilla.|La manteca.
GALLETA|GALLETITA|Cookie|La galleta.|La galletita.
NIEVE|HELADO|Ice cream|La nieve.|El helado.
BOTANA|PICADA|Snacks|La botana.|La picada.
CHELA|BIRRA|Beer|Una chela.|Una birra.
CRUDA|RESACA|Hangover|La cruda.|La resaca.
PACHANGA|JODA|Party|La pachanga.|La joda.
PISTEAR|CHUPAR|To drink (booze)|Pistear.|Chupar.
CALCETINES|MEDIAS|Socks|Los calcetines.|Las medias.
SUÉTER|PULÓVER|Sweater|El suéter.|El pulóver.
SUDADERA|BUZO|Sweatshirt|La sudadera.|El buzo.
TRAJE DE BAÑO|MALLA|Swimsuit|El traje de baño.|La malla.
FALDA|POLLERA|Skirt|La falda.|La pollera.
MEZCLILLA|JEAN|Denim|La mezclilla.|El jean.
TENIS|ZAPATILLAS|Sneakers|Los tenis.|Las zapatillas.
CHANCLAS|OJOTAS|Flip-flops|Las chanclas.|Las ojotas.
ARETES|AROS|Earrings|Los aretes.|Los aros.
LENTES|ANTEOJOS|Glasses|Los lentes.|Los anteojos.
CALZONES|BOMBACHA|Panties|Los calzones.|La bombacha.
BOLSA|CARTERA|Purse|La bolsa.|La cartera.
REFRI|HELADERA|Fridge|El refri.|La heladera.
CLÓSET|PLACARD|Closet|El clóset.|El placard.
SALA|LIVING|Living room|La sala.|El living.
COBIJA|FRAZADA|Blanket|La cobija.|La frazada.
FOCO|LAMPARITA|Light bulb|El foco.|La lamparita.
CERILLO|FÓSFORO|Match|El cerillo.|El fósforo.
LLAVE|CANILLA|Faucet|La llave.|La canilla.
TINA|BAÑADERA|Bathtub|La tina.|La bañadera.
BANQUETA|VEREDA|Sidewalk|La banqueta.|La vereda.
CARRO|AUTO|Car|El carro.|El auto.
CAJUELA|BAÚL|Trunk|La cajuela.|El baúl.
LLANTA|GOMA|Tire|La llanta.|La goma.
GASOLINA|NAFTA|Gas|La gasolina.|La nafta.
CARRETERA|RUTA|Highway|La carretera.|La ruta.
METRO|SUBTE|Subway|El metro.|El subte.
ENGRAPADORA|ABROCHADORA|Stapler|La engrapadora.|La abrochadora.
CHAVO|PIBE|Kid|El chavo.|El pibe.
CHAMACO|NENE|Little kid|El chamaco.|El nene.
CHAVA|MINA|Girl|La chava.|La mina.
CUATE|AMIGO|Buddy|Mi cuate.|Mi amigo.
FRESA|CHETO|Posh|Fresa.|Cheto.
CHISMOSO|CHUSMA|Gossip|Chismoso.|Chusma.
GÜERO|RUBIO|Blond|Güero.|Rubio.
MORENO|MOROCHO|Dark-haired|Moreno.|Morocho.
¡QUÉ PADRE!|¡QUÉ COPADO!|So cool!|¡Qué padre!|¡Qué copado!
¡QUÉ CHIDO!|¡QUÉ ZARPADO!|Awesome!|¡Qué chido!|¡Qué zarpado!
CHINGÓN|GROSO|The best|Chingón.|Groso.
¡ÓRALE!|¡DALE!|Come on!|¡Órale!|¡Dale!
¡NO MAMES!|¡NO JODAS!|No way!|¡No mames!|¡No jodas!
¡AGUAS!|¡OJO!|Watch out!|¡Aguas!|¡Ojo!
¿MANDE?|¿QUÉ?|Pardon?|¿Mande?|¿Qué?
¿BUENO?|¿HOLA?|Hello? (on the phone)|¿Bueno?|¿Hola?
AHORITA|EN UN RATO|In a bit|Ahorita.|En un rato.
PLATICAR|CHARLAR|To chat|Platicar.|Charlar.
FLOJO|VAGO|Lazy|Flojo.|Vago.
FERIA|CAMBIO|Coins|La feria.|El cambio.
PIENSAS|PENSÁS|You think|Tú piensas.|Vos pensás.
DUERMES|DORMÍS|You sleep|Tú duermes.|Vos dormís.
JUEGAS|JUGÁS|You play|Tú juegas.|Vos jugás.
ENTIENDES|ENTENDÉS|You understand|Tú entiendes.|Vos entendés.
VIENES|VENÍS|You come|Tú vienes.|Vos venís.
HACES|HACÉS|You do|Tú haces.|Vos hacés.
DICES|DECÍS|You say|Tú dices.|Vos decís.
SABES|SABÉS|You know|Tú sabes.|Vos sabés.
PON|PONÉ|Put it|Pon.|Poné.
SAL|SALÍ|Get out|Sal.|Salí.
TOMA|TOMÁ|Take it|Toma.|Tomá.
CORRE|CORRÉ|Run!|Corre.|Corré.
RECÁMARA|PIEZA|Bedroom|La recámara.|La pieza.
REGADERA|DUCHA|Shower|La regadera.|La ducha.
ESTUFA|COCINA|Stove|La estufa.|La cocina.
TRASTES|PLATOS|Dishes|Los trastes.|Los platos.
CHAFA|TRUCHO|Fake|Chafa.|Trucho.
ESTÁ CAÑÓN|ESTÁ BRAVO|It's tough|Está cañón.|Está bravo.
¡QUÉ OSO!|¡QUÉ PAPELÓN!|So embarrassing!|¡Qué oso!|¡Qué papelón!
¡ÁNDALE!|¡VAMOS!|Let's go!|¡Ándale!|¡Vamos!
MORRO|CHABÓN|Dude|El morro.|El chabón.
MIS JEFES|MIS VIEJOS|My parents|Mis jefes.|Mis viejos.
MESERO|MOZO|Waiter|El mesero.|El mozo.
LIGAR|CHAMUYAR|To flirt|Ligar.|Chamuyar.
CACHUCHA|GORRA|Cap|La cachucha.|La gorra.
PLUMA|BIROME|Pen|La pluma.|La birome.
RENTAR|ALQUILAR|To rent|Rentar.|Alquilar.
COLONIA|BARRIO|Neighborhood|La colonia.|El barrio.
`);

export const TOURIST = p(`
¿CÓMO ESTÁS?|¿TODO BIEN?|How are you?|¿Cómo estás?|¿Todo bien?
BUENOS DÍAS|BUEN DÍA|Good morning|Buenos días.|Buen día.
ADIÓS|CHAU|Bye|Adiós.|Chau.
HASTA LUEGO|NOS VEMOS|See you|Hasta luego.|Nos vemos.
¿CUÁNTO CUESTA?|¿CUÁNTO SALE?|How much is it?|¿Cuánto cuesta?|¿Cuánto sale?
ES UN ROBO|ES UN AFANO|It's a rip-off|Es un robo.|Es un afano.
EL CAMBIO|EL VUELTO|The change|El cambio.|El vuelto.
MUY CARO|RE CARO|Super expensive|Muy caro.|Re caro.
SÍ, CLARO|OBVIO|Of course|Sí, claro.|Obvio.
ESTÁ BIEN|DALE|OK|Está bien.|Dale.
TRANQUILO|TRANQUI|Relax|Tranquilo.|Tranqui.
NO HAY PROBLEMA|NO HAY DRAMA|No problem|No hay problema.|No hay drama.
¡GENIAL!|¡BÁRBARO!|Great!|¡Genial!|¡Bárbaro!
¡INCREÍBLE!|¡ZARPADO!|Amazing!|¡Increíble!|¡Zarpado!
¡QUÉ BONITO!|¡QUÉ LINDO!|So pretty!|¡Qué bonito!|¡Qué lindo!
MUY BUENO|RE BUENO|Really good|Muy bueno.|Re bueno.
AMIGO|BOLUDO|Buddy|Amigo.|Boludo.
HOMBRE|CHABÓN|Guy|Un hombre.|Un chabón.
MUJER|MINA|Woman|Una mujer.|Una mina.
NIÑO|NENE|Little kid|El niño.|El nene.
ESTOY CANSADO|ESTOY FUNDIDO|I'm exhausted|Estoy cansado.|Estoy fundido.
ESTOY BORRACHO|ESTOY EN PEDO|I'm drunk|Estoy borracho.|Estoy en pedo.
ES ABURRIDO|ES UN EMBOLE|It's boring|Es aburrido.|Es un embole.
ESTÁ LOCO|ESTÁ CHAPITA|He's crazy|Está loco.|Está chapita.
¿DE DÓNDE ERES?|¿DE DÓNDE SOS?|Where are you from?|¿De dónde eres?|¿De dónde sos?
¿CÓMO TE LLAMAS?|¿CÓMO TE LLAMÁS?|What's your name?|¿Cómo te llamas?|¿Cómo te llamás?
¿HABLAS INGLÉS?|¿HABLÁS INGLÉS?|Do you speak English?|¿Hablas inglés?|¿Hablás inglés?
¿DÓNDE VIVES?|¿DÓNDE VIVÍS?|Where do you live?|¿Dónde vives?|¿Dónde vivís?
¿QUIERES IR?|¿QUERÉS IR?|Do you want to go?|¿Quieres ir?|¿Querés ir?
¿TIENES HAMBRE?|¿TENÉS HAMBRE?|Are you hungry?|¿Tienes hambre?|¿Tenés hambre?
¿PUEDES AYUDARME?|¿ME PODÉS AYUDAR?|Can you help me?|¿Puedes ayudarme?|¿Me podés ayudar?
ESCUCHA|ESCUCHÁ|Listen|Escucha.|Escuchá.
AQUÍ|ACÁ|Here|Aquí.|Acá.
ALLÍ|ALLÁ|There|Allí.|Allá.
VEN AQUÍ|VENÍ ACÁ|Come here|Ven aquí.|Vení acá.
EN UN MOMENTO|EN UN TOQUE|In a sec|En un momento.|En un toque.
LA COMIDA|EL MORFI|Food|La comida.|El morfi.
COMER|MORFAR|To eat|Comer.|Morfar.
UNA CERVEZA|UNA BIRRA|A beer|Una cerveza.|Una birra.
ESTÁ DELICIOSO|ESTÁ BUENÍSIMO|It's delicious|Está delicioso.|Está buenísimo.
EL SÁNDWICH|EL SÁNGUCHE|Sandwich|El sándwich.|El sánguche.
PATATAS FRITAS|PAPAS FRITAS|Fries|Patatas fritas.|Papas fritas.
LA BARBACOA|EL ASADO|Barbecue|La barbacoa.|El asado.
EL APERITIVO|LA PICADA|Snacks|El aperitivo.|La picada.
EL TRABAJO|EL LABURO|Work|El trabajo.|El laburo.
TRABAJAR|LABURAR|To work|Trabajar.|Laburar.
EL APARTAMENTO|EL DEPTO|Apartment|El apartamento.|El depto.
EL TAXI|EL TACHO|Taxi|El taxi.|El tacho.
NO ENTIENDO|NO CAZO UNA|I don't get it|No entiendo.|No cazo una.
¿EN SERIO?|¿POSTA?|Really?|¿En serio?|¿Posta?
ES MENTIRA|PURO VERSO|It's a lie|Es mentira.|Es puro verso.
ESTOY BROMEANDO|TE ESTOY JODIENDO|I'm kidding|Estoy bromeando.|Te estoy jodiendo.
TENGO PRISA|ESTOY APURADO|I'm in a hurry|Tengo prisa.|Estoy apurado.
ESPERA UN MOMENTO|BANCÁ UN TOQUE|Hold on|Espera un momento.|Bancá un toque.
¡VÁMONOS!|¡RAJEMOS!|Let's get out of here!|¡Vámonos!|¡Rajemos!
¡CUIDADO!|¡OJO!|Careful!|¡Cuidado!|¡Ojo!
ME GUSTA|ME COPA|I like it|Me gusta.|Me copa.
¡QUÉ SUERTE!|¡QUÉ LECHE!|So lucky!|¡Qué suerte!|¡Qué leche!
¡QUÉ VERGÜENZA!|¡QUÉ PAPELÓN!|So embarrassing!|¡Qué vergüenza!|¡Qué papelón!
¡QUÉ DESASTRE!|¡QUÉ QUILOMBO!|What a mess!|¡Qué desastre!|¡Qué quilombo!
LA POLICÍA|LA CANA|The cops|La policía.|La cana.
ROBAR|AFANAR|To steal|Robar.|Afanar.
LA FIESTA|LA JODA|Party|La fiesta.|La joda.
LA DISCOTECA|EL BOLICHE|Nightclub|La discoteca.|El boliche.
¿QUÉ HACES?|¿QUÉ HACÉS?|What are you doing?|¿Qué haces?|¿Qué hacés?
¿QUÉ QUIERES?|¿QUÉ QUERÉS?|What do you want?|¿Qué quieres?|¿Qué querés?
¿SABES?|¿VISTE?|You know?|¿Sabes?|¿Viste?
OYE|CHE|Hey!|Oye.|Che.
LA CHICA|LA PIBA|Girl|La chica.|La piba.
EL CHICO|EL PIBE|Boy|El chico.|El pibe.
GUAPO|FACHERO|Handsome|Guapo.|Fachero.
LOS PADRES|LOS VIEJOS|Parents|Los padres.|Los viejos.
TONTO|GIL|Idiot|Tonto.|Gil.
PRESUMIDO|AGRANDADO|Show-off|Presumido.|Agrandado.
TACAÑO|RATA|Stingy|Tacaño.|Rata.
PEREZOSO|VAGO|Lazy|Perezoso.|Vago.
PESADO|DENSO|Annoying|Pesado.|Denso.
MENTIROSO|CHAMUYERO|Smooth talker|Mentiroso.|Chamuyero.
CHISMOSO|CHUSMA|Gossip|Chismoso.|Chusma.
BORRACHO|MAMADO|Wasted|Borracho.|Mamado.
SIN DINERO|SIN UN MANGO|Broke|Estoy sin dinero.|Estoy sin un mango.
MIL PESOS|UNA LUCA|A thousand pesos|Mil pesos.|Una luca.
CIEN PESOS|UN GAMBA|A hundred pesos|Cien pesos.|Un gamba.
BARATO|REGALADO|Super cheap|Está barato.|Está regalado.
MUCHO|UNA BOCHA|A lot|Mucho.|Una bocha.
UN POCO|UN CACHO|A little|Un poco.|Un cacho.
LA COSA|EL COSO|The thing|La cosa.|El coso.
EL TELÉFONO|EL CELU|Phone|El teléfono.|El celu.
BESAR|CHAPAR|To make out|Besar.|Chapar.
COQUETEAR|CHAMUYAR|To flirt|Coquetear.|Chamuyar.
ENAMORADO|ENGANCHADO|Hooked on someone|Enamorado.|Enganchado.
LA ESPOSA|LA JERMU|The wife|La esposa.|La jermu.
EL ESTADIO|LA CANCHA|Stadium|El estadio.|La cancha.
EL AFICIONADO|EL HINCHA|Fan|El aficionado.|El hincha.
EL ÁRBITRO|EL REFERÍ|Referee|El árbitro.|El referí.
EL ENTRENADOR|EL DT|Coach|El entrenador.|El dete.
EL CAFÉ|EL FECA|Coffee|El café.|El feca.
EL TANGO|EL GOTÁN|Tango|El tango.|El gotán.
EL BAÑO|EL ÑOBA|Bathroom|El baño.|El ñoba.
EL PERRO|EL PICHICHO|Doggy|El perro.|El pichicho.
¡QUÉ PENA!|¡QUÉ BAJÓN!|What a bummer!|¡Qué pena!|¡Qué bajón!
ESTOY TRISTE|ESTOY BAJONEADO|I'm down|Estoy triste.|Estoy bajoneado.
ESTOY HARTO|ESTOY PODRIDO|I'm fed up|Estoy harto.|Estoy podrido.
NO TENGO GANAS|ME DA PAJA|Can't be bothered|No tengo ganas.|Me da paja.
BUENAS TARDES|¡BUENAS!|Good afternoon|Buenas tardes.|¡Buenas!
MUCHAS GRACIAS|GRACIAS, GENIO|Thanks a lot|Muchas gracias.|Gracias, genio.
¿CÓMO TE VA?|¿CÓMO ANDÁS?|How's it going?|¿Cómo te va?|¿Cómo andás?
ENCANTADO|UN GUSTO|Nice to meet you|Encantado.|Un gusto.
EL AGUACATE|LA PALTA|Avocado|El aguacate.|La palta.
LA FRESA|LA FRUTILLA|Strawberry|La fresa.|La frutilla.
EL MELOCOTÓN|EL DURAZNO|Peach|El melocotón.|El durazno.
LAS PALOMITAS|EL POCHOCLO|Popcorn|Las palomitas.|El pochoclo.
COGER|TOMAR|To take (the bus)|Coger el autobús.|Tomar el colectivo.
EL METRO|EL SUBTE|Subway|El metro.|El subte.
EL BILLETE|EL BOLETO|Ticket|El billete.|El boleto.
LA GASOLINA|LA NAFTA|Gas|La gasolina.|La nafta.
`);
