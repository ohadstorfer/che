// Drake carousels (DrakeSlide.tsx): opener + 5 word pairs + closer, plus a "Stop saying" alternative cover.
// Renders to out/carousels-drake/<id>/01.png… with render-carousel.mjs. No word appears twice across the 30.
// English is plain first, one casual word at most.
const pair = (no, yes, en) => ({no, yes, en});
const textbook = (coverNo, coverYes) => ({coverNo, coverYes});

export const DRAKES = [
  {id: 'drake-01-everyday', topic: 'Everyday words', ...textbook('Textbook Spanish', 'How Argentines really say it'), pairs: [
    pair('Dinero', 'Plata', 'money'), pair('Trabajo', 'Laburo', 'work, a job'), pair('Chaval', 'Pibe', 'kid, guy'), pair('Apartamento', 'Depto', 'apartment'), pair('Muy bueno', 'Re bueno', 'really good')]},
  {id: 'drake-02-food', topic: 'Food edition', ...textbook('Textbook food words', 'What Argentines call them'), pairs: [
    pair('Aguacate', 'Palta', 'avocado'), pair('Fresa', 'Frutilla', 'strawberry'), pair('Palomitas', 'Pochoclo', 'popcorn'), pair('Melocotón', 'Durazno', 'peach'), pair('Pastel', 'Torta', 'cake')]},
  {id: 'drake-03-vos', topic: 'Vos edition', ...textbook('Tú, like the textbook', 'Vos, like Argentina'), stopNo: 'Stop saying tú', stopYes: 'Say vos in Argentina', pairs: [
    pair('Tú eres', 'Vos sos', 'you are'), pair('Tú tienes', 'Vos tenés', 'you have'), pair('Tú quieres', 'Vos querés', 'you want'), pair('Tú puedes', 'Vos podés', 'you can'), pair('Ven aquí', 'Vení acá', 'come here')]},
  {id: 'drake-04-small-talk', topic: 'Small talk edition', ...textbook('Textbook small talk', 'How Argentines greet and react'), pairs: [
    pair('¿Qué pasa?', '¿Qué hacés?', 'what’s up?'), pair('Oye', 'Che', 'hey'), pair('Vale', 'Dale', 'okay'), pair('¿En serio?', '¿Posta?', 'really?'), pair('¡Qué guay!', '¡Qué copado!', 'how cool!')]},
  {id: 'drake-05-city', topic: 'City edition', ...textbook('Textbook street words', 'Getting around Buenos Aires'), pairs: [
    pair('Coche', 'Auto', 'car'), pair('Autobús', 'Colectivo', 'bus'), pair('Metro', 'Subte', 'subway'), pair('Gasolina', 'Nafta', 'gas, petrol'), pair('Acera', 'Vereda', 'sidewalk')]},
  {id: 'drake-06-home', topic: 'Home & clothes edition', ...textbook('Textbook clothes & home', 'What Argentines call them'), pairs: [
    pair('Camiseta', 'Remera', 'T-shirt'), pair('Chaqueta', 'Campera', 'jacket'), pair('Falda', 'Pollera', 'skirt'), pair('Nevera', 'Heladera', 'fridge'), pair('Piscina', 'Pileta', 'swimming pool')]},
  {id: 'drake-07-fruit-veg', topic: 'Fruit & veg edition', ...textbook('Textbook fruit & veg', 'What the verdulería sells'), pairs: [
    pair('Piña', 'Ananá', 'pineapple'), pair('Plátano', 'Banana', 'banana'), pair('Patata', 'Papa', 'potato'), pair('Guisante', 'Arveja', 'pea'), pair('Judías verdes', 'Chauchas', 'green beans')]},
  {id: 'drake-08-breakfast', topic: 'Breakfast edition', ...textbook('Textbook breakfast', 'Breakfast in Argentina'), pairs: [
    pair('Cruasán', 'Medialuna', 'croissant'), pair('Mantequilla', 'Manteca', 'butter'), pair('Zumo', 'Jugo', 'juice'), pair('Galleta', 'Galletita', 'cookie'), pair('Nata', 'Crema', 'cream')]},
  {id: 'drake-09-food-drinks', topic: 'Food & drinks edition', ...textbook('Textbook bar menu', 'What you order in Argentina'), pairs: [
    pair('Perrito caliente', 'Pancho', 'hot dog'), pair('Refresco', 'Gaseosa', 'soda'), pair('Cerveza', 'Birra', 'beer'), pair('Filete', 'Bife', 'steak'), pair('Tapas', 'Picada', 'snacks to share')]},
  {id: 'drake-10-classics', topic: 'Argentine classics', ...textbook('Textbook names', 'The Argentine classics'), pairs: [
    pair('Barbacoa', 'Asado', 'barbecue'), pair('Pan con chorizo', 'Choripán', 'sausage sandwich'), pair('Pan de molde', 'Pan lactal', 'sliced bread'), pair('Pasta', 'Fideos', 'pasta, noodles'), pair('Mazorca', 'Choclo', 'corn on the cob')]},
  {id: 'drake-11-house', topic: 'House edition', ...textbook('Textbook house words', 'What Argentines call them'), pairs: [
    pair('Dormitorio', 'Pieza', 'bedroom'), pair('Grifo', 'Canilla', 'faucet'), pair('Bañera', 'Bañadera', 'bathtub'), pair('Manta', 'Frazada', 'blanket'), pair('Bombilla', 'Lamparita', 'light bulb')]},
  {id: 'drake-12-clothes', topic: 'Clothes edition', ...textbook('Textbook clothes', 'What Argentines wear'), pairs: [
    pair('Calcetines', 'Medias', 'socks'), pair('Bañador', 'Malla', 'swimsuit'), pair('Tenis', 'Zapatillas', 'sneakers'), pair('Vaqueros', 'Jean', 'jeans'), pair('Sudadera', 'Buzo', 'sweatshirt')]},
  {id: 'drake-13-people', topic: 'People edition', ...textbook('Textbook people', 'How Argentines talk about people'), pairs: [
    pair('Tía', 'Mina', 'woman, girl'), pair('Tío', 'Tipo', 'man, guy'), pair('Niño', 'Nene', 'little boy'), pair('Mis padres', 'Mis viejos', 'my parents'), pair('Policía', 'Cana', 'police officer, cop')]},
  {id: 'drake-14-describing', topic: 'Describing people', ...textbook('Textbook adjectives', 'How Argentines describe you'), pairs: [
    pair('Simpático', 'Buena onda', 'nice, friendly'), pair('Antipático', 'Mala onda', 'unfriendly'), pair('Tacaño', 'Amarrete', 'someone who hates spending'), pair('Chismoso', 'Chusma', 'someone who gossips'), pair('Ladrón', 'Chorro', 'thief')]},
  {id: 'drake-15-insults', topic: 'Insults edition', ...textbook('Textbook insults', 'What you’ll really hear'), pairs: [
    pair('Tonto', 'Boludo', 'idiot, fool'), pair('Cobarde', 'Cagón', 'coward'), pair('Presumido', 'Agrandado', 'someone who thinks he’s great'), pair('Mentiroso', 'Chamuyero', 'someone who lies to charm you'), pair('Borracho', 'En pedo', 'drunk')]},
  {id: 'drake-16-reactions', topic: 'Reactions edition', ...textbook('Textbook reactions', 'How Argentines react'), pairs: [
    pair('¡Qué desastre!', '¡Qué quilombo!', 'what a mess!'), pair('¡Qué pereza!', '¡Qué fiaca!', 'I don’t feel like it!'), pair('¡Estupendo!', '¡Joya!', 'great!'), pair('¡Vaya!', '¡Mirá vos!', 'wow, look at that!'), pair('¡Qué caro!', '¡Un afano!', 'that’s too expensive!')]},
  {id: 'drake-17-phrases', topic: 'Everyday phrases', ...textbook('Textbook phrases', 'What Argentines say all day'), pairs: [
    pair('Por supuesto', 'Obvio', 'of course'), pair('¡Qué va!', '¡Ni ahí!', 'not at all'), pair('Mogollón', 'Un montón', 'a lot'), pair('¿Sabes?', '¿Viste?', 'you know?'), pair('Espera', 'Bancá', 'wait')]},
  {id: 'drake-18-verbs', topic: 'Verbs edition', ...textbook('Textbook verbs', 'The verbs Argentines use'), pairs: [
    pair('Coger', 'Agarrar', 'to take, to grab'), pair('Beber', 'Tomar', 'to drink'), pair('Enfadarse', 'Enojarse', 'to get angry'), pair('Conducir', 'Manejar', 'to drive'), pair('Aparcar', 'Estacionar', 'to park')]},
  {id: 'drake-19-slang-verbs', topic: 'Slang verbs edition', ...textbook('Textbook verbs', 'Argentine street verbs'), pairs: [
    pair('Comer', 'Morfar', 'to eat'), pair('Coquetear', 'Chamuyar', 'to flirt'), pair('Vacilar', 'Cargar', 'to tease, to joke with'), pair('Pedir cosas', 'Manguear', 'to ask for free things'), pair('Aburrirse', 'Embolarse', 'to get bored')]},
  {id: 'drake-20-night-out', topic: 'Night out edition', ...textbook('Textbook night out', 'A night out in Argentina'), pairs: [
    pair('Discoteca', 'Boliche', 'nightclub'), pair('Ir de fiesta', 'Salir de joda', 'to go out partying'), pair('Portero', 'Patovica', 'bouncer'), pair('Copa', 'Trago', 'a drink'), pair('Besarse', 'Transar', 'to kiss, to make out')]},
  {id: 'drake-21-money', topic: 'Money edition', ...textbook('Textbook money talk', 'How Argentines talk money'), pairs: [
    pair('Mil pesos', 'Una luca', '1,000 pesos'), pair('Un millón', 'Un palo', 'a million'), pair('Un peso', 'Un mango', 'one peso'), pair('Dólares', 'Verdes', 'US dollars'), pair('Sin dinero', 'Seco', 'without money, broke')]},
  {id: 'drake-22-school', topic: 'School edition', ...textbook('Textbook school words', 'School in Argentina'), pairs: [
    pair('Universidad', 'Facu', 'college'), pair('Instituto', 'Secundario', 'high school'), pair('Asignatura', 'Materia', 'school subject'), pair('Bolígrafo', 'Birome', 'pen'), pair('Rotulador', 'Fibra', 'marker')]},
  {id: 'drake-23-car', topic: 'Car edition', ...textbook('Textbook road words', 'On the road in Argentina'), pairs: [
    pair('Maletero', 'Baúl', 'car trunk'), pair('Carnet de conducir', 'Registro', 'driver’s license'), pair('Carretera', 'Ruta', 'highway'), pair('Tráfico', 'Tránsito', 'traffic'), pair('Hacer autostop', 'Hacer dedo', 'to hitchhike')]},
  {id: 'drake-24-jobs', topic: 'Jobs edition', ...textbook('Textbook job titles', 'Who you’ll meet in Argentina'), pairs: [
    pair('Camarero', 'Mozo', 'waiter'), pair('Fontanero', 'Plomero', 'plumber'), pair('Conserje', 'Encargado', 'building manager'), pair('Taxista', 'Tachero', 'taxi driver'), pair('Repartidor', 'Delivery', 'delivery rider')]},
  {id: 'drake-25-health', topic: 'Health edition', ...textbook('Textbook health words', 'At the pharmacy in Argentina'), pairs: [
    pair('Tirita', 'Curita', 'band-aid'), pair('Catarro', 'Resfrío', 'a cold'), pair('Pañuelo de papel', 'Carilina', 'tissue'), pair('Cardenal', 'Moretón', 'bruise'), pair('Barriga', 'Panza', 'belly')]},
  {id: 'drake-26-time', topic: 'Time & place edition', ...textbook('Textbook time & place', 'How Argentines say it'), pairs: [
    pair('Aquí', 'Acá', 'here'), pair('Allí', 'Allá', 'there'), pair('Por la noche', 'A la noche', 'at night'), pair('Luego', 'Después', 'later'), pair('Por la tarde', 'A la tarde', 'in the afternoon')]},
  {id: 'drake-27-commands', topic: 'Commands edition', ...textbook('Tú commands', 'Vos commands'), stopNo: 'Stop using tú commands', stopYes: 'Use vos in Argentina', pairs: [
    pair('Dime', 'Decime', 'tell me'), pair('Mira', 'Mirá', 'look'), pair('Siéntate', 'Sentate', 'sit down'), pair('Hazlo', 'Hacelo', 'do it'), pair('Vete', 'Andate', 'go away')]},
  {id: 'drake-28-pronouns', topic: 'Pronouns edition', ...textbook('Tú and vosotros', 'Vos and ustedes'), stopNo: 'Stop saying tú and vosotros', stopYes: 'Say vos and ustedes', pairs: [
    pair('Contigo', 'Con vos', 'with you'), pair('Para ti', 'Para vos', 'for you'), pair('¿Y tú?', '¿Y vos?', 'and you?'), pair('Vosotros', 'Ustedes', 'you all'), pair('¿Tú qué piensas?', '¿Vos qué pensás?', 'what do you think?')]},
  {id: 'drake-29-animals', topic: 'Animals edition', ...textbook('Textbook animals', 'Animals in Argentina'), pairs: [
    pair('Capibara', 'Carpincho', 'capybara'), pair('Cerdo', 'Chancho', 'pig'), pair('Mofeta', 'Zorrino', 'skunk'), pair('Mantis', 'Mamboretá', 'praying mantis'), pair('Ratón pequeño', 'Laucha', 'small mouse')]},
  {id: 'drake-30-vesre', topic: 'Backwards slang', ...textbook('Normal words', 'Argentines say them backwards'), pairs: [
    pair('Hotel por horas', 'Telo', 'hotel for couples'), pair('Amigo', 'Gomía', 'friend'), pair('Tango', 'Gotán', 'tango'), pair('Pantalón', 'Lompa', 'pants'), pair('Mujer', 'Jermu', 'wife, woman')]},
];
